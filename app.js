const fs = require('fs');
const path = require('path');
const { put } = require('@vercel/blob');
require('dotenv').config();

const token = process.env.BLOB_READ_WRITE_TOKEN;

async function uploadFiles(directory) {
    const files = fs.readdirSync(directory);

    for (const file of files) {
        const filePath = path.join(directory, file);
        const fileStream = fs.createReadStream(filePath);

        const { url } = await put(`himon-dev-blob/items/${file}`, fileStream, {
            access: 'public',
            addRandomSuffix: false,
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        console.log(`Uploaded ${file} to ${url}`);
    }
}

uploadFiles('./items-icons');
