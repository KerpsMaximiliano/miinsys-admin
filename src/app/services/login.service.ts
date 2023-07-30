import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { Estado, Rol } from "../models/abm";
import { LoginForm } from "../models/login";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";


@Injectable({
    providedIn: 'root'
})

export class LoginService {

    constructor(
        private http: HttpClient,
        private router: Router,
        private dialogRef: MatDialog,
        private snackBar: MatSnackBar
    ) {}

    login(loginForm: LoginForm): Observable<any> {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        });
        return this.http.post<any>(`${environment.base_url}Authenticate/login`, loginForm)
        
    }

    getEstadoRol() {
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        });
        this.http.get<any>(`${environment.base_url}Estado`, {headers: headers}).subscribe(d => {
            localStorage.setItem('estados', JSON.stringify(d as Array<Estado>))
        });
        this.http.get<Array<Rol>>(`${environment.base_url}Rol`, {headers: headers}).subscribe(d => {
            localStorage.setItem('roles', JSON.stringify(d as Array<Rol>))
        });
    }

    rememberUser(loginForm: LoginForm) {
        localStorage.setItem('usuarioGuardado', JSON.stringify(loginForm))
    }

    getRememberedUser() {
        return localStorage.getItem('usuarioGuardado')
    }

    removeRememberedUser() {
        localStorage.removeItem('usuarioGuardado')
    }

    recoverPassword(username: string): Observable<any> {
        return this.http.post<any>(`${environment.base_url}Account/forgotPassword`, { username: username });
    }

    getExtraInfo(): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        });
        return this.http.get<any>(`${environment.base_url}Authenticate/GetUserExtraInfo`, {headers: headers});
    }

    setToken(data: any) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('expiration', data.expiration);
    }

    setUser(user: string) {
        localStorage.setItem('username', user)
    }

    getUser() {
        return localStorage.getItem('username')
    }

    getEstados() {
        return localStorage.getItem('estados')
    }

    logout() {
        localStorage.removeItem('estados');
        localStorage.removeItem('username');
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        this.router.navigate(['/']);
        this.dialogRef.closeAll();
        this.snackBar.dismiss();
    }

    setRol(rol: number) {
        localStorage.setItem('rol', rol.toString())
    }

    getRol() {
        return localStorage.getItem('rol')
    }

    setEmpresa(empresa: any) {
        localStorage.setItem('empresa', empresa.toString())
    }

    getEmpresa() {
        return localStorage.getItem('empresa')
    }

    getUserData(rut: number): Observable<any> {
        return this.http.get<any>(`${environment.base_url}Authenticate?rut=${rut}`);
    }

}