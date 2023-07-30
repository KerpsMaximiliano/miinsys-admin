import { EventEmitter, Injectable } from "@angular/core";

@Injectable({
    providedIn: 'root'
})

export class ButtonsEventService {
    events = new EventEmitter<any>();
}