export function log(content, method = console.info){
    const currentTime = new Date(Date.now());
    method(`[${currentTime.toISOString()}] ${content}`)
}