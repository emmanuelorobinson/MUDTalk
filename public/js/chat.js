const socket = io();

const btn = document.getElementById('add');
const $msgForm = document.getElementById('message-form');
const $msgInput = document.getElementById('message');
const $msgButton = document.getElementById('send');
const $sendLoc = document.getElementById('send-location');
const $messages = document.querySelector('#msgs');

//Templates
const msgTemplate = document.querySelector('#msg-template').innerHTML;
const locTemplate = document.querySelector('#loc-template').innerHTML;


socket.on('message', (message) => {
    console.log(message);

    const html = Mustache.render(msgTemplate, {
        message
    });
    $messages.insertAdjacentHTML('beforeend', html);

});

socket.on('locationMessage', (url) => {
    console.log(url);

    const html = Mustache.render(locTemplate, {
        url: url
    });

    $messages.insertAdjacentHTML('beforeend', html);
});

$msgForm.addEventListener('submit', (e) => {
    e.preventDefault();

    $msgButton.setAttribute('disabled', 'disabled');

    const msg = document.getElementById('message').value;

    socket.emit('sendMessage', msg, (error) => {
        $msgButton.removeAttribute('disabled');
        $msgInput.value = '';
        $msgInput.focus();
        
        if (error) {
            return console.log(error);
        }

        console.log('Message delivered');
    });
});

$sendLoc.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser');
    }

    $sendLoc.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {

            if (error) {
                return console.log(error);
            }

            $sendLoc.removeAttribute('disabled');
            console.log('Location shared');
        });
        $sendLoc.removeAttribute('disabled');
    });
});