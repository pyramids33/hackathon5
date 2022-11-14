const { initialize } = require('zokrates-js');

(async () => {

const source = `
import "hashes/sha256/sha256Padded" as sha256;

def main (private u8[42] a) -> u32[8] { 
    u32[8] x = [
        0x341088d5,
        0x79e6576a,
        0xa56bec9f,
        0xec271406,
        0xe3745b32,
        0x816e1eeb,
        0x9c9faef5,
        0xb8c0d789
    ];
    u32[8] h = sha256(a);
    assert(x == h);
    return h; 
}
`;

const zkp = await initialize();
const artifacts = zkp.compile(source);
const keypair = zkp.setup(artifacts.program);

let args = [[
    "3","6",  "4","7",  
    "3","6",  "5","8", 
    "3","6",  "4","7",  
    "3","6",  "5","8", 
    "3","6",  "4","7",  
    "3","6",  "5","8", 
    "3","6",  "4","7",  
    "3","6",  "5","8", 
    "3","6",  "4","7",  
    "3","6",  "5","8", 
    "3","6"
]];

// 341088d579e6576aa56bec9fec271406e3745b32816e1eeb9c9faef5b8c0d789

const { witness, output } = zkp.computeWitness(artifacts, args);
const proof = zkp.generateProof(artifacts.program, witness, keypair.pk);
console.log('output', output)
// // A will receive [ proof ]
// // A will verify proof
const isVerified = zkp.verify(keypair.vk, proof);

console.log(isVerified);

})().catch(console.error)