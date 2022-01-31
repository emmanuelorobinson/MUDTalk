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
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessgeHeight = $newMessage.offsetHeight + newMessageMargin;

    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;
    const scrollOffset = $messages.scrollTop + visibleHeight;
    
    if (containerHeight - newMessgeHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight;
    }
}

socket.on('message', (message) => {
    console.log(message);

    const html = Mustache.render(msgTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a'),
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();

});

socket.on('locationMessage', (url) => {
    console.log(url);

    const html = Mustache.render(locTemplate, {
        username: url.username,
        url: url.text,
        createdAt: moment(url.createdAt).format('h:mm a'),
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.getElementById('sidebar').innerHTML = html;
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

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});