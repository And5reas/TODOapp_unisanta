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
const userModel = require('../models/user');
var jwt = require('jsonwebtoken');
router.post('/login', async (req, res) => {
    try {
        const data = await userModel.findOne({ 'nome': req.body.nome });

        if (data!=null && validPassword(req.body.senha, data.hash, data.salt)) {
            const token = jwt.sign(
                { id: req.body.user },
                'segredo',
                { expiresIn: 300 }
            );
            return res.json({ token: token });
        }

        res.status(500).json({ message: 'Login invalido!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
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

var { createHash } = require('crypto');
function validPassword (senha, hashBD, saltBD) {
    hashCalculado=createHash('sha256').update(senha+saltBD).digest('hex');
    return hashCalculado === hashBD;
};
