const fs = require('fs');
const path = require('path');
const { put, list, del } = require('@vercel/blob');
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

// uploadFiles('./items-icons', 1000);


async function deleteAll() {
    try {
        const files = await list({token: process.env.BLOB_READ_WRITE_TOKEN});
        const urls = Object.values(files.blobs).map(blob => blob.url);

        await async.eachLimit(urls, 10, async url => {
            try {
                await del(url, {token: process.env.BLOB_READ_WRITE_TOKEN});
                console.log(`Deleted ${url}`);
            } catch (e) {
                console.error(`Failed to delete ${url}: ${e}`);
            }
        });
    } catch (err) {
        console.error(`Failed to list files: ${err}`);
    }
}

deleteAll();
