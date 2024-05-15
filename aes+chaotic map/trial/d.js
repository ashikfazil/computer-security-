async function decryptAndSave() {
    // Get the encrypted image data and encryption key
    const encryptedDataTextarea = document.getElementById('encryptedData');
    const encryptedDataString = encryptedDataTextarea.value.trim();
    if (!encryptedDataString) {
        alert('Please enter the encrypted image data.');
        return;
    }

    const encryptionKeyTextarea = document.getElementById('encryptionKey');
    const encryptionKeyString = encryptionKeyTextarea.value.trim();
    if (!encryptionKeyString) {
        alert('Please enter the encryption key.');
        return;
    }

    // Convert hex strings to Uint8Array
    const encryptedImageData = hexToUint8Array(encryptedDataString);
    const encryptionKey = hexToUint8Array(encryptionKeyString);

    // Import the encryption key
    const key = await window.crypto.subtle.importKey(
        'raw',
        encryptionKey,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
    );

    // Decrypt the encrypted image data
    const decryptedImageData = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(12) },
        key,
        encryptedImageData
    );

    // Convert ArrayBuffer to Blob
    const decryptedImageBlob = new Blob([decryptedImageData], { type: 'image/jpeg' });

    // Save the decrypted image as a file
    const link = document.createElement('a');
    link.href = URL.createObjectURL(decryptedImageBlob);
    link.download = 'decrypted.jpeg';
    link.click();
}

function hexToUint8Array(hexString) {
    const bytes = [];
    for (let i = 0; i < hexString.length; i += 2) {
        bytes.push(parseInt(hexString.substr(i, 2), 16));
    }
    return new Uint8Array(bytes);
}
