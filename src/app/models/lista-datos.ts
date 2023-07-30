export interface ListaDatosCrear {
    id_lista_datos: number,
    archivo: string,
    empresa: number,
    estado: number,
    descripcion: string,
    listaDatosColumna: Array<ListaDatosColumna>
}

export interface ListaDatosColumna {
    name: string,
    orden: number,
    estado: number
}

export interface ListaDatosEditar {
    id_lista_datos: number,
    empresa: number,
    estado: number,
    descripcion: string,
    listaDatosColumna: Array<ListaDatosColumna>,
    datos: Array<ListaDatosValores>
}

export interface ListaDatosValores {
    id_fila: number,
    descripciones: Array<string>
}

export interface ListaDatosParams {
    empresa?: number,
    estado?: number,
    descripcion?: string
}