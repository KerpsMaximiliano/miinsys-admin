import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'fechaRespuestaCuestionario'})
export class FechaRespuestaCuestionario implements PipeTransform {
  transform(date: string | null): string {
    if(date == null) {
      return ""
    } else {
      return `${date.split('T')[0]} / ${date.split('T')[1].split(':')[0]}:${date.split('T')[1].split(':')[1]}`
    }
  }
};