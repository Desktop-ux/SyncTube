const roomManager = require("./roomManager");
const Room = require("./models/Room");

function canControl(roomId, userId) {
  const role = roomManager.getUserRole(roomId, userId);

  return role === "host" || role === "moderator";
}

function socketHandler(io) {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", async ({ roomId, username }) => {
      console.log("join_room event:", roomId, username);

      let room = roomManager.getRoom(roomId);
      let dbRoom = await Room.findOne({ roomId });

      let role = "participant";

      if (!room) {
        role = "host";

        room = roomManager.createRoom(roomId, {
          id: socket.id,
          username,
          role,
        });

        if (!dbRoom) {
          dbRoom = await Room.create({
            roomId,
            host: username,
            videoId: null,
            playState: "pause",
            currentTime: 0,
            participants: [
              {
                userId: socket.id,
                username,
                role,
              },
            ],
          });
        }
      } else {
        roomManager.joinRoom(roomId, {
          id: socket.id,
          username,
          role,
        });

        await Room.updateOne(
          { roomId },
          {
            $push: {
              participants: {
                userId: socket.id,
                username,
                role,
              },
            },
          },
        );
      }

      socket.join(roomId);

      const updatedRoom = roomManager.getRoom(roomId);

      io.to(roomId).emit("participants_update", updatedRoom.participants);

      const roomState = await Room.findOne({ roomId });

      socket.emit("sync_state", {
        videoId: roomState.videoId,
        playState: roomState.playState,
        currentTime: roomState.currentTime,
      });
    });

    socket.on("play", async ({ roomId }) => {
      if (!canControl(roomId, socket.id)) {
        socket.emit("permission_denied", {
          action: "play",
          message: "You do not have permission to control playback",
        });

        return;
      }

      roomManager.updateVideoState(roomId, {
        playState: "play",
      });

      await Room.updateOne({ roomId }, { playState: "play" });

      socket.to(roomId).emit("play");

      console.log("play event:", roomId);
    });

    socket.on("pause", async ({ roomId }) => {
      if (!canControl(roomId, socket.id)) {
        socket.emit("permission_denied", {
          action: "pause",
          message: "You do not have permission to control playback",
        });

        return;
      }

      roomManager.updateVideoState(roomId, {
        playState: "pause",
      });

      await Room.updateOne({ roomId }, { playState: "pause" });

      socket.to(roomId).emit("pause");

      console.log("pause event:", roomId);
    });

    socket.on("seek", async ({ roomId, time }) => {
      if (!canControl(roomId, socket.id)) {
        socket.emit("permission_denied", {
          action: "seek",
          message: "You do not have permission to control playback",
        });

        return;
      }

      roomManager.updateVideoState(roomId, {
        currentTime: time,
      });

      await Room.updateOne({ roomId }, { currentTime: time });

      socket.to(roomId).emit("seek", { time });

      console.log("seek event:", roomId, time);
    });

    socket.on("change_video", async ({ roomId, videoId }) => {
      if (!canControl(roomId, socket.id)) {
        socket.emit("permission_denied", {
          action: "change_video",
          message: "You do not have permission to control playback",
        });

        return;
      }

      roomManager.updateVideoState(roomId, {
        videoId,
        currentTime: 0,
      });

      await Room.updateOne(
        { roomId },
        {
          videoId,
          currentTime: 0,
        },
      );

      io.to(roomId).emit("change_video", { videoId });

      console.log("change_video event:", roomId, videoId);
    });

    socket.on("assign_role", ({ roomId, userId, role }) => {
      const senderRole = roomManager.getUserRole(roomId, socket.id);

      if (senderRole !== "host") {
        console.log("Only host can assign roles");
        return;
      }

      const updatedRoom = roomManager.assignRole(roomId, userId, role);

      if (!updatedRoom) return;

      io.to(roomId).emit("participants_update", updatedRoom.participants);

      console.log("Role assigned:", userId, role);
    });

    socket.on("remove_participant", async ({ roomId, userId }) => {
      const senderRole = roomManager.getUserRole(roomId, socket.id);

      if (senderRole !== "host") {
        console.log("Only host can remove participants");
        return;
      }

      const updatedRoom = roomManager.removeParticipant(roomId, userId);

      if (!updatedRoom) return;

      await Room.updateOne(
        { roomId },
        {
          $pull: {
            participants: { userId },
          },
        },
      );

      io.to(roomId).emit("participants_update", updatedRoom.participants);

      io.to(userId).emit("removed_from_room");

      console.log("User removed:", userId);
    });

    

    socket.on("disconnect", async () => {
      const roomId = roomManager.removeUser(socket.id);

      if (!roomId) return;

      await Room.updateOne(
        { roomId },
        {
          $pull: {
            participants: { userId: socket.id },
          },
        },
      );

      const room = roomManager.getRoom(roomId);

      if (room) {
        io.to(roomId).emit("participants_update", room.participants);
      }

      console.log("User disconnected:", socket.id);
    });
  });
}

module.exports = socketHandler;
