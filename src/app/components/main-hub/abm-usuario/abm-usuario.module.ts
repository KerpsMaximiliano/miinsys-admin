import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AbmUsuarioComponent } from './abm-usuario.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { AbmUsuarioNuevoComponent } from './nuevo/nuevo.component';
import { AbmUsuarioEditarComponent } from './editar/editar.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { PipesModule } from 'src/app/pipes/pipes.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { AbmUsuarioCargaMasivaComponent } from './carga-masiva/carga-masiva.component';
import { MatListModule } from '@angular/material/list';
import { MatSortModule } from '@angular/material/sort';


@NgModule({
  declarations: [
    AbmUsuarioComponent,
    AbmUsuarioNuevoComponent,
    AbmUsuarioEditarComponent,
    AbmUsuarioCargaMasivaComponent
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
    PipesModule,
    MatPaginatorModule,
    MatListModule,
    MatSortModule
  ],
  providers: [],
  bootstrap: []
})
export class AbmUsuarioModule { }
