// Define NTRUEncrypt parameters
const N = 503;
const p = 3;
const q = 1024;

// Function to generate random polynomial with coefficients in {-1, 0, 1}
function generateRandomPolynomial(length) {
    return Array.from({ length }, () => Math.floor(Math.random() * 3) - 1);
}

// Function to generate keys
function generateKeys() {
    const f = generateRandomPolynomial(N);
    const g = generateRandomPolynomial(N);
    const h = generateRandomPolynomial(N);
    
    // Compute public key (t)
    const t = polynomialMultiplicationModP(f, invertPolynomial(g, p), p);

    return { publicKey: t, privateKey: { f, g, h } };
}

// Function to perform polynomial multiplication and modulo p
function polynomialMultiplicationModP(poly1, poly2, mod) {
    const result = [];
    for (let i = 0; i < poly1.length + poly2.length - 1; i++) {
        let sum = 0;
        for (let j = Math.max(0, i - poly2.length + 1); j <= Math.min(i, poly1.length - 1); j++) {
            sum += poly1[j] * poly2[i - j];
            sum %= mod;
        }
        result.push(sum);
    }
    return result;
}

// Function to invert polynomial modulo p
function invertPolynomial(poly, mod) {
    const inv = [];
    for (let i = 0; i < poly.length; i++) {
        inv[i] = (poly[i] < 0 ? poly[i] + mod : poly[i]) % mod;
    }
    return inv;
}

// Function to encrypt plaintext
function encrypt(plaintext, publicKey) {
    const m = Array.from(plaintext).map(char => char.charCodeAt(0) - 32); // Convert plaintext to polynomial
    const r = Math.floor(Math.random() * q); // Randomization factor
    const e = polynomialAdditionModQ(polynomialMultiplicationModQ(r, publicKey, q), m, q);
    return e;
}

// Function to decrypt ciphertext
function decrypt(ciphertext, privateKey) {
    const ef = polynomialMultiplicationModQ(ciphertext, privateKey.f, q);
    const efModP = polynomialModuloP(ef, p);
    const m = polynomialDecode(efModP);
    return String.fromCharCode(...m.map(code => code + 32)); // Convert polynomial to plaintext
}

// Function to perform polynomial multiplication and modulo q
function polynomialMultiplicationModQ(poly1, poly2, mod) {
    const result = [];
    for (let i = 0; i < poly1.length + poly2.length - 1; i++) {
        let sum = 0;
        for (let j = Math.max(0, i - poly2.length + 1); j <= Math.min(i, poly1.length - 1); j++) {
            sum += poly1[j] * poly2[i - j];
            sum %= mod;
        }
        result.push(sum);
    }
    return result;
}

// Function to perform polynomial addition and modulo q
function polynomialAdditionModQ(poly1, poly2, mod) {
    const result = [];
    const maxLength = Math.max(poly1.length, poly2.length);
    for (let i = 0; i < maxLength; i++) {
        const term1 = poly1[i] || 0;
        const term2 = poly2[i] || 0;
        result[i] = (term1 + term2) % mod;
    }
    return result;
}

// Function to perform polynomial modulo p
function polynomialModuloP(poly, mod) {
    return poly.map(coef => coef % mod);
}

// Function to decode polynomial
function polynomialDecode(poly) {
    return poly.map(coef => coef < p / 2 ? coef : coef - p);
}

// Function to handle encryption and decryption
function processEncryptionDecryption() {
    const plaintext = document.getElementById('plaintext').value;
    const { publicKey, privateKey } = generateKeys();

    // Display keys
    document.getElementById('publicKey').textContent = 'Public Key:\n' + JSON.stringify(publicKey);
    document.getElementById('privateKey').textContent = 'Private Key:\n' + JSON.stringify(privateKey);

    // Encrypt plaintext
    const ciphertext = encrypt(plaintext, publicKey);
    document.getElementById('encryptedText').textContent = 'Encryption Result:\n' + JSON.stringify(ciphertext);

    // Decrypt ciphertext
    const decryptedText = decrypt(ciphertext, privateKey);
    document.getElementById('decryptedText').textContent = 'Decryption Result:\n' + decryptedText;
}

// Perform encryption and decryption when the button is clicked
document.getElementById('encryptDecryptButton').addEventListener('click', processEncryptionDecryption);
