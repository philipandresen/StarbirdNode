import fs from "fs";
import config from "config";

export default function cleanup() {
    const dbConfig = config.get(`${process.env.PC_NAME}.dbConfig`);
    const backupConfig = config.get(`${process.env.PC_NAME}.backupConfig`);
    const twentySixHoursMs = 26*60*60*1000
    const yesterday = new Date( Date.now() - twentySixHoursMs);

    const existingBackups = fs.readdirSync(backupConfig.targetLocation)
        .filter(fileName => {
            return fileName.startsWith(dbConfig.database) &&
                (fileName.endsWith('.bak') || fileName.endsWith('.zip'));
    });
    console.log(`Found ${existingBackups.length} existing backup files.`);

    const oldBackups = existingBackups.filter(existingBackup => {
        const stats = fs.statSync(existingBackup);
        return stats.mtime < yesterday;
    });

    console.log(`Of those, ${oldBackups.length} can be deleted due to being more than ${twentySixHoursMs/60/60/1000} hours old.`);

    if (existingBackups.length <= 2) {
        console.warn('Backups will not be deleted because that would leave fewer than two backups.')
    } else {
        oldBackups.forEach(oldBackup => {
            fs.unlink(oldBackup, () => console.info(`deleted ${oldBackup}`));
        })
    }
}
