import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Empresa, Estado } from 'src/app/models/abm';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { ButtonsEventService } from '../../buttons-event.service';
import { AbmGrillaDatosModalSeccion } from '../nueva/nueva.component';
import { AbmListaDatosService } from '../abm-lista-datos.service';
import { ListaDatosEditar } from 'src/app/models/lista-datos';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss']
})
export class AbmGrillaDatosEditarComponent implements OnInit, OnDestroy {

  ////////////////////////

  mockAtributos = [
    {id: 1, name: "Atributo 1"},
    {id: 2, name: "Atributo 2"},
    {id: 3, name: "Atributo 3"},
    {id: 4, name: "Atributo 4"}
  ];

  mockDatos = [
    {id: 1, column1: "Atributo 1 fila 1", column2: "Atributo 2 fila 1", column3: "Atributo 3 fila 1", column4: "Atributo 4 fila 1"},
    {id: 2, column1: "Atributo 1 fila 2", column2: "Atributo 2 fila 2", column3: "Atributo 3 fila 2", column4: "Atributo 4 fila 2"},
    {id: 3, column1: "Atributo 1 fila 3", column2: "Atributo 2 fila 3", column3: "Atributo 3 fila 3", column4: "Atributo 4 fila 3"},
    {id: 4, column1: "Atributo 1 fila 4", column2: "Atributo 2 fila 4", column3: "Atributo 3 fila 4", column4: "Atributo 4 fila 4"},
    {id: 5, column1: "Atributo 1 fila 5", column2: "Atributo 2 fila 5", column3: "Atributo 3 fila 5", column4: "Atributo 4 fila 5"}
  ]

  ////////////////////////

  titulo: string = "Editar lista de datos";
  boton: string = "Guardar lista";
  seccion: string = "Lista de Datos";

  estados = [] as Array<Estado>;
  empresas = [] as Array<Empresa>;

  displayedColumnsAtributos = ['listaName', 'acciones'] as Array<string>;
  displayedColumnsDatos = [] as Array<string>;

  atributos = [] as Array<any>;
  datos = [] as Array<{id: number, data: Array<any>}>

  listaId: number = 0;

  suscripcion: Subscription;

  listaDatos: any;

  rolUsuario: number = 0;
  empresaUsuario = {} as any;

  listaDatosForm: FormGroup = new FormGroup({
    descripcion: new FormControl(null, Validators.required),
    empresa: new FormControl(null, Validators.required),
    estado: new FormControl(null, Validators.required)
  });

  mode: string = "";

  constructor(
    private stylesService: StylesService,
    private empresasService: AbmEmpresaService,
    private router: Router,
    private snackbar: MatSnackBar,
    private buttonsEventService: ButtonsEventService,
    public dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private listaDatosService: AbmListaDatosService,
    private loginService: LoginService
  ) {
    this.suscripcion = this.buttonsEventService.events.subscribe(
      (data: any) => {
        this.save()
      }
    )
  }

  ngOnInit(): void {
    this.estados = JSON.parse(localStorage.getItem('estados')!);
    this.listaId = this.activatedRoute.snapshot.params['listaDatosId'];
    this.mode = this.listaDatosService.getMode();
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
    this.listaDatosService.getListaById(this.listaId).subscribe(d => {
      this.listaDatos = d;
      this.listaDatosForm.setValue({
        descripcion: d.descripcion,
        empresa: d.empresa,
        estado: d.estado
      });
      this.listaDatosForm.get('empresa')?.disable();
      console.log(d);
      this.atributos = d.listaDatosColumna;
      //this.atributos = this.mockAtributos;
      this.atributos.forEach(d => {
        this.displayedColumnsDatos.push(d.name);
      });
      this.displayedColumnsDatos.push("acciones");
      d.lista.forEach( (dato: { id_fila: any; descripciones: Array<any>}) => {
        let model = {
          id: dato.id_fila,
          data: [] as Array<any>
        };
        Object.keys(dato.descripciones).forEach((key, i) => {
          model.data.push(Object.values(dato.descripciones)[i])
        });
        this.datos.push(model);
      });
      console.log(this.datos);
      this.datos = [...this.datos];
    });

    if(this.mode == "View") {
      this.listaDatosForm.disable();
    }
    
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  save() {
    console.log(this.atributos);
    console.log(this.datos);
    if(this.mode == 'View') {
      this.router.navigate(['dashboard/lista-datos']);
      return;
    };
    let model: ListaDatosEditar = {
      id_lista_datos: this.listaDatos.id_lista_datos,
      empresa: this.listaDatos.empresa,
      estado: this.listaDatosForm.get('estado')?.value,
      descripcion: this.listaDatosForm.get('descripcion')?.value,
      listaDatosColumna: [],
      datos: []
    };
    this.atributos.forEach((at, i) => {
      model.listaDatosColumna.push({
        name: at.name,
        orden: i + 1,
        estado: 1
      })
    });
    this.datos.forEach((dato, i) => {
      model.datos.push({
        id_fila: i + 1,
        descripciones: dato.data
      })
    });
    this.listaDatosService.updateLista(model).subscribe(d => {
      this.openSnackBar(d.message, 'X', 'success-snackbar');
      this.router.navigate(['dashboard/lista-datos']);
    })
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
          this.atributos.push({id_lista_datos_columna: 0, name: result});
          this.atributos = [...this.atributos]
          this.displayedColumnsDatos.splice(this.displayedColumnsDatos.length - 1, 1);
          this.displayedColumnsDatos.push(result);
          this.displayedColumnsDatos.push('acciones');
        }
      }
    });
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
            this.atributos[this.atributos.indexOf(row)] = {id_lista_datos_columna: row.id_lista_datos_columna, name: result};
            this.atributos = [...this.atributos];
            this.displayedColumnsDatos[this.displayedColumnsDatos.indexOf(row.name)] = result;
          }
        } else {
          this.atributos[this.atributos.indexOf(row)] = {id_lista_datos_columna: row.id_lista_datos_columna, name: result};
          this.atributos = [...this.atributos];
          this.displayedColumnsDatos[this.displayedColumnsDatos.indexOf(row.name)] = result;
        }
      }
    });
  }

  deleteAtributo(row: any) {
    this.datos.forEach(dato => {
      dato.data.splice(this.atributos.indexOf(row), 1);
    });
    this.datos = [...this.datos];
    this.atributos.splice(this.atributos.indexOf(row), 1);
    this.atributos = [...this.atributos];
    this.displayedColumnsDatos.splice(this.displayedColumnsDatos.indexOf(row.name), 1);
  }

  addDato() {
    let config = this.displayedColumnsDatos.filter(c => c != 'acciones');
    const dialogRef = this.dialog.open(AbmGrillaDatosModalSeccion, {
      width: '70%',
      maxHeight: '85vh',
      height: 'auto',
      data: {mode: "Add", label: "Dato", config: config},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined) {
        let model = {
          id: 0,
          data: [] as Array<any>
        };
        Object.keys(result).forEach((key, i) => {
          model.data.push(Object.values(result)[i]);
        });
        this.datos.push(model);
        this.datos = [...this.datos]
      }
    });
  }

  editDato(row: any) {
    console.log(row);
    let config = this.displayedColumnsDatos.filter(c => c != 'acciones');
    const dialogRef = this.dialog.open(AbmGrillaDatosModalSeccion, {
      width: '70%',
      maxHeight: '85vh',
      height: 'auto',
      data: {mode: "Edit", label: "Dato", config: config, row: row},
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result != undefined) {
        let model = {
          id: 0,
          data: [] as Array<any>
        };
        Object.keys(result).forEach((key, i) => {
          model.data.push(Object.values(result)[i]);
        });
        this.datos[this.datos.indexOf(row)] = model;
        this.datos = [...this.datos]
      }
    });
  }

  deleteDato(row: any) {
    console.log(row);
    this.datos.splice(this.datos.indexOf(row), 1);
    this.datos = [...this.datos]
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
