import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { CargaMasivaUsuariosParams, Rol, Usuario, UsuarioSearchParams } from "src/app/models/abm";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})

export class AbmUsuarioService {
    private mode = "View";

    constructor(private http: HttpClient) {}

    getUsersByParams(params: UsuarioSearchParams): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Authenticate/GetByParams`, params)
    }

    getUserByRut(rut: number): Observable<any> {
        return this.http.get<any>(`${environment.base_url}Authenticate?rut=` + rut)
    }

    createUser(user: Usuario): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Authenticate/register`, user)
    }

    updateUser(user: Usuario): Observable<any> {
        return this.http.put<any>(`${environment.base_url}Authenticate`, user)
    }

    getRoles(): Observable<Array<Rol>> {
        return this.http.get<Array<Rol>>(`${environment.base_url}Rol`)
    }

    recoverPassword(username: any): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Account/forgotPassword`, username);
    }

    cargaMasiva(params: CargaMasivaUsuariosParams, file: any, guardarDatos: number) {
        let formParams = new FormData();
        formParams.append('file', file);
        let url = "";
        if(params.id_planta) {
            url = `${environment.base_url}Authenticate/UploadUsers?id_empresa=${params.id_empresa}&id_planta=${params.id_planta}&id_estado=${params.id_estado}&contrase%C3%B1a=${params.contraseña}&guardar_datos=${guardarDatos}`;
        } else {
            url = `${environment.base_url}Authenticate/UploadUsers?id_empresa=${params.id_empresa}&id_estado=${params.id_estado}&contrase%C3%B1a=${params.contraseña}&guardar_datos=${guardarDatos}`;
        };
        return this.http.post<any>(url, formParams);
    }

    getMode() {
        return this.mode;
    }

    setMode(mode: string) {
        this.mode = mode;
    }
}