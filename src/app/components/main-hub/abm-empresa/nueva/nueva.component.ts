import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Empresa, Estado, Grupo, Planta } from 'src/app/models/abm';
import { FilesService } from 'src/app/services/files.service';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { ButtonsEventService } from '../../buttons-event.service';
import { AbmEmpresaService } from '../abm-empresa.service';
import { moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-empresa-nueva',
  templateUrl: './nueva.component.html',
  styleUrls: ['./nueva.component.scss']
})
export class AbmEmpresaNuevaComponent implements OnInit, OnDestroy {

  titulo: string = "Añadir nueva empresa";
  boton: string = "Guardar empresa";
  seccion: string = "Empresas";

  empresaForm: FormGroup = new FormGroup({
    razonSocial: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
    rut: new FormControl(null, [Validators.required, Validators.max(999999999)]),
    estado: new FormControl(null, [Validators.required]),
    planta: new FormControl(null),
    grupo: new FormControl(null)
  });
  estados = [] as Array<Estado>;
  imgSrc: any = "";
  selectedFile: any = null;

  plantas = [] as Array<Planta>;
  grupos = [] as Array<Grupo>;

  suscripcion: Subscription;

  constructor(
    private stylesService: StylesService,
    private buttonsEventService: ButtonsEventService,
    private abmEmpresaService: AbmEmpresaService,
    private router: Router,
    private loginService: LoginService,
    private snackbar: MatSnackBar,
    private fileService: FilesService
  ) {
    this.suscripcion = this.buttonsEventService.events.subscribe(
      (data: any) => {
        this.save()
      }
    )
  }

  ngOnInit(): void {
    this.estados = JSON.parse(localStorage.getItem('estados')!);
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  save() {
    console.log(this.empresaForm.getRawValue());
    if(this.empresaForm.invalid) {
      this.empresaForm.markAllAsTouched();
      return;
    };

    let model: Empresa = {
      id: 0,
      descripcion: this.empresaForm.get('razonSocial')?.value,
      rut_empresa: Number(this.empresaForm.get('rut')?.value),
      id_estado: this.empresaForm.get('estado')?.value,
      rut_usuario: Number(this.loginService.getUser()!),
      //id_imagen: 0//Agregar imagen subida cuando funcione
      plantas: this.plantas,
      grupos: this.grupos
    };
    console.log(model);

    if(this.selectedFile != null) {
      this.fileService.subirArchivo(this.selectedFile, 3).subscribe(res => {
        console.log(res);
        model.id_imagen = res.id;
        this.abmEmpresaService.createEmpresa(model).subscribe(d => {
          console.log(d);
          this.openSnackBar("Empresa guardada con éxito", 'X', 'success-snackbar');
          this.router.navigate(['dashboard/empresa']);
        },
        err => {
          this.openSnackBar(err.message, 'X', 'error-snackbar');
        });
      })
    } else {
      this.abmEmpresaService.createEmpresa(model).subscribe(d => {
        console.log(d);
        this.openSnackBar("Empresa guardada con éxito", 'X', 'success-snackbar');
        this.router.navigate(['dashboard/empresa']);
      },
      err => {
        this.openSnackBar(err.message, 'X', 'error-snackbar');
      });
    }
  }

  openSnackBar(message: string, action: string, className: string) {
    this.snackbar.open(message, action, {horizontalPosition: 'right', verticalPosition: 'top', panelClass: className});
  }

  uploadFoto() {
    //3 - Empresas
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.jfif, .jpg, .png';
    input.onchange = _ => {
      let extension = input.files![0].name.split('.')[input.files![0].name.split('.').length - 1];
      if (extension != 'jpg' && extension != 'jfif' && extension != 'png') {
        this.openSnackBar("Extensión no admitida", "X", "warn-snackbar");
      } else {
        let files = Array.from(input.files!);
        console.log(files); //File Array
        this.selectedFile = files[0];
        console.log(input.files); //FileList
        const reader = new FileReader();
        reader.readAsDataURL(files[0]);
        reader.onload = _event => {
          let url = reader.result;
          this.imgSrc = url;
        }
      }
    };
    input.click();
  }

  addPlanta() {
    if(this.empresaForm.get('planta')!.value == null || this.empresaForm.get('planta')!.value == "") {
      return;
    };
    this.plantas.push({
      id_planta: 0,
      id_empresa: 0,
      id_estado: 1,
      descripcion: this.empresaForm.get('planta')!.value
    });
    this.empresaForm.get('planta')!.setValue(null)
  }

  addGrupo() {
    if(this.empresaForm.get('grupo')!.value == null || this.empresaForm.get('grupo')!.value == "") {
      return;
    };
    this.grupos.push({
      id_grupo: 0,
      id_empresa: 0,
      id_estado: 1,
      descripcion: this.empresaForm.get('grupo')!.value,
      orden: this.grupos.length + 1
    });
    this.empresaForm.get('grupo')!.setValue(null)
  }

  dropGrupo(event: any) {
    console.log(event);
    console.log(this.grupos);
    const prevIndex = this.grupos.findIndex((d) => d === event.item.data);
    moveItemInArray(this.grupos, prevIndex, event.currentIndex);
    let index = 1;
    this.grupos.forEach(g => {
      g.orden = index;
      index++;
    });
  }

  get colours() {
    return this.stylesService.getStyle()
  }

}
