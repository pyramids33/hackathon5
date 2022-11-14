const { initialize } = require('zokrates-js');
const fs = require('node:fs');
const path = require('path');

(async () => {

const program = fs.readFileSync(path.join(__dirname, 'temp', 'artifacts.program.bin'));
const abi = JSON.parse(fs.readFileSync(path.join(__dirname, 'temp', 'artifacts.abi.json')).toString());
const pk = fs.readFileSync(path.join(__dirname, 'temp', 'keypair.pk.bin'));
const args = JSON.parse(fs.readFileSync(path.join(__dirname, 'args1.json')).toString());

const zkp = await initialize();

const { witness, output } = zkp.computeWitness({ program, abi }, args);
const proof = zkp.generateProof(program, witness, pk);

fs.writeFileSync(path.join(__dirname, 'temp', 'proof.json'), JSON.stringify({ output: JSON.parse(output), proof },null,2));

})().catch(console.error)