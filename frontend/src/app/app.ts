import { Component, Input, signal } from '@angular/core';
import { Tarefa } from './tarefa';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('TODOapp');

  arrayDeTarefas: Tarefa[] = [];

  constructor() {
    this.READ_tarefas();
  }

  CREATE_tarefa(descricaoNovaTarefa: HTMLInputElement) {
    var novaTarefa = new Tarefa(descricaoNovaTarefa.value, false);
    
    descricaoNovaTarefa.value = '';
    descricaoNovaTarefa.focus();

    this.arrayDeTarefas.unshift(novaTarefa);
  }

  DELETE_tarefa(tarefaParaRemover: Tarefa) {
    const index = this.arrayDeTarefas.indexOf(tarefaParaRemover);
    if (index !== -1) {
      this.arrayDeTarefas.splice(index, 1);
    }
  }

  READ_tarefas() {
    this.arrayDeTarefas = [
      new Tarefa("Estudar Frameworks WEB", false),
      new Tarefa("Comer Pizza", false),
      new Tarefa("Ajudar meus pais", false)
    ]
  }
}
