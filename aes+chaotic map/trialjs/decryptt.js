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


// Function to convert hex string to Uint8Array
function hexToArrayBuffer(hexString) {
    const bytes = new Uint8Array(hexString.match(/[\da-f]{2}/gi).map(function(h) {
        return parseInt(h, 16);
    }));
    return bytes.buffer;
}


// Function to download the decrypted image
function downloadImage() {
    const imageContainer = document.getElementById('image-container');
    const imageSrc = imageContainer.querySelector('img').src;

    const a = document.createElement('a');
    a.href = imageSrc;
    a.download = 'decrypted_image.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Function to retrieve encrypted image data by UID
async function getImageDataByUID(uid) {
    // Get a reference to the Firebase Realtime Database
    const databaseRef = firebase.database().ref('encrypted_images');

    try {
        // Query the database for the encrypted image data with the specified UID
        const snapshot = await databaseRef.orderByChild('uid').equalTo(uid).once('value');
        const imageData = snapshot.val();

        if (!imageData) {
            alert('No image data found for the provided UID.');
            return;
        }

        // Get the encrypted image data from the snapshot
        const encryptedDataString = Object.values(imageData)[0].imageData;
        return encryptedDataString;
    } catch (error) {
        console.error('Error fetching image data from Firebase Database:', error);
        alert('Error fetching image data from Firebase Database.');
    }
}

// Function to decrypt and display the image
async function decryptAndDisplay() {
    const uid = document.getElementById('uid').value.trim();
    const aesKeyHex = document.getElementById('aesKey').value.trim();

    if (!uid || !aesKeyHex) {
        alert('Please enter a UID and AES key.');
        return;
    }

    const aesKeyBytes = hexToArrayBuffer(aesKeyHex);

    try {
        // Import the AES key
        const aesKey = await window.crypto.subtle.importKey(
            'raw', // Key format
            aesKeyBytes, // Key data
            { name: 'AES-GCM' }, // Algorithm details
            false, // Extractability
            ['decrypt'] // Key usages
        );

        const encryptedDataString = await getImageDataByUID(uid);

        if (!encryptedDataString) {
            alert('No encrypted image data found for the provided UID.');
            return;
        }

        const encryptedData = hexToArrayBuffer(encryptedDataString);

        const decryptedImageData = await window.crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(12) },
            aesKey,
            encryptedData
        );

        // Display the decrypted image
        const blob = new Blob([decryptedImageData], { type: 'image/jpeg' });
        const imgUrl = URL.createObjectURL(blob);
        const imageContainer = document.getElementById('image-container');
        imageContainer.innerHTML = `<img src="${imgUrl}" alt="Decrypted Image">`;

        // Show download button
        document.getElementById('download-btn').style.display = 'block';
    } catch (error) 
        {
        console.error('Error decrypting and displaying image:', error);
        alert('Error decrypting and displaying image. Check UID and AES key.');
    }
}
