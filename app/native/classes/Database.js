const config = require('config');
const db = require('mongoose');

module.exports = class {
  constructor() {

    let sensorDataSchema = new db.Schema({
      title: String,
      start: Date,
      co2: [Number],
      temperature: [Number],
      humidity: [Number],
      tvoc: [Number],
      pm10: [Number],
      pm25: [Number],
      pm40: [Number],
      pm100: [Number],
      pmSize: [Number],
    })

    this.sensorDataModel = db.model("Sensor Dataset", sensorDataSchema)

    //connect to the database
    const databaseURL = config.get('databaseURL')
    db.connect(databaseURL, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: true })
      .then(() => console.log('connected to database successfully'))
      .catch(error => console.log(error));
  }

  async uploadDataset(dataset) {
    const newDataset = new this.sensorDataModel(dataset)
    const error = newDataset.validateSync()
    if(error) return { error }
    const result = await newDataset.save()
    return result
  }

  async getDatasets() {
    const datasets = await this.sensorDataModel.find({}, 'title start')
    return datasets
  }

  async getDataset(id) {
    let dataset = (await this.sensorDataModel.findById(id))._doc
    dataset.time = new Array(dataset.temperature.length).fill(0).map((c,i) => i * 2) 
    Object.keys(dataset).filter(v => !['_id','title','__v','id','start','time'].includes(v)).forEach(a => {
      dataset[a].forEach((v,i) => {
        dataset[a][i] = Number.parseFloat(v).toFixed(2)
      })
    })
    return dataset
  }

  async changeName(id, newName) {
    await this.sensorDataModel.findByIdAndUpdate(id, { title: newName })
    return this.sensorDataModel.findById(id)
  }

  async deleteDataset(id) {
    return await this.sensorDataModel.findByIdAndDelete(id)
  }
}