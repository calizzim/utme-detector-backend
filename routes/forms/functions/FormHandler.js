const fs = require('fs')
const path = require('path')
const typesToValidators = require('./typeToValidators')
const options = require('./options')
const _ = require('lodash')
const Database = require('./Database')

module.exports = class {
    clientTemplates = {}
    serverTemplates = {}
    database

    constructor() {
        this.templateNames = fs
        .readdirSync(path.join(__dirname,'../templates'))
        .map(ele => ele.split('.')[0])
        
        for(let templateName of this.templateNames) {
            let template = require(path.join('../templates',templateName))
            this.clientTemplates[templateName] = this.convertTemplate(template,true)
            this.serverTemplates[templateName] = this.removeGroups(this.convertTemplate(template,false))
        }

        this.database = new Database(this)
    }

    checkName(templateName) {
        return this.templateNames.includes(templateName)
    }

    getTemplateClient(formName) {
        if(!this.checkName(formName)) return null
        return this.clientTemplates[formName]
    }

    getTemplateServer(formName) {
        if(!this.checkName(formName)) return null
        return this.serverTemplates[formName]
    }

    async verify(data, templateName) {
        const template = this.serverTemplates[templateName]
        for(let key in template) if(!(key in data)) return 'data is missing some keys in the template'
        if(Object.keys(template).length != Object.keys(data).length) return 'data has additional keys not in the template'
        for(let key in template) {
            for(let validator of template[key].validators) 
            { if(!validator.expression.test(data[key])) return `field ${key} ${validator.message}` }
            if(template[key].type == 'dropdown' && !(template[key].options.includes(data[key]))) 
            { return `field ${key} must be one of the following options ${template[key].options}` }
            let result = await this.database.verify(templateName,key,data[key])
            if(result) {
                result = result[Object.keys(result)[0]]
                return `${key} ${result}`
            }
        }
        return ''
    }
    
    convertTemplate(template,isClient) {
        template = _.cloneDeep(template)
        template.groups.forEach(group => {
            group.components.forEach(component => {
                component.validators = typesToValidators(component.validators, isClient)
                if(typeof(component.options) == 'string') component.options = options(component.options)
            });
        });
        return template
    }

    removeGroups(template) {
        let newTemplate = {}
        template.groups.forEach(group => {
            group.components.forEach(component => {
                newTemplate[component.name] = _.cloneDeep(component)
            });
        });
        return newTemplate
    }
}

