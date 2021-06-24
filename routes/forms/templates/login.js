module.exports = {
    title: 'Login',
    showTitle: true,
    resetOnSubmit: true,
    groups: [
        {
            title: 'loginInfo',
            showTitle: false,
            components: [
                {
                    dType: String,
                    type: 'text',
                    name: 'username',
                    validators: 'name',
                    asyncValidators: ['unique'],
                    hint: 'your unique identifier',
                },
                {
                    dType: String,
                    type: 'radio',
                    name: 'salaryType',
                    validators: 'radio',
                    options: ['monthly','yearly']
                },
                {
                    dType: String,
                    type: 'dropdown',
                    name: 'state',
                    validators: 'dropdown',
                    options: 'states'
                },
            ]
        }
    ]
}