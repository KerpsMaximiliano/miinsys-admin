import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { GestionIncidenciasParams, GestionIncidenciasPlanCierre } from "src/app/models/gestion-incidencias";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})

export class GestionIncidenciasService {

    constructor(private http: HttpClient) {}

    getEstados(): Observable<any> {
        return this.http.get<any>(`${environment.base_url}IncidenciaEstado`)
    }

    getByParams(params: GestionIncidenciasParams): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Incidencia/GetByParams`, params)
    }

    getById(id: number): Observable<any> {
        return this.http.get<any>(`${environment.base_url}Incidencia/GetByID?id_incidencia=` + id)
    }

    getUsersByCuestionarioId(idCuestionario: number): Observable<any> {
        return this.http.get<any>(`${environment.base_url}IncidenciaUsuarioAsignado/ReadUsersByForm?id_cuestionario=` + idCuestionario)
    }


    postIncidenciaUsuarioAsignado(data: {id_usuario: string, id_incidencia: number}): Observable<any> {
        return this.http.post<any>(`${environment.base_url}IncidenciaUsuarioAsignado`, data)
    }

    postIncidenciaPlanCierre(incidencia: GestionIncidenciasPlanCierre): Observable<any> {
        return this.http.post<any>(`${environment.base_url}IncidenciaPlanCierre`, incidencia)
    }

    getEstadosPermitidosIncidencia(idIncidencia: number): Observable<any> {
        return this.http.get<any>(`${environment.base_url}Incidencia/GetAllowStates?id_incidencia=` + idIncidencia)
    }

    postUpdateEstadoIncidencia(idIncidencia: number, idEstado: number, motivo: string): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Incidencia/UpdateState?id_incidencia=${idIncidencia}&id_estado=${idEstado}&motivo=${motivo}`, null)
    }

}