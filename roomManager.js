class RoomManager {

    constructor() {
        this.rooms = {}
    }

    createRoom(roomId, host) {

        this.rooms[roomId] = {
            host: host.id,
            videoId: null,
            playState: "pause",
            currentTime: 0,
            participants: [host]
        }

        return this.rooms[roomId]
    }

    joinRoom(roomId, user) {

        const room = this.rooms[roomId]

        if (!room) return null

        room.participants.push(user)

        return room
    }

    getRoom(roomId) {
        return this.rooms[roomId]
    }

    getUserRole(roomId, userId) {

        const room = this.rooms[roomId]

        if (!room) return null

        const user = room.participants.find(p => p.id === userId)

        if (!user) return null

        return user.role
    }

    assignRole(roomId, userId, newRole) {

        const room = this.rooms[roomId]

        if (!room) return null

        const user = room.participants.find(p => p.id === userId)

        if (!user) return null

        user.role = newRole

        return room
    }

    removeParticipant(roomId, userId) {

        const room = this.rooms[roomId]

        if (!room) return null

        room.participants = room.participants.filter(p => p.id !== userId)

        return room
    }

    updateVideoState(roomId, state) {

        const room = this.rooms[roomId]

        if (!room) return

        room.videoId = state.videoId ?? room.videoId
        room.playState = state.playState ?? room.playState
        room.currentTime = state.currentTime ?? room.currentTime
    }

}

module.exports = new RoomManager()