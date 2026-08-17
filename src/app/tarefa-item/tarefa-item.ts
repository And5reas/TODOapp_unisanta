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
}
