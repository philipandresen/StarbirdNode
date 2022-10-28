import {drive as googleDrive, auth} from "@googleapis/drive"
import fs from "fs";
import config from "config";

const driveConfig = config.get(`${process.env.PC_NAME}.googleDriveConfig`);

const googleAuth = new auth.GoogleAuth({
    keyFile: driveConfig.keyFileLocation,
    scopes: ['https://www.googleapis.com/auth/drive.file']
})

const drive = googleDrive({
    version: 'v3',
    auth: googleAuth
})

export default async function upload(fullFilePath) {
    console.info('Uploading file to google drive...')
    const plainFileName = fullFilePath.split('\\').pop().split('/').pop();
    const res = await drive.files.create({
        requestBody: {
            name: plainFileName,
            mimeType: 'application/zip',
            parents: [driveConfig.folderId] // The ID of the shared folder
        },
        media: {
            mimeType: 'application/zip',
            body: fs.createReadStream(fullFilePath)
        }
    }).catch(console.error);
    console.log(`Uploaded file ${res?.data?.name} with drive ID of: ${res?.data?.id}`);
}

export async function cleanUpDrive() {
    const res = await drive.files.list();
    const files = res.data.files;
    const fileDetails = await Promise.all(files.map(file => drive.files.get({
            fileId: file.id,
            fields: 'createdTime, id, name'
        }).then(({data}) => {
            return {
                ...data,
                createdTime: new Date(data.createdTime)
            }
        })
    ))

    console.info(`There are ${fileDetails.length} backups available on drive.`)

    const sevenDaysMs = 7*24*60*60*1000
    const lastWeek = new Date( Date.now() - sevenDaysMs);

    const oldFiles = fileDetails.filter(file => {
        return file.createdTime < lastWeek
    })

    await Promise.all(oldFiles.map(oldFile => {
        console.info(`Deleting old file from drive as it is ${Math.round((Date.now() - oldFile.createdTime)/100/60/60/24)/10} days old`)
        return drive.files.delete({
            fileId: oldFile.id
        })
    }));
}