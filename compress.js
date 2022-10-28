import fs from "fs";
import archiver from "archiver";

export default async function compress(backupFullFilePath) {
    const zipFullPath = backupFullFilePath.replace('.bak', '.zip');
    const output = fs.createWriteStream(zipFullPath);

    console.info(`Creating archive at ${zipFullPath}`);
    const archive = archiver.create('zip-encrypted', {
        zlib: {level: 7},
        encryptionMethod: 'aes256',
        password: process.env.BKP_PASS
    });

    output.on('close', () => {
        console.info('archiver has been finalized and the output file descriptor has closed.');
    });

    output.on('end', function () {
        console.log('Data has been drained');
    });

    archive.on('warning', function (err) {
        if (err.code === 'ENOENT') {
            // log warning
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

    console.info(`Adding ${backupFullFilePath} to archive...`);
// append a file
    archive.file(backupFullFilePath, {name: 'AIM.bak'});
    console.info('finalizing archive...');
    await archive.finalize();
    const stats = fs.statSync(backupFullFilePath);
    console.log(`Final size is ${Math.round(archive.pointer() / 10000) / 100} MB, with a compression ratio of about ${Math.round(stats.size / archive.pointer())}`);
    return zipFullPath;
}
