# SyncTube – YouTube Watch Party 🎬

SyncTube is a small project I built to watch YouTube videos together with friends in real time. Basically one person hosts the room and everyone else in the room sees the same video playing at the same time. So if the host pauses or skips, it changes for everyone.

The idea was kinda inspired by things like Teleparty but made using React and Socket.IO just to learn real-time systems and build something fun.

---

## What it can do

**Real time video sync**

When the host plays, pauses or moves the video timeline it updates for everyone in the room almost instantly.

**Rooms**

Users can create or join a room using a room id. Each room works like a small watch party.

**Roles**

There are different roles in the room.

* Host → controls the video
* Moderator → can help manage things
* Participant → just watches the video

**Refresh handling**

If someone refreshes the page the room doesn't reset. The current video and timestamp is restored.

**YouTube integration**

Videos are loaded using the YouTube IFrame player.

---

## Tech used

Frontend

* React
* React YouTube player
* Socket.io client
* CSS

Backend

* Node.js
* Express
* Socket.io

Database

* MongoDB (used for saving room state)

Deployment

* Vercel for frontend
* Render for backend

---

## Project structure

```
SyncTube
│
├── client
│   ├── src
│   │   ├── components
│   │   │   ├── VideoPlayer.jsx
│   │   │   ├── Room.jsx
│   │   │   └── ParticipantList.jsx
│   │   ├── socket.js
│   │   └── App.jsx
│
├── server
│   ├── models
│   │   └── Room.js
│   ├── socket
│   │   └── socketHandler.js
│   └── server.js
```

It is not the cleanest structure yet but it works for now.

---

## How to run it locally

Clone the repo first

```
git clone https://github.com/Desktop-ux/SyncTube.git
cd SyncTube
```

Install frontend dependencies

```
cd client
npm install
```

Install backend dependencies

```
cd server
npm install
```

---

## Environment setup

Create a `.env` file inside the **server** folder.

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

---

## Start the project

Run backend

```
cd server
npm run dev
```

Run frontend

```
cd client
npm start
```

After that open the browser and create or join a room.

---

## How the syncing works (simple idea)

When the host interacts with the video player it sends events through Socket.IO.
The server then broadcasts those events to everyone in the room so their player updates as well.

Room data like current video and timestamp is also saved in MongoDB so if someone refreshes it doesn't lose the state.

---

## Things I still want to add later

* room chat
* video queue
* better UI
* maybe user login
* ability to transfer host

This project was mostly built for learning real time apps and WebSockets so there are probably many improvements that can still be made.
