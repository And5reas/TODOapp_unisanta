// Configuração de produção.
// Em produção as chamadas são relativas (same-origin): o Nginx do container
// encaminha /api/* para o Backend através da rede interna do Docker.
// Nenhuma URL de desenvolvimento (localhost) é usada aqui.
export const environment = {
  production: true,
  apiURL: '',
};
