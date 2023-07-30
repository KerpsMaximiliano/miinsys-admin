import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { CargaMasivaUsuariosParams, Empresa, Estado, Planta } from 'src/app/models/abm';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmEmpresaService } from '../../abm-empresa/abm-empresa.service';
import { AbmUsuarioService } from '../abm-usuario.service';

@Component({
  selector: 'app-carga-masiva',
  templateUrl: './carga-masiva.component.html',
  styleUrls: ['./carga-masiva.component.scss']
})
export class AbmUsuarioCargaMasivaComponent implements OnInit {

  titulo: string = "Carga masiva de usuarios";
  seccion: string = "Usuarios";

  cargaForm: FormGroup = new FormGroup({
    empresa: new FormControl(null, Validators.required),
    planta: new FormControl(null, Validators.required),
    estado: new FormControl(null, Validators.required),
    contraseña: new FormControl(null, Validators.required)
  });

  estados = [] as Array<Estado>;
  empresas = [] as Array<Empresa>;
  rolUsuario: number = 0;
  empresaUsuario = {} as any;
  plantas = [] as Array<Planta>;
  errores = [] as Array<string>;

  constructor(
    private stylesService: StylesService,
    private empresaService: AbmEmpresaService,
    private loginService: LoginService,
    private usuarioService: AbmUsuarioService,
    private router: Router,
    private snackbar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.rolUsuario = Number(this.loginService.getRol());
    this.estados = JSON.parse(localStorage.getItem('estados')!);
    this.empresaUsuario = JSON.parse(this.loginService.getEmpresa()!);
    if(this.rolUsuario > 1) {
      this.empresaService.getEmpresas({id: this.empresaUsuario.id, id_estado: 1}).subscribe(d => {
        this.empresas = d;
      });
    } else {
      this.empresaService.getEmpresas({id_estado: 1}).subscribe(d => {
        this.empresas = d;
      });
    };
    this.cargaForm.get('planta')?.disable();
  }

  empresaChange(event: any) {
    this.empresaService.getPlantas(event.value).subscribe(d => {
      this.plantas = d.filter((pl: { id_estado: number; }) => pl.id_estado == 1);
      this.cargaForm.get('planta')?.setValue(null);
      if(this.plantas.length > 0) {
        this.cargaForm.get('planta')?.enable();
      } else {
        this.cargaForm.get('planta')?.disable();
      }
    });
  }

  downloadTemplate() {
    let link = document.createElement("a");
    link.download = "Carga  masiva de usuarios.xlsx";
    link.href = "assets/csv/Carga_masiva_de_usuarios.xlsx";
    link.click();
  }

  uploadCsv() {
    //5 - carga masiva usuarios
    this.cargaForm.markAllAsTouched();
    if(this.cargaForm.invalid) {
      return;
    };
    let model: CargaMasivaUsuariosParams = {
      id_empresa: this.cargaForm.get('empresa')?.value,
      id_estado: this.cargaForm.get('estado')?.value,
      contraseña: this.cargaForm.get('contraseña')?.value,
    };
    if(this.cargaForm.get('planta')?.value != null) {
      Object.assign(model, {id_planta: this.cargaForm.get('planta')?.value});
    };
    let file: any;
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xls, .xlsx';
    input.onchange = _ => {
      let files = Array.from(input.files!);
      file = files[0];
      this.usuarioService.cargaMasiva(model, file, 0).subscribe(d => {
        console.log(d);
        if(d.status == "Success") {
          this.errores = [];
          this.usuarioService.cargaMasiva(model, file, 1).subscribe(res => {
            console.log(res);
            if(res.status == "Success") {
              this.openSnackBar(res.message, 'X', 'success-snackbar');
              this.router.navigate(['dashboard/usuario']);
            } else {
              this.errores = this.formatError(res);
            }
          })
        } else {
          this.errores = this.formatError(d);
        }
      })
    };
    input.click();
  }

  formatError(array: Array<any>) {
    let newArray = [] as Array<string>;
    array.forEach(a => {
      let sections = a.split('Fila');
      if(sections[1] != undefined) {
        newArray.push(sections[0] + ' en la fila ' + (Number(sections[1].split(': ')[1]) + 1));
      } else {
        newArray.push(a);
      }
    });
    newArray = [...new Set(newArray)];
    return newArray;
  }

  generatePassword() {
    let password2 = [];
    password2[0] = Array(2).fill("0123456789").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    password2[1] = Array(2).fill("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    password2[2] = Array(2).fill("abcdefghijklmnopqrstuvwxyz").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    password2[3] = Array(2).fill("~!@-#$").map(function(x) { return x[Math.floor(Math.random() * x.length)] }).join('');
    for (let i = password2.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      let temp: string = password2[i];
      password2[i] = password2[j];
      password2[j] = temp;
    }
    this.cargaForm.get('contraseña')?.setValue(password2[0] + password2[1] + password2[2] + password2[3]);
    this.cargaForm.updateValueAndValidity();
  }

  filtrar() {
    if(this.rolUsuario > 1) {
      this.empresas = this.empresas.filter(e => e.id == this.empresaUsuario.id);
    }
  }

  openSnackBar(message: string, action: string, className: string) {
    this.snackbar.open(message, action, {horizontalPosition: 'right', verticalPosition: 'top', panelClass: className});
  }

  get colours() {
    return this.stylesService.getStyle()
  }

}
