import sql from "mssql";
import config from "config";
import {log} from "./utils.js";

export default async function backup() {
    const dbConfig = config.get(`${process.env.PC_NAME}.dbConfig`);
    const backupConfig = config.get(`${process.env.PC_NAME}.backupConfig`);

    // Don't store Password in the config, but inject at runtime.
    const sqlConfig = {
        ...dbConfig,
        password: process.env.DB_PASS,
    };


    log(`Connecting to: ${sqlConfig.user}@${sqlConfig.server}...`)

    const dbConnection = await sql
        .connect(sqlConfig);

    if (dbConnection) {
        log(`Connected successfully.`)
    }

    log(`Backing up ${sqlConfig.database} to ${backupConfig.targetLocation}...`);

    const result = await sql
        .query(`
            DECLARE @fileName VARCHAR(256) -- filename for backup 
            DECLARE @fileDate VARCHAR(20) -- used for file name

            SELECT @fileDate =
                   CONVERT(VARCHAR(20), GETDATE(), 112) + '_' + REPLACE(CONVERT(VARCHAR(20), GETDATE(), 108), ':', '')
            SET @fileName = '${backupConfig.targetLocation}\\${sqlConfig.database}_' + @fileDate + '.bak'

            BACKUP DATABASE ${sqlConfig.database}
                TO DISK = @fileName
                WITH FORMAT,
                MEDIANAME = 'SQLServerBackups',
                NAME = 'Full Backup of DB: ${sqlConfig.database}';

            SELECT @fileName AS fullFilePath;
        `);

    log(`Closing DB Connection...`)
    await dbConnection.close();

    const backupFullFilePath = result.recordset[0].fullFilePath;
    log(`Backup completed successfully to ${backupFullFilePath}`);

    return backupFullFilePath;
}

