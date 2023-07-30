import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AbmAccionesComponent } from './abm-acciones.component';
import { AbmAccionesNuevaComponent } from './nueva/nueva.component';
import { AbmAccionesEditarComponent } from './editar/editar.component';
import { MatListModule } from '@angular/material/list';
import { MatSortModule } from '@angular/material/sort';


@NgModule({
  declarations: [
    AbmAccionesComponent,
    AbmAccionesNuevaComponent,
    AbmAccionesEditarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    MatExpansionModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule,
    MatCardModule,
    MatDialogModule,
    MatCheckboxModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    PipesModule,
    MatPaginatorModule,
    DragDropModule,
    MatListModule,
    MatSortModule
  ],
  providers: [],
  bootstrap: []
})
export class AbmAccionesModule { }