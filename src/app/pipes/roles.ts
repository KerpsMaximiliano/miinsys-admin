import { Pipe, PipeTransform } from "@angular/core";
import { AbmUsuarioService } from "../components/main-hub/abm-usuario/abm-usuario.service";

@Pipe({name: 'roles'})
export class RolesPipe implements PipeTransform {
  transform(rol: number | null): any {
    let roles = JSON.parse(localStorage.getItem('roles')!);
    if(rol == null) {
        return 'Rol'
    } else {
        return roles.find((r: { id_rol: number; }) => r.id_rol == rol).descripcion
    }
  }
};