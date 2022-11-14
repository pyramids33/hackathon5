## Steps

### 1. Alice: Create private1.json

private1.json - a json array of 42 numbers, 0 - 255.

```
// Example
[ 1,2, ... 4,3 ]
```

This is the private input to the zero-knowledge proof.  

### 2. Alice: Certify private1.json

Certify the private1.json file, by putting the hash into the bsv blockchain.  
Create a buffer by converting each number in private1.json to a byte, then take the sha256 hash of the buffer.  
The buffer (not tx) is the first public input to the zero-knowledge proof.   

cert1.tx - binary file of transaction.   
This tx contains an op_return output containing the sha256 hash of private1.json.  
It could be extended with more information and a signature.

### 3. Bob: Create public1.json

public1.json - a json array of 231 numbers, 0 - 255.

```
// Example
[ 1,2, ... 4,3 ]
```

This is the second public input to the zero-knowledge proof.

### 4. Bob: Compile the program: comp.zok

Compile the comp.zok script and produce:
 - program
 - key pair

### 5. Alice: Create proof.json

Alice will receive from Bob:
 - program
 - proving key
 - public1.json

Alice will create proof.json using:
 - program
 - proving key
 - private1.json
 - cert1.tx (extract the hash from the output)
 - public1.json

### 6. Bob: Verify the proof

Bob will receive from Alice:
 - proof.json
 - cert1.tx

Bob will verify the proof using:
 - verification key
 - public1.json
 - cert1.tx (extract the hash from the output)
 - proof.json

The match count is available as the last element in the 'inputs' array from proof.json