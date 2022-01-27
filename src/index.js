const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const pathToPublic = path.join(__dirname, '../public');

app.use(express.static(pathToPublic));


io.on('connection', (socket) => {
    console.log('New user connected');

    socket.emit('message', 'Welcome!')
    socket.broadcast.emit('message', 'New user joined')

    socket.on('sendMessage', (message, callback) => {
        io.emit('message', message);

        if (callback) {
            callback();
        }
        
    });

    socket.on('sendLocation', (coords) => {
        io.emit('message', `Location: ${coords.latitude}, ${coords.longitude}`);
    });

    socket.on('disconnect', () => {
        io.emit('message', 'User disconnected');
    }); 
    
});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    }
);