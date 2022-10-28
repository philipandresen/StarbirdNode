# StarbirdNode

This is a simple node application for performing automated administrative tasks on the Z820 on-premise server.

## Prerequisites:
In order to run this application locally you will need to have:
1. Setup a config profile for the PC running the app in default.json
2. Installed Node (v19 was used in development, but 18 is probably okay too)
3. Checked out the code from the repo (downloaded the project to some local directory)
4. Run NPM install (Maybe, I might also include that in the run script in package.json)
5. Ensure your backup directory is one that your backup user has access to (if you don't you'll see an error saying about as much when you run the script)
6. execute the following command in the project folder 
   1. `env PC_NAME=SERVER-Z820 DB_PASS=[whatever you set your backup user password to] node backup.js`

## Actual function
This is likely going to be run via the windows task scheduler through a windows .bat file calling the
node script. What it should be doing is:
1. Connecting to the database specified in the default.json config for the given `PC_NAME`
2. Create a backup of that database to the directory specified in the config
3. Archive that backup / compress it / encrypt it with a password
4. Upload the resulting archive to google drive or Alex's Ermine Server. Or both. Who knows.

I'm writing this readme at the state where the script can perform a backup by itself if given a config, 
but it does not yet compress / archive / encrypt that backup (SQL express doesn't support it natively)
so I need to get a library to do that still. It also does not upload the backup anywhere. This is all
maintained in Git also, so checking out `Master` is a good idea before running the script. Might work
that into the windows bat file process.

## Example .bat file content:
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
