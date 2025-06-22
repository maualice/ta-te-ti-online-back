import { CrearSalaArgs, UnirseASalaArgs } from "../interfaces/crearSala";
import { Jugador, JUGADOR_VACIO } from "../interfaces/jugador";

export class Sala {
    publica: boolean;
    jugadores: [Jugador, Jugador] = [{ ...JUGADOR_VACIO }, { ...JUGADOR_VACIO }] //{...JUGADOR_VACIO} para que sea una copia,si pongo JUGADOR_VACIO si modifico uno modifico los dos
    id: number

    constructor(args: CrearSalaArgs) {
        this.publica = args.publica
    }

    agregarJugador(nombre: string) {
        const indiceJugador = !this.jugadores[0].nombre ? 0 : 1
        this.jugadores[indiceJugador].nombre = nombre
        this.jugadores[indiceJugador].vidas = 3
        this.comunicarSala()
    }

    getSala() {
        return {
            publica: this.publica,
            jugadores: this.jugadores,
            id: this.id
        }
    }

    /** Comunica el estado actual de la sala a todos sus integrantes */
    comunicarSala() {
        global.io.to("sala-" + this.id).emit("sala", this.getSala())
    }

    jugarAbandono() {
        //Cambiar el estado de la sala a abanonado
        this.comunicarSala()
    }
}