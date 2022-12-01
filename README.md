# StarbirdNode

This is a simple node application for performing automated administrative tasks on the Z820 on-premise server.

## Prerequisites:

In order to run this application locally you will need to have:

1. Set up a config profile for the PC running the app in default.json
   1. You should be able to follow the pattern in that file.
2. Installed Node (v19 was used in development, but 18 is probably okay too)
3. Checked out the code from the repo (can be done automatically with a bat file command)
4. Run NPM install (Can be done automatically with a bat file command)
5. Ensure your local backup directory is one that your local backup user has access to (if you don't you'll see an error 
   saying as much when you run the script)
6. Create a service account through the Google Cloud Console (https://console.cloud.google.com)
7. Make sure your service account has Editor access (probably?) and generate a key file for that service account
8. Download the key file and put it somewhere, point to it in the drive configuration subsection of the config
9. Make sure you enable google drive API access in your project in Google Cloud console.
10. Create a folder in google drive using the UI and share it with the service account you created (The console should
    provide you an email for that account)
11. Make sure you have 7zip installed and the path is referenced although if you do not do this there will be a regular
    zip fallback, and I am also including a 7zip executable in this project, so in most cases you don't need to do
    anything
12. execute the following command in the project folder
    1. `env PC_NAME=SERVER-Z820 DB_PASS=[???] BKP_PASS=[???] SENDGRID_API_KEY=[???] node main.js`
        1. DB_Pass is the password to the database for the Backup user
        2. BKP_PASS is the desired password on the encrypted Zip file
        3. SENDGRID_API_KEY is the API key for a sendgrid account for sending error emails.
           1. If this is not included, or is wrong, the app will still work, you will just get errors in the log only.

## Sometimes:

If the PC name ever changes you may need to update the configs to match. You'll notice I have a config for each PC the
script runs on, my personal one and the server itself.

## DO NOT EVER:

* Commit credentials to the git repository
* Commit a key file to the git repository
* Store credentials in the code
* Store the key file anywhere but the local server where the code is running
* Push changes directly to Master unless you want the server to start using those changes next time it runs.
    * Instead, commit changes only locally or push remotely to a branch while testing.

## Actual function

This will usually run via the windows task scheduler through a windows .bat file calling the
node script. What the program does at a high level is:

1. Connect to the database specified in the default.json config for the given `PC_NAME`
2Create a backup of that database to the directory specified in the config
2. Archive that backup / compress it / encrypt it with a password
3. Upload the resulting archive to google drive.
   1. This is done via a service account which has its own drive space (15GB by default from Google)
4. Clean up files locally and on drive. Starting out I set it to 26 hours expiry on local and 7 day expiry on drive

## Example .bat file content:

This file will never actually exist in this git repository because it contains SENSITIVE INFORMATION but here is an
example of what one might look like!

```BAT
git pull origin master
CALL npm install
SET PC_NAME=SERVER-Z820
SET DB_PASS=SUPER_SECRET_PASSWORD
CALL node backup.js >> log.txt
```

* We pull origin master to ensure we have the latest version of the script
* We NPM install to take care of all dependencies
* We set environment variables
* Then we call the backup script. Logs are appended to log.txt.

## Decompressing backups
Backups are compressed using 7Zip by default, or if that fails, they will be compressed using the regular zip format.
Both formats include encryption / password protection. The password will be passed into the script as part of the
batch file arguments (see the example bat file above). This password should also be stored in a password manager.

Windows can natively decompress zip files, but you will need to go to https://www.7-zip.org/ to get the 7Zip app. 
7Zip is actually a prerequisite of this program, but it is included / installed as part of the automated deployment.