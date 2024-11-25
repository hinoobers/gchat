document.addEventListener('DOMContentLoaded', function() {
    const socket = io('http://localhost:3001');

    const btn = document.getElementById("send-msg");

    
    function sanitize(msg) {
        return msg.replace(/[<>&"']/g, (c) => {
            return {
                '<': '&lt;',
                '>': '&gt;',
                '&': '&amp;',
                '"': '&quot;',
                "'": '&#039;'
            }[c];
        });
    }

    fetch("/getchat").then(res => res.json())
    .then(messages => {
        const chat = document.getElementById("chat-messages");

        messages.forEach(msgObject => {
            let msg = `${msgObject.sender} - ${msgObject.msg}`;
            
            const p = document.createElement("div");
            p.classList.add("chat-message");

            msg = sanitize(msg);
            msg = msg.replace(/(https?:\/\/[^\s]+)/g, (url) => {
                const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
                if(isImage) {
                    return "<img src='" + url + "' width='300' height='300'/>";
                } else {
                    return "<a href='" + url + "' target='_blank'>" + url + "</a>";
                }
            });

            p.innerHTML = "<p>" + msg + "</p>";

            chat.appendChild(p);
        });

        // When user first visits, they want to see latest messages
        window.scrollTo(0, document.body.scrollHeight);
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
    document.addEventListener("keypress", function(e) {
        if(e.key == "Enter") {
    
            if(document.activeElement != document.getElementById("msg")) {
                document.getElementById("msg").focus();
            }
            sendChat(document.getElementById("msg").value);
        }
    })

    socket.on("chat", function(msg) {
        const p = document.createElement("div");
        p.classList.add("chat-message");
        // Detect links and make them clickable

        msg = sanitize(msg);

        msg = msg.replace(/(https?:\/\/[^\s]+)/g, (url) => {
            const isImage = /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(url);
            if(isImage) {
                return "<img src='" + url + "' width='300' height='300'/>";
            } else {
                return "<a href='" + url + "' target='_blank'>" + url + "</a>";
            }
        });

        p.innerHTML = "<p>" + msg + "</p>";

        const chatMessages = document.getElementById("chat-messages");
        chatMessages.appendChild(p);
        window.scrollTo(0, document.body.scrollHeight);
    });
});