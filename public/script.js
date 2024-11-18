document.addEventListener('DOMContentLoaded', function() {
    const socket = io('http://localhost:3001');

    const btn = document.getElementById("send-msg");

    fetch("/getchat").then(res => res.text())
    .then(data => {
        const chat = document.getElementById("chat-messages");
        const messages = data.split("\n");

        messages.forEach(msg => {
            if(msg.trim() != "") {
                const p = document.createElement("div");
                p.classList.add("chat-message");
                p.innerHTML = "<p>" + msg + "</p>";

                chat.appendChild(p);
            }
        });
    });

    function sendChat(msg) {
        const box = document.getElementById("msg");

        box.value = "";
        socket.emit("chat", msg);
    }

    btn.addEventListener('click', function() {
        sendChat(document.getElementById("msg").value);
    });

    // Detect enter
    document.getElementById("msg").addEventListener("keypress", function(e) {
        if(e.key == "Enter") {
            sendChat(document.getElementById("msg").value);
        }
    })

    socket.on("chat", function(msg) {
        const p = document.createElement("div");
        p.classList.add("chat-message");
        p.innerHTML = "<p>" + msg + "</p>";

        const chatMessages = document.getElementById("chat-messages");
        chatMessages.appendChild(p);
        window.scrollTo(0, document.body.scrollHeight);
    });
});