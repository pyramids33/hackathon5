const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const bsv = require('bsv');
const commander = require('commander');
const { initialize } = require('zokrates-js');

/*
compile <programDir>
certify <private.json> <outputFile> 
prove <programDir> <private.json> <public.json> <outputFile>
verify <programDir> <public.json> <cert.tx> <proof.json>
*/

function validatePrivate (private) {
    if (!Array.isArray(private)) {
        throw new Error('invalid type: not an array');
    }
    if (private.length != 42) {
        throw new Error('invalid length: must be 42 integers, 0 - 255');
    }
    if (!private.every(x => Number.isSafeInteger(x))) {
        throw new Error('invalid type: ' + n + ', must be int');
    }
    if (!private.every(x => x >= 0 && x < 255)) {
        throw new Error('invalid number: ' + n + ', must be 0 - 255');
    }
}

function validatePublic (public) {
    if (!Array.isArray(public)) {
        throw new Error('invalid type: not an array');
    }
    if (public.length != 231) {
        throw new Error('invalid length: must be 231 integers, 0 - 255');
    }
    if (!public.every(x => Number.isSafeInteger(x))) {
        throw new Error('invalid type: ' + n + ', must be int');
    }
    if (!public.every(x => x >= 0 && x < 255)) {
        throw new Error('invalid number: ' + n + ', must be 0 - 255');
    }
}


const program = new commander.Command();
program.version('1.0.0');

program
.command('compile [programDir]')
.option('-c --create', 'create programDir if necessary')
.description(
    'Compiles the zok program and makes keypair in programDir (default = ./ )\n'+
    'Files: artifacts.abi.json, artifacts.program.bin, keypair.pk.bin, keypair.vk.json'
)
.action (async function (programDir='', options, command) {
    try {
        fs.mkdirSync(programDir, { recursive: true });
    } catch (err) {
        if (err.code === 'EEXIST') {
            console.log('programDir already exists');
        } else {
            throw err;
        }
    }

    const zkp = await initialize();
    const artifacts = zkp.compile(fs.readFileSync(path.join(__dirname, 'comp.zok')).toString());
    const keypair = zkp.setup(artifacts.program);

    fs.writeFileSync(path.join(programDir, 'artifacts.program.bin'), artifacts.program);
    fs.writeFileSync(path.join(programDir, 'artifacts.abi.json'), JSON.stringify(artifacts.abi,null,2));
    fs.writeFileSync(path.join(programDir, 'keypair.pk.bin'), Buffer.from(keypair.pk));
    fs.writeFileSync(path.join(programDir, 'keypair.vk.json'), JSON.stringify(keypair.vk,null,2));
});

program
.command('certify <private.json> [outputFile]')
.option('-o --overwrite', 'overwrite the file if it exists')
.description(
    'Hash the private.json and write a cert tx in outputFile (default = cert.tx)'
)
.action (async function (privateFile, outputFile, options, command) {

    const private = JSON.parse(fs.readFileSync(privateFile).toString());
    validatePrivate(private);

    let hashBuf = crypto.createHash('sha256').update(Buffer.from(private)).digest();
    let tx = new bsv.Tx();
    tx.addTxOut(new bsv.Bn('0'), bsv.Script.fromSafeData(hashBuf));

    // the transaction can be funded and broadcast in another program.

    fs.writeFileSync(outputFile, tx.toBuffer(), { flag: options.overwrite ? 'w' : 'wx' });
});


program
.command('prove <programDir> <private.json> <public.json> [outputFile]')
.option('-o --overwrite', 'overwrite the file if it exists')
.description(
    'Create the proof in outputFile (default = ./proof.json)'
)
.action (async function (programDir, privateFile, publicFile, outputFile='proof.json', options, command) {

    const program = fs.readFileSync(path.join(programDir, 'artifacts.program.bin'));
    const abi = JSON.parse(fs.readFileSync(path.join(programDir, 'artifacts.abi.json')).toString());
    const pk = fs.readFileSync(path.join(programDir, 'keypair.pk.bin'));

    const private = JSON.parse(fs.readFileSync(privateFile).toString());
    validatePrivate(private);

    const public = JSON.parse(fs.readFileSync(publicFile).toString());
    validatePublic(public);

    const hashHex = crypto.createHash('sha256').update(Buffer.from(private)).digest('hex');

    // array of 42 uint8, convert to string for zkp
    const arg0 = private.map(x => x.toString());
    
    // convert 32byte hash to type u32[8] for zkp input eg [ "0x12345678", "0x12345678", etc ]
    const arg1 = [ 0, 8, 16, 24, 32, 40, 48, 56 ].map(x => '0x' + hashHex.slice(x, x+8));
    
    // array of 231 uint8, convert to string for zkp
    const arg2 = public.map(x => x.toString());
    
    const zkp = await initialize();
    const { witness } = zkp.computeWitness({ program, abi }, [ arg0, arg1, arg2 ]);
    const proofJson = zkp.generateProof(program, witness, pk);
    
    fs.writeFileSync(outputFile, JSON.stringify(proofJson, null, 2), { flag: options.overwrite ? 'w' : 'wx' });
});


program
.command('verify <verificationKey.json> <public.json> <cert.tx> <proof.json>')
.description(
    'Verify the proof, using the verification key from programDir and proof.json'
)
.action (async function (verificationKeyFile, publicFile, certFile, proofFile, options, command) {

    const vk = JSON.parse(fs.readFileSync(verificationKeyFile).toString());

    const public = JSON.parse(fs.readFileSync(publicFile).toString());
    validatePublic(public);

    const certHashBuf = bsv.Tx.fromBuffer(fs.readFileSync(certFile)).txOuts[0].script.getData()[0];
    const proof = JSON.parse(fs.readFileSync(proofFile).toString());

    // check the cert hash against proof inputs
    if (certHashBuf.toString('hex') !== proof.inputs.slice(0, 8).map(x => x.slice(58)).join('')){
        throw new Error('invalid proof: does not match certHash');
    }
    
    // check the public numbers against proof inputs
    for (let i = 0; i < public.length; i++) {
        let intValue = parseInt(proof.inputs[i+8].slice(64), 16);
        if (public[i] != intValue) {
            throw new Error('invalid proof: does not match public. ' + public[i].toString() + ' != ' + intValue.toString());
        }
    }

    const zkp = await initialize();
    const isVerified = zkp.verify(vk, proof);
    
    if (!isVerified) {
        throw new Error('invalid proof: failed to verify');
    }

    console.log('output:', parseInt(proof.inputs[proof.inputs.length-1].slice(64), 16));
});


module.exports = program;