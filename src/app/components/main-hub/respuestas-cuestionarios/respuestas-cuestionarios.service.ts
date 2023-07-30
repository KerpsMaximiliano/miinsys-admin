import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Usuario, UsuarioSearchParams } from "src/app/models/abm";
import { RespuestaBusquedaParams } from "src/app/models/respuesta-cuestionario";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})

export class RespuestasCuestionariosService {

    constructor(private http: HttpClient) {}

    getCuestionario(idCuestionario: number): Observable<any> {
        return this.http.get<any>(`${environment.base_url}Cuestionario?cue_id=${idCuestionario}`);
    }

    getCuestionariosByParams(params: RespuestaBusquedaParams): Observable<any> {
        return this.http.post<any>(`${environment.base_url}RespuestaCuestionario/GetByParams`, params);
    }

    getRespuesta(idRespuestaCuestionario: number):Observable<any> {
        return this.http.get<any>(`${environment.base_url}RespuestaCuestionario?id_respuesta_cuestionario=${idRespuestaCuestionario}`);
    }

    getLocation(latitude: number, longitude: number) {
        return this.http.get(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`, { responseType: 'text' });
    }
}