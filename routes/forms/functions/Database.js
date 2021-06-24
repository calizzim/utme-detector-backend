const config = require('config');
const db = require('mongoose')
module.exports = class {
    constructor(formHandler) {
        this.templates = formHandler.serverTemplates
        
        //create schema from templates
        this.models = {}
        for(let templateName in this.templates) {
            let template = this.templates[templateName]
            let schema = new db.Schema({})
            for(let key in template){
                let temp = {}
                temp[key] = template[key].dType
                schema.add(temp)
            }
            this.models[templateName] = db.model(templateName, schema)
        }

        //connect to the database
        const databaseURL = config.get('databaseURL')
        db.connect(databaseURL, {useUnifiedTopology:true, useNewUrlParser: true})
        .then(()=>console.log('connected to database successfully'))
        .catch(error=>console.log(error));
    }

    async upload(templateName, data) {
        const Model = this.models[templateName]
        const toUpload = new Model(data)
        const result = await toUpload.save()
        return result
    }

    async verify(templateName, name, value) {
        const validators = this.templates[templateName][name].asyncValidators
        if(!validators) return null
        for(let validator of validators) {
            let result = await this.asyncValidatorFunctions[validator](templateName,name,value)
            if(result) return result
        }
        return null
    }

    asyncValidatorFunctions = {
        unique: async (formName, name, value) => {
            let query = {}; query[name] = value
            let result = await this.models[formName].findOne(query)
            if(result) return { unique: 'has already been taken' }
            return null
        }
    }

}