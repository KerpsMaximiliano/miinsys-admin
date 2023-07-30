import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Estado } from 'src/app/models/abm';
import { StylesService } from 'src/app/services/styles.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class AbmEmpresaModalComponent implements OnInit {

  estados = [] as Array<Estado>;

  editForm: FormGroup = new FormGroup({
    descripcion: new FormControl(null, Validators.required),
    estado: new FormControl(null, Validators.required)
  })

  constructor(
    public dialogRef: MatDialogRef<AbmEmpresaModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private stylesService: StylesService
  ) { }

  ngOnInit(): void {
    this.estados = JSON.parse(localStorage.getItem('estados')!);
    this.editForm.setValue({
      descripcion: this.data.data.descripcion,
      estado: this.data.data.estado
    })
  }

  accept() {
    if(this.editForm.invalid) {
      this.editForm.markAllAsTouched()
      return;
    }

    this.dialogRef.close({
      descripcion: this.editForm.get('descripcion')?.value,
      estado: this.editForm.get('estado')?.value
    });
  }

  cancel() {
    this.dialogRef.close(false)
  }

  get colours() {
    return this.stylesService.getStyle();
  }

}
