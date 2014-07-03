exports.signUp = function (data, socket, mongo) {
  socket.emit('sign_up_response', null);
};
