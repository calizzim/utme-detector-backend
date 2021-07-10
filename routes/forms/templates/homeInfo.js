const Home = require('../../api/Home')
const home = new Home()
module.exports = {
  template: {
    title: 'What type of housing can you afford?',
    showTitle: true,
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
            dType: Number,
            type: 'text',
            name: 'property tax rate',
            validators: 'zipcode',
            hint: 'zipcode (for property taxes)'
          },
          {
            dType: Number,
            type: 'text',
            name: 'mortgageLength',
            validators: 'integer',
            hint: 'length of mortgage (years)',
            advanced: true
          },
          {
            dType: Number,
            type: 'text',
            name: 'interestRate',
            validators: 'number',
            hint: 'interest rate paid to bank',
            advanced: true
          },
          {
            dType: Number,
            type: 'text',
            name: 'homeValueGrowth',
            validators: 'number',
            hint: 'percent growth rate of your home value',
            advanced: true
          },
          {
            dType: Number,
            type: 'text',
            name: 'downPaymentPercent',
            validators: 'number',
            hint: 'percent of your home value put down',
            advanced: true
          },
          {
            dType: Number,
            type: 'text',
            name: 'homeInsurancePercent',
            validators: 'number',
            hint: 'insurance as percent of home value',
            advanced: true
          },
          {
            dType: Number,
            type: 'text',
            name: 'MonthlyHoaFees',
            validators: 'number',
            hint: 'hoa fees per month',
            advanced: true
          },
          {
            dType: Number,
            type: 'text',
            name: 'marketInterestRate',
            validators: 'number',
            hint: 'interest you would make in the market',
            advanced: true
          },
        ]
      },
    ]
  },
  computed: [
    {
      name: 'homeValue',
      compute: (native, computed) => {
        return home.getHomeValue(native.monthlyPayment, native.mortgageLength, native.interestRate)
      }
    },
    {
      name: 'homeEquityData',
      compute: (native, computed) => {
        let xvalues = Array(native.mortgageLength * 12).fill(0).map((value, index) => index)
        let yvalues = xvalues.reduce((yvalues, xvalue, index) => {
          let last = index == 0 ? 0 : yvalues[index - 1]
          yvalues.push(
            last + (native.monthlyPayment - ((computed.homeValue - last) * native.interestRate / 1200)))
          return yvalues
        }, [])
        return {
          xvalues: xvalues.filter((val, index) => !index || (index + 1) % 12 == 0).map((val, index) => index != 0 ? (val + 1) / 12 : 0),
          yvalues: yvalues.filter((val, index) => !index || (index + 1) % 12 == 0)
        }
      }
    },
  ]
}
