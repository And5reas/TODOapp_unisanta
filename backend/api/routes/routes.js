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

router.get('/getAll', async (req, res) => {
    try{
        const taferas = await modeloTarefa.find({});
        res.status(200).json(taferas)
    }
    catch (error) {
        res.status(400).json({ message: error.message })
    }
})

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
   
