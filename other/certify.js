const fs = require('node:fs');
const crypto = require('crypto');
const bsv = require('bsv');

(async () => {

const private1 = JSON.parse(fs.readFileSync('./private1.json').toString());

if (private1.length != 42) {
    console.error('invalid length: must be 42 integers < 255');
    process.exit(1);
}

if (!private1.every(x => x < 255)) {
    console.error('invalid number: ' + n);
    process.exit(1);
}

let hashBuf = crypto.createHash('sha256').update(Buffer.from(private1)).digest();
let tx = new bsv.Tx();
tx.addTxOut(new bsv.Bn('0'), bsv.Script.fromSafeData(hashBuf));

fs.writeFileSync('./cert1.tx', tx.toBuffer());

})().catch(console.error)