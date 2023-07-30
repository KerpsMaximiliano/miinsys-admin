import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Empresa } from "src/app/models/abm";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})

export class AbmEmpresaService {
    private mode = "View";

    constructor(
        private http: HttpClient
    ) {}

    getEmpresas(params: Empresa | null): Observable<any> {
        if(params == null) {
            return this.http.post<any>(`${environment.base_url}Empresa/GetByParams`, {
                id: 0,
                userName: ""
              })
        } else {
            return this.http.post<any>(`${environment.base_url}Empresa/GetByParams`, params)
        }
    }

    createEmpresa(empresa: Empresa): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Empresa`, empresa)
    }

    updateEmpresa(empresa: Empresa): Observable<any> {
        return this.http.put<any>(`${environment.base_url}Empresa`, empresa)
    }

    deleteEmpresa(id: number): Observable<any> {
        return this.http.delete<any>(`${environment.base_url}Empresa?empresaID?=` + id)
    }

    getGrupos(id: number): Observable<any> {
        return this.http.get<any>(`${environment.base_url}Grupo?id_empresa=` + id)
    }

    getPlantas(id: number): Observable<any> {
        return this.http.get<any>(`${environment.base_url}Planta?id_empresa=` + id)
    }

    getMode() {
        return this.mode;
    }

    setMode(mode: string) {
        this.mode = mode;
    }
}