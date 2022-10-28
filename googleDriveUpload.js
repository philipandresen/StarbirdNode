import { drive as googleDrive } from "@googleapis/drive"
import fs from "fs";

const drive = googleDrive({
    version: 'v3',
    auth: process.env.DRIVE_API_KEY  // Not compatible with drive API! Need OAUTH!
})

export default async function upload(fullFilePath) {
    console.log(drive);
    const res = await drive.files.create({
        requestBody: {
            name: 'test.zip',
            mimeType: 'application/zip'
        },
        media: {
            mimeType: 'application/zip',
            body: fs.createReadStream(fullFilePath)
        }
    }).catch(console.error);
    console.log(res?.data);
}
