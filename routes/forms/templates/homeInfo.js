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
                        name: 'monthlyPayment',
                        validators: 'currency',
                        hint: 'how much are you willing to spend on housing?'
                    },
                    {
                        dType: Number,
                        type: 'text',
                        name: 'mortgageLength',
                        validators: 'integer',
                        hint: 'length of mortgage (years)'
                    },
                    {
                        dType: Number,
                        type: 'text',
                        name: 'interestRate',
                        validators: 'number',
                        hint: 'yearly interest rate in percent'
                    },
                ]
            },
        ]
    },
    computed: [
        {
            name: 'homeValue',
            compute: (native, computed) => {
                return home.getHomeValue(native.monthlyPayment,native.mortgageLength,native.interestRate)
            }
        },
        {
            name: 'homeEquityData',
            compute: (native, computed) => {
                let xvalues = Array(native.mortgageLength*12)
                               .fill(0)
                               .map((value,index) => index)
                let yvalues = xvalues.reduce((yvalues, xvalue, index) => {
                    let last = index == 0 ? 0 : yvalues[index-1]
                    yvalues.push(
                        last + 
                        (native.monthlyPayment - ((computed.homeValue - last) * native.interestRate / 1200))
                    )
                    return yvalues
                },[])
                return { 
                    xvalues: xvalues.filter((val,index) => index % 12 == 0).map(val => val/12), 
                    yvalues: yvalues.filter((val,index) => index % 12 == 0) 
                }
            }
        },
    ]
}
