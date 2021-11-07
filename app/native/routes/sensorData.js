const { application } = require('express');
const express = require('express')
const app = express.Router();
const Database = require('../classes/Database')
const db = new Database()

app.post('/', async (req, res) => {
  let dataset = req.body
  dataset.start = new Date(dataset.start)
  let result = await db.uploadDataset(dataset)
  if(result.error) return res.status(400).send(result)
  return res.status(200).send({data: result})
})

app.get('/', async (req, res) => {
  let datasets = await db.getDatasets()
  res.status(200).send({data: datasets})
})

app.post('/:setID', async (req, res) => {
  let result = await db.changeName(req.params.setID, req.body.name)
  res.status(200).send({ data: result.title })
})

app.get('/:setID', async (req, res) => {
  let dataset = await db.getDataset(req.params.setID)
  dataset.time = new Array(dataset.temperature.length).fill(0).map((c,i) => i * 4) 
  res.status(200).send({data: dataset})
})


module.exports = app