import {drive as googleDrive, auth} from "@googleapis/drive"
import fs from "fs";
import config from "config";
import {log} from "./utils.js";

const driveConfig = config.get(`${process.env.PC_NAME}.googleDriveConfig`);

const googleAuth = new auth.GoogleAuth({
    keyFile: driveConfig.keyFileLocation,
    scopes: ['https://www.googleapis.com/auth/drive.file']
})

const drive = googleDrive({
    version: 'v3',
    auth: googleAuth
})

export default async function uploadBackup(fullFilePath) {
    log('Uploading file to google drive...')
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
    }).catch(log);
    log(`Uploaded file ${res?.data?.name} with drive ID of: ${res?.data?.id}`);
}

export async function uploadLog() {
    log('Uploading Logs to google drive...')
    return upsertUnique('log.txt', 'text/plain');
}

export async function cleanUpDrive() {
    const res = await drive.files.list();
    const backups = res.data.files.filter(file => file.name.endsWith('.zip'));
    const backupDetails = await Promise.all(backups.map(file => drive.files.get({
            fileId: file.id,
            fields: 'createdTime, id, name'
        }).then(({data}) => {
            return {
                ...data,
                createdTime: new Date(data.createdTime)
            }
        })
    ))

    log(`There are ${backupDetails.length} backups available on drive.`)

    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000
    const lastWeek = new Date(Date.now() - sevenDaysMs);

    const oldBackups = backupDetails.filter(file => {
        return file.createdTime < lastWeek
    })

    if ((backupDetails.length - oldBackups.length) < 7) {
        await Promise.all(oldBackups.map(oldFile => {
            log(`Deleting old file from drive as it is ${Math.round((Date.now() - oldFile.createdTime) / 100 / 60 / 60 / 24) / 10} days old`)
            return drive.files.delete({
                fileId: oldFile.id
            })
        }));
    } else {
        // Would be a good opportunity to send an email to someone or something.
        log('-----!!! WARNING, DRIVE CLEANUP SKIPPED BECAUSE THERE ARENT ENOUGH BACKUPS ON DRIVE !!!------');
    }
}

/**
 * Goes to google drive and checks for all instances of a file with the given name. If multiple exist, it chooses one
 * and updates it, deleting the others. If zero exist, it creates the file. If exactly one exists, it updates that one.
 * @param filePath
 * @param mimeFormat
 * @returns {Promise<void>}
 */
async function upsertUnique(filePath, mimeFormat) {
    const fileName = filePath.split('\\').pop().split('/').pop();

    const allFiles = await drive.files.list().then(res => res.data.files);
    const existingFiles = allFiles.filter(file => file.name === fileName);

    await Promise.all(existingFiles.map((file, index) => {
        if (index > 0) {
            return drive.files.delete({
                fileId: file.id
            }).catch(log);
        } else {
            return drive.files.update({
                fileId: file.id,
                media: {
                    mimeType: mimeFormat,
                    body: fs.createReadStream(filePath)
                }
            }).catch(log);
        }
    }));

    if (existingFiles.length === 0) {
        await drive.files.create({
            requestBody: {
                name: fileName,
                mimeType: mimeFormat,
                parents: [driveConfig.folderId] // The ID of the shared folder
            },
            media: {
                mimeType: mimeFormat,
                body: fs.createReadStream(filePath)
            }
        }).catch(log);
    }
}