import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { RespuestasCuestionariosComponent } from './respuestas-cuestionarios.component';
import { RespuestasCuestionarioVisualizarComponent } from './visualizar/visualizar.component';
import { AbmCuestionarioModule } from '../abm-cuestionario/abm-cuestionario.module';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { RespuestasCuestionariosModalComponent } from './modal/modal.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatSortModule } from '@angular/material/sort';


@NgModule({
  declarations: [
    RespuestasCuestionariosComponent,
    RespuestasCuestionarioVisualizarComponent,
    RespuestasCuestionariosModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatExpansionModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    MatCardModule,
    AbmCuestionarioModule,
    PipesModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSortModule
  ],
  providers: [
    MatDatepickerModule,
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ],
  bootstrap: []
})
export class RespuestasCuestionariosModule { }
