/** @format */

const socket = io();
const { name, room } = $.deparam(window.location.search);
socket.on('connect', () => {
  socket.emit('INFO_FROM_CLIENT_TO_SERVER', {
    name,
    room,
  });
  socket.emit('notiConnect', {
    from: 'Admin',
    createdAt: moment(new Date()).format('LT'),
    text: `${name} joined the room chat`,
  });
});
socket.on('toOtherUser', (message) => {
  const text = message.text;
  const liTag = `<li>${text}</li>`;
  $('#message').append(liTag);
});

socket.on('toAllUser', (msg) => {
  const template = $('#message-template').html();
  const html = Mustache.render(template, {
    from: msg.from,
    createdAt: moment(msg.createdAt).format('LT'),
    text: msg.text,
  });
  $('#message').append(html);
});

socket.on('USER_LIST', (msg) => {
  const users = msg.users;
  const ol = $('<ol></ol>');

  users.forEach((user) => {
    const li = $(`<li>${user.name}</li>`);
    ol.append(li);
  });
  $('#users').html(ol);
});

socket.on('LOCATION_FROM_CLIENT_TO_SERVER', (msg) => {
  const template = $('#location-message-template').html();
  const html = Mustache.render(template, {
    from: msg.from,
    createdAt: moment(msg.createdAt).format('LT'),
    url: `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.870735636578!2d${msg.lng}!3d${msg.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ5JzE2LjMiTiAxMDbCsDQyJzQyLjEiRQ!5e0!3m2!1svi!2s!4v1595640229835!5m2!1svi!2s`,
  });
  $('#message').append(html);
});

socket.on('USER_DISCONNECT', (msg) => {
  const template = $('#message-template').html();
  const html = Mustache.render(template, {
    from: msg.from,
    createdAt: moment(msg.createdAt).format('LT'),
    text: msg.text,
  });
  const users = msg.users;
  const ol = $('<ol></ol>');

  users.forEach((user) => {
    const li = $(`<li>${user.name}</li>`);
    ol.append(li);
  });
  $('#users').html(ol);
  $('#message').append(html);
});

$('#message-form').on('submit', (e) => {
  e.preventDefault();
  const text = $('[name=message]').val();

  $('[name=message]').val('');

  if (text !== '') {
    socket.emit('fromClient', {
      from: name,
      text,
      createdAt: new Date().getTime(),
    });
  }
  $('#message').scrollTop($('#message').height());
});

$('#send-location').on('click', (e) => {
  if (!navigator.geolocation) return alert('Your browser is too old');
  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    socket.emit('LOCATION_FROM_CLIENT_TO_SERVER', {
      from: name,
      lat,
      lng,
      createAt: new Date(),
    });
  });
});

var typing = false;
var timeout = undefined;

function timeoutFunction() {
  typing = false;
  socket.emit('noLongerTypingMessage');
}

function onKeyDownNotEnter() {
  if (typing == false) {
    typing = true;
    socket.emit('typingMessage', { from: name });
    timeout = setTimeout(timeoutFunction, 1000);
  } else {
    clearTimeout(timeout);
    timeout = setTimeout(timeoutFunction, 1000);
  }
}

socket.on('isMessageTyping', (msg) => {
  document.getElementById('name').innerHTML = msg.from;
  document.getElementById('chatting').classList.add('show');
});

socket.on('isMessageNotTyping', () => {
  document.getElementById('chatting').classList.remove('show');
});
