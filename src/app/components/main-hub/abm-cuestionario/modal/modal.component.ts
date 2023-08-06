import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable } from '@angular/material/table';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmCuestionarioService } from '../abm-cuestionario.service';
import {
  FirmaDatoAdicional,
  OpcionCuestionario,
  PreguntaCuestionario,
  ValidacionCuestionario,
} from 'src/app/models/cuestionario';
import { AbmListaDatosService } from '../../abm-grilla-datos/abm-lista-datos.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class AbmCuestionarioModalComponent implements OnInit {
  @ViewChild('table') table!: MatTable<any>;

  tiposPregunta = [
    { id: 4, descripcion: 'Texto fijo' },
    { id: 5, descripcion: 'Texto' },
    { id: 6, descripcion: 'Combo selección' },
    { id: 7, descripcion: 'Numérico' },
    { id: 8, descripcion: 'Nombre de Usuario' },
    { id: 9, descripcion: 'Fecha' },
    { id: 10, descripcion: 'Selección radio' },
    { id: 11, descripcion: 'RUT Usuario' },
    { id: 12, descripcion: 'Calendario' },
    { id: 13, descripcion: 'Lista de datos' },
    { id: 14, descripcion: 'Subir foto' },
    { id: 15, descripcion: 'Selección Radio SI/NO' },
    { id: 17, descripcion: 'Alfanumérico' },
  ];

  tipoElegido: number = 0;
  tituloPregunta: string = '';
  ordenPregunta: number = 0;
  preguntaForm: FormGroup = new FormGroup({});
  enableButton: boolean = false;
  descripcion: string = '';
  tpr6 = [] as Array<any>;
  tpr10 = [] as Array<any>;
  tpr16 = [] as Array<any>;
  rolUsuario: number = 0;
  listasDeDatos = [] as Array<any>;
  idListaExistente: number = 0;

  constructor(
    private stylesService: StylesService,
    public dialogRef: MatDialogRef<AbmCuestionarioModalComponent>,
    private cuestionarioService: AbmCuestionarioService,
    private loginService: LoginService,
    private router: Router,
    private snackbar: MatSnackBar,
    private listaDatosService: AbmListaDatosService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      mode: string;
      data?: any;
      ordenPregunta: number;
      idCuestionario: number;
      idSeccion: number;
      titulosSeccion: Array<string>;
      preguntaTipo?: string;
      empresaId: number;
    }
  ) {
    dialogRef.disableClose = true;
  }

  ngOnInit(): void {
    console.log(this.router.url);
    this.rolUsuario = Number(this.loginService.getRol());
    console.log(this.data);
    this.ordenPregunta = this.data.ordenPregunta;
    if (this.data.mode == 'Edit' || this.data.mode == 'Copy') {
      this.tiposPregunta.push({ id: 16, descripcion: 'Firma' });
      if (this.data.mode == 'Edit') {
        this.tituloPregunta = this.data.data.pre_descripcion;
      }
      this.tipoElegido = this.data.data.tpr_id;
      console.log(this.tipoElegido);
      this.changeType();
      switch (this.tipoElegido) {
        case 4:
          this.preguntaForm
            .get('textoFijo')
            ?.setValue(this.data.data.opciones[0].opc_descripcion);
          if (this.data.data.opciones[0].opc_descripcion == undefined) {
            this.preguntaForm
              .get('textoFijo')
              ?.setValue(this.data.data.opciones[0].descripcion);
          }
          break;
        case 5:
          if (this.data.data.validators.length > 0) {
            if (this.data.data.validators[0].id_validacion == 0) {
              this.preguntaForm.get('requerido')?.setValue(true);
            } else {
              this.preguntaForm.get('requerido')?.setValue(false);
            }
            this.data.data.validators.forEach(
              (val: {
                id_validacion: number;
                Value: string;
                valor: string;
              }) => {
                if (val.id_validacion == 4) {
                  if (val.valor != undefined) {
                    this.preguntaForm
                      .get('maxLength')
                      ?.setValue(Number(val.valor));
                  } else {
                    this.preguntaForm
                      .get('maxLength')
                      ?.setValue(Number(val.Value));
                  }
                }
                if (val.id_validacion == 3) {
                  if (val.valor != undefined) {
                    this.preguntaForm
                      .get('minLength')
                      ?.setValue(Number(val.valor));
                  } else {
                    this.preguntaForm
                      .get('minLength')
                      ?.setValue(Number(val.Value));
                  }
                }
              }
            );
          } else {
            this.preguntaForm.get('requerido')?.setValue(false);
          }
          break;
        case 6:
          console.log(this.data.data.opciones);
          this.data.data.opciones.forEach(
            (opc: { descripcion: any; opc_descripcion: any; valor: any }) => {
              this.tpr6.push(opc);
            }
          );
          this.tpr6.sort((a, b) => a.opc_orden - b.opc_orden);
          if (this.data.data.validators.length > 0) {
            if (this.data.data.validators[0].id_validacion == 0) {
              this.preguntaForm.get('requerido')?.setValue(true);
            } else {
              this.preguntaForm.get('requerido')?.setValue(false);
            }
          } else {
            this.preguntaForm.get('requerido')?.setValue(false);
          }
          break;
        case 7:
          if (this.data.data.validators.length > 0) {
            if (this.data.data.validators[0].id_validacion == 0) {
              this.preguntaForm.get('requerido')?.setValue(true);
            } else {
              this.preguntaForm.get('requerido')?.setValue(false);
            }
            this.data.data.validators.forEach(
              (val: {
                id_validacion: number;
                Value: string;
                valor: string;
              }) => {
                if (val.id_validacion == 1) {
                  if (val.valor != undefined) {
                    this.preguntaForm.get('max')?.setValue(Number(val.valor));
                  } else {
                    this.preguntaForm.get('max')?.setValue(Number(val.Value));
                  }
                }
                if (val.id_validacion == 2) {
                  if (val.valor != undefined) {
                    this.preguntaForm.get('min')?.setValue(Number(val.valor));
                  } else {
                    this.preguntaForm.get('min')?.setValue(Number(val.Value));
                  }
                }
              }
            );
          } else {
            this.preguntaForm.get('requerido')?.setValue(false);
          }
          break;
        case 10:
          console.log(this.data.data.opciones);
          this.data.data.opciones.forEach(
            (opc: { descripcion: any; valor: any }) => {
              this.tpr10.push(opc);
            }
          );
          this.tpr10.sort((a, b) => a.opc_orden - b.opc_orden);
          this.preguntaForm.get('critica')?.setValue(this.data.data.critica);
          if (this.data.data.validators.length > 0) {
            if (this.data.data.validators[0].id_validacion == 0) {
              this.preguntaForm.get('requerido')?.setValue(true);
            } else {
              this.preguntaForm.get('requerido')?.setValue(false);
            }
          } else {
            this.preguntaForm.get('requerido')?.setValue(false);
          }
          break;
        case 12:
          if (this.data.data.validators.length > 0) {
            if (this.data.data.validators[0].id_validacion == 0) {
              this.preguntaForm.get('requerido')?.setValue(true);
            } else {
              this.preguntaForm.get('requerido')?.setValue(false);
            }
          } else {
            this.preguntaForm.get('requerido')?.setValue(false);
          }
          break;
        case 13:
          if (this.data.data.validators.length > 0) {
            if (this.data.data.validators[0].id_validacion == 0) {
              this.preguntaForm.get('requerido')?.setValue(true);
            } else {
              this.preguntaForm.get('requerido')?.setValue(false);
            }
          } else {
            this.preguntaForm.get('requerido')?.setValue(false);
          }
          this.preguntaForm.get('lista')?.setValue(this.data.data.lst_id);
          this.idListaExistente = this.data.data.lst_id;
          break;
        case 14:
          if (this.data.data.validators.length > 0) {
            if (this.data.data.validators[0].id_validacion == 0) {
              this.preguntaForm.get('requerido')?.setValue(true);
            } else {
              this.preguntaForm.get('requerido')?.setValue(false);
            }
          } else {
            this.preguntaForm.get('requerido')?.setValue(false);
          }
          break;
        case 15:
          if (this.data.data.opciones[0].descripcion == undefined) {
            this.preguntaForm
              .get('opcion1')
              ?.setValue(this.data.data.opciones[0].opc_descripcion);
          } else {
            this.preguntaForm
              .get('opcion1')
              ?.setValue(this.data.data.opciones[0].descripcion);
          }
          if (this.data.data.opciones[1].descripcion == undefined) {
            this.preguntaForm
              .get('opcion2')
              ?.setValue(this.data.data.opciones[1].opc_descripcion);
          } else {
            this.preguntaForm
              .get('opcion2')
              ?.setValue(this.data.data.opciones[1].descripcion);
          }
          this.preguntaForm.get('critica')?.setValue(this.data.data.critica);
          if (this.data.data.validators.length > 0) {
            if (this.data.data.validators[0].id_validacion == 0) {
              this.preguntaForm.get('requerido')?.setValue(true);
            } else {
              this.preguntaForm.get('requerido')?.setValue(false);
            }
          } else {
            this.preguntaForm.get('requerido')?.setValue(false);
          }
          break;
        case 16:
          this.cuestionarioService
            .getFirmaDatoAdicional(this.data.data.pre_id)
            .subscribe((resFirma) => {
              console.log(resFirma);
              this.tpr16 = resFirma.firmaDatoAdicional;
            });
          if (this.data.data.validators.length > 0) {
            if (this.data.data.validators[0].id_validacion == 0) {
              this.preguntaForm.get('requerido')?.setValue(true);
            } else {
              this.preguntaForm.get('requerido')?.setValue(false);
            }
          } else {
            this.preguntaForm.get('requerido')?.setValue(false);
          }
          break;
        case 17:
          if (this.data.data.validators.length > 0) {
            if (this.data.data.validators[0].id_validacion == 0) {
              this.preguntaForm.get('requerido')?.setValue(true);
            } else {
              this.preguntaForm.get('requerido')?.setValue(false);
            }
            this.data.data.validators.forEach(
              (val: {
                id_validacion: number;
                Value: string;
                valor: string;
              }) => {
                if (val.id_validacion == 4) {
                  if (val.valor != undefined) {
                    this.preguntaForm
                      .get('maxLength')
                      ?.setValue(Number(val.valor));
                  } else {
                    this.preguntaForm
                      .get('maxLength')
                      ?.setValue(Number(val.Value));
                  }
                }
                if (val.id_validacion == 3) {
                  if (val.valor != undefined) {
                    this.preguntaForm
                      .get('minLength')
                      ?.setValue(Number(val.valor));
                  } else {
                    this.preguntaForm
                      .get('minLength')
                      ?.setValue(Number(val.Value));
                  }
                }
              }
            );
          } else {
            this.preguntaForm.get('requerido')?.setValue(false);
          }
          break;
      }
      this.detectChanges();
      this.preguntaForm.updateValueAndValidity();
    }
    if (this.data.preguntaTipo == 'Firma' && this.data.mode == 'Add') {
      this.tiposPregunta = [{ id: 16, descripcion: 'Firma' }];
      this.tipoElegido = 16;
      this.tpr16 = [
        { descripcion: 'NOMBRE' },
        { descripcion: 'CARGO' },
        { descripcion: 'CORREO' },
      ];
      this.changeType();
    }
  }

  detectChanges() {
    this.tpr6 = [...this.tpr6];
    this.tpr10 = [...this.tpr10];
    this.tpr16 = [...this.tpr16];
  }

  deleteFirmaDatoAdicional(row: any, index: number) {
    this.cuestionarioService.deleteFirmaDatoAdicional(row.id).subscribe((d) => {
      console.log(d);
      this.openSnackBar('Campo eliminado', 'X', 'success-snackbar');
      this.tpr16.splice(index, 1);
      this.detectChanges();
    });
  }

  changeType() {
    this.preguntaForm = new FormGroup({});
    switch (this.tipoElegido) {
      case 4:
        //Texto fijo
        this.preguntaForm.addControl(
          'textoFijo',
          new FormControl(null, Validators.required)
        );
        this.descripcion =
          'Campo de texto fijo que mostrará los datos ingresados';
        break;
      case 5:
        //Input Texto
        this.preguntaForm.addControl(
          'requerido',
          new FormControl(true, Validators.required)
        );
        this.preguntaForm.addControl('maxLength', new FormControl(null));
        this.preguntaForm.addControl('minLength', new FormControl(null));
        this.descripcion =
          'Campo para ingresar texto, con validaciones opcionales de caracteres mínimos y máximos';
        break;
      case 6:
        //Combo selección
        this.preguntaForm.addControl(
          'requerido',
          new FormControl(true, Validators.required)
        );
        this.preguntaForm.addControl('opcion', new FormControl(null));
        this.preguntaForm.addControl('valor', new FormControl(null));
        this.descripcion =
          'Desplegable con las opciones agregadas en la grilla';
        break;
      case 7:
        //Input numérico
        this.preguntaForm.addControl(
          'requerido',
          new FormControl(true, Validators.required)
        );
        this.preguntaForm.addControl('min', new FormControl(null));
        this.preguntaForm.addControl('max', new FormControl(null));
        this.descripcion =
          'Campo para ingresar un número, con validaciones opcionales de número mínimo y número máximo';
        break;
      case 8:
        //Nombre usuario
        this.descripcion =
          'Campo inhabilitado que se autocompletará con el nombre del usuario realizando el cuestionario';
        break;
      case 9:
        //Fecha
        this.descripcion =
          'Campo inhabilitado que se autocompletará con la fecha en la cuál se inicie el cuestionario';
        break;
      case 10:
        //Selección radio
        this.preguntaForm.addControl(
          'critica',
          new FormControl(false, Validators.required)
        );
        this.preguntaForm.addControl(
          'requerido',
          new FormControl(true, Validators.required)
        );
        this.preguntaForm.addControl('opcion', new FormControl(null));
        this.preguntaForm.addControl('valor', new FormControl(null));
        this.descripcion =
          'Selección de una opción con nombres y valores determinados en la grilla. Las opciones que posean crítico 0 van a requerir justificación con registro fotográfico al ser seleccionadas';
        break;
      case 11:
        //RUT Usuario
        this.descripcion =
          'Campo inhabilitado que se autocompletará con el RUT del usuario realizando el cuestionario';
        break;
      case 12:
        //Calendario (completar)
        this.preguntaForm.addControl(
          'requerido',
          new FormControl(true, Validators.required)
        );
        this.descripcion = 'Calendario para seleccionar una fecha';
        break;
      case 13:
        //Autocompletar
        this.listaDatosService
          .getListaByParams({ empresa: this.data.empresaId })
          .subscribe((d) => {
            console.log(d);
            this.listasDeDatos = d.filter(
              (x: { id_lista_datos: number; estado: number }) =>
                x.id_lista_datos == this.idListaExistente || x.estado == 1
            );
          });
        this.preguntaForm.addControl(
          'requerido',
          new FormControl(true, Validators.required)
        );
        this.preguntaForm.addControl(
          'lista',
          new FormControl(null, Validators.required)
        );
        this.descripcion =
          'Lista de datos a vincular. La primera columna de la lista asociada será el valor a seleccionar, mientras que los demás datos de la fila serán autocompletados';
        break;
      case 14:
        //Subir foto
        this.preguntaForm.addControl(
          'requerido',
          new FormControl(true, Validators.required)
        );
        this.descripcion = 'Botón para subir adjuntar una imagen';
        break;
      case 15:
        //Selección Radio SI/NO
        this.preguntaForm.addControl(
          'critica',
          new FormControl(false, Validators.required)
        );
        this.preguntaForm.addControl(
          'requerido',
          new FormControl(true, Validators.required)
        );
        this.preguntaForm.addControl(
          'opcion1',
          new FormControl('SI', Validators.required)
        );
        this.preguntaForm.addControl(
          'opcion2',
          new FormControl('NO', Validators.required)
        );
        this.descripcion =
          'Selección de una opción de dos posibles opciones. La opción 2 requerirá justificación y registro fotográfico al ser seleccionada';
        break;
      case 16:
        this.preguntaForm.addControl(
          'requerido',
          new FormControl(true, Validators.required)
        );
        this.preguntaForm.addControl('descripcion', new FormControl(null));
        this.descripcion = 'Campo para cargar firma';
        break;
      case 17:
        this.preguntaForm.addControl(
          'requerido',
          new FormControl(true, Validators.required)
        );
        this.preguntaForm.addControl('maxLength', new FormControl(null));
        this.preguntaForm.addControl('minLength', new FormControl(null));
        this.descripcion =
          'Campo para ingresar texto alfanumérico, con validaciones opcionales de caracteres mínimos y máximos';
        break;
    }
  }

  save() {
    let find = this.data.titulosSeccion.find(
      (t) => t.toLowerCase() == this.tituloPregunta.toLowerCase()
    );
    if (
      this.data.mode == 'Edit' &&
      this.tituloPregunta.toLowerCase() !=
        this.data.data.pre_descripcion.toLowerCase() &&
      find != undefined
    ) {
      this.openSnackBar(
        'El título ya existe en esta sección',
        'X',
        'warn-snackbar'
      );
      return;
    } else if (this.data.mode != 'Edit' && find != undefined) {
      this.openSnackBar(
        'El título ya existe en esta sección',
        'X',
        'warn-snackbar'
      );
      return;
    }
    let idPregunta = 0;
    if (this.data.mode == 'Edit') {
      idPregunta = this.data.data.pre_id;
    }
    let model: PreguntaCuestionario = {
      id_pregunta: idPregunta,
      descripcion: this.tituloPregunta,
      opciones: [] as Array<OpcionCuestionario>,
      orden: this.ordenPregunta,
      id_tipo_pregunta: this.tipoElegido,
      preguntaValidaciones: [] as Array<ValidacionCuestionario>,
      id_estado: 1,
      rut_usuario_alta: Number(this.loginService.getUser()),
      critica: false,
    };
    console.log(model);

    switch (this.tipoElegido) {
      case 4:
        //Texto fijo
        model.opciones = [
          {
            id_opcion: 0,
            descripcion: this.preguntaForm.get('textoFijo')?.value,
            id_pregunta: idPregunta,
            id_estado: 1,
            valor: 0,
            orden: 0,
          },
        ];
        if (this.data.data) {
          if (this.data.data.opciones[0].opc_id != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].opc_id;
          } else if (this.data.data.opciones[0].id_opcion != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].id_opcion;
          }
        }
        break;
      case 5:
        //Input Texto
        model.opciones = [
          {
            id_opcion: 0,
            descripcion: 'Ingrese texto',
            id_pregunta: idPregunta,
            id_estado: 1,
            valor: 1,
            orden: 1,
          },
        ];
        if (this.data.data) {
          if (this.data.data.opciones[0].opc_id != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].opc_id;
          } else if (this.data.data.opciones[0].id_opcion != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].id_opcion;
          }
        }
        if (this.preguntaForm.get('requerido')?.value) {
          model.preguntaValidaciones!.push({
            id_pregunta_validacion: 0,
            id_validacion: 0,
            valor: '',
            mensaje: 'El campo es requerido',
            id_estado: 1,
          });
        }
        if (
          this.preguntaForm.get('maxLength')?.value != null &&
          this.preguntaForm.get('maxLength')?.value != ''
        ) {
          model.preguntaValidaciones!.push({
            id_pregunta_validacion: 0,
            id_validacion: 4,
            valor: `${this.preguntaForm.get('maxLength')?.value}`,
            mensaje: `Máximo ${
              this.preguntaForm.get('maxLength')?.value
            } caracteres`,
            id_estado: 1,
          });
        }
        if (
          this.preguntaForm.get('minLength')?.value != null &&
          this.preguntaForm.get('minLength')?.value != ''
        ) {
          model.preguntaValidaciones!.push({
            id_pregunta_validacion: 0,
            id_validacion: 3,
            valor: `${this.preguntaForm.get('minLength')?.value}`,
            mensaje: `Mínimo ${
              this.preguntaForm.get('minLength')?.value
            } caracteres`,
            id_estado: 1,
          });
        }
        break;
      case 6:
        //Combo selección
        console.log(this.tpr6);
        if (this.preguntaForm.get('requerido')?.value) {
          model.preguntaValidaciones!.push({
            id_pregunta_validacion: 0,
            id_validacion: 0,
            valor: '',
            mensaje: 'El campo es requerido',
            id_estado: 1,
          });
        }
        this.tpr6.forEach((opc, i) => {
          let idOpcion = 0;
          let opcDescripcion = '';
          if (opc.opc_id != undefined) {
            idOpcion = opc.opc_id;
          } else if (opc.id_opcion != undefined) {
            idOpcion = opc.id_opcion;
          }
          if (opc.opc_descripcion == undefined) {
            opcDescripcion = opc.descripcion;
          } else {
            opcDescripcion = opc.opc_descripcion;
          }
          model.opciones!.push({
            id_opcion: idOpcion,
            descripcion: opcDescripcion,
            id_pregunta: idPregunta,
            id_estado: 1,
            valor: opc.valor,
            orden: i,
          });
        });
        break;
      case 7:
        //Input numérico
        model.opciones = [
          {
            id_opcion: 0,
            descripcion: 'Ingrese número',
            id_pregunta: idPregunta,
            id_estado: 1,
            valor: 1,
            orden: 1,
          },
        ];
        if (this.data.data) {
          if (this.data.data.opciones[0].opc_id != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].opc_id;
          } else if (this.data.data.opciones[0].id_opcion != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].id_opcion;
          }
        }
        if (this.preguntaForm.get('requerido')?.value) {
          model.preguntaValidaciones!.push({
            id_pregunta_validacion: 0,
            id_validacion: 0,
            valor: '',
            mensaje: 'El campo es requerido',
            id_estado: 1,
          });
        }
        if (
          this.preguntaForm.get('min')?.value != null &&
          this.preguntaForm.get('min')?.value != ''
        ) {
          model.preguntaValidaciones!.push({
            id_pregunta_validacion: 0,
            id_validacion: 2,
            valor: `${this.preguntaForm.get('min')?.value}`,
            mensaje: `Valor mínimo ${this.preguntaForm.get('min')?.value}`,
            id_estado: 1,
          });
        }
        if (
          this.preguntaForm.get('max')?.value != null &&
          this.preguntaForm.get('max')?.value != ''
        ) {
          model.preguntaValidaciones!.push({
            id_pregunta_validacion: 0,
            id_validacion: 1,
            valor: `${this.preguntaForm.get('max')?.value}`,
            mensaje: `Valor máximo ${this.preguntaForm.get('max')?.value}`,
            id_estado: 1,
          });
        }
        break;
      case 8:
        model.opciones = [
          {
            id_opcion: 0,
            descripcion: 'Nombre usuario',
            id_pregunta: idPregunta,
            id_estado: 1,
            valor: 1,
            orden: 1,
          },
        ];
        if (this.data.data) {
          if (this.data.data.opciones[0].opc_id != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].opc_id;
          } else if (this.data.data.opciones[0].id_opcion != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].id_opcion;
          }
        }
        break;
      case 9:
        model.opciones = [
          {
            id_opcion: 0,
            descripcion: 'Fecha y hora',
            id_pregunta: idPregunta,
            id_estado: 1,
            valor: 1,
            orden: 1,
          },
        ];
        if (this.data.data) {
          if (this.data.data.opciones[0].opc_id != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].opc_id;
          } else if (this.data.data.opciones[0].id_opcion != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].id_opcion;
          }
        }
        break;
      case 10:
        //Selección radio
        model.critica = this.preguntaForm.get('critica')?.value;
        if (this.preguntaForm.get('requerido')?.value) {
          model.preguntaValidaciones!.push({
            id_pregunta_validacion: 0,
            id_validacion: 0,
            valor: '',
            mensaje: 'El campo es requerido',
            id_estado: 1,
          });
        }
        this.tpr10.forEach((opc, i) => {
          let idOpcion = 0;
          let opcValor = 0;
          let opcDescripcion = '';
          if (opc.opc_id != undefined) {
            idOpcion = opc.opc_id;
          } else if (opc.id_opcion != undefined) {
            idOpcion = opc.id_opcion;
          }
          if (opc.opc_descripcion == undefined) {
            opcDescripcion = opc.descripcion;
          } else {
            opcDescripcion = opc.opc_descripcion;
          }
          if (opc.opc_valor == undefined) {
            opcValor = opc.valor;
          } else {
            opcValor = opc.opc_valor;
          }
          model.opciones!.push({
            id_opcion: idOpcion,
            descripcion: opcDescripcion,
            id_pregunta: idPregunta,
            id_estado: 1,
            valor: opcValor,
            orden: i,
          });
        });
        break;
      case 11:
        model.opciones = [
          {
            id_opcion: 0,
            descripcion: 'Ingrese número',
            id_pregunta: idPregunta,
            id_estado: 1,
            valor: 1,
            orden: 1,
          },
        ];
        if (this.data.data) {
          if (this.data.data.opciones[0].opc_id != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].opc_id;
          } else if (this.data.data.opciones[0].id_opcion != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].id_opcion;
          }
        }
        break;
      case 12:
        //Calendario (completar)
        model.opciones = [
          {
            id_opcion: 0,
            descripcion: 'Ingrese fecha',
            id_pregunta: idPregunta,
            id_estado: 1,
            valor: 1,
            orden: 1,
          },
        ];
        if (this.data.data) {
          if (this.data.data.opciones[0].opc_id != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].opc_id;
          } else if (this.data.data.opciones[0].id_opcion != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].id_opcion;
          }
        }
        if (this.preguntaForm.get('requerido')?.value) {
          model.preguntaValidaciones!.push({
            id_pregunta_validacion: 0,
            id_validacion: 0,
            valor: '',
            mensaje: 'El campo es requerido',
            id_estado: 1,
          });
        }
        break;
      case 13:
        Object.assign(model, {
          id_lista: this.preguntaForm.get('lista')?.value,
        });
        model.opciones = [
          {
            id_opcion: 0,
            descripcion: 'Lista de datos',
            id_pregunta: idPregunta,
            id_estado: 1,
            valor: 1,
            orden: 1,
          },
        ];
        if (this.data.data) {
          if (this.data.data.opciones[0].opc_id != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].opc_id;
          } else if (this.data.data.opciones[0].id_opcion != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].id_opcion;
          }
        }
        break;
      case 14:
        //Subir foto
        model.opciones = [
          {
            id_opcion: 0,
            descripcion: 'Subir Foto',
            id_pregunta: idPregunta,
            id_estado: 1,
            valor: 1,
            orden: 1,
          },
        ];
        if (this.data.data) {
          if (this.data.data.opciones[0].opc_id != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].opc_id;
          } else if (this.data.data.opciones[0].id_opcion != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].id_opcion;
          }
        }
        if (this.preguntaForm.get('requerido')?.value) {
          model.preguntaValidaciones!.push({
            id_pregunta_validacion: 0,
            id_validacion: 0,
            valor: '',
            mensaje: 'El campo es requerido',
            id_estado: 1,
          });
        }
        break;
      case 15:
        //Selección Radio SI/NO
        model.critica = this.preguntaForm.get('critica')?.value;
        if (this.preguntaForm.get('requerido')?.value) {
          model.preguntaValidaciones!.push({
            id_pregunta_validacion: 0,
            id_validacion: 0,
            valor: '',
            mensaje: 'El campo es requerido',
            id_estado: 1,
          });
        }
        model.opciones = [
          {
            id_opcion: 0,
            descripcion: this.preguntaForm.get('opcion1')?.value,
            id_pregunta: idPregunta,
            id_estado: 1,
            valor: 1,
            orden: 0,
          },
          {
            id_opcion: 0,
            descripcion: this.preguntaForm.get('opcion2')?.value,
            id_pregunta: idPregunta,
            id_estado: 1,
            valor: 0,
            orden: 1,
          },
        ];
        for (let index = 0; index < 2; index++) {
          if (this.data.data) {
            if (this.data.data.opciones[index].opc_id != undefined) {
              model.opciones[index].id_opcion =
                this.data.data.opciones[index].opc_id;
            } else if (this.data.data.opciones[index].id_opcion != undefined) {
              model.opciones[index].id_opcion =
                this.data.data.opciones[index].id_opcion;
            }
          }
        }
        break;
      case 16:
        //Subir foto
        model.opciones = [
          {
            id_opcion: 0,
            descripcion: 'Firmar',
            id_pregunta: idPregunta,
            id_estado: 1,
            valor: 1,
            orden: 1,
          },
        ];
        if (this.data.data) {
          if (this.data.data.opciones[0].opc_id != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].opc_id;
          } else if (this.data.data.opciones[0].id_opcion != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].id_opcion;
          }
        }
        if (this.preguntaForm.get('requerido')?.value) {
          model.preguntaValidaciones!.push({
            id_pregunta_validacion: 0,
            id_validacion: 0,
            valor: '',
            mensaje: 'El campo es requerido',
            id_estado: 1,
          });
        }
        break;
      case 17:
        model.opciones = [
          {
            id_opcion: 0,
            descripcion: 'Ingrese texto alfanumérico',
            id_pregunta: idPregunta,
            id_estado: 1,
            valor: 1,
            orden: 1,
          },
        ];
        if (this.data.data) {
          if (this.data.data.opciones[0].opc_id != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].opc_id;
          } else if (this.data.data.opciones[0].id_opcion != undefined) {
            model.opciones[0].id_opcion = this.data.data.opciones[0].id_opcion;
          }
        }
        if (this.preguntaForm.get('requerido')?.value) {
          model.preguntaValidaciones!.push({
            id_pregunta_validacion: 0,
            id_validacion: 0,
            valor: '',
            mensaje: 'El campo es requerido',
            id_estado: 1,
          });
        }
        if (
          this.preguntaForm.get('maxLength')?.value != null &&
          this.preguntaForm.get('maxLength')?.value != ''
        ) {
          model.preguntaValidaciones!.push({
            id_pregunta_validacion: 0,
            id_validacion: 4,
            valor: `${this.preguntaForm.get('maxLength')?.value}`,
            mensaje: `Máximo ${
              this.preguntaForm.get('maxLength')?.value
            } caracteres`,
            id_estado: 1,
          });
        }
        if (
          this.preguntaForm.get('minLength')?.value != null &&
          this.preguntaForm.get('minLength')?.value != ''
        ) {
          model.preguntaValidaciones!.push({
            id_pregunta_validacion: 0,
            id_validacion: 3,
            valor: `${this.preguntaForm.get('minLength')?.value}`,
            mensaje: `Mínimo ${
              this.preguntaForm.get('minLength')?.value
            } caracteres`,
            id_estado: 1,
          });
        }
        break;
    }
    if (this.data.mode == 'Edit') {
      this.cuestionarioService
        .updatePregunta(
          model,
          this.data.idCuestionario,
          this.data.idSeccion,
          idPregunta
        )
        .subscribe((d) => {
          if (model.id_tipo_pregunta == 16 && this.tpr16.length > 0) {
            let arrayFirmas = [] as Array<FirmaDatoAdicional>;
            this.tpr16.forEach((campo, index) => {
              let modelFirmaDatoAdicional: FirmaDatoAdicional = {
                id: 0,
                id_pregunta: model.id_pregunta!,
                descripcion: campo.descripcion,
                orden: index + 1,
                id_estado: 1,
              };
              if (campo.id) {
                modelFirmaDatoAdicional.id = campo.id;
              }
              arrayFirmas.push(modelFirmaDatoAdicional);
            });
            this.cuestionarioService
              .updateFirmaDatoAdicional({ firmaDatoAdicional: arrayFirmas })
              .subscribe((res) => {
                this.dialogRef.close(model);
                //window.location.reload();
                let url = this.router.url;
                this.router
                  .navigateByUrl('/', { skipLocationChange: true })
                  .then(() => {
                    this.router.navigate([`/${url}`]).then(() => {
                      console.log(
                        `After navigation I am on:${this.router.url}`
                      );
                    });
                  });
              });
          } else {
            console.log(d);
            this.dialogRef.close(model);
            //window.location.reload();
            let url = this.router.url;
            this.router
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => {
                this.router.navigate([`/${url}`]).then(() => {
                  console.log(`After navigation I am on:${this.router.url}`);
                });
              });
          }
        });
    } else if (this.data.mode == 'Add') {
      console.log(model);
      this.cuestionarioService
        .addPregunta(model, this.data.idCuestionario, this.data.idSeccion)
        .subscribe((d) => {
          model.id_pregunta = d.id;
          if (model.id_tipo_pregunta == 16 && this.tpr16.length > 0) {
            let arrayFirmas = [] as Array<FirmaDatoAdicional>;
            this.tpr16.forEach((campo, index) => {
              let modelFirmaDatoAdicional: FirmaDatoAdicional = {
                id: 0,
                id_pregunta: model.id_pregunta!,
                descripcion: campo.descripcion,
                orden: index + 1,
                id_estado: 1,
              };
              arrayFirmas.push(modelFirmaDatoAdicional);
            });
            this.cuestionarioService
              .createFirmaDatoAdicional({ firmaDatoAdicional: arrayFirmas })
              .subscribe((res) => {
                this.dialogRef.close(model);
                //window.location.reload();
                let url = this.router.url;
                this.router
                  .navigateByUrl('/', { skipLocationChange: true })
                  .then(() => {
                    this.router.navigate([`/${url}`]).then(() => {
                      console.log(
                        `After navigation I am on:${this.router.url}`
                      );
                    });
                  });
              });
          } else {
            this.dialogRef.close(model);
            //window.location.reload();
            let url = this.router.url;
            this.router
              .navigateByUrl('/', { skipLocationChange: true })
              .then(() => {
                this.router.navigate([`/${url}`]).then(() => {
                  console.log(`After navigation I am on:${this.router.url}`);
                });
              });
          }
        });
    } else if ((this.data.mode = 'Copy')) {
      model.opciones!.forEach((op) => {
        op.id_opcion = 0;
      });
      console.log(model);
      this.cuestionarioService
        .addPregunta(model, this.data.idCuestionario, this.data.idSeccion)
        .subscribe((d) => {
          model.id_pregunta = d.id;
          this.dialogRef.close(model);
          //window.location.reload();
          let url = this.router.url;
          this.router
            .navigateByUrl('/', { skipLocationChange: true })
            .then(() => {
              this.router.navigate([`/${url}`]).then(() => {
                console.log(`After navigation I am on:${this.router.url}`);
              });
            });
        });
    }
  }

  close() {
    let url = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
        console.log(`After navigation I am on:${this.router.url}`);
      });
    });
    this.dialogRef.close();
  }

  checkSave(): boolean {
    if (this.rolUsuario == 3) {
      return true;
    }
    if (this.preguntaForm.invalid) {
      return true;
    }
    if (this.tituloPregunta == '') {
      return true;
    }
    if (this.tipoElegido == 0) {
      return true;
    }
    if (
      this.tipoElegido == 6 &&
      (this.tpr6.length == 0 ||
        this.tpr6.find((data) => data.opc_descripcion == '') != undefined)
    ) {
      return true;
    }
    if (
      this.tipoElegido == 10 &&
      (this.tpr10.length == 0 ||
        this.tpr10.find((data) => data.opc_descripcion == '') != undefined)
    ) {
      return true;
    }
    return false;
  }

  dropTable(event: CdkDragDrop<any[]>) {
    const prevIndex = this.tpr6.findIndex((d) => d === event.item.data);
    moveItemInArray(this.tpr6, prevIndex, event.currentIndex);
    this.table.renderRows();
    let index = 0;
    this.tpr6.forEach((opc) => {
      opc.opc_orden = index;
      index++;
    });
  }

  dropTableRadio(event: CdkDragDrop<any[]>) {
    const prevIndex = this.tpr10.findIndex((d) => d === event.item.data);
    moveItemInArray(this.tpr10, prevIndex, event.currentIndex);
    this.table.renderRows();
    let index = 0;
    this.tpr10.forEach((opc) => {
      opc.opc_orden = index;
      index++;
    });
  }

  get colours() {
    return this.stylesService.getStyle();
  }

  openSnackBar(message: string, action: string, className: string) {
    this.snackbar.open(message, action, {
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: className,
    });
  }
}
