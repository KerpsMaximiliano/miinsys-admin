export interface AccionSearchParams {
    id_empresa?: number,
    descripcion?: string,
    id_pregunta?: number,
    id_estado?: number,
    id_cuestionario?: number,
    rut_responsable?: number
}

export interface Accion {
    id_accion?: number,
    id_empresa: number,
    descripcion: string,
    id_pregunta: number,
    id_estado?: number,
    id_cuestionario: number,
    aprobar: number,
    incluir_plan_cierre: number,
    incluir_adjuntos: number,
    asignar_usuario: number,
    alertar_supervisor: number,
    alertar_observaciones: number,
    usuario_alta?: string,
    usuario_modificacion?: string,
    fecha_alta?: string,
    fecha_modificacion?: string
}