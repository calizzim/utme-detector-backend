const ChartFunctions = require('../../../api/ChartFunctions')
const _ = require('lodash')

module.exports = {
    order: 4,
    computed: [
        { name: 'test',
        compute: (native,computed,previous) => {
          return 'hello'
        }},
        {
          name: 'dataOverTime',
          compute: (native,computed,previous) => {
            let savingsData = previous.salaryInfo.computed.dataOverTime
            let housingData = previous.homeInfo.computed.dataOverTime
            let transportationData = previous.carInfo.computed.dataOverTime
            let otherData = previous.otherInfo.computed.dataOverTime

            let xvalues = savingsData.xvalues.slice(1)
            let yvalues = xvalues.map((c,i) => {
              obj = {
                savings: savingsData.yvalues[i+1].savings.total/12,
                housing: housingData.yvalues[i+1].payments.total,
                transportation: transportationData.yvalues[i+1].payments.total,
                food: otherData.yvalues[i+1].food,
                health: otherData.yvalues[i+1].health,
                utilities: otherData.yvalues[i+1].utilities,
              }
              obj.fun = savingsData.yvalues[i+1].pretaxSalary/12
                - Object.keys(obj).reduce((a,v)=>a+obj[v],0) 
                - savingsData.yvalues[i+1].taxes.total/12
              return obj
            })
            xvalues = savingsData.xvalues
            yvalues.unshift({})
            return { xvalues, yvalues }
          }
        },
        {
          name: 'budgetChart',
          compute: (native,computed,previous) => {
            let labels = ['savings','housing','transportation','food','health','utilities','fun!']
            let yvalues = computed.dataOverTime.yvalues.slice(1).map(v => Object.values(v))
            return {labels, yvalues}
          }
        },
    ]
}
