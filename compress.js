import fs from "fs";
import archiver from "archiver";
import {log} from "./utils.js";
import sevenZip from "node-7z";
import sevenZipBin from '7zip-bin';

const sevenZipLocation = sevenZipBin.path7za;

/**
 * Attempts to compress with 7zip and falls back to regular zip otherwise.
 * @param backupFullFilePath
 * @returns {Promise<void>}
 */
export default async function compress(backupFullFilePath) {
    return compressSevenZip(backupFullFilePath).catch(err => {
        log(err);
        return compressZip(backupFullFilePath);
    })
}

/**
 * Takes the file located at backupFullFilePath and puts it into a compressed 7zip archive with a password
 * @param backupFullFilePath
 * @returns {Promise<void>} the full file path of the compressed .7z file.
 */
async function compressSevenZip(backupFullFilePath) {
    const sevenZipFullPath = backupFullFilePath.replace('.bak', '.7z');
    log(`Creating .7z archive at ${sevenZipFullPath}`);
    return new Promise((resolve, reject) => {
        const archiveStream = sevenZip.add(sevenZipFullPath, backupFullFilePath, {
            $bin: sevenZipLocation,
            method: ['x=9'],
            password: process.env.BKP_PASS
        })
        archiveStream.on('end', () => {
            log(`Compression completed successfully.`)
            const statsBackup = fs.statSync(backupFullFilePath);
            const statsArchive = fs.statSync(sevenZipFullPath);
            log(`Final size is ${Math.round(statsArchive.size / 10000) / 100} MB, with a compression ratio of about ${Math.round(statsBackup.size / statsArchive.size)}`);
            resolve(sevenZipFullPath);
        });
        archiveStream.on('error', err => {
            log('Compression with 7zip failed');
            reject(err);
        });
    })
}

/**
 * Takes the file at backupFullFilePath and puts it into a zip archive with a password.
 * @param backupFullFilePath
 * @returns {Promise<*>} The full file path to the output zip file.
 */
async function compressZip(backupFullFilePath) {
    const zipFullPath = backupFullFilePath.replace('.bak', '.zip');
    const output = fs.createWriteStream(zipFullPath);

    log(`Creating archive at ${zipFullPath}`);
    const archive = archiver.create('zip-encrypted', {
        zlib: {level: 7},
        encryptionMethod: 'aes256',
        password: process.env.BKP_PASS
    });

    output.on('close', () => {
        // log('archiver has been finalized and the output file descriptor has closed.');
    });

    output.on('end', function () {
        log('Data has been drained');
    });

    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            log(err);
        } else {
            // throw error
            throw err;
        }
    });

    archive.on('error', function (err) {
        throw err;
    });

    // pipe archive data to the file
    archive.pipe(output);

    log(`Adding ${backupFullFilePath} to archive...`);
    // append a file
    archive.file(backupFullFilePath, {name: 'AIM.bak'});
    log('finalizing archive...');
    await archive.finalize();
    const stats = fs.statSync(backupFullFilePath);
    log(`Final size is ${Math.round(archive.pointer() / 10000) / 100} MB, with a compression ratio of about ${Math.round(stats.size / archive.pointer())}`);
    return zipFullPath;
}
