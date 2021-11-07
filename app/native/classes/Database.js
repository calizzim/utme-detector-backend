const config = require('config');
const db = require('mongoose');

module.exports = class {
  constructor() {

    let sensorDataSchema = new db.Schema({
      title: String,
      start: Date,
      temperature: [Number],
      humidity: [Number],
      voc: [Number],
      pm: [Number],
      co2: [Number],
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
    const dataset = await this.sensorDataModel.findById(id)
    return dataset._doc
  }

  async changeName(id, newName) {
    await this.sensorDataModel.findByIdAndUpdate(id, { title: newName })
    return this.sensorDataModel.findById(id)
  }
}