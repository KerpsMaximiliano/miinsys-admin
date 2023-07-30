import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { FilesService } from 'src/app/services/files.service';
import { AbmListaDatosService } from '../../abm-grilla-datos/abm-lista-datos.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class RespuestasCuestionariosModalComponent implements OnInit {

  imgSrc: any = "";
  type: string = "";
  show: boolean = false;
  justificacion: string = "";
  lista = [] as Array<any>;
  listaForm: FormGroup = new FormGroup({});

  constructor(
    private fileService: FilesService,
    private sanitizer: DomSanitizer,
    public dialogRef: MatDialogRef<RespuestasCuestionariosModalComponent>,
    private listaDatosService: AbmListaDatosService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    console.log(this.data);
    if(this.data.type == 'img') {
      this.fileService.traerArchivo(this.data.id, 1).subscribe(d => {
        console.log(d);
        let blob = this.fileService.b64toBlob(d.file, this.fileService.getFileType(d.fileName));
        this.imgSrc = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
        console.log(this.imgSrc)
        console.log(this.fileService.getFileType(d.fileName))
        if(this.fileService.getFileType(d.fileName) == 'image/jpeg') {
          this.type = 'image';
        } else {
          this.type = 'video';
        };
        this.show = true;
      })
    } else if (this.data.type == 'text'){
      this.type = 'text';
      this.fileService.traerArchivo(this.data.id, 1).subscribe(d => {
        console.log(d);
        this.justificacion = d.justificacion_imagen;
        this.show = true;
      })
    } else if(this.data.type == 'list') {
      this.type = 'list';
      this.listaDatosService.getRespuestaLista(this.data.respuestaCuestionarioId, this.data.preguntaId).subscribe(d => {
        console.log(d);
        d.forEach((dato: { campo: string; valor: any; }) => {
          this.listaForm.addControl(dato.campo, new FormControl(dato.valor));
        });
        this.listaForm.disable();
        this.lista = d;
        this.show = true;
      })
    }
  }

}
