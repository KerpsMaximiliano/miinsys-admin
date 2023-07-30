import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'fechaPlanificacion'})
export class FechaPlanificacion implements PipeTransform {
  transform(date: string | null): string {
    if(date == null) {
      return ""
    } else {
      return `${date.split('T')[0]}`
    }
  }
};