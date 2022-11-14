const { initialize } = require('zokrates-js');

(async () => {

const source = `
from "hashes/sha256/sha256" import main as sha256;

const u32 SIZE0 = 2;
const u32 SIZE1 = 3;
const u32 SIZE2 = SIZE1*SIZE0;

const u32 SIZE3 = 11;
const u32 SIZE4 = SIZE3*SIZE1;

def findNum(u8 a, u8[SIZE3] b) -> u8 { 
    bool mut result = false;

    for u32 i in 0..SIZE2 {
        result = result || a > 0 && a == b[i];
    }

    return (result ? 1 : 0); 
}

def main (private u8[SIZE2] a, u8[SIZE4] b) -> u8 { 
    u8 mut m = 0;
    for u32 i in 0..SIZE1 {
        u8[SIZE3] bs = b[i*SIZE3..i*SIZE3+SIZE3];
        m = m + findNum(a[i*SIZE0], bs);
        m = m + findNum(a[i*SIZE0+1], bs);
    }
    return m; 
}
`;

// A will create program and keypair
const zkp = await initialize();
const artifacts = zkp.compile(source);
const keypair = zkp.setup(artifacts.program);

// B will receive [ artifacts, keypair.pk ]
// B will create proof
const args = [ 
    ["3","6",  "3","6",  "3","6"], 
    ["1","2","3","4","6","0","0","0","0","0",  "1","2","3","4","6","0","0","0","0","0",  "1","2","3","4","6","0","0","0","0","0"] 
];

const { witness, output } = zkp.computeWitness(artifacts, args);
const proof = zkp.generateProof(artifacts.program, witness, keypair.pk);
console.log('output', output)
// // A will receive [ proof ]
// // A will verify proof
const isVerified = zkp.verify(keypair.vk, proof);

console.log(isVerified);

})().catch(console.error)