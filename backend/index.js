require('dotenv').config();

const express = require('express');
const app = express();

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Methods', 'HEAD, GET, POST, PATCH, DELETE');
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, id-token"
    );
    next();
});

app.use(express.json());
const PORT = process.env.PORT || 3000;
// Garante que o servidor aceite conexões externas (dentro do container)
const HOST = process.env.HOST || '0.0.0.0';

// Endpoint de saúde usado pelos healthchecks do Docker (não depende do banco)
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const routes = require('./api/routes/routes');
app.use('/api', routes);

app.listen(PORT, HOST, () => {
    console.log(`Server Started at ${PORT}`)
})

// Obtendo os parametros passados pela linha de comando
var mongoURL = process.env.MONGO_URL;

//Configurando a conexao com o Banco de Dados
var mongoose = require('mongoose');
mongoose.connect(mongoURL);
mongoose.Promise = global.Promise;

const db = mongoose.connection;

db.on('error', (error) => {
 console.log(error)
})

db.once('connected', () => {
 console.log('Database Connected');
})