import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Empresa, Estado, Grupo, Planta } from 'src/app/models/abm';
import { FilesService } from 'src/app/services/files.service';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { ButtonsEventService } from '../../buttons-event.service';
import { ConfirmationModalComponent } from '../../modals/confirmation-modal/confirmation-modal.component';
import { AbmEmpresaService } from '../abm-empresa.service';
import { AbmEmpresaModalComponent } from '../modal/modal.component';
import { moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-empresa-editar',
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.scss']
})
export class AbmEmpresaEditarComponent implements OnInit, OnDestroy {

  titulo: string = "Editar empresa";
  boton: string = "Guardar cambios";
  seccion: string = "Empresas";

  empresaForm: FormGroup = new FormGroup({
    razonSocial: new FormControl(null, [Validators.required, Validators.maxLength(100)]),
    rut: new FormControl(null, [Validators.required, Validators.max(999999999)]),
    estado: new FormControl(null, [Validators.required]),
    planta: new FormControl(null),
    grupo: new FormControl(null)
  });
  estados = [] as Array<Estado>;

  suscripcion: Subscription;
  imgSrc: any = "";
  selectedFile: any = null;

  empresa: Empresa | undefined;

  plantas = [] as Array<Planta>;
  grupos = [] as Array<Grupo>;

  constructor(
    private stylesService: StylesService,
    private buttonsEventService: ButtonsEventService,
    private router: Router,
    public abmEmpresaService: AbmEmpresaService,
    private activatedRoute: ActivatedRoute,
    private loginService: LoginService,
    private snackbar: MatSnackBar,
    public dialog: MatDialog,
    private fileService: FilesService,
    private sanitizer: DomSanitizer
  ) {
    this.suscripcion = this.buttonsEventService.events.subscribe(
      (data: any) => {
        this.save()
      }
    )
  }

  ngOnInit(): void {
    this.estados = JSON.parse(localStorage.getItem('estados')!);
    console.log(this.activatedRoute.snapshot.params['empresaId']);
    this.abmEmpresaService.getEmpresas(null).subscribe(d => {
      console.log(d)
      this.empresa = d.find((emp: { id: any; }) => emp.id == this.activatedRoute.snapshot.params['empresaId']);
      if(this.empresa != undefined) {
        this.empresaForm.setValue({
          razonSocial: this.empresa.descripcion,
          rut: this.empresa.rut_empresa,
          estado: this.empresa.id_estado,
          planta: null,
          grupo: null
        });
        if(this.empresa.descripcion == "Optimal") {
          this.imgSrc = "/assets/images/logos/Optimal_logo_blanco_sm.png";
        };
        if(this.empresa.descripcion == "Collahuasi") {
          this.imgSrc = "/assets/images/logos/collahuasi-logo.jpg";
        };
        this.abmEmpresaService.getGrupos(this.empresa.id!).subscribe(res => {
          if(res.find((r: { orden: any; }) => r.orden) != undefined) {
            this.grupos = res.sort((a: { orden: number; },b: { orden: number; }) => a.orden - b.orden);
          } else {
            this.grupos = res
          }
          console.log(this.grupos)
        });
        this.abmEmpresaService.getPlantas(this.empresa.id!).subscribe(res => {
          this.plantas = res;
          console.log(this.plantas)
        });
      };
      if(this.empresa?.id_imagen) {
        this.fileService.traerArchivo(this.empresa?.id_imagen, 3).subscribe(d => {
          let blob = this.fileService.b64toBlob(d.file, this.fileService.getFileType(d.fileName));
          this.imgSrc = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
        })
      }
      console.log(this.empresa)
    })
    
    if(this.abmEmpresaService.getMode() == "View") {
      this.empresaForm.disable();
    }
  }

  ngOnDestroy(): void {
    this.suscripcion.unsubscribe();
  }

  save() {
    console.log(this.empresaForm.getRawValue());
    if(this.abmEmpresaService.getMode() == "View") {
      this.router.navigate(['dashboard/empresa']);
    } else {
      if(this.empresaForm.invalid) {
        this.empresaForm.markAllAsTouched();
        return;
      };

      let model: Empresa = {
        id: this.empresa!.id,
        descripcion: this.empresaForm.get('razonSocial')?.value,
        rut_empresa: this.empresaForm.get('rut')?.value,
        rut_usuario: Number(this.loginService.getUser()),
        id_estado: this.empresaForm.get('estado')?.value,
        //id_imagen: 0
        plantas: this.plantas,
        grupos: this.grupos
      };

      if(this.empresa?.id_imagen) {
        model.id_imagen = this.empresa.id_imagen;
      };

      model.plantas?.forEach(pl => {
        pl.usuariosPlanta = [];
        pl.cuestionarios = [];
      });

      model.grupos?.forEach(gr => {
        gr.cuestionarios = [];
      });

      if(this.selectedFile != null) {
        if(this.empresa?.id_imagen) {
          this.fileService.actualizarArchivo(this.selectedFile, this.empresa.id_imagen, 3).subscribe(res => {
            this.abmEmpresaService.updateEmpresa(model).subscribe(d => {
              console.log(d)
              this.openSnackBar("Cambios guardados", 'X', 'success-snackbar');
              this.router.navigate(['dashboard/empresa']);
            },
            err => {
              this.openSnackBar(err.error.message, 'X', 'error-snackbar');
            });
          })
        } else {
          this.fileService.subirArchivo(this.selectedFile, 3).subscribe(res => {
            model.id_imagen = res.id;
            this.abmEmpresaService.updateEmpresa(model).subscribe(d => {
              console.log(d)
              this.openSnackBar("Cambios guardados", 'X', 'success-snackbar');
              this.router.navigate(['dashboard/empresa']);
            },
            err => {
              this.openSnackBar(err.error.message, 'X', 'error-snackbar');
            });
          })
        }
      } else {
        this.abmEmpresaService.updateEmpresa(model).subscribe(d => {
          console.log(d)
          this.openSnackBar("Cambios guardados", 'X', 'success-snackbar');
          this.router.navigate(['dashboard/empresa']);
        },
        err => {
          this.openSnackBar(err.error.message, 'X', 'error-snackbar');
        });
      }

      

      
      //Si tiene, que verifique que se haya seleccionado un archivo selectedFile
      //Si tiene selectedFile y id_imagen, hacer PUT de Archivo de id_imagen tipo 3 y no cambiar id_imagen del model
      //Si tiene selectedFile y no tiene id_imagen, hacer POST de archivo y agregar id_imagen a model
    }
  }

  estadoSelectionChange(event: any) {
    if(event.value == 3) {
      const dialogRef = this.dialog.open(ConfirmationModalComponent, {
        width: '70%',
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if(result) {
          this.empresaForm.get('estado')?.setValue(3);
          this.empresaForm.updateValueAndValidity();
        } else {
          this.empresaForm.get('estado')?.setValue(1);
          this.empresaForm.updateValueAndValidity();
        }
      });
    }
  }

  uploadFoto() {
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
      id_empresa: this.empresa!.id!,
      id_estado: 1,
      descripcion: this.empresaForm.get('planta')!.value
    });
    this.empresaForm.get('planta')!.setValue(null)
  }

  editPlanta(event: any, planta: any) {
    event.stopPropagation();
    const dialogRef = this.dialog.open(AbmEmpresaModalComponent, {
      maxHeight: '85vh',
      height: 'auto',
      data: {data: {descripcion: planta.descripcion, estado: planta.id_estado}, mode: "Planta"}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.plantas.find(pl => pl == planta)!.descripcion = result.descripcion;
        this.plantas.find(pl => pl == planta)!.id_estado = result.estado;
      }
    });
  }

  addGrupo() {
    if(this.empresaForm.get('grupo')!.value == null || this.empresaForm.get('grupo')!.value == "") {
      return;
    };
    this.grupos.push({
      id_grupo: 0,
      id_empresa: this.empresa!.id!,
      id_estado: 1,
      descripcion: this.empresaForm.get('grupo')!.value,
      orden: this.grupos.length + 1
    });
    this.empresaForm.get('grupo')!.setValue(null)
  }

  editGrupo(event: any, grupo: any) {
    event.stopPropagation();
    console.log(grupo);
    const dialogRef = this.dialog.open(AbmEmpresaModalComponent, {
      maxHeight: '85vh',
      height: 'auto',
      data: {data: {descripcion: grupo.descripcion, estado: grupo.id_estado}, mode: "Grupo"}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.grupos.find(gr => gr == grupo)!.descripcion = result.descripcion;
        this.grupos.find(gr => gr == grupo)!.id_estado = result.estado;
      }
    });
  }

  dropGrupo(event: any) {
    console.log(event);
    console.log(this.grupos);
    const prevIndex = this.grupos.findIndex((d) => d === event.item.data);
    moveItemInArray(this.grupos, prevIndex, event.currentIndex);
    
    let index = 0;
    this.grupos
    this.grupos.forEach(g => {
      g.orden = index + 1;
      index++;
    });
  }

  openSnackBar(message: string, action: string, className: string) {
    this.snackbar.open(message, action, {horizontalPosition: 'right', verticalPosition: 'top', panelClass: className});
  }

  get colours() {
    return this.stylesService.getStyle()
  }


}
