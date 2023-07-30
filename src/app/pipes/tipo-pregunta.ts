import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'tipoPregunta'})
export class TipoPreguntaPipe implements PipeTransform {
  private tpr_id = ["", "", "", "", 
  "Texto Fijo",//4
  "Texto",//5
  "Combo selección",//6
  "Numérico",//7
  "Nombre de Usuario",//8
  "Fecha",//9
  "Selección Radio",//10
  "RUT Usuario",//11
  "Calendario",//12
  "Lista de datos",//13
  "Subir foto",//14
  "Selección Radio SI/NO",//15
  "Firma", //16
  "Alfanumérico" //17

];
  transform(value: number): string {
    return this.tpr_id[value];
  }
};