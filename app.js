const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');
const async = require('async');
require('dotenv').config();

let uploadQueue;

async function uploadFile(directory, file, callback) {
    try {
        const filePath = path.join(directory, file);
        const fileBuffer = fs.readFileSync(filePath);

        const uploadedFile = await put(`items/${file}`, fileBuffer, {
            access: 'public',
            addRandomSuffix: false,
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        console.log(`Uploaded ${file} to ${uploadedFile.url}`);
        callback();
    } catch (e) {
        console.error(`Failed to upload ${file}: ${e}`);
        uploadQueue.push(file);
        callback();
    }
}

async function uploadFiles(directory, startIndex = 0) {
    const files = fs.readdirSync(directory);
    uploadQueue = async.queue((file, callback) => uploadFile(directory, file, callback), 15);
    files.slice(startIndex).forEach(file => uploadQueue.push(file));
}

uploadFiles('./items-icons', 1000);
