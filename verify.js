const { initialize } = require('zokrates-js');

const fs = require('node:fs');
const path = require('path');

(async () => {

const zkp = await initialize();
const proof = JSON.parse(fs.readFileSync('./proof.json').toString());
const vk = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'keypair.vk.json')).toString());
const public1 = JSON.parse(fs.readFileSync('./public1.json').toString());

let inputsMatch = true;

for (let i = 0; i < public1[0].length; i++) {
    let value1 = public1[0][i].slice(2);
    let value2 = proof.proof.inputs[i].slice(58);
    if (value1 != value2) {
        inputsMatch = false;
    }
}

for (let i = 0; i < public1[1].length; i++) {
    let hexString = proof.proof.inputs[i+8].slice(2);
    let intValue = parseInt(hexString, 16);
    if (public1[1][i] != intValue) {
        inputsMatch = false;
    }
}

const isVerified = zkp.verify(vk, proof.proof);

console.log('verified:', isVerified);
console.log('inputs match:', inputsMatch);
console.log('output:', parseInt(proof.output.slice(2), 16));

})().catch(console.error)