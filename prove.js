const { initialize } = require('zokrates-js');
const fs = require('node:fs');
const path = require('node:path');
const bsv = require('bsv');

(async () => {

const program = fs.readFileSync(path.join(__dirname, 'build', 'artifacts.program.bin'));
const abi = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'artifacts.abi.json')).toString());
const pk = fs.readFileSync(path.join(__dirname, 'build', 'keypair.pk.bin'));
const private1 = JSON.parse(fs.readFileSync('./private1.json').toString());
const cert1Tx = bsv.Tx.fromBuffer(fs.readFileSync('./cert1.tx'));
const cert1HashBuf = cert1Tx.txOuts[0].script.getData()[0];
const public1 = JSON.parse(fs.readFileSync('./public1.json').toString());

// array of 42 uint8
const arg0 = private1.map(x => x.toString());

// convert 32byte hash to zkp type u32[8]
const arg1 = [ 0, 4, 8, 12, 16, 20, 24, 28 ].map(x => '0x'+(cert1HashBuf.slice(x,x+4).toString('hex')));

// array of 231 uint8
const arg2 = public1.map(x => x.toString());

const zkp = await initialize();
const { witness } = zkp.computeWitness({ program, abi }, [ arg0, arg1, arg2 ]);
const proof = zkp.generateProof(program, witness, pk);

fs.writeFileSync('./proof.json', JSON.stringify(proof, null, 2));

})().catch(console.error)