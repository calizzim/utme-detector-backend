const Taxes = require('../../api/Taxes')
const taxHelper = new Taxes()
module.exports = {
    template: {
        title: 'Lets see what we have to work with...',
        showTitle: true,
        resetOnSubmit: false,
        groups: [
            {
                title: 'salaryInfo',
                showTitle: true,
                components: [
                    {
                        dType: Number,
                        type: 'text',
                        name: 'pretaxSalary',
                        validators: 'currency',
                        hint: 'salary in dollars (include 401k matching)'
                    },
                    {
                        dType: String,
                        type: 'radio',
                        name: 'salaryType',
                        validators: 'radio',
                        options: ['monthly','yearly']
                    },
                    {
                        dType: Number,
                        type: 'text',
                        name: 'salaryGrowthPercentage',
                        validators: 'integer',
                        hint: 'how much do you expect your salary to grow every year?',
                        advanced: true
                    },
                ],
            },
            {
                title: 'taxInfo',
                showTitle: true,
                components: [
                    {
                        dType: String,
                        type: 'dropdown',
                        name: 'state',
                        validators: 'dropdown',
                        options: 'states'
                    },
                    {
                        dType: String,
                        type: 'radio',
                        name: 'filingStatus',
                        validators: 'radio',
                        options: ['single','married']
                    },
                ]
            },
            {
                title: 'savingsInfo',
                showTitle: true,
                components: [
                    {
                        dType: Number,
                        type: 'text',
                        name: 'savingPercentage',
                        validators: 'integer',
                        hint: 'what percentage of your income do you want to save?'
                    },
                    {
                        dType: Number,
                        type: 'text',
                        name: 'currentAge',
                        validators: 'integer',
                        hint: 'how old are you now?'
                    },
                    {
                        dType: Number,
                        type: 'text',
                        name: 'retirementAge',
                        validators: 'integer',
                        hint: 'whats your ideal retirement age?'
                    },
                    {
                        dType: Number,
                        type: 'text',
                        name: 'investmentReturns',
                        validators: 'integer',
                        hint: 'yearly returns on investments',
                        advanced: true
                    },
                ]
            }
        ]
    },
    computed: [
        {
            name: 'pretaxSalary',
            compute: (native, computed) => {
                return native.salaryType == 'monthly' ?
                native.pretaxSalary * 12: native.pretaxSalary
            }
        },
        {
            name: 'taxes',
            compute: (native, computed) => {
                let taxes = taxHelper.getTaxes(native, computed)
                taxes['total'] = Object.values(taxes)
                .reduce((acc,ele)=>acc+ele,0)
                return taxes
            }
        },
        {
            name: 'posttaxSalary',
            compute: (native, computed) => {
                return computed.pretaxSalary - computed.taxes.total
            }
        },
        {
            name: 'savings',
            compute: (native, computed) => {
                let savings = { total: computed.pretaxSalary * native.savingPercentage / 100 }
                savings.contribution = Math.min(savings.total, 19500)
                savings.additional = savings.total - savings.contribution
                return savings
            }
        },
        {
            name: 'savingsChartData',
            compute: (native, computed) => {
                let xvalues = Array(native.retirementAge-native.currentAge+1)
                .fill(native.currentAge).map((current,index) => current+index)
                let yvalues = xvalues.reduce((yvalues,current,index) => {
                    if(index == 0) { yvalues.push(0); return yvalues }
                    yvalues.push((yvalues[index-1]+(computed.savings.total*Math.pow(1+native.salaryGrowthPercentage/100,index)))*(1+native.investmentReturns/100))
                    return yvalues
                },[])
                return { xvalues: xvalues, yvalues: yvalues }
            }
        },
        {
            name: 'pieChartData',
            compute: (native,computed) => {
                let xvalues = ['401k contributions','additional savings','taxes','whats left for other expenses?']
                let leftOver = computed.pretaxSalary - computed.savings.contribution - computed.savings.additional - computed.taxes.total
                let yvalues = [computed.savings.contribution,computed.savings.additional,computed.taxes.total,leftOver]
                return { xvalues: xvalues, yvalues: yvalues }
            }
        }

    ]
}
