import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Actividad, ActividadParams, PlanificacionParams, Rol, Usuario, UsuarioSearchParams } from "src/app/models/abm";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})

export class PlanificacionService {
    private mode = "View";

    constructor(private http: HttpClient) {}

    getPlanificacionesByParams(params: PlanificacionParams): Observable<any> {
        return this.http.post<any>(`${environment.base_url}ActividadRespuestas/GetByParams`, params)
    }

    getMode() {
        return this.mode;
    }

    setMode(mode: string) {
        this.mode = mode;
    }
}