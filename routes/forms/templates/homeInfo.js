const PropertyTaxes = require('../../../api/PropertyTaxes')
const propertyTaxes = new PropertyTaxes()
const ChartFunctions = require('../../../api/ChartFunctions')

module.exports = {
  template: {
    title: 'Housing',
    showTitle: false,
    resetOnSubmit: false,
    groups: [
      {
        title: 'mortgageInformation',
        showTitle: true,
        components: [
          {
            dType: Number,
            type: 'text',
            name: 'desiredHomeValue',
            validators: 'currency',
            hint: 'how expensive of a home do you want?'
          },
          {
            dType: String,
            type: 'text',
            name: 'zipcodeOrCounty',
            validators: 'required',
            hint: 'zipcode or county (for property taxes)',
            asyncValidators: ['zipcodeOrCounty']
          },
          {
            dType: Number,
            type: 'text',
            name: 'mortgageLength',
            validators: 'integer',
            hint: 'length of mortgage (years)',
            advanced: true,
            defaultValue: 30
          },
          {
            dType: Number,
            type: 'text',
            name: 'interestRate',
            validators: 'number',
            hint: 'interest rate paid to bank',
            advanced: true,
            defaultValue: 3.45
          },
          {
            dType: Number,
            type: 'text',
            name: 'homeValueGrowth',
            validators: 'number',
            hint: 'percent growth rate of your home value',
            advanced: true,
            defaultValue: 4
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
            name: 'homeInsurancePercent',
            validators: 'number',
            hint: 'yearly insurance as percent of home value',
            advanced: true,
            defaultValue: 0.42
          },
          {
            dType: Number,
            type: 'text',
            name: 'monthlyHoaFees',
            validators: 'number',
            hint: 'hoa fees per month',
            advanced: true,
            defaultValue: '0'

          },
        ]
      },
    ]
  },
  order: 1,
  computed: [
    {
      name: 'downPayment',
      compute: (native,computed,previous) => native.downPaymentPercent * native.desiredHomeValue / 100
    },
    {
      name: 'principal',
      compute: (native,computed,previous) => native.desiredHomeValue - computed.downPayment
    },
    {
      name: 'numMonths',
      compute: (native,computed,previous) => native.mortgageLength * 12
    },
    {
      name: 'taxRate',
      compute: (native,computed,previous) => {
        let taxRate = propertyTaxes.getTaxrateZipcode(native.zipcodeOrCounty)
        if(taxRate) return taxRate
        return propertyTaxes.getTaxrateCounty(previous.salaryInfo.native.state, native.zipcodeOrCounty)
      }
    },
    {
      name: 'leftOver',
      compute: (native,computed,previous) => {
        return previous.salaryInfo.computed.leftOver
      }
    },
    {
      name: 'principalInterest',
      compute: (native,computed,previous) => {
        let i = native.interestRate/1200
        let N = computed.numMonths
        let P = computed.principal
        let PI = P * (i * Math.pow(1+i,N)) / (Math.pow(1 + i,N) - 1)
        return PI
      }
    },
    {
      name: 'dataOverTime',
      compute: (native,computed,previous) => {
        let currentAge = previous.salaryInfo.native.currentAge
        let retirementAge = previous.salaryInfo.native.retirementAge
        let xvalues = [...Array((retirementAge-currentAge)*12+1).keys()]
        let yvalues = xvalues.slice(1).reduce((a,c,i) => {
          let amountOwed = native.desiredHomeValue * (1-a[i].percentEquity/100)
          let interest = amountOwed * native.interestRate/1200
          let principal = Math.min(computed.principalInterest - interest, amountOwed)
          let percentEquity = a[i].percentEquity + principal/native.desiredHomeValue * 100
          let homeValue = a[i].homeValue * (1 + native.homeValueGrowth/1200)
          let valueInHome = homeValue - (1-percentEquity/100)*native.desiredHomeValue
          let taxes = computed.taxRate/1200 * homeValue
          let insurance = native.homeInsurancePercent/1200 * homeValue
          let hoa = native.monthlyHoaFees
          let obj = {percentEquity, valueInHome, homeValue,
            payments: { principal, interest, taxes, insurance, hoa }}
          obj.payments.total = Object.keys(obj.payments).reduce((a,v)=>a+obj.payments[v],0)
          a.push(obj)
          return a
        },
        [{
          percentEquity: native.downPaymentPercent,
          valueInHome: computed.downPayment,
          homeValue: native.desiredHomeValue
        }])
        let data = ChartFunctions.monthsToYears(xvalues,yvalues)
        data.xvalues = data.xvalues.map(v => v + previous.salaryInfo.native.currentAge)
        return data
      }
    },
    {
      name: 'equityInHomeChart',
      compute: (native,computed,previous) => {
        return { 
          xvalues: computed.dataOverTime.xvalues, 
          yvalues: computed.dataOverTime.yvalues.map(v => v.valueInHome)
        }
      }
    },
    {
      name: 'paymentBreakdownChart',
      compute: (native,computed,previous) => {
        let labels = ['Principal','Interest','Taxes','Insurance','HOA']
        let yvalues = computed.dataOverTime.yvalues.slice(1).map(v => {
          let p = v.payments
          return [p.principal,p.interest,p.taxes,p.insurance,p.hoa]
        })
        return {labels, yvalues}
      }
    },
  ]
}