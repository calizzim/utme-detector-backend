module.exports = {
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
                    hint: 'salary in dollars'
                },
                {
                    dType: String,
                    type: 'radio',
                    name: 'salaryType',
                    validators: 'radio',
                    options: ['monthly','yearly']
                },
            ]
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
                    dType: String,
                    type: 'text',
                    name: 'savingPercentage',
                    validators: 'integer',
                    hint: 'what percentage of your income do you want to save?'
                },
                {
                    dType: String,
                    type: 'text',
                    name: 'currentAge',
                    validators: 'integer',
                    hint: 'how old are you now?'
                },
                {
                    dType: String,
                    type: 'text',
                    name: 'retirementAge',
                    validators: 'integer',
                    hint: 'whats your ideal retirement age?'
                },
            ]
        }
    ]
}