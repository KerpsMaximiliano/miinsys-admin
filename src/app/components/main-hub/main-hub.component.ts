import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { FilesService } from 'src/app/services/files.service';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { AbmUsuarioService } from './abm-usuario/abm-usuario.service';
import { ButtonsEventService } from './buttons-event.service';

@Component({
  selector: 'app-main-hub',
  templateUrl: './main-hub.component.html',
  styleUrls: ['./main-hub.component.scss'],
})
export class MainHubComponent implements OnInit {

  opened: boolean = true;
  username: string = "Default";
  nombreBoton: string = "Botón";
  seccionActual: string = "Clientes";
  titulo: string = "Búsqueda de clientes";

  botonExtra: boolean = false;

  showNotifications: boolean = false;
  notificaciones: Array<string> = ["Notificación 1", "Notificación 2", "Notificación 3", "Notificación 4"];
  showBackButton: boolean = false;
  imgSrc: any = "";

  isExpanded: boolean = true;

  openedExpansion: Array<boolean> = [false, false];

  rolUsuario: number = 0;

  constructor(
    private loginService: LoginService,
    private stylesService: StylesService,
    private buttonEventService: ButtonsEventService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    public abmUsuarioService: AbmUsuarioService,
    private fileService: FilesService,
    private sanitizer: DomSanitizer,
    private ref: ChangeDetectorRef
  ) { }

  hasChild = (_: number, node: any) => node.expandable;


  ngOnInit(): void {
    this.rolUsuario = Number(this.loginService.getRol());
    this.username = this.loginService.getUser()!;
    this.abmUsuarioService.getUserByRut(Number(this.username)).subscribe(d => {
      if(d.id_imagen) {
        this.fileService.traerArchivo(d.id_imagen, 2).subscribe(d => {
          let blob = this.fileService.b64toBlob(d.file, this.fileService.getFileType(d.fileName));
          this.imgSrc = this.sanitizer.bypassSecurityTrustUrl(URL.createObjectURL(blob));
        })
      }
    });
  }

  closeNav() {
    this.opened = !this.opened;
    this.openedExpansion = [false, false];
    this.ref.detectChanges();
  }

  transitionEnd(event: any) {
    this.ref.detectChanges();
  }


  componentAdded(event: any) {
    this.titulo = event.titulo;
    this.nombreBoton = event.boton;
    if(event.botonExtra) {
      this.botonExtra = event.botonExtra;
    } else {
      this.botonExtra = false;
    }
    this.seccionActual = event.seccion;
    if(event.titulo == "Añadir nueva empresa" || event.titulo == "Editar empresa" || event.titulo == "Añadir nuevo usuario" || event.titulo == "Editar usuario" || event.titulo == "Nuevo cuestionario" || event.titulo == "Editar cuestionario" || event.titulo == "Respuesta" || event.titulo == "Crear actividad" || event.titulo == "Editar actividad" || event.titulo == "Crear acción nueva" || event.titulo == "Editar acción" || event.titulo == "Editar usuario" || event.titulo == "Nueva lista de datos" || event.titulo == "Editar lista de datos") {
      this.showBackButton = true;
    } else {
      this.showBackButton = false;
    }
  }

  buttonAction() {
    this.buttonEventService.events.next(1);
  }

  backButton() {
    this.router.navigate(['/dashboard/' + this.router.url.split('/')[2]]);
  }

  logout() {
    this.loginService.logout();
  }

  get colours() {
    return this.stylesService.getStyle()
  }

}
