const { initialize } = require('zokrates-js');

const fs = require('node:fs');
const path = require('node:path');
const bsv = require('bsv');

(async () => {

const zkp = await initialize();
const vk = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'keypair.vk.json')).toString());
const public1 = JSON.parse(fs.readFileSync('./public1.json').toString());
const proof = JSON.parse(fs.readFileSync('./proof.json').toString());
const cert1Tx = bsv.Tx.fromBuffer(fs.readFileSync('./cert1.tx'));
const cert1HashBuf = cert1Tx.txOuts[0].script.getData()[0];


let inputsMatch = true;

// check the cert hash
if (!cert1HashBuf.toString() === proof.inputs.slice(0, 8).map(x => x.slice(58)).join('')){
    inputsMatch = false;
}

for (let i = 0; i < public1.length; i++) {
    let intValue = parseInt(proof.inputs[i+8].slice(64), 16);
    if (public1[i] != intValue) {
        inputsMatch = false;
    }
}

const isVerified = zkp.verify(vk, proof);

console.log('verified:', isVerified);
console.log('inputs match:', inputsMatch);
console.log('output:', parseInt(proof.inputs[proof.inputs.length-1].slice(64),16));

})().catch(console.error)