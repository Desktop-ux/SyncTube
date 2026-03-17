const roomManager = require("./roomManager")

function canControl(roomId, userId) {

  const role = roomManager.getUserRole(roomId, userId)

  return role === "host" || role === "moderator"
}

function socketHandler(io) {

  io.on("connection", (socket) => {

    console.log("User connected:", socket.id)

    socket.on("join_room", ({ roomId, username }) => {

      console.log("join_room event:", roomId, username)

      let room = roomManager.getRoom(roomId)

      let role = "participant"

      if (!room) {

        role = "host"

        room = roomManager.createRoom(roomId, {
          id: socket.id,
          username,
          role
        })

        console.log("Creating new room:", roomId)

      } else {

        roomManager.joinRoom(roomId, {
          id: socket.id,
          username,
          role
        })

        console.log("Joining existing room:", roomId)

      }

      socket.join(roomId)

      const updatedRoom = roomManager.getRoom(roomId)

      io.to(roomId).emit("participants_update", updatedRoom.participants)

      socket.emit("sync_state", {
        videoId: updatedRoom.videoId,
        playState: updatedRoom.playState,
        currentTime: updatedRoom.currentTime
      })

    })


    socket.on("play", ({ roomId }) => {

      if (!canControl(roomId, socket.id)) {

        socket.emit("permission_denied", {
          action: "play",
          message: "You do not have permission to control playback"
        })

        return
      }

      roomManager.updateVideoState(roomId, {
        playState: "play"
      })

      socket.to(roomId).emit("play")

      console.log("play event:", roomId)

    })


    socket.on("pause", ({ roomId }) => {

      if (!canControl(roomId, socket.id)) {

        socket.emit("permission_denied", {
          action: "pause",
          message: "You do not have permission to control playback"
        })

        return
      }

      roomManager.updateVideoState(roomId, {
        playState: "pause"
      })

      socket.to(roomId).emit("pause")

      console.log("pause event:", roomId)

    })


    socket.on("seek", ({ roomId, time }) => {

      if (!canControl(roomId, socket.id)) {

        socket.emit("permission_denied", {
          action: "seek",
          message: "You do not have permission to control playback"
        })

        return
      }

      roomManager.updateVideoState(roomId, {
        currentTime: time
      })

      socket.to(roomId).emit("seek", { time })

      console.log("seek event:", roomId, time)

    })


    socket.on("change_video", ({ roomId, videoId }) => {

      if (!canControl(roomId, socket.id)) {

        socket.emit("permission_denied", {
          action: "change_video",
          message: "You do not have permission to control playback"
        })

        return
      }

      roomManager.updateVideoState(roomId, {
        videoId,
        currentTime: 0
      })

      io.to(roomId).emit("change_video", { videoId })

      console.log("change_video event:", roomId, videoId)

    })


    socket.on("assign_role", ({ roomId, userId, role }) => {

      const senderRole = roomManager.getUserRole(roomId, socket.id)

      if (senderRole !== "host") {

        console.log("Only host can assign roles")
        return
      }

      const updatedRoom = roomManager.assignRole(roomId, userId, role)

      if (!updatedRoom) return

      io.to(roomId).emit("participants_update", updatedRoom.participants)

      console.log("Role assigned:", userId, role)

    })


    socket.on("remove_participant", ({ roomId, userId }) => {

      const senderRole = roomManager.getUserRole(roomId, socket.id)

      if (senderRole !== "host") {

        console.log("Only host can remove participants")
        return
      }

      const updatedRoom = roomManager.removeParticipant(roomId, userId)

      if (!updatedRoom) return

      io.to(roomId).emit("participants_update", updatedRoom.participants)

      io.to(userId).emit("removed_from_room")

      console.log("User removed:", userId)

    })


    socket.on("disconnect", () => {

      const roomId = roomManager.removeUser(socket.id)

      if (!roomId) return

      const room = roomManager.getRoom(roomId)

      if (room) {
        io.to(roomId).emit("participants_update", room.participants)
      }

      console.log("User disconnected:", socket.id)

    })

  })

}

module.exports = socketHandler