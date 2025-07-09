import express from 'express'
import { createServer } from 'node:http'
import { Server, Socket } from 'socket.io'
import { Sala } from './clases/sala';
import { CrearSalaArgs, UnirseASalaArgs } from './interfaces/crearSala';

const app = express();
const server = createServer(app)
const io = new Server(server, { cors: { origin: "*" } }) //se puede conectar a nuestro servidor desde cualquier origen
global.io = io

server.listen(3000, () => {
    console.log('Server escuchando en el puerto 3000');
})

let salas: Sala[] = []
let idProximaSala = 0

io.on("connection", (socket) => {//cliente llama a socket.connect() desde el frontend, Socket.IO del servidor automáticamente emite un evento "connection"
    //console.log("Nueva conexion");
    socket.on("encontrarSala", (callback) => buscarSalaPublica(callback))
    socket.on("crearSala", (args, callback) => crearSala(socket, callback, args))
    socket.on("unirseASala", (args, callback) => unirseASala(socket, callback, args))
    socket.on("disconnecting", () => {
        if (socket.rooms.size < 2) return        //contiene info del socket id 
        const salaJugador = salas.find(sala => sala.id == parseInt([...socket.rooms][1].substring(5))); //socket.rooms devuelve un objeto Set
        if (!salaJugador) return
        salaJugador?.jugadorAbandono()
        socket.conn.close()
        salas = salas.filter(sala => sala.id !== salaJugador.id)
    });
    socket.on("jugar", (args) => {
        //console.log("Viendo de registrar una jugada", args, buscarSala(args.salaId))
        buscarSala(args.salaId)?.jugar(args.jugador, args.posicion)
    })
    socket.on("nuevaRonda",(args)=> {
    //console.log("Viendo de empezar una nueva ronda",args, buscarSala(args.salaId))
    buscarSala(args.salaId)?.nuevaRonda();
  })
})

function buscarSalaPublica(callback: Function) {
    const salaDisponible = salas.find(sala => {
        if (!sala.publica) return false
        if (sala.jugadores[0].nombre && sala.jugadores[1].nombre) return false
        return true
    })
    callback(salaDisponible ? salaDisponible.id : null)
}

function crearSala(socket: Socket, callback: Function, args: CrearSalaArgs) {
    const nuevaSala = new Sala(args)
    nuevaSala.id = idProximaSala
    idProximaSala++
    salas.push(nuevaSala)
    unirseASala(socket, callback, {
        id: nuevaSala.id,
        nombreJugador: args.nombreJugador
    })
}

/** Une a un jugador a una sala */
function unirseASala(socket: Socket, callback: Function, args: UnirseASalaArgs) {
    if (!salas.length) return callback({ exito: false, mensaje: "No existen salas" });
    const salaIndex = salas.findIndex(sala => sala.id === args.id);
    if (salaIndex === -1) return callback({ exito: false, mensaje: "No existe la sala con ID " + args.id });
    if (salas[salaIndex].jugadores[0].nombre && salas[salaIndex].jugadores[1].nombre) return callback(
        { exito: false, mensaje: "La sala está llena" }
    );
    salas[salaIndex].agregarJugador(args.nombreJugador)
    socket.join("sala-" + salas[salaIndex].id)
    return callback({ exito: true, mensaje: "Unido a la sala " + salas[salaIndex].id, sala: salas[salaIndex].getSala() })
}

function buscarSala(id: number) {
    return salas.find(sala => sala.id === id)
}

