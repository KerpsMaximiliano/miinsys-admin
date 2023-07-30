import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { Empresa, Estado } from 'src/app/models/abm';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { ButtonsEventService } from '../../buttons-event.service';
import { AbmListaDatosService } from '../abm-lista-datos.service';
import { ListaDatosColumna, ListaDatosCrear } from 'src/app/models/lista-datos';

@Component({
  selector: 'app-nueva',
  templateUrl: './nueva.component.html',
  styleUrls: ['./nueva.component.scss']
})
export class AbmGrillaDatosNuevaComponent implements OnInit, OnDestroy {

  titulo: string = "Nueva lista de datos";
  boton: string = "Crear lista";
  seccion: string = "Lista de Datos";

  listaForm: FormGroup = new FormGroup({
    nombre: new FormControl(null, Validators.required),
    empresa: new FormControl(null, Validators.required),
    estado: new FormControl(null, Validators.required),
  });

  estados = [] as Array<Estado>;
  empresas = [] as Array<Empresa>;

  displayedColumns = ['listaName', 'acciones'];

  atributos = [] as Array<any>

  suscripcion: Subscription;

  selectedFile: any = null;

  rolUsuario: number = 0;
  empresaUsuario = {} as any;

  constructor(
    private stylesService: StylesService,
    private empresasService: AbmEmpresaService,
    private loginService: LoginService,
    private router: Router,
    private snackbar: MatSnackBar,
    private buttonsEventService: ButtonsEventService,
    private listaDatosService: AbmListaDatosService,
    public dialog: MatDialog
  ) {
    this.suscripcion = this.buttonsEventService.events.subscribe(
      (data: any) => {
        this.create()
      }
    )
  }

  ngOnInit(): void {
    this.estados = JSON.parse(localStorage.getItem('estados')!);
    this.rolUsuario = Number(this.loginService.getRol());
    this.empresaUsuario = JSON.parse(this.loginService.getEmpresa()!);
    if(this.rolUsuario > 1) {
      this.empresasService.getEmpresas({id: this.empresaUsuario.id}).subscribe(d => {
        this.empresas = d;
      });
    } else {
      this.empresasService.getEmpresas(null).subscribe(d => {
        this.empresas = d;
      });
    };
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  addAtributo() {
    const dialogRef = this.dialog.open(AbmGrillaDatosModalSeccion, {
      width: '70%',
      maxHeight: '85vh',
      height: 'auto',
      data: {mode: "Add", label: "Atributo"},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined) {
        let find = this.atributos.find(a => a.name == result);
        if (find != undefined) {
          this.openSnackBar('Ya existe un atributo con ese nombre', 'X', 'warn-snackbar');
        } else {
          this.atributos.push({id: this.atributos.length + 1, name: result});
          this.atributos = [...this.atributos];
        }
      }
    });
  }

  deleteAtributo(row: any) {
    this.atributos.splice(this.atributos.indexOf(row), 1);
    let pos = 1;
    this.atributos.forEach(a => {
      a.id = pos;
      pos++;
    });
    this.atributos = [...this.atributos]
  }

  editAtributo(row: any) {
    console.log(row)
    const dialogRef = this.dialog.open(AbmGrillaDatosModalSeccion, {
      width: '70%',
      maxHeight: '85vh',
      height: 'auto',
      data: {mode: "Edit", name: row.name, label: "Atributo"},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined) {
        let find = this.atributos.find(a => a.name == result);
        if (find != undefined) {
          if(result != row.name) {
            this.openSnackBar('Ya existe un atributo con ese nombre', 'X', 'warn-snackbar');
          } else {
            this.atributos.find(a => a.id == row.id).name = result;
            this.atributos = [...this.atributos];
          }
        } else {
          this.atributos.find(a => a.id == row.id).name = result;
          this.atributos = [...this.atributos];
        }
      }
    });
  }

  create() {
    if(this.listaForm.invalid) {
      this.listaForm.markAllAsTouched();
      return;
    };
    if(this.atributos.length == 0) {
      this.openSnackBar('La estructura de lista debe tener al menos un atributo cargado', 'X', 'warn-snackbar');
    };
    if(this.selectedFile == null) {
      this.openSnackBar('Debe seleccionar un archivo', 'X', 'warn-snackbar');
    };
    let model: ListaDatosCrear = {
      id_lista_datos: 0,
      archivo: this.selectedFile,
      empresa: this.listaForm.get('empresa')?.value,
      estado: this.listaForm.get('estado')?.value,
      descripcion: this.listaForm.get('nombre')?.value,
      listaDatosColumna: [] as Array<ListaDatosColumna>
    };
    this.atributos.forEach((at, i) => {
      model.listaDatosColumna.push({
        name: at.name,
        orden: i + 1,
        estado: 1
      })
    });
    this.listaDatosService.createLista(model).subscribe(d => {
      console.log(d);
      this.openSnackBar(d.message, 'X', 'success-snackbar');
      this.router.navigate(['dashboard/lista-datos']);
    });
  }

  upload() {
    let file: any;
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx';
    input.onchange = _ => {
      let files = Array.from(input.files!);
      file = files[0];
      this.selectedFile = file;
      let reader = new FileReader;
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.selectedFile = reader.result;
        this.selectedFile = this.selectedFile.split(',')[1];
      }
    };
    input.click();
  }

  filtrar() {
  }

  openSnackBar(message: string, action: string, className: string) {
    this.snackbar.open(message, action, {horizontalPosition: 'right', verticalPosition: 'top', panelClass: className});
  }

  get colours() {
    return this.stylesService.getStyle()
  }

}

@Component({
  template: `
  <div mat-dialog-content>
    <form [formGroup]="editForm" class="w-full flex">
        <mat-form-field appearance="fill" class="w-full" *ngIf="data.label != 'Dato'">
            <mat-label>{{data.label}}</mat-label>
            <input matInput formControlName="descripcion" id="input">
        </mat-form-field>
        <div *ngIf="data.label == 'Dato'">
          <mat-form-field appearance="fill" class="w-full" *ngFor="let item of data.config">
            <mat-label>{{item}}</mat-label>
            <input matInput [formControlName]="item">
          </mat-form-field>
        </div>
    </form>
  </div>
  <div mat-dialog-actions class="flex justify-end gap-x-4">
    <button mat-dialog-close mat-button [style.background-color]="colours.warnButtonColor" class="text-white"(click)="cancel()">Cancelar</button>
    <button mat-button mat-dialog-close [style.background-color]="colours.mainButtonColor" class="text-white" (click)="accept()">Aceptar</button>
  </div>
  `
})

export class AbmGrillaDatosModalSeccion implements OnInit {

  editForm: FormGroup = new FormGroup({});

  constructor(
    public dialogRef: MatDialogRef<AbmGrillaDatosModalSeccion>,
    @Inject(MAT_DIALOG_DATA) public data: {name: string, mode: string, label: string, config: any, row: any},
    private stylesService: StylesService,
    private snackbar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    if(this.data.label == "Dato") {
      if(this.data.mode == "Edit") {
        let index = 0;
        this.data.config.forEach((c: string) => {
          this.editForm.addControl(c, new FormControl(this.data.row.data[index], Validators.required));
          index++;
        });
      } else {
        this.data.config.forEach((c: string) => {
          this.editForm.addControl(c, new FormControl(null, Validators.required))
        });
      }
      console.log(this.data.config);
      
    } else {
      if(this.data.mode == "Edit") {
        this.editForm.addControl('descripcion', new FormControl(this.data.name, Validators.required))
      } else {
        this.editForm.addControl('descripcion', new FormControl(null, Validators.required))
      }
    }
    
  }

  accept() {
    if(this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    };
    if(this.data.label != "Dato") {
      this.dialogRef.close(this.editForm.get('descripcion')?.value);
    } else {
      this.dialogRef.close(this.editForm.getRawValue());
    }
  }

  cancel() {
    this.dialogRef.close()
  }

  openSnackBar(message: string, action: string, className: string) {
    this.snackbar.open(message, action, {horizontalPosition: 'right', verticalPosition: 'top', panelClass: className});
  }

  get colours() {
    return this.stylesService.getStyle();
  }
}
