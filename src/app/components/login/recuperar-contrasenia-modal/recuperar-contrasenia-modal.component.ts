import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoginService } from 'src/app/services/login.service';

@Component({
  selector: 'app-recuperar-contrasenia-modal',
  templateUrl: './recuperar-contrasenia-modal.component.html',
  styleUrls: ['./recuperar-contrasenia-modal.component.scss']
})
export class RecuperarContraseniaModalComponent implements OnInit {

  form: FormGroup = new FormGroup({
    usuario: new FormControl(null, Validators.required)
  })

  constructor(
    public dialogRef: MatDialogRef<RecuperarContraseniaModalComponent>,
    private loginService: LoginService,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
  }

  recuperar() {
    if(this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    };

    this.loginService.recoverPassword(this.form.get('usuario')?.value.toString()).subscribe(d => {
      this.openSnackBar(d.message, "Cerrar", "success-snackbar");
      this.dialogRef.close();
    },
    err => {
      this.openSnackBar(err.error.message, "Cerrar", "error-snackbar");
    })
  }

  openSnackBar(message: string, action: string, className?: string) {
    this.snackBar.open(message, action, {
        panelClass: className
    });
  };

}
