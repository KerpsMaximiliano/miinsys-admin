import { EventEmitter, Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class AbmTurnoJornadaService {
    private mode = "View";

    getMode() {
        return this.mode;
    }

    setMode(mode: string) {
        this.mode = mode;
    }
}