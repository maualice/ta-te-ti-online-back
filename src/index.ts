import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const app = express();
const server = createServer(app)
const io = new Server(server, { cors: { origin: "*" } }) //se puede conectar a nuestro servidor desde cualquier origen

server.listen(3000, () => {
    console.log('Server escuchando en el puerto 3000');
})

io.on("connection", (socket) => {//cliente llama a socket.connect() desde el frontend, Socket.IO del servidor automáticamente emite un evento "connection"
    console.log("Nueva conexion");
    socket.emit("mensaje desde el back")
    socket.on("Mensaje custom", () => console.log("Recibi un mensaje custom"))
})