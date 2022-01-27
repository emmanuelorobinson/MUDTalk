const socket = io();

const btn = document.getElementById('add');
const formDom = document.getElementById('message-form');
const sendLoc = document.getElementById('send-location');

socket.on('message', (message) => {
    console.log(message);
});

formDom.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = document.getElementById('message');

    socket.emit('sendMessage', msg.value, (error) => {
        msg.value = '';
        msg.focus();

        if (error) {
            return console.log(error);
        }

        console.log('Message delivered');
    });
    msg.value = '';
});

sendLoc.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    sendLoc.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        });
        sendLoc.removeAttribute('disabled');
    });
});