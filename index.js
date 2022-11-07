const { initialize } = require('zokrates-js');

(async () => {

const source = `
from "hashes/sha256/sha256" import main as sha256;

def main(private field a) -> field { 
    assert(a * a == 4);
    return 1; 
}
`;

// A will create program and keypair
const zkp = await initialize();
const artifacts = zkp.compile(source);
// const keypair = zkp.setup(artifacts.program);

// // B will receive [ artifacts, keypair.pk ]
// // B will create proof
// const secretInfo = "3";
// const { witness, output } = zkp.computeWitness(artifacts, [ secretInfo ]);
// const proof = zkp.generateProof(artifacts.program, witness, keypair.pk);

// // A will receive [ proof ]
// // A will verify proof
// const isVerified = zkp.verify(keypair.vk, proof);

// console.log(isVerified);

})().catch(console.error)