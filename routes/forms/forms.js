const express = require('express');
const route = express.Router()
const FormHandler = require('./functions/FormHandler')
const formHandler = new FormHandler()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('config')
const authenticator = require('../../middleware/authenticator')

//client requests a specific form object
route.get('/:formName', (req,res) => {
    const formName = req.params.formName
    const template = formHandler.getTemplateClient(formName)
    if(!template) return res.status(404).send({ error: `${formName} is not an available form` })
    return res.status(200).send({data: template})
});

//a new user is created
route.post('/user', async (req,res) => {
    const newUser = req.body
    const error = await formHandler.verify(newUser,'user')
    if(error) return res.status(400).send({ error: error })
    const salt = await bcrypt.genSalt()
    newUser.password = await bcrypt.hash(newUser.password, salt)
    await formHandler.database.upload('user',newUser)
    res.status(200).send({ data: "new user created" })
});

//login attempt
route.post('/login', async (req,res) => {
    const login = req.body
    const error = await formHandler.verify(login,'login')
    if(error) return res.status(400).send({error: error})
    const _id = await formHandler.database.authenticateLogin(login)
    if(!_id) return res.status(400).send({ error: 'invalid username and password combonation' })
    const token = jwt.sign({ id: _id }, config.get('privateKey'))
    return res.status(200).send({data: token})
});

//client uploads a completed form to the server
route.post('/:formName', authenticator, async (req,res) => {
    const formName = req.params.formName
    if(!formHandler.checkName(formName)) return res.status(404).send({ error: `${formName} is not an available form` })
    const error = await formHandler.verify(req.body,formName)
    if(error) return res.status(400).send({ error: error })
    let result = await formHandler.database.upload(formName, req.body, token)
    res.status(200).send({data: result})
});

//asynchronous verification
route.post('/asyncVerify/:formName', async (req,res) => {
    const formName = req.params.formName
    const {name, value} = req.body
    let result = await formHandler.database.verify(formName,name,value)
    return res.status(200).send({data: result})
});

module.exports = route