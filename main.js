import backup from "./backup.js";
import compress from "./compress.js"
import archiver from "archiver";
import archiverZE from "archiver-zip-encrypted";
import upload from "./googleDriveUpload.js";
import cleanup from "./cleanup.js";
// register format for archiver
// note: only do it once per Node.js process/application, as duplicate registration will throw an error
archiver.registerFormat('zip-encrypted', archiverZE);

cleanup();
const backupFullFilePath = await backup();
const archiveFullFilePath = await compress(backupFullFilePath);
await upload(archiveFullFilePath);