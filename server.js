const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const dotenv = require("dotenv")

const socketHandler = require("./socketHandler")
const connectDB = require("./Config/db")

dotenv.config()

connectDB()

const app = express()
app.use(cors())

const server = http.createServer(app)

const io = new Server(server,{
    cors:{
        origin:"*"
    }
})

socketHandler(io)

server.listen(process.env.PORT || 5000,()=>{
    console.log("Server running on port 5000")
})