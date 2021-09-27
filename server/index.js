/** @format */

const express = require('express');
const app = express();
const path = require('path'); //build-in nodejs
const socketio = require('socket.io');

const http = require('http'); //build-in nodejs
const server = http.createServer(app);

const Room = require('./models/Room');

const _room = new Room();

io = socketio(server);

// On là lắng nghe
io.on('connection', (socket) => {
  //   Emit là phát đi cho client tương tác với server
  // socket.emit("fromServer", {
  //   text: "Hello user",
  //   from: "admin",
  //   createdAt: new Date(),
  // });

  //   broadcast.emit phát đi cho những client không tương tác với server
  //   socket.broadcast.emit("fromServer", {
  //     text: "New user joined",
  //     from: "admin",
  //     createdAt: new Date(),
  //   });

  socket.on('INFO_FROM_CLIENT_TO_SERVER', (msg) => {
    const { name, room } = msg;
    _room.createUser(socket.id, name, room);

    socket.join(room);

    socket.on('LOCATION_FROM_CLIENT_TO_SERVER', (msg) => {
      io.to(room).emit('LOCATION_FROM_CLIENT_TO_SERVER', msg);
    });

    socket.on('notiConnect', (msg) => {
      socket.to(room).broadcast.emit('toAllUser', msg);
    });

    io.to(room).emit('USER_LIST', {
      users: _room.getUserByRoom(room),
    });

    socket.on('fromClient', (message) => {
      io.to(room).emit('toAllUser', message);
    });
    socket.on('typingMessage', (msg) => {
      socket.to(room).broadcast.emit('isMessageTyping', msg);
    });
    socket.on('noLongerTypingMessage', () => {
      socket.to(room).broadcast.emit('isMessageNotTyping');
    });
    socket.on('disconnect', () => {
      const removedUser = _room.removeUser(socket.id);
      if (removedUser) {
        io.to(room).emit('USER_DISCONNECT', {
          from: 'Admin',
          text: `${removedUser.name} left room`,
          createdAt: new Date().getTime(),
          users: _room.getUserByRoom(room),
        });
      }
    });
  });
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log('App is listening to port', port);
});

const publicPath = path.join(__dirname + '/../public'); // do file đang nằm trong folder server nên phải đi ra ngoài mới dẫn đến folder public
app.use(express.static(publicPath));
