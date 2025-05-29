const express = require('express')
const {conectar} = require('./bd.js')
const bcryptjs = require('bcryptjs')
const jsonwebtoken = require('jsonwebtoken')
const {validarCookie} = require('./middlewares.js')
const cookie_parser = require('cookie-parser')
require("dot-env").config()


let db = null

const server = express()

server.use(express.json())

server.get('/usuarios', async(req, res)=>{
    const sql = `SELECT * FROM usuarios`
    const dados = await db.all(sql)
    console.log(dados)
    res.status(200).send(dados)
})
server.get('usuarios/:id', async (req, res)=>{
    const id = req.params.id
    const sql = `SELECT * FROM usuarios WHERE id = ?`
    const dados = await db.get(sql, [id])
    if(!dados){
        res.status(404).json({msg:'Not Found'})
        return
    }
    res.status(200).send(dados)
})
server.post('/usuarios', validarCookie, validarCookie, async (req, res) => {
    try {
      const { nome, cpf, email, senha } = req.body
      // verificar se cpf ou email ja existem no banco
      const sql = `SELECT nome FROM usuarios WHERE cpf = ? OR email = ?`
      const valores = [cpf, email]
      const resultado = await db.get(sql, valores)

      if (resultado) {
        res.status(400).json({ msg: 'CPF ou Email já cadastrado' })
        return
      }

      // verificar se a senha atende certos requisitos (exemplo, pode implementar)
      // criptografar a senha do usuario
      const senha_criptografada = bcryptjs.hashSync(senha, 10)
      // criar um novo usuario no banco
      const sql2 = `INSERT INTO usuarios (nome, cpf, email, senha) VALUES (?, ?, ?, ?)`
      const valores2 = [nome, cpf, email, senha_criptografada]
      await db.run(sql2, valores2)
      // retornar uma resposta para o cliente
      res.status(201).json({ msg: 'Usuário criado com sucesso' })
    } catch (err) {
      res.status(500).json({ msg: 'Erro ao criar usuário', error: err.message })
    }
  })
server.post('/login', validarCookie, async(req, res)=>{
    try{
        const {email, senha} = req.body
        const sql = `SELECT * FROM usuarios WHERE email = ?`
        const valores = [email]
        const resultado = await db.get(sql, valores)
        if(!resultado){
            res.status(404).json({msg:'Usuário não encontrado'})
            return
        }
        //compara com a senha armazenada no banco
        const senha_valida = bcryptjs.compareSync(senha, resultado.senha)
        if(!senha_valida){
            res.status(401).json({msg:'Senha inválida'})
            return
        }
    }catch (err){
        res.status(500).json({msg:'Erro ao fazer login'})
        return
    }
})
server.listen(8000, validarCookie, async(err)=>{
    console.log('Servidor rodando na porta 8000')
    db = conectar()
})
