import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Tarefa } from '../tarefa'; 

@Component({
  selector: 'app-tarefa-item',
  standalone: false,
  templateUrl: './tarefa-item.html',
  styleUrl: './tarefa-item.css',
})
export class TarefaItem {
  emEdicao = false;
  @Input() tarefa: Tarefa = new Tarefa("", false);
  @Output() removerTarefa = new EventEmitter<Tarefa>();
  @Output() modificaTarefa = new EventEmitter<Tarefa>();

  salvarEdicao(descricao: string) {
    const descricaoAtualizada = descricao.trim();
    if (!descricaoAtualizada) {
      return;
    }

    this.tarefa.descricao = descricaoAtualizada;
    this.emEdicao = false;
    this.modificaTarefa.emit(this.tarefa);
  }
}
