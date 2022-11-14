const { initialize } = require('zokrates-js');
const fs = require('node:fs');
const path = require('path');

(async () => {

const zkp = await initialize();
const artifacts = zkp.compile(fs.readFileSync(path.join(__dirname, 'comp.zok')).toString());
const keypair = zkp.setup(artifacts.program);

fs.writeFileSync(path.join(__dirname, 'build', 'artifacts.program.bin'), artifacts.program);
fs.writeFileSync(path.join(__dirname, 'build', 'artifacts.abi.json'), JSON.stringify(artifacts.abi,null,2));
fs.writeFileSync(path.join(__dirname, 'build', 'keypair.pk.bin'), Buffer.from(keypair.pk));
fs.writeFileSync(path.join(__dirname, 'build', 'keypair.vk.json'), JSON.stringify(keypair.vk,null,2));

})().catch(console.error)