import sql from "mssql";

const sqlConfig = {
    user: 'BackupUser',
    password: '5889091',
    database: 'AIM',
    server: 'PHILIP-PC\\SQLEXPRESS',
    port: 1433,
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: false,
        trustServerCertificate: true // true for local dev / self-signed certs
    }
}


try {
    // make sure that any items are correctly URL encoded in the connection string
    await sql.connect(sqlConfig)
    const result = await sql.query(`select * from dbo.test_data where ID = 2`);
    console.dir(result)
} catch (err) {
    console.error(err);
}
