
const request = require("supertest");
const app = require("./index");
const io = require("socket.io-client");
const waitFor = require("wait-for-expect");
const {generateUid} = require("./util");
const {filter} = require("./util");

it("should return a list of messages", async () => {
    const res = await request(app).get("/getchat");
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
});

it("should generate a usernames", async () => {
    const fakeSocket = {
        handshake: {
            address: "::1"
        }
    };
    const uid = await generateUid(fakeSocket);
    expect(uid).toHaveLength(8);
});

it("should generate a unique username based on IP", async () => {
    const fakeSocket = {
        handshake: {
            address: "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
        }
    };
    const fakeSocket2 = {
        handshake: {
            address: "2001:0db8:85a3:0000:0000:8a2e:0370:7335"
        }
    };
    const uid = await generateUid(fakeSocket);
    const uid2 = await generateUid(fakeSocket2);
    expect(uid).not.toEqual(uid2);
});

it("should post messages from socket", async () => {
    const socket = io("http://localhost:3001");
    await new Promise((resolve) => {
        socket.on("connect", async () => {
            socket.emit("chat", {temporary: true, msg: "Hello, world!"});
            await waitFor(async () => {
                const res = await request(app).get("/getchat");
                expect(res.body.some(msg => msg.msg === "Hello, world!")).toBe(true);
                socket.disconnect();
                resolve();
            });
        });
    });
});

it("should filter out untrusted URLs", () => {
    const safeMsg = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    const unsafeMsg = "https://www.evil.com/malware";
    expect(filter(safeMsg)).toBe(safeMsg);
    expect(filter(unsafeMsg)).toBe("[blocked]");
});

it("should truncate long messages", async () => {
    const longMsg = "a".repeat(105);

    // Post that, then check chat logs
    const socket = io("http://localhost:3001");
    await new Promise((resolve) => {
        socket.on("connect", async () => {
            socket.emit("chat", {temporary: true, msg: longMsg});
            await waitFor(async () => {
                const res = await request(app).get("/getchat");
                for(const msg of res.body) {
                    if(msg.msg.includes("a")){
                        expect(msg.msg.length).toBe(100);
                        break;
                    }
                }
                socket.disconnect();
                resolve();
            });
        });
    });
});