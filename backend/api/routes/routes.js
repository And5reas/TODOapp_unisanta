const express = require('express');

const router = express.Router()

module.exports = router;

const modeloTarefa = require('../models/tarefa');

router.post('/post', async (req, res) => {
    const objetoTarefa = new modeloTarefa({
        descricao: req.body.descricao,
        statusRealizada: req.body.statusRealizada
    })
    try {
        const tarefaSalva = await objetoTarefa.save();
        res.status(200).json(tarefaSalva)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.get('/getAll', verificaJWT, async (req, res) => {
    try{
        const taferas = await modeloTarefa.find({});
        res.status(200).json(taferas)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

//Autorizacao
// function verificaUsuarioSenha(req, res, next) {
//     if (req.body.nome !== 'branqs' || req.body.senha !== '1234') {
//         return res.status(401).json({ auth: false, message: 'Usuario ou Senha incorreta' });
//     }
//     next();
// }

//Autenticacao
var jwt = require('jsonwebtoken');
router.post('/login', (req, res, next) => {
    if (req.body.nome === 'branqs' && req.body.senha === '1234') {
        const token = jwt.sign({ id: req.body.nome }, 'segredo', { expiresIn: 300 });
        return res.json({ auth: true, token: token });
    }
    res.status(500).json({ message: 'Login invalido!' });
})

//Nova forma de Autorizacao
function verificaJWT(req, res, next) {
    const token = req.headers['id-token'];
    if (!token) return res.status(401).json({
        auth: false, message: 'Token nao fornecido'
    });
    jwt.verify(token,'segredo', function (err, decoded) {
    if (err) return res.status(500).json({ auth: false, message: 'Falha !' });
        next();
    });
}

router.patch('/update/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const tarefaAtualizada = await modeloTarefa.findByIdAndUpdate(
            id,
            req.body,
            { new: true, runValidators: true }
        )

        if (!tarefaAtualizada) {
            return res.status(404).json({ message: "Item não encontrado" });
        }

        return res.status(200).json(tarefaAtualizada);
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const tarefaDeletada = await modeloTarefa.findByIdAndDelete(id)

        if (!tarefaDeletada) {
            return res.status(404).json({ message: "Item não encontrado" });
        }

        return res.status(200).json(tarefaDeletada);
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})
