const firebaseConfig = {
    apiKey: "AIzaSyDPRwE7iDJMwU-mKPoc7XcHWfcKh1PUkuU",
    authDomain: "computer-security-7bda4.firebaseapp.com",
    databaseURL: "https://computer-security-7bda4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "computer-security-7bda4",
    storageBucket: "computer-security-7bda4.appspot.com",
    messagingSenderId: "563562292542",
    appId: "1:563562292542:web:d559f56deec8d8b5d4b86f",
    measurementId: "G-93CXMMDS8R"
  };

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const storage = firebase.storage();
const database = firebase.database();

function arrayBufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(byte => ('00' + byte.toString(16)).slice(-2))
        .join('');
}


// Function to handle RSA encryption of AES key and uploading
async function encryptAndUpload() {
    // Get the uploaded image file
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    if (!file) {
        alert('Please select an image file.');
        return;
    }

    // Read the image file as ArrayBuffer
    const reader = new FileReader();
    reader.onload = async function(event) {
        const imageData = event.target.result;

        // Get the RSA public key input
        const publicKeyInput = document.getElementById('publicKeyInput');
        const rsaPublicKey = publicKeyInput.value;

        // Check if RSA public key is provided
        if (!rsaPublicKey) {
            alert('Please provide RSA public key.');
            return;
        }

        // Convert RSA public key to Uint8Array
        const rsaPublicKeyArray = new TextEncoder().encode(rsaPublicKey);

        // Import the RSA public key
        const importedPublicKey = await window.crypto.subtle.importKey(
            'spki',
            rsaPublicKeyArray,
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            false,
            ['encrypt']
        );

        // Generate a random encryption key
        const key = await window.crypto.subtle.generateKey(
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );

        // Encrypt the image data
        const encryptedImageData = await window.crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: new Uint8Array(12) },
            key,
            imageData
        );

        // Encrypt AES key using RSA
        const keyData = await window.crypto.subtle.exportKey('raw', key);
        const encryptedAESKey = await encryptRSA(keyData, importedPublicKey);

        const encryptedDataString = arrayBufferToHex(encryptedImageData);
        const encryptedKeyString = arrayBufferToHex(encryptedAESKey);

        const uid = generateUID();

        // Display encrypted data and key in HTML
        document.getElementById('uid').textContent = "Uid:" + uid;
        document.getElementById('aesKey').textContent = "Key:" + encryptedKeyString;

        // Upload the encrypted image data to Firebase Storage
        const encryptedDataBuffer = new Uint8Array(encryptedImageData);
        const databaseRef = firebase.database().ref('encrypted_images');

        // Push the encrypted image data, encrypted AES key, and UID to the database
        databaseRef.push({
            uid: uid,
            imageData: encryptedDataString,
            encryptedKey: encryptedKeyString
        }).then(function() {
            console.log('Uploaded encrypted image data successfully to Firebase Database!');
        }).catch(function(error) {
            console.error('Error uploading encrypted image data:', error);
        });
    };
    reader.readAsArrayBuffer(file);
}

function generateUID() {
    return Math.random().toString(36).substr(2, 9);
}
// Function to encrypt data using RSA public key
async function encryptRSA(data, publicKey) {
    // Import the RSA public key
    const importedPublicKey = await window.crypto.subtle.importKey(
        'spki',
        publicKey,
        { name: 'RSA-OAEP', hash: 'SHA-256' },
        false,
        ['encrypt']
    );

    // Encrypt the data using RSA-OAEP
    const encryptedData = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        importedPublicKey,
        data
    );

    // Return the encrypted data
    return encryptedData;
}