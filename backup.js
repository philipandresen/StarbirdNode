import sql from "mssql";
import config from "config";

const dbConfig = config.get(`${process.env.PC_NAME}.dbConfig`);
const backupConfig = config.get(`${process.env.PC_NAME}.backupConfig`);

// Don't store Password in the config, but inject at runtime.
const sqlConfig = {
    ...dbConfig,
    password: process.env.DB_PASS,
};

try {
    // make sure that any items are correctly URL encoded in the connection string
    await sql.connect(sqlConfig);
    const result = await sql.query(`
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
        
        SELECT @fileName AS fileName;
    `);
    console.dir(result);
    const backupFilePath = result.recordset[0].fileName;
    console.info(`Backup completed successfully to ${backupFilePath}`);
} catch (err) {
    console.error(err);
}
process.exit();
