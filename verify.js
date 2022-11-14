const { initialize } = require('zokrates-js');

const fs = require('node:fs');
const path = require('path');

(async () => {

const zkp = await initialize();
const proof = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'proof.json')).toString());
const vk = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'keypair.vk.json')).toString());
const isVerified = zkp.verify(vk, proof.proof);

console.log(isVerified);

})().catch(console.error)