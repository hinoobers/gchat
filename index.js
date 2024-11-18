const express = require("express");
const {Server} = require("socket.io");
const http = require("http");
const app = express();
const crypto = require("crypto");

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

app.use(express.static("public/"));

async function appendChatLog(msg) {
    const fs = require("fs");

    fs.appendFile("chat.log", msg + "\n", (err) => {
        if(err) {
            console.error(err);
        }
    });
}

async function hash(msg) {
    return crypto.createHash("sha256").update(msg).digest("hex");
}

async function generateUid(socket) {
    if(socket.handshake.address === "::1" || socket.handshake.address.startsWith("::ffff")) {
        // Running in a locan environment, create a random string
        return (await hash(Math.random().toString())).substring(0, 8);
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
        if(url.startsWith("https://youtube.com") || url.startsWith("https://github.com") || url.startsWith("https://google.com")) {
            return url;
        } else {
            return "[blocked]";
        }
    });
    return msg;
}

app.get("/getchat", (req, res) => {
    const fs = require("fs");

    fs.readFile("chat.log", "utf8", (err, data) => {
        if(err) {
            console.error(err);
            res.status(500).send("Internal server error");
        } else {
            res.send(data);
        }
    })
})

io.on("connection", async (socket) => {
    const uid = await generateUid(socket);
    //console.log(uid + " connected");
    socket.on("chat", (msg) => {
        msg = msg.substring(0, 40).trim();
        if(msg == "") return;
        io.emit("chat", uid + " - " + filter(msg));
        appendChatLog(uid + " - " + filter(msg));
    });
});

io.listen(3001);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});