const express = require("express");
const {Server} = require("socket.io");
const http = require("http");
const app = express();
const crypto = require("crypto");
const fs = require("fs").promises;
const {filter, generateUid, appendChatLog} = require("./util");

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

app.use(express.static("public/"));


// Each startup, delete temporary messages
(async () => {
    try {
        const data = await fs.readFile("chat.log");
        let json = JSON.parse(data);
        json = json.filter(m => !m.temporary);
        await fs.writeFile('chat.log', JSON.stringify(json));
    } catch(err) {
        console.error(err);
        await fs.writeFile('chat.log', "[]");
    }
})();

app.get("/getchat", async (req, res) => {
    try {
        const data = await fs.readFile("chat.log");
        const json = JSON.parse(data);
        return res.json(json);
    } catch(err) {
        console.error(err);
        res.status(400).json({error: "An error occurred"});
    }
})

io.on("connection", async (socket) => {
    const uid = await generateUid(socket);
    //console.log(uid + " connected");
    socket.on("chat", (data) => {
        let msg;
        let isNew = false;
        if(typeof data === "string") {
            msg = data;
        } else if(typeof data === "object" && data.msg) {
            msg = data.msg;
            isNew = true;
        } else {
            // Invalid message
            return;
        }


        msg = msg.substring(0, 100).trim();
        if(msg == "") return;
        io.emit("chat", uid + " - " + filter(msg));
        if(isNew) {
            data.msg = msg;
            appendChatLog(uid, filter(data));
        } else {
            appendChatLog(uid, filter(msg));
        }
    });
});

io.listen(3001);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});

module.exports = app;