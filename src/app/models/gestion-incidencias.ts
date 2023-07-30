export interface GestionIncidenciasParams {
    id_empresa?: number,
    descripcion?: string,
    id_cuestionario?: number,
    rut_responsable?: number,
    rut_supervisor?: number,
    id_estado?: number,
    fecha_desde?: string | Date,
    fecha_hasta?: string | Date,
}

export interface GestionIncidenciasPlanCierre {
    id_incidencia: number,
    plan: string
}