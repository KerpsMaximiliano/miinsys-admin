import { NgModule } from "@angular/core";
import { FechaPlanificacion } from "./fecha-planificacion";
import { FechaRespuestaCuestionario } from "./fecha-respuesta-cuestionario";
import { RolesPipe } from "./roles";
import { TipoPreguntaPipe } from "./tipo-pregunta";


@NgModule({
    declarations: [
      TipoPreguntaPipe,
      FechaRespuestaCuestionario,
      FechaPlanificacion,
      RolesPipe
    ],
    providers: [],
    bootstrap: [],
    exports: [
      TipoPreguntaPipe,
      FechaRespuestaCuestionario,
      FechaPlanificacion,
      RolesPipe
    ]
  })
  export class PipesModule { }