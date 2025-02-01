const socket = io();
let username = "";

// Select elements
const usernamePrompt = document.getElementById("usernamePrompt");
const usernameInput = document.getElementById("usernameInput");
const joinBtn = document.getElementById("joinBtn");
const chatContainer = document.getElementById("chat");
const usersList = document.getElementById("users");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const messagesDiv = document.getElementById("messages");
const typingIndicator = document.getElementById("typingIndicator");

// User joins the chat
joinBtn.addEventListener("click", () => {
    username = usernameInput.value.trim();
    if (username) {
        socket.emit("joinChat", username);
        usernamePrompt.style.display = "none";
        chatContainer.style.display = "block";
    } else {
        alert("Please enter a valid username.");
    }
});

// Send message on button click
sendBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && messageInput.value.trim()) {
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        socket.emit("chatMessage", message);
        messageInput.value = "";
    }
}

// Receive and display messages
socket.on("chatMessage", (data) => {
    typingIndicator.textContent = "";
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", data.username === username ? "sent" : "received");
    messageElement.innerHTML = `<b>${data.username}</b>: ${data.message} 
        <span class="timestamp">${data.time}</span>`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Display server messages (like user joined/left)
socket.on("serverMessage", (message) => {
    const messageElement = document.createElement("div");
    messageElement.classList.add("server-message");
    messageElement.textContent = message;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

// Update online users list
socket.on("updateUsers", (users) => {
    usersList.innerHTML = "";
    users.forEach((user) => {
        const li = document.createElement("li");
        li.textContent = user;
        usersList.appendChild(li);
    });
});

// Display typing indicator
messageInput.addEventListener("input", () => {
    socket.emit("typing");
});

socket.on("typing", (user) => {
    typingIndicator.textContent = `${user} is typing...`;
    setTimeout(() => { typingIndicator.textContent = ""; }, 2000);
});
