const Taxes = require('../../../api/Taxes')
const taxHelper = new Taxes()
const ChartFunctions = require('../../../api/ChartFunctions')
const _ = require('lodash')

module.exports = {
    template: {
        title: 'Other',
        showTitle: false,
        resetOnSubmit: false,
        groups: [
            {
                title: 'groceries',
                showTitle: true,
                components: [
                    {
                        dType: Number,
                        type: 'text',
                        name: 'averageGroceryTripCost',
                        validators: 'currency',
                        hint: 'how much do you spend on average at the grocery store?'
                    },
                    {
                        dType: Number,
                        type: 'text',
                        name: 'groceryTimesPerMonth',
                        validators: 'integer',
                        hint: 'how many times per month do you go shopping?'
                    },
                ],
            },
            {
                title: 'eatingOut',
                showTitle: true,
                components: [
                    {
                        dType: Number,
                        type: 'text',
                        name: 'averageEatOutCost',
                        validators: 'currency',
                        hint: 'how much do you spend when you eat out?'
                    },
                    {
                        dType: Number,
                        type: 'text',
                        name: 'eatOutTimesPerMonth',
                        validators: 'integer',
                        hint: 'how many times per month do you eat out?'
                    },
                ],
            },
            {
                title: 'health',
                showTitle: true,
                components: [
                    {
                        dType: Number,
                        type: 'text',
                        name: 'gymMembershipCost',
                        validators: 'currency',
                        hint: 'do you have a monthly gym membership?'
                    },
                    {
                        dType: Number,
                        type: 'text',
                        name: 'healthInsurance',
                        validators: 'integer',
                        hint: 'what are your monthly health insurance premiums?'
                    },
                ],
            },
            {
                title: 'utilities',
                showTitle: true,
                components: [
                    {
                        dType: Number,
                        type: 'text',
                        name: 'internet',
                        validators: 'currency',
                        hint: 'monthly internet cost'
                    },
                    {
                        dType: Number,
                        type: 'text',
                        name: 'cellPhone',
                        validators: 'currency',
                        hint: 'how much do you pay for cell service?'
                    },
                    {
                        dType: Number,
                        type: 'text',
                        name: 'electricity',
                        validators: 'currency',
                        hint: 'whats your average monthly electricity bill?'
                    },
                    {
                        dType: Number,
                        type: 'text',
                        name: 'water',
                        validators: 'currency',
                        hint: 'whats your average monthly water bill?'
                    },
                    {
                        dType: Number,
                        type: 'text',
                        name: 'television',
                        validators: 'currency',
                        hint: 'netflix? hulu? cable? put monthly total here'
                    },
                ],
            },
        ]
    },
    order: 3,
    computed: [
        { name: 'groceries',
        compute: (native,computed,previous) => {
          return native.averageGroceryTripCost * native.groceryTimesPerMonth
        }},
        { name: 'eatingOut',
        compute: (native,computed,previous) => {
          return native.averageEatOutCost * native.eatOutTimesPerMonth
        }},
        { name: 'foodTotal',
        compute: (native,computed,previous) => {
          return computed.groceries + computed.eatingOut
        }},
        { name: 'utilitiesTotal',
        compute: (native,computed,previous) => {
          return native.internet + native.cellPhone + native.electricity + native.water + native.television
        }},
        { name: 'healthTotal',
        compute: (native,computed,previous) => {
          return native.gymMembershipCost + native.healthInsurance
        }},
        {
          name: 'dataOverTime',
          compute: (native,computed,previous) => {
            let currentAge = previous.salaryInfo.native.currentAge
            let retirementAge = previous.salaryInfo.native.retirementAge
            let xvalues = [...Array((retirementAge-currentAge)*12+1).keys()]
            let yvalues = xvalues.slice(1).reduce((a,c,i) => {
              let multiplier = previous.salaryInfo.computed.dataOverTime.yvalues[Math.round(i/12) || 1].leftOver/
                previous.salaryInfo.computed.dataOverTime.yvalues[1].leftOver
              a.push({ 
                food: computed.foodTotal * multiplier,
                utilities: computed.utilitiesTotal * multiplier,
                health: computed.healthTotal * multiplier
              })
              return a
            },
            [{}])
            let data = ChartFunctions.monthsToYears(xvalues,yvalues)
            data.xvalues = data.xvalues.map(v => v + previous.salaryInfo.native.currentAge)
            return data
          }
        },
    ]
}
