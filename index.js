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
    socket.on("chat", (msg) => {
        msg = msg.substring(0, 100).trim();
        if(msg == "") return;
        io.emit("chat", uid + " - " + filter(msg));
        appendChatLog(uid, filter(msg));
    });
});

io.listen(3001);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});