export interface CuestionarioInicial {
    descripcion: string,
    id_estado: number,
    rut_usuario_alta: number,
    id_empresa: number,
    orden: number,
    id_grupo?: number,
    id_planta?: number,
    planificado?: number
}

export interface AgregarSeccion {
    id_seccion: number,
    id_estado: number,
    descripcion: string,
    orden: number,
    id_cuestionario: number,
    rut_usuario_alta: number
}

export interface EditarSeccion {
    id_seccion: number,
    descripcion: string
}

export interface CuestionarioSearchParams {
    descripcion?: string,
    id_estado?: number,
    id_empresa?: number,
    id_cuestionario?: number
}

export interface CuestionarioUpdate {
    id_cuestionario: number,
    descripcion: string,
    id_estado: number,
    rut_usuario_modificacion: number,
    orden: number,
    id_planta?: number,
    id_grupo?: number,
    planificado?: number
}

export interface Cuestionario {
    descripcion_cuestionario: string,
    id_cuestionario: number,
    id_estado: number,
    secciones: Array<SeccionCuestionario>,
    id_grupo?: number,
    id_planta?: number
}

export interface SeccionCuestionario {
    cue_id: number,
    orden: number,
    sec_id: number,
    sec_descripcion: string,
    preguntas: Array<PreguntaCuestionario>
}

export interface PreguntaCuestionario {
    id_pregunta?: number,
    pre_id?: number,
    descripcion?: string,
    pre_descripcion?: string,
    id_tipo_pregunta?: number,
    tpr_id?: number,
    rut_usuario_alta?: number,
    id_estado?: number,
    opciones?: Array<OpcionCuestionario> | Array<any>,
    preguntaValidaciones?: Array<ValidacionCuestionario>,
    validators?: Array<ValidacionCuestionario> | Array<any>,
    sec_id?: number,
    orden?: number,
    critica?: boolean
}

export interface OpcionCuestionario {
    id_opcion: number,
    descripcion: string,
    id_pregunta: number,
    id_estado: number,
    valor: number,
    orden: number
}

export interface ValidacionCuestionario {
    id_pregunta_validacion: number,
    id_validacion: number,
    valor: string,
    mensaje: string,
    id_estado: number
}

export interface FirmaDatoAdicional {
    id: number,
    id_pregunta: number,
    descripcion: string,
    orden: number,
    id_estado: number
}