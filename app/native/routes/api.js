//server
const express = require('express');
const app = express.Router();

//routes
const sensorData = require('./sensorData')

//middleware
app.use(express.json())
app.use('/sensorData', sensorData)

//have all other endpoints return a 404 error
app.all('*', (req,res) => {
    res.status(404).send({error: 'invalid endpoint'})
})

module.exports = app