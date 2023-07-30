import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { AbmCuestionarioModule } from './abm-cuestionario/abm-cuestionario.module';
import { AbmEmpresaModule } from './abm-empresa/abm-empresa.module';
import { AbmTurnoJornadaModule } from './abm-turno-jornada/abm-turno-jornada.module';
import { AbmUsuarioModule } from './abm-usuario/abm-usuario.module';
import { MainHubComponent } from './main-hub.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Route, RouterModule } from '@angular/router';
import { AbmCuestionarioComponent } from './abm-cuestionario/abm-cuestionario.component';
import { AbmEmpresaComponent } from './abm-empresa/abm-empresa.component';
import { AbmTurnoJornadaComponent } from './abm-turno-jornada/abm-turno-jornada.component';
import { AbmUsuarioComponent } from './abm-usuario/abm-usuario.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { AbmEmpresaNuevaComponent } from './abm-empresa/nueva/nueva.component';
import { AbmEmpresaEditarComponent } from './abm-empresa/editar/editar.component';
import { AbmUsuarioNuevoComponent } from './abm-usuario/nuevo/nuevo.component';
import { AbmUsuarioEditarComponent } from './abm-usuario/editar/editar.component';
import { MainHub2Component } from './main-hub2.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AbmCuestionarioNuevoComponent } from './abm-cuestionario/nuevo/nuevo.component';
import { AbmCuestionarioEditarComponent } from './abm-cuestionario/editar/editar.component';
import { ConfirmationModalComponent } from './modals/confirmation-modal/confirmation-modal.component';
import { RespuestasCuestionariosComponent } from './respuestas-cuestionarios/respuestas-cuestionarios.component';
import { RespuestasCuestionariosModule } from './respuestas-cuestionarios/respuestas-cuestionarios.module';
import { RespuestasCuestionarioVisualizarComponent } from './respuestas-cuestionarios/visualizar/visualizar.component';
import { AbmActividadComponent } from './planificacion/abm-actividad/abm-actividad.component';
import { AbmActividadNuevoComponent } from './planificacion/abm-actividad/nuevo/nuevo.component';
import { AbmActividadEditarComponent } from './planificacion/abm-actividad/editar/editar.component';
import { AbmActividadModule } from './planificacion/abm-actividad/abm-actividad.module';
import { MatTreeModule } from '@angular/material/tree';
import { PlanificacionComponent } from './planificacion/planificacion/planificacion.component';
import { PlanificacionModule } from './planificacion/planificacion/planificacion.module';
import { AbmUsuarioCargaMasivaComponent } from './abm-usuario/carga-masiva/carga-masiva.component';
import { UsabilidadComponent } from './dashboard/usabilidad/usabilidad.component';
import { CumplimientoComponent } from './dashboard/cumplimiento/cumplimiento.component';
import { GestionComponent } from './dashboard/gestion/gestion.component';
import { DashboardModule } from './dashboard/dashboard.module';
import { AbmAccionesComponent } from './abm-acciones/abm-acciones.component';
import { AbmAccionesNuevaComponent } from './abm-acciones/nueva/nueva.component';
import { AbmAccionesEditarComponent } from './abm-acciones/editar/editar.component';
import { AbmAccionesModule } from './abm-acciones/abm-acciones.module';
import { GestionIncidenciasModule } from './gestion-incidencias/gestion-incidencias.module';
import { GestionIncidenciasComponent } from './gestion-incidencias/gestion-incidencias.component';
import { AbmActividadDuplicarComponent } from './planificacion/abm-actividad/duplicar/duplicar.component';
import { AbmCuestionarioDuplicarComponent } from './abm-cuestionario/duplicar/duplicar.component';
import { AbmGrillaDatosModule } from './abm-grilla-datos/abm-grilla-datos-module';
import { AbmGrillaDatosComponent } from './abm-grilla-datos/abm-grilla-datos.component';
import { AbmGrillaDatosNuevaComponent } from './abm-grilla-datos/nueva/nueva.component';
import { AbmGrillaDatosEditarComponent } from './abm-grilla-datos/editar/editar.component';


const routes: Route[] = [
  {
      path     : 'dashboard',
      component: MainHubComponent,
      children: [
          { path: 'cuestionario', component: AbmCuestionarioComponent },
          { path: 'cuestionario/nuevo', component: AbmCuestionarioNuevoComponent },
          { path: 'cuestionario/:cuestionarioId', component: AbmCuestionarioEditarComponent },
          { path: 'cuestionario/duplicar/:cuestionarioId', component: AbmCuestionarioDuplicarComponent },
          { path: 'empresa', component: AbmEmpresaComponent },
          { path: 'empresa/nueva', component: AbmEmpresaNuevaComponent },
          { path: 'empresa/:empresaId', component: AbmEmpresaEditarComponent },
          { path: 'turno-jornada', component: AbmTurnoJornadaComponent },
          //{ path: 'turno-jornada/nueva', component: AbmTurnoJornadaComponent },
          //{ path: 'turno-jornada/:turnoJornadaId', component: AbmTurnoJornadaComponent },
          { path: 'usuario', component: AbmUsuarioComponent },
          { path: 'usuario/nuevo', component: AbmUsuarioNuevoComponent },
          { path: 'usuario/carga-masiva', component: AbmUsuarioCargaMasivaComponent },
          { path: 'usuario/:usuarioId', component: AbmUsuarioEditarComponent },
          { path: 'respuestas', component: RespuestasCuestionariosComponent },
          { path: 'respuestas/:respuestaCuestionarioId', component: RespuestasCuestionarioVisualizarComponent },
          { path: 'actividad', component: AbmActividadComponent },
          { path: 'actividad/nuevo', component: AbmActividadNuevoComponent },
          { path: 'actividad/:actividadId', component: AbmActividadEditarComponent },
          { path: 'actividad/duplicar/:actividadId', component: AbmActividadDuplicarComponent },
          { path: 'planificacion', component: PlanificacionComponent },
          { path: 'dashboard/usabilidad', component: UsabilidadComponent },
          { path: 'dashboard/cumplimiento', component: CumplimientoComponent },
          { path: 'dashboard/gestion', component: GestionComponent },
          { path: 'acciones', component: AbmAccionesComponent },
          { path: 'acciones/nueva', component: AbmAccionesNuevaComponent },
          { path: 'acciones/:accionId', component: AbmAccionesEditarComponent },
          { path: 'gestion-incidencias', component: GestionIncidenciasComponent },
          { path: 'lista-datos', component: AbmGrillaDatosComponent },
          { path: 'lista-datos/nueva', component: AbmGrillaDatosNuevaComponent },
          { path: 'lista-datos/:listaDatosId', component: AbmGrillaDatosEditarComponent },
      ]
  },
  {
    path     : 'dashboard2',
    component: MainHub2Component,
    children: [
        { path: 'cuestionario', component: AbmCuestionarioComponent },
        //{ path: 'cuestionario/nuevo', component: AbmCuestionarioComponent },
        //{ path: 'cuestionario/:cuestionarioId', component: AbmCuestionarioComponent },
        { path: 'empresa', component: AbmEmpresaComponent },
        { path: 'empresa/nueva', component: AbmEmpresaNuevaComponent },
        { path: 'empresa/:empresaId', component: AbmEmpresaEditarComponent },
        { path: 'turno-jornada', component: AbmTurnoJornadaComponent },
        //{ path: 'turno-jornada/nueva', component: AbmTurnoJornadaComponent },
        //{ path: 'turno-jornada/:turnoJornadaId', component: AbmTurnoJornadaComponent },
        { path: 'usuario', component: AbmUsuarioComponent },
        { path: 'usuario/nuevo', component: AbmUsuarioNuevoComponent },
        { path: 'usuario/:usuarioId', component: AbmUsuarioEditarComponent }
    ]
},

];

@NgModule({
  declarations: [
    MainHubComponent,
    MainHub2Component,
    ConfirmationModalComponent,
  ],
  imports: [
    RouterModule.forChild(routes),
    BrowserModule,
    AppRoutingModule,
    AbmCuestionarioModule,
    AbmTurnoJornadaModule,
    AbmUsuarioModule,
    AbmEmpresaModule,
    AbmAccionesModule,
    RespuestasCuestionariosModule,
    AbmActividadModule,
    PlanificacionModule,
    GestionIncidenciasModule,
    AbmGrillaDatosModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatSidenavModule,
    HttpClientModule,
    MatCheckboxModule,
    FormsModule,
    MatListModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatSelectModule,
    MatBadgeModule,
    MatTooltipModule,
    MatTreeModule,
    DashboardModule
  ],
  providers: [],
  bootstrap: []
})
export class MainHubModule { }
