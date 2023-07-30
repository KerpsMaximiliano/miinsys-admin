import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AccionSearchParams, Accion } from "src/app/models/accion";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})

export class AbmAccionesService {
    private mode = "View";

    constructor(private http: HttpClient) {}

    getAccionesByParams(params: AccionSearchParams): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Accion/GetByParams`, params)
    }

    getAccionById(id: number): Observable<any> {
        return this.http.get<any>(`${environment.base_url}Accion?id_accion=` + id)
    }

    createAccion(accion: Accion): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Accion`, accion)
    }

    updateAccion(accion: Accion): Observable<any> {
        return this.http.put<any>(`${environment.base_url}Accion`, accion)
    }

    getPreguntasCriticasPorEmpresa(empresaId: number) {
        return this.http.post<any>(`${environment.base_url}Cuestionario/GetCriticByCompany?id_empresa=${empresaId}`, null)
    }

    getPreguntasCriticasPorCuestionario(cuestionarioId: number) {
        return this.http.post<any>(`${environment.base_url}Cuestionario/GetCriticQuestion?id_cuestionario=${cuestionarioId}`, null)
    }

    getMode() {
        return this.mode;
    }

    setMode(mode: string) {
        this.mode = mode;
    }
}