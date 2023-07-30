import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { AgregarSeccion, CuestionarioInicial, CuestionarioSearchParams, CuestionarioUpdate, EditarSeccion, FirmaDatoAdicional, PreguntaCuestionario } from "src/app/models/cuestionario";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})

export class AbmCuestionarioService {
    private mode = "View";

    private cuestionario: any;

    constructor(
        private http: HttpClient
    ) {}

    getMode() {
        return this.mode;
    }

    setMode(mode: string) {
        this.mode = mode;
    }

    getCuestionario() {
        return this.cuestionario;
    }

    setCuestionario(cuest: any) {
        this.cuestionario = cuest;
    }

    createInitialCuestionario(cuest: CuestionarioInicial): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Cuestionario`, cuest)
    }

    duplicateCuesitonario(cuest: CuestionarioInicial, cueId: number): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Cuestionario/Replicate?id_cuestionario=${cueId}`, cuest)
    }

    getCreatedCuestionario(id: number): Observable<any> {
        return this.http.get<any>(`${environment.base_url}Cuestionario?cue_id=` + id)
    }

    getCreatedEnabledCuestionario(id: number): Observable<any> {
        //return this.http.get<any>(`${environment.base_url}Cuestionario/GetEnabled?cue_id=` + id)
        return this.http.get<any>(`${environment.base_url}Cuestionario/GetEnabledquestions?cue_id=` + id)
    }

    addSeccion(seccion: AgregarSeccion): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Cuestionario/CrearSeccion?id_cuestionario=` + seccion.id_cuestionario, seccion)
    }

    updateSeccion(seccion: EditarSeccion): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Cuestionario/ModificarSeccion`, seccion)
    }

    addPregunta(pregunta: PreguntaCuestionario, idCuestionario: number, idSeccion: number): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Cuestionario/CrearPregunta?id_cuestionario=` + idCuestionario + '&id_seccion=' + idSeccion, pregunta);
    }

    updatePregunta(pregunta: PreguntaCuestionario, idCuestionario: number, idSeccion: number, idPregunta: number): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Cuestionario/ModificarPregunta?id_cuestionario=` + idCuestionario + '&id_seccion=' + idSeccion + '&id_pregunta=' + idPregunta, pregunta);
    }

    getCuestionariosByParams(params: CuestionarioSearchParams): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Cuestionario/GetByParams`, params)
    }

    updateCuestionario(cuestionario: CuestionarioUpdate): Observable<any> {
        return this.http.put<any>(`${environment.base_url}Cuestionario`, cuestionario)
    }

    deletePregunta(preguntaId: number): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Cuestionario/EliminarPregunta?id_pregunta=` + preguntaId, null)
    }

    //Firmas datos adicionales

    getFirmaDatoAdicional(idPregunta: number): Observable<any> {
        return this.http.get<any>(`${environment.base_url}FirmaDatosAdicionales/GetByID?id_pregunta=` + idPregunta)
    }

    createFirmaDatoAdicional(firmas: {firmaDatoAdicional: Array<FirmaDatoAdicional>}): Observable<any> {
        return this.http.post<any>(`${environment.base_url}FirmaDatosAdicionales`, firmas)
    }

    updateFirmaDatoAdicional(firmas: {firmaDatoAdicional: Array<FirmaDatoAdicional>}): Observable<any> {
        return this.http.put<any>(`${environment.base_url}FirmaDatosAdicionales`, firmas)
    }

    deleteFirmaDatoAdicional(idFirma: number): Observable<any> {
        return this.http.post<any>(`${environment.base_url}FirmaDatosAdicionales/Delete?id_firma=` + idFirma, null)
    }

    deleteFirmaDatoAdicionalByPregunta(idPregunta: number): Observable<any> {
        return this.http.post<any>(`${environment.base_url}FirmaDatosAdicionales/DeleteByQuestion?id_pregunta=` + idPregunta, null)
    }
}