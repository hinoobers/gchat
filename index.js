const express = require("express");
const {Server} = require("socket.io");
const http = require("http");
const app = express();

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

io.on("connection", (socket) => {
    socket.on("chat", (msg) => {
        io.emit("chat", msg);
        appendChatLog(msg);
    });
});

io.listen(3001);

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});