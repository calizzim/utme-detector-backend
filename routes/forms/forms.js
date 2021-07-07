const express = require('express');
const route = express.Router()
const FormHandler = require('./helperClasses/FormHandler')
const formHandler = new FormHandler()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const config = require('config')
const authenticator = require('../../middleware/authenticator')
const decode = require('../../middleware/decode')

//client requests a specific form object
route.get('/:templateName', (req,res) => {
    const templateName = req.params.templateName
    if(templateName == 'user') return res.status(400).send({ data: 'user data cannot be requested' })
    const template = formHandler.getTemplateClient(templateName)
    if(!template) return res.status(404).send({ error: `${templateName} is not an available form` })
    return res.status(200).send({data: template})
});

//client requests a specific form object and form data
route.get('/formdata/:templateName', authenticator, async (req,res) => {
    const templateName = req.params.templateName
    const formData = await formHandler.database.getFormData(templateName,req.token)
    if(!formData) return res.status(404).send({ error: "data under provided form name and id was not found" })
    return res.status(200).send({data: formData})
})

//a new user is created
route.post('/user', async (req,res) => {
    const newUser = req.body
    const error = await formHandler.verify(newUser,'user')
    if(error) return res.status(400).send({ error: error })
    const salt = await bcrypt.genSalt()
    newUser.password = await bcrypt.hash(newUser.password, salt)
    await formHandler.database.newUser(newUser)
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
    formHandler.database.upload(formName, req.body, req.token)
    let computed = await formHandler.computeData(formName,req.body)
    res.status(200).send({data: computed})
});

//asynchronous verification
route.post('/asyncVerify/:formName', async (req,res) => {
    const formName = req.params.formName
    const {name, value} = req.body
    let result = await formHandler.database.verify(formName,name,value)
    return res.status(200).send({data: result})
});

module.exports = route