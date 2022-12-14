import backup from "./backup.js";
import compress from "./compress.js"
import archiver from "archiver";
import archiverZE from "archiver-zip-encrypted";
import uploadBackup, {cleanUpDrive, uploadLog} from "./googleDriveUpload.js";
import cleanup from "./cleanup.js";
import {log} from "./utils.js";
import {notifyError} from "./sendgridEmail.js";
import config from "config";
// register format for archiver
// note: only do it once per Node.js process/application, as duplicate registration will throw an error
archiver.registerFormat('zip-encrypted', archiverZE);

try {
    const backupConfig = config.get(`${process.env.PC_NAME}.backupConfig`);
    cleanup();
    const backupFullFilePath = await backup();
    const archiveFullFilePath = await compress(backupFullFilePath, [backupConfig.attachmentsLocation]);
    await uploadBackup(archiveFullFilePath);
    await cleanUpDrive();
    await uploadLog();
} catch (e) {
    log(e);
    await notifyError(e.stack);
}
