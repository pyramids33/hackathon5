const { initialize } = require('zokrates-js');
const fs = require('node:fs');
const path = require('path');

(async () => {

const program = fs.readFileSync(path.join(__dirname, 'build', 'artifacts.program.bin'));
const abi = JSON.parse(fs.readFileSync(path.join(__dirname, 'build', 'artifacts.abi.json')).toString());
const pk = fs.readFileSync(path.join(__dirname, 'build', 'keypair.pk.bin'));
const private1 = JSON.parse(fs.readFileSync('./private1.json').toString());
const public1 = JSON.parse(fs.readFileSync('./public1.json').toString());

const zkp = await initialize();
const { witness, output } = zkp.computeWitness({ program, abi }, [ private1, public1[0], public1[1] ]);
const proof = zkp.generateProof(program, witness, pk);

fs.writeFileSync('./proof.json', JSON.stringify({ output: JSON.parse(output), proof },null,2));

})().catch(console.error)