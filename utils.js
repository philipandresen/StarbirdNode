import fs from "fs";

export function log(content, method = console.info) {
    const currentTime = new Date(Date.now());
    method(`[${currentTime.toISOString()}] ${content}`)
    fs.appendFileSync('log.txt', `[${currentTime.toISOString()}] ${content}\n`);
}
