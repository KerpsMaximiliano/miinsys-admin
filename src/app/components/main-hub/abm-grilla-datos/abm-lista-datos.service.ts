import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ListaDatosCrear, ListaDatosEditar, ListaDatosParams } from "src/app/models/lista-datos";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})

export class AbmListaDatosService {
    private mode = "View";

    constructor(private http: HttpClient) {}

    getMode() {
        return this.mode;
    }

    setMode(mode: string) {
        this.mode = mode;
    }

    getListaById(listaId: number): Observable<any> {
        return this.http.get<any>(`${environment.base_url}ListaDatos?id=` + listaId)
    }

    getListaByParams(params: ListaDatosParams): Observable<any> {
        return this.http.post<any>(`${environment.base_url}ListaDatos/GetByParams`, params)
    }

    createLista(lista: ListaDatosCrear): Observable<any> {
        return this.http.post<any>(`${environment.base_url}ListaDatos`, lista)
    }

    updateLista(lista: ListaDatosEditar): Observable<any> {
        return this.http.put<any>(`${environment.base_url}ListaDatos`, lista)
    }

    getRespuestaLista(idRespuestaCuestionario: number, idPregunta: number): Observable<any> {
        return this.http.post<any>(`${environment.base_url}ListaDatos/GetQuestionAutoComplete?id_respuesta_cuestionario=${idRespuestaCuestionario}&id_pregunta=${idPregunta}`, null)
    }
}