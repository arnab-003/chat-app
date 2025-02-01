const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static("public"));

let users = {}; // Stores connected users

io.on("connection", (socket) => {
    console.log("A user connected");

    // User joins the chat
    socket.on("joinChat", (username) => {
        if (!username) return;
        socket.username = username;
        users[socket.id] = username;
        
        // Notify all users
        io.emit("updateUsers", Object.values(users));
        io.emit("serverMessage", `${username} has joined the chat.`);
    });

    // Handle chat message
    socket.on("chatMessage", (message) => {
        if (!socket.username || !message) return;
        io.emit("chatMessage", { 
            username: socket.username, 
            message: message, 
            time: new Date().toLocaleTimeString()
        });
    });

    // Handle typing event
    socket.on("typing", () => {
        socket.broadcast.emit("typing", socket.username);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
        if (socket.username) {
            delete users[socket.id];
            io.emit("updateUsers", Object.values(users));
            io.emit("serverMessage", `${socket.username} has left the chat.`);
        }
        console.log(`${socket.username || "A user"} disconnected`);
    });
});

const PORT = process.env.PORT || 2001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
