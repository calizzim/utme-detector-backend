const { application } = require('express');
const express = require('express')
const app = express.Router();
const Database = require('../classes/Database')
const db = new Database()
const fs = require('fs')

//dataset structure
//CO2 array
//T array
//RH array
//TVOC array
//PM1.0
//PM2.5
//PM4.0
//PM10.0
//PMSize
//title
//start

app.post('/', async (req, res) => {
  let dataset = req.body
  dataset.start = new Date(dataset.start)
  let result = await db.uploadDataset(dataset)
  console.log(result)
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
  res.status(200).send({data: dataset})
})

app.get('/download/:setID', async (req,res) => {
  let dataset = await db.getDataset(req.params.setID)
  let csvString = ['_id','title','start','time','temperature','humidity','tvoc','pm10','pm25','pm40','pm100','pmSize','co2'].reduce((str,key) => {
    return `${str}${key},${dataset[key]}\n`
  },'')
  fs.writeFileSync('app/native/files/data.csv',csvString)
  res.status(200).download('app/native/files/data.csv')
})


module.exports = app