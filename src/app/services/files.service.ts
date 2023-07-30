import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Estado } from "../models/abm";
import { LoginForm } from "../models/login";


@Injectable({
    providedIn: 'root'
})

export class FilesService {

    constructor(
        private http: HttpClient
    ) {}

    subirArchivo(archivo: File, tipo: number, idEntidad?: number): Observable<any> {
        let formParams = new FormData();
        formParams.append('file', archivo);
        if(idEntidad) {
            return this.http.post<any>(`${environment.base_url}Archivo?tipo_imagen=${tipo}&id_entidad_relacionada=${idEntidad}`, formParams);
        } else {
            return this.http.post<any>(`${environment.base_url}Archivo?tipo_imagen=` + tipo, formParams);
        }
        
    }

    actualizarArchivo(archivo: any, fileId: number, tipo: number): Observable<any> {
        let formParams = new FormData();
        formParams.append('file', archivo);
        return this.http.put<any>(`${environment.base_url}Archivo?tipo_imagen=` + tipo + '&id_file=' + fileId, formParams);
    }

    traerArchivo(fileId: number, tipo: number): Observable<any> {
        return this.http.get<Blob>(`${environment.base_url}Archivo?tipo_imagen=` + tipo + '&id_file=' + fileId);
    }

    b64toBlob (b64Data: any, contentType='', sliceSize=512) {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];
      
        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
          const slice = byteCharacters.slice(offset, offset + sliceSize);
      
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
      
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
      
        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    };

    getFileType(fileName: string) {
        let extension = fileName.split('.')[fileName.split('.').length - 1];
        switch (extension) {
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'png':
                return 'image/jpeg'
            case 'mp4':
                return 'video/mp4'
            default:
                return ''
        }
    }
    

}