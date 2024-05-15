
        // Function to handle button click for generating RSA key pair
        document.getElementById('generateKeysBtn').addEventListener('click', function() {
            var PassPhrase = "The Moon is a Harsh Mistress.";
            var Bits = 512;
            // Generate RSA key pair using cryptico
            var MattsRSAkey = cryptico.generateRSAKey(PassPhrase, Bits);
            var MattsPublicKeyString = cryptico.publicKeyString(MattsRSAkey); 
            var MattsPrivateKeyString = cryptico.privateKeyString(MattsRSAkey); 
            // Update the content of publicKey and privateKey divs with the generated keys
            document.getElementById('publicKey').innerText = 'Public Key: ' + MattsPublicKeyString;
            document.getElementById('privateKey').innerText = 'Private Key: ' + MattsPrivateKeyString;
        });
        document.getElementById("encryptBtn").addEventListener("click", function() {
            var plaintext = document.getElementById("plaintext").value;
            var publicKey = document.getElementById("publicKeyInput").value;

            var encryptionResult = cryptico.encrypt(plaintext, publicKey);
            var ciphertextDiv = document.getElementById("ciphertext");
            if (encryptionResult.status === "success") {
                ciphertextDiv.textContent = encryptionResult.cipher;
            } else {
                ciphertextDiv.textContent = "Encryption failed!";
            }
        });
        document.getElementById("decryptBtn").addEventListener("click", function() {
            var PassPhrase = "The Moon is a Harsh Mistress.";
            var Bits = 512;
            var MattsRSAkey = cryptico.generateRSAKey(PassPhrase, Bits);
            var ciphertext = document.getElementById("ciphertextInput").value;
            var privateKey = document.getElementById("privateKeyInput").value;
            var decryptionResult = cryptico.decrypt(ciphertext,MattsRSAkey);
            var decryptedTextDiv = document.getElementById("decryptedtext");
            if (decryptionResult.status === "success") {
                decryptedTextDiv.textContent = decryptionResult.plaintext;
            } else {
                decryptedTextDiv.textContent = "Decryption failed!";
            }
        });