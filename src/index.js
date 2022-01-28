const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;
const pathToPublic = path.join(__dirname, '../public');

app.use(express.static(pathToPublic));


io.on('connection', (socket) => {
    console.log('New user connected');

    socket.emit('message', generateMessage('Admin', 'Welcome to the chat app'));
    socket.broadcast.emit('message', generateMessage('Admin', 'New user joined'));

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed');
        }

        io.emit('message', generateMessage(undefined, message));

        if (callback) {
            callback();
        }

    });

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocationMessage(undefined, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));

        if (callback) {
            callback();
        }
    });
    socket.on('disconnect', () => {
        io.emit('message', generateMessage('Admin', 'User left'));
    });

});

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
}
);