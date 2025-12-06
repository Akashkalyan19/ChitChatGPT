module.exports = function (io) {
  io.on("connection", (socket) => {
    console.log("a user connected", socket.id);
    socket.on("message", ({ message, username, roomname, date }) => {
      io.to(roomname).emit("message", { message, username, date });
    });
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
    socket.on("room", ({ roomname, username }) => {
      socket.join(roomname);
      socket.emit("room", {
        message: "successfully joined Room",
        username: username,
      });
      io.to(roomname).emit("videoRoom", {
        message: "successfully joined Room",
        username,
        socketId: socket.id,
      });
    });
    socket.on("call-user", ({ to, offer }) => {
      io.to(to).emit("incoming-call", { offer, from: socket.id });
    });
    socket.on("call-accepted", ({ to, answer }) => {
      io.to(to).emit("call-accepted", { answer, from: socket.id });
    });
    socket.on("peer-nego-needed", ({ offer, to }) => {
      io.to(to).emit("peer-nego-needed", { offer, from: socket.id });
    });
    socket.on("peer-nego-done", ({ answer, to }) => {
      io.to(to).emit("peer-nego-final", { answer, from: socket.id });
    });
    socket.on("user-disconnected", ({ to }) => {
      io.to(to).emit("user-disconnected", { from: socket.id });
    });
    socket.on("wait-for-gpt", ({ message, username, roomname, date }) => {
      io.to(roomname).emit("wait-for-gpt", { message, username, date });
    });
    socket.on("bot-gpt-message", ({ message, username, roomname, date }) => {
      io.to(roomname).emit("bot-gpt-message", { message, username, date });
    });
  });
};
