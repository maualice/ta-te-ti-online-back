import { CrearSalaArgs } from "../interfaces/crearSala";
import { Jugador, JUGADOR_VACIO } from "../interfaces/jugador";
import { EstadoJuego, POSICION_TABLERO, SalaBackend, Tablero } from "../interfaces/sala";

export class Sala {
    publica: boolean;
    jugadores: [Jugador, Jugador] = [{ ...JUGADOR_VACIO }, { ...JUGADOR_VACIO }] //{...JUGADOR_VACIO} para que sea una copia,si pongo JUGADOR_VACIO si modifico uno modifico los dos
    id: number
    jugadorInicial: 0 | 1 = 0;
    tablero: Tablero = ["", "", "", "", "", "", "", "", "",]

    estado: EstadoJuego = "ESPERANDO_COMPAÑERO"

    constructor(args: CrearSalaArgs) {
        this.publica = args.publica
    }

    agregarJugador(nombre: string) {
        const indiceJugador = !this.jugadores[0].nombre ? 0 : 1
        this.jugadores[indiceJugador].nombre = nombre
        this.jugadores[indiceJugador].vidas = 3
        if (this.jugadores[1].nombre) { //quiere decir que ya hay dos jugadores
            this.estado = this.jugadorInicial === 0 ? "TURNO_P1" : "TURNO_P2"; //actualiza el estado que se visualiza en pantalla
            this.jugadorInicial = this.jugadorInicial === 0 ? 1 : 0; //no siempre queremos que P1 arranque jugando
        }
        this.comunicarSala();
    }

    getSala(): SalaBackend {
        return {
            publica: this.publica,
            jugadores: this.jugadores,
            id: this.id,
            estado: this.estado,
            tablero: this.tablero
        }
    }

    /** Comunica el estado actual de la sala a todos sus integrantes */
    comunicarSala() {
        global.io.to("sala-" + this.id).emit("sala", this.getSala())
    }

    jugadorAbandono() {
        this.estado = "ABANDONADO";
        this.comunicarSala();
    }

    jugar(numeroJugador: 1 | 2, posicion: POSICION_TABLERO) {
        if ((numeroJugador !== 1 && this.estado === "TURNO_P1") ||
            (numeroJugador !== 2 && this.estado === "TURNO_P2")) return;
        this.tablero[posicion] = numeroJugador;
        this.estado = this.estado === "TURNO_P1" ? "TURNO_P2" : "TURNO_P1";
        this.comunicarSala();
    }
}