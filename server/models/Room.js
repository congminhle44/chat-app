class Room {
  constructor() {
    this.list = [];
  }

  createUser(id, name, room) {
    const user = { id, name, room };
    this.list.push(user);
  }

  getUserById(id) {
    const user = this.list.filter((user) => user.id === id)[0];
    return user;
  }

  removeUser(id) {
    const index = this.list.findIndex((user) => user.id === id);
    const user = this.list[index];
    this.list.splice(user, 1);
    return user;
  }

  getUserByRoom(room) {
    return this.list.filter((user) => user.room === room);
  }
}

module.exports = Room;
