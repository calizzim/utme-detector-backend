//server
const express = require('express');
const app = express.Router();

//routes
const forms = require('../../reusable-backend/routes/forms')
const auth = require('../../reusable-backend/routes/auth')

//middleware
app.use(express.json())
app.use('/forms', forms)
app.use('/auth', auth)

//have all other endpoints return a 404 error
app.all('*', (req,res) => {
    res.status(404).send({error: 'invalid endpoint'})
})

module.exports = app