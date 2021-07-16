const PropertyTaxes = require('../../../api/PropertyTaxes')
const propertyTaxes = new PropertyTaxes()
const ChartFunctions = require('../../../api/ChartFunctions')

module.exports = {
  template: {
    title: 'Transportation',
    showTitle: false,
    resetOnSubmit: false,
    groups: [
      {
        title: 'Car Information',
        showTitle: true,
        components: [
          {
            dType: Number,
            type: 'text',
            name: 'desiredCarValue',
            validators: 'currency',
            hint: 'how expensive of a car do you want?'
          },
          {
            dType: String,
            type: 'text',
            name: 'interestRate',
            validators: 'number',
            hint: 'interest rate for car loan',
            defaultValue: 3.45
          },
          {
            dType: Number,
            type: 'text',
            name: 'monthlyInsurancePremium',
            validators: 'currency',
            defaultValue: 100
          },
          {
            dType: Number,
            type: 'text',
            name: 'downPaymentPercent',
            validators: 'number',
            hint: 'percent of your home value put down',
            advanced: true,
            defaultValue: 20
          },
          {
            dType: Number,
            type: 'text',
            name: 'loanTerm',
            validators: 'integer',
            hint: 'loan term in years',
            advanced: true,
            defaultValue: 6
          },
          {
            dType: Number,
            type: 'text',
            name: 'depreciationPercent',
            validators: 'number',
            hint: 'yearly percentage depreciation',
            advanced: true,
            defaultValue: 20
          },
          {
            dType: Number,
            type: 'text',
            name: 'yearlyMilesDriven',
            validators: 'integer',
            advanced: true,
            defaultValue: 12000
          },
          {
            dType: Number,
            type: 'text',
            name: 'gasPrice',
            validators: 'currency',
            hint: 'price per gallon in dollars',
            advanced: true,
            defaultValue: 2.75
          },
          {
            dType: Number,
            type: 'text',
            name: 'milesPerGallon',
            validators: 'number',
            hint: 'average mpg of your vehicle',
            advanced: true,
            defaultValue: 23
          },
        ]
      },
    ]
  },
  order: 2,
  computed: [
    {
      name: 'downPayment',
      compute: (native,computed,previous) => native.downPaymentPercent * native.desiredCarValue / 100
    },
    {
      name: 'principal',
      compute: (native,computed,previous) => native.desiredCarValue - computed.downPayment
    },
    {
      name: 'numMonths',
      compute: (native,computed,previous) => native.loanTerm * 12
    },
    {
      name: 'gasCost',
      compute: (native,computed,previous) => {
        return native.gasPrice * native.yearlyMilesDriven / native.milesPerGallon / 12
      }
    },
    {
      name: 'principalInterest',
      compute: (native,computed,previous) => {
        return (carValue,startEquityPercent) => {
          let i = native.interestRate/1200
          let N = computed.numMonths
          let P = (1-startEquityPercent/100)*carValue 
          let PI = P * (i * Math.pow(1+i,N)) / (Math.pow(1 + i,N) - 1)
          return PI
        }
      }
    },
    {
      name: 'dataOverTime',
      compute: (native,computed,previous) => {
        let startCarValue = native.desiredCarValue
        let currentAge = previous.salaryInfo.native.currentAge
        let retirementAge = previous.salaryInfo.native.retirementAge
        let xvalues = [...Array((retirementAge-currentAge)*12+1).keys()]
        let principalInterest = computed.principalInterest(startCarValue,native.downPaymentPercent)
        let yvalues = xvalues.slice(1).reduce((a,c,i) => {
          if(a[i].percentEquity == 100) {
            startCarValue = previous.salaryInfo.computed.dataOverTime.yvalues[Math.round(i/12)].leftOver/
            previous.salaryInfo.computed.dataOverTime.yvalues[1].leftOver*native.desiredCarValue
            a[i].percentEquity = a[i].valueInCar/startCarValue * 100
            a[i].carValue = startCarValue
            principalInterest = computed.principalInterest(startCarValue,a[i].percentEquity)
          }
          let amountOwed = startCarValue * (1-a[i].percentEquity/100)
          let interest = amountOwed * native.interestRate/1200
          let principal = Math.min(principalInterest - interest, amountOwed)
          let percentEquity = a[i].percentEquity + principal/startCarValue * 100
          let carValue = a[i].carValue * (1 - native.depreciationPercent/1200)
          let valueInCar = carValue - (1-percentEquity/100)*startCarValue
          let insurance = native.monthlyInsurancePremium
          let gas = computed.gasCost
          let obj = {percentEquity, valueInCar, carValue,
            payments: { principal, interest, insurance, gas }}
          obj.payments.total = Object.keys(obj.payments).reduce((a,v)=>a+obj.payments[v],0)
          a.push(obj)
          return a
        },
        [{
          percentEquity: native.downPaymentPercent,
          valueInCar: computed.downPayment,
          carValue: startCarValue
        }])
        let data = ChartFunctions.monthsToYears(xvalues,yvalues)
        data.xvalues = data.xvalues.map(v => v + previous.salaryInfo.native.currentAge)
        return data
      }
    },
    {
      name: 'equityInCarChart',
      compute: (native,computed,previous) => {
        return { 
          xvalues: computed.dataOverTime.xvalues, 
          yvalues: computed.dataOverTime.yvalues.map(v => v.valueInCar)
        }
      }
    },
    {
      name: 'paymentBreakdownChart',
      compute: (native,computed,previous) => {
        let labels = ['Principal','Interest','Insurance','Gas']
        let yvalues = computed.dataOverTime.yvalues.slice(1).map(v => {
          let p = v.payments
          return [p.principal,p.interest,p.insurance,p.gas]
        })
        return {labels, yvalues}
      }
    },
  ]
}