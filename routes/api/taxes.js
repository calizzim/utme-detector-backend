const express = require('express')
const route = express.Router()
const axios = require('axios').default
const config = require('config')
const path = require('path')
const fs = require('fs')

const header = config.get('taxeeHeader')
const taxee = axios.create({
    baseURL: "http://taxee.io/api/v2/",
    headers: { Authorization: header }
})

let vars = {
    taxes: JSON.parse(fs.readFileSync('files/taxes.json')),
    states: JSON.parse(fs.readFileSync('files/states.json'))
}

let calcTaxes = (salary, brackets) => {
    if(!brackets) return 0
    brackets.push({bracket: Infinity})
    return brackets.reduce((tax,bracket,index)=>
    salary>bracket.bracket ?
    tax + (Math.min(salary,brackets[index+1].bracket)-bracket.bracket) * bracket.marginal_rate / 100 : tax, 0)
}

let getAbbrev = (state) => {
    return vars.states.find(e => e.name == state).abbreviation
}

route.get('/update', async (req,res) => {
    const abbs = JSON.parse(fs.readFileSync('files/states.json')).map(state => state.abbreviation)
    const requests = await Promise.all(abbs.map(state => taxee.get('/state/2020/'+state)))
    const stateTaxes = abbs.reduce((a,c,i) => { a[c]=requests[i].data; return a },{})
    const federalTaxes = (await taxee.get('/federal/2020')).data
    const taxes = { state: stateTaxes, federal: federalTaxes }
    fs.writeFileSync('files/taxes.json',JSON.stringify(taxes,null,4))
    vars.taxes = taxes
    res.status(200).send({ data: 'updated successfully' })
})

route.post('/', (req,res) => {
    let { salary, state, filingStatus } = req.body
    state = getAbbrev(state)
    let federalBrackets = vars.taxes.federal[filingStatus].income_tax_brackets
    let stateBrackets = vars.taxes.state[state][filingStatus].income_tax_brackets
    res.status(200).send({data: {
        state: calcTaxes(salary, stateBrackets), 
        federal: calcTaxes(salary, federalBrackets)
    }})
})

module.exports = route