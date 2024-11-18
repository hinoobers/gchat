const crypto = require("crypto");
const fs = require("fs").promises;

async function appendChatLog(sender, msg) {
    try {
        const data = await fs.readFile("chat.log");
        const json = JSON.parse(data);
        json.push({sender, msg});
        await fs.writeFile('chat.log', JSON.stringify(json));
    } catch(err) {
        console.error(err);
    }
}

async function hash(msg) {
    return crypto.createHash("sha256").update(msg).digest("hex");
}

async function generateUid(socket) {
    if(socket.handshake.address === "::1" || socket.handshake.address.startsWith("::ffff")) {
        // Running in a locan environment, create a random string
        return crypto.randomBytes(4).toString("hex");
    } else {
        // Sure, this uses your IP address, but
        // a) dots and colons are removed, meaning an potential attacker would have to bruteforce all the possible combinations
        // b) it's hashed with SHA256, meaning the original data is not stored
        // c) half the time it's a mix of IPv6 and IPv4
        return (await hash(socket.handshake.address.replaceAll(".", "").replaceAll(":", ""))).substring(0, 8);
    }
}

function filter(msg) {
    // A) If it contains a URL, only allow trusted domains (youtube.com, github.com, google.com, etc)
    msg = msg.replace(/(https?:\/\/[^\s]+)/g, (url) => {
        const trustedDomains = [
            "youtube.com", "github.com", "google.com", "imgur.com", "photos.google.com", "i.natgeofe.com"
        ];
        const domain = new URL(url).hostname;
        
        if(trustedDomains.includes(domain)) {
            return url;
        } else {
            return "[blocked]";
        }
    });
    return msg;
}

module.exports = {filter, generateUid, hash, appendChatLog};