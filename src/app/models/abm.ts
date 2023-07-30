export interface Estado {
    id: number,
    descripcion: string
}

export interface Rol {
    id_rol: number,
    descripcion: string
}

export interface Planta {
    id_planta: number,
    id_empresa: number,
    id_estado: number,
    descripcion: string,
    usuariosPlanta?: Array<{
        id_usuario: string,
        nombre: string,
        apellido: string,
        rut: string
    }>,
    cuestionarios?: Array<{
        descripcion: string,
        id_cuestionario: number,
        id_estado: number
    }>
}

export interface Grupo {
    id_grupo: number,
    id_empresa: number,
    id_estado: number,
    descripcion: string,
    orden?: number,
    cuestionarios?: Array<{
        id_cuestionario: number,
        descripcion: string
    }>
}

export interface Empresa {
    id?: number,
    descripcion?: string,
    rut?: number,
    rut_empresa?: number,
    rut_usuario?: number,
    id_estado?: number,
    userName?: string,
    id_imagen?: number
    plantas?: Array<Planta>,
    grupos?: Array<Grupo>
}

export interface UsuarioSearchParams {
    email?: string,
    firstName?: string,
    lastName?: string,
    rut?: number,
    id_estado?: number,
    id_empresa?: number
}

export interface Usuario {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    rut: number,
    id_estado: number,
    rut_user_add: number | undefined | null,
    anu_fecha_alta?: string | null,
    usuarioEmpresa?: []
}

export interface Actividad {
    descripcion: string,
    fecha_desde: string,
    fecha_hasta: string,
    id_cuestionario: number,
    id_empresa: number,
    repeticion_diaria: number,
    repeticion_dias_laborales: number,
    repeticion_semanal: number,
    rut_lider: number,
    participantes: Array<{
        rut_participante: number
    }>,
    adicionales: Array<{
        rut: number,
        nombre: string,
        cargo: string
    }>
}

export interface ActividadParams {
    id_empresa?: number,
    rut_lider?: number,
    rut_supervisor?: number,
    descripcion_actividad?: string,
    id_estado?: number
}

export interface PlanificacionParams {
    id_empresa?: number,
    rut_lider?: number,
    rut_supervisor?: number,
    descripcion_actividad?: string,
    id_estado?: number,
    fecha_planificada?: Date | string,
    fecha_realizada?: Date
}

export interface CargaMasivaUsuariosParams {
    id_empresa: number,
    id_planta?: number,
    id_estado: number,
    contraseña: string
}