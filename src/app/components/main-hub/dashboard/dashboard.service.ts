import { HttpClient } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})

export class DashboardService {

    constructor(
        private http: HttpClient
    ) {}

    getPorCuestionario(idEmpresa: number, fechaDesde: Date | null, fechaHasta: Date | null): Observable<any> {
        let params = this.formatParams(idEmpresa, fechaDesde, fechaHasta);
        return this.http.get<any>(`${environment.base_url}Grafico/PorCuestionario?${params}`)
    }

    getPorPlanta(idEmpresa: number, fechaDesde: Date | null, fechaHasta: Date | null): Observable<any> {
        let params = this.formatParams(idEmpresa, fechaDesde, fechaHasta);
        return this.http.get<any>(`${environment.base_url}Grafico/PorPlanta?${params}`)
    }

    getPorGrupo(idEmpresa: number, fechaDesde: Date | null, fechaHasta: Date | null): Observable<any> {
        let params = this.formatParams(idEmpresa, fechaDesde, fechaHasta);
        return this.http.get<any>(`${environment.base_url}Grafico/PorGrupo?${params}`)
    }

    getPorTipoRespuestas(idEmpresa: number, fechaDesde: Date | null, fechaHasta: Date | null): Observable<any> {
        let params = this.formatParams(idEmpresa, fechaDesde, fechaHasta);
        return this.http.get<any>(`${environment.base_url}Grafico/PorTipoRespuestas?${params}`)
    }

    getPorUsuario(idEmpresa: number, fechaDesde: Date | null, fechaHasta: Date | null): Observable<any> {
        let params = this.formatParams(idEmpresa, fechaDesde, fechaHasta);
        return this.http.get<any>(`${environment.base_url}Grafico/PorUsuario?${params}`)
    }

    getPlanificadasRealizadas(idEmpresa: number, fechaDesde: Date | null, fechaHasta: Date | null): Observable<any> {
        let params = this.formatParams(idEmpresa, fechaDesde, fechaHasta);
        return this.http.get<any>(`${environment.base_url}Grafico/PlanificadasVsRealizadas?${params}`)
    }

    getIncidenciasPorEstado(idEmpresa: number, fechaDesde: Date | null, fechaHasta: Date | null): Observable<any> {
        let params = this.formatParams(idEmpresa, fechaDesde, fechaHasta);
        return this.http.get<any>(`${environment.base_url}Grafico/IncidenciasPorEstado?${params}`)
    }

    private formatDate(date: Date) {
        let stringDate = "";
        stringDate = `${date.getFullYear()}-${(date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1)}-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`;
        return stringDate;
      }

    private formatParams(emp: number, fechaDesde: Date | null, fechaHasta: Date | null) {
        if(fechaDesde == null && fechaHasta == null) {
            return `id_empresa=${emp}`
        } else if (fechaDesde == null) {
            return `id_empresa=${emp}&fecha_hasta=${this.formatDate(fechaHasta!)}`
        } else if (fechaHasta == null) {
            return `id_empresa=${emp}&fecha_desde=${this.formatDate(fechaDesde!)}`
        } else {
            return `id_empresa=${emp}&fecha_desde=${this.formatDate(fechaDesde!)}&fecha_hasta=${this.formatDate(fechaHasta!)}`
        }
    }
}