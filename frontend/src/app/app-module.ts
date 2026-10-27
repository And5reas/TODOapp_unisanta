import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { App } from './app';
import { TarefaItem } from './tarefa-item/tarefa-item';

@NgModule({
  declarations: [App, TarefaItem],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [provideBrowserGlobalErrorListeners()],
  bootstrap: [App],
})
export class AppModule {}
