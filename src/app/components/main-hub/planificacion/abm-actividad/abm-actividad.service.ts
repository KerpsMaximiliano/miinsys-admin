import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Actividad, ActividadParams, Rol, Usuario, UsuarioSearchParams } from "src/app/models/abm";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})

export class AbmActividadService {
    private mode = "View";

    constructor(private http: HttpClient) {}

    getActividades(): Observable<any> {
        return this.http.get<any>(`${environment.base_url}Actividad`)
    }

    getActividadesByParams(params: ActividadParams): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Actividad/GetByParams`, params)
    }

    getActividadById(id: number): Observable<any> {
        return this.http.get<any>(`${environment.base_url}Actividad/GetByID?id_actividad=` + id)
    }

    createActividad(actividad: Actividad): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Actividad`, actividad)
    }

    updateActividad(actividad: Actividad): Observable<any> {
        return this.http.put<any>(`${environment.base_url}Actividad`, actividad)
    }

    getEstadosActividad() {
        return this.http.get<any>(`${environment.base_url}Actividad/GetEstados`)
    }

    getMode() {
        return this.mode;
    }

    setMode(mode: string) {
        this.mode = mode;
    }
}