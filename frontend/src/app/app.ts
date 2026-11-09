import { Component, Input, signal } from '@angular/core';
import { Tarefa } from './tarefa';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('TODOapp');

  arrayDeTarefas = signal<Tarefa[]>([]);
  apiURL: string;
  usuarioLogado = signal(false);
  tokenJWT = '{ "token":""}';

  constructor(private http: HttpClient) {
    // Produção: '' (requisições relativas, proxy do Nginx).
    // Desenvolvimento: http://localhost:3000 (via environment.development.ts).
    this.apiURL = environment.apiURL;
    this.READ_tarefas();
  }

  CREATE_tarefa(descricaoNovaTarefa: string) {
    var novaTarefa = new Tarefa(descricaoNovaTarefa, false);
    this.http.post<Tarefa>(`${this.apiURL}/api/post`, novaTarefa).subscribe(
    resultado => { console.log(resultado); this.READ_tarefas(); });
  }

  DELETE_tarefa(tarefaAserRemovida: Tarefa) {
    var indice = this.arrayDeTarefas().indexOf(tarefaAserRemovida);
    var id = this.arrayDeTarefas()[indice]._id;
    this.http.delete<Tarefa>(`${this.apiURL}/api/delete/${id}`).subscribe(
    resultado => { console.log(resultado); this.READ_tarefas(); });
  }

  READ_tarefas() {
    const idToken = new HttpHeaders().set("id-token", JSON.parse(this.tokenJWT).token);
    this.http.get<Tarefa[]>(`${this.apiURL}/api/getAll`, { 'headers': idToken }).subscribe(
      (resultado) => { this.arrayDeTarefas.set(resultado); this.usuarioLogado.set(true) },
      (error) => { this.usuarioLogado.set(false) }
    )
  }

  UPDATE_tarefa(tarefaAserModificada: Tarefa) {
    const id = tarefaAserModificada._id;
    if (!id) {
      console.error('Não foi possível atualizar a tarefa: identificador ausente.');
      return;
    }

    this.http.patch<Tarefa>(`${this.apiURL}/api/update/${id}`, tarefaAserModificada).subscribe({
      next: () => this.READ_tarefas(),
      error: error => {
        console.error('Falha ao atualizar a tarefa:', error);
        this.READ_tarefas();
      }
    });
  }

  login(username: string, password: string) {
  var credenciais = { "nome": username, "senha": password }
    this.http.post(`${this.apiURL}/api/login`, credenciais).subscribe(resultado => {
    this.tokenJWT = JSON.stringify(resultado);
    this.READ_tarefas();
    });
  }
}
