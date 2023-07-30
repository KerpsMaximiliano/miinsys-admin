import { Component, OnInit } from '@angular/core';
import { LoginService } from 'src/app/services/login.service';
import { StylesService } from 'src/app/services/styles.service';
import { ButtonsEventService } from './buttons-event.service';

@Component({
  selector: 'app-main-hub2',
  templateUrl: './main-hub2.component.html',
  styleUrls: ['./main-hub2.component.scss']
})
export class MainHub2Component implements OnInit {

  opened!: boolean;
  username: string = "Default";
  nombreBoton: string = "Botón";
  seccionActual: string = "Clientes";
  titulo: string = "Búsqueda de clientes"

  constructor(
    private loginService: LoginService,
    private stylesService: StylesService,
    private buttonEventService: ButtonsEventService
  ) { }

  ngOnInit(): void {
    this.username = this.loginService.getUser()!;
  }

  closeNav() {
    this.opened = !this.opened
  }

  componentAdded(event: any) {
    this.titulo = event.titulo;
    this.nombreBoton = event.boton;
    this.seccionActual = event.seccion
  }

  buttonAction() {
    this.buttonEventService.events.next(1);
  }

  get colours() {
    return this.stylesService.getStyle()
  }

}
