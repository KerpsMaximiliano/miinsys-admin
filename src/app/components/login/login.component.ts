import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginForm } from 'src/app/models/login';
import { LoginService } from 'src/app/services/login.service';
import { MatSnackBar } from "@angular/material/snack-bar";
import { AbmUsuarioService } from '../main-hub/abm-usuario/abm-usuario.service';
import { MatDialog } from '@angular/material/dialog';
import { RecuperarContraseniaModalComponent } from './recuperar-contrasenia-modal/recuperar-contrasenia-modal.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup = new FormGroup({
    username: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required])
  });

  hide: boolean = true;
  remember: boolean = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private snackBar: MatSnackBar,
    private usuarioService: AbmUsuarioService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    if(this.loginService.getRememberedUser() != undefined) {
      this.loginForm.get('username')?.setValue(JSON.parse(this.loginService.getRememberedUser()!).username);
      this.loginForm.get('password')?.setValue(JSON.parse(this.loginService.getRememberedUser()!).password);
      this.loginForm.updateValueAndValidity();
      this.remember = true;
    }
  }
  
  login() {
    console.log(this.loginForm.value);
    if(this.loginForm.invalid) {
      return;
    };

    let model: LoginForm = {
      username: this.loginForm.get('username')!.value.toString(),
      password: this.loginForm.get('password')!.value
    };

    this.loginService.login(model).subscribe(d => {
      console.log(d);
      this.loginService.setToken(d);
      this.loginService.getEstadoRol();
      this.loginService.getExtraInfo().subscribe(e => {
        console.log(e);
        if(e.usuarioRol.length > 0) {
          if(e.usuarioRol[0].id_rol < 4) {
            this.loginService.setUser(e.rut);
            this.loginService.setRol(e.usuarioRol[0].id_rol);
            if(e.usuarioRol[0].id_rol == 2 || e.usuarioRol[0].id_rol == 3) {
              this.usuarioService.getUserByRut(e.rut).subscribe(res => {
                console.log(res)
                if(res.id_estado == 3) {
                  this.openSnackBar("El usuario se encuentra inactivo", "Cerrar");
                  this.loginService.logout();
                } else {
                  this.loginService.setEmpresa(JSON.stringify({
                    id: res.usuarioEmpresa[0].emp_id,
                    rut: res.usuarioEmpresa[0].emp_id,
                    nombre: res.usuarioEmpresa[0].descripcion_empresa
                  }));
                  if(this.remember) {
                    this.loginService.rememberUser(model)
                  } else {
                    this.loginService.removeRememberedUser()
                  }
                  setTimeout(() => {
                    this.router.navigate(['/dashboard/dashboard/usabilidad']);
                  }, 500);
                }
                
              })
            } else {
              if(this.remember) {
                this.loginService.rememberUser(model)
              } else {
                this.loginService.removeRememberedUser()
              }
              setTimeout(() => {
                this.router.navigate(['/dashboard/dashboard/usabilidad']);
              }, 500);
            }
          } else {
            this.openSnackBar("El usuario no posee el rol requerido para ingresar", "Cerrar");
          }
        } else {
          this.openSnackBar("El usuario no posee el rol requerido para ingresar", "Cerrar");
        }
      });
    },
    err => {
      console.log(err);
      if(err.error.message) {
        this.openSnackBar(err.error.message, "Cerrar");
      } else {
        this.openSnackBar("El sistema no está disponible por el momento", "Cerrar");
      }
      
    })
  }

  recoverPassword() {
    const dialogRef = this.dialog.open(RecuperarContraseniaModalComponent, {
      width: '40%',
      height: '30%'
    });
  }

  enterSubmit(event: any) {
    if(event.keyCode == 13) {
      this.login();
    }
  }

  openSnackBar(message: string, action: string, className?: string) {
    this.snackBar.open(message, action, {
        panelClass: className
    });
  };

}
