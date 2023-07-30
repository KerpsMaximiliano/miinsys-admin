import { Injectable } from "@angular/core";


@Injectable({
    providedIn: 'root'
})

export class StylesService {

    private paleta = {
        azulPrincipal: "#0B057A",
        violetaPrincipal: "#A170EF",
        cremaSecundario: "#F9DBBD",
        naranjaSecundario: "#F2B111",
        grisSecundario: "#A4A5A4"
    };

    // private backgroundColor: string = "#A3E1DC";
    private backgroundColor: string = this.paleta.azulPrincipal;
    // private backgroundColorDark: string = "#B5EaD6";
    private backgroundColorDark: string = this.paleta.azulPrincipal;
    // private secondaryBackgroundColor: string = "#EDBD3E";
    private secondaryBackgroundColor: string = "#EDBD3E";
    // private mainButtonColor: string = "#3F51B5";
    private mainButtonColor: string = this.paleta.violetaPrincipal;
    // private warnButtonColor: string = "#F44336";
    private warnButtonColor: string = this.paleta.naranjaSecundario;

    private disabledColor: string = this.paleta.grisSecundario;

    constructor() {}

    setStyle() {

    }
    
    getStyle() {
        return {
            backgroundColor: this.backgroundColor,
            backgroundColorDark: this.backgroundColorDark,
            secondaryBackgroundColor: this.secondaryBackgroundColor,
            mainButtonColor: this.mainButtonColor,
            warnButtonColor: this.warnButtonColor,
            disabledColor: this.disabledColor
        }
    }

}