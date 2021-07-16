const Taxes = require("../../../api/Taxes");
const taxHelper = new Taxes();
const ChartFunctions = require("../../../api/ChartFunctions");

module.exports = {
  template: {
    title: "Savings",
    showTitle: false,
    resetOnSubmit: false,
    groups: [
      {
        title: "salaryInfo",
        showTitle: true,
        components: [
          {
            dType: Number,
            type: "text",
            name: "pretaxSalary",
            validators: "currency",
            hint: "salary in dollars (include 401k matching)",
          },
          {
            dType: String,
            type: "radio",
            name: "salaryType",
            validators: "radio",
            options: ["monthly", "yearly"],
          },
          {
            dType: Number,
            type: "text",
            name: "salaryGrowthPercentage",
            validators: "integer",
            hint: "how much do you expect your salary to grow every year?",
            defaultValue: "3",
          },
        ],
      },
      {
        title: "taxInfo",
        showTitle: true,
        components: [
          {
            dType: String,
            type: "dropdown",
            name: "state",
            validators: "dropdown",
            options: "states",
          },
          {
            dType: String,
            type: "radio",
            name: "filingStatus",
            validators: "radio",
            options: ["single", "married"],
          },
        ],
      },
      {
        title: "savingsInfo",
        showTitle: true,
        components: [
          {
            dType: Number,
            type: "text",
            name: "yearlyRetirementFundContribution",
            validators: "currency",
            hint: "yearly contribution to 401k (max $19,500)",
            defaultValue: "19500",
          },
          {
            dType: Number,
            type: "text",
            name: "savingPercentage",
            validators: "number",
            hint: "additional savings percentage after taxes",
          },
          {
            dType: Number,
            type: "text",
            name: "investmentReturns",
            validators: "integer",
            hint: "yearly returns on investments",
            defaultValue: "7",
          },
        ],
      },
      {
        title: "retirementGoal",
        showTitle: true,
        components: [
          {
            dType: Number,
            type: "text",
            name: "currentAge",
            validators: "integer",
            hint: "how old are you now?",
          },
          {
            dType: Number,
            type: "text",
            name: "retirementAge",
            validators: "integer",
            hint: "whats your ideal retirement age?",
          },
        ],
      },
    ],
  },
  order: 0,
  computed: [
    {
      name: "pretaxSalary",
      compute: (native, computed, previous) => {
        return native.salaryType == "monthly"
          ? native.pretaxSalary * 12
          : native.pretaxSalary;
      },
    },
    {
      name: 'dataOverTime',
      compute: (native,computed,previous) => {
        let numMonths = (native.retirementAge - native.currentAge) * 12
        let xvalues = [...Array(numMonths + 1).keys()]
        let yvalues = xvalues.slice(1).reduce((a,c,i) => {
          let pretaxSalary = a[i].pretaxSalary * (native.salaryGrowthPercentage/1200 + 1)
          let contribution = native.yearlyRetirementFundContribution
          let taxes = taxHelper.getTaxes(contribution, pretaxSalary, native.state, native.filingStatus)
          let additional = (pretaxSalary - taxes.total) * native.savingPercentage/100
          let savings = { contribution, additional, total: contribution + additional }
          let totalSavings = (a[i].totalSavings + savings.total/12) * (1+native.investmentReturns/1200)
          a.push({ 
            pretaxSalary, 
            taxes, 
            savings, 
            totalSavings, 
            leftOver: pretaxSalary - taxes.total - savings.total })
          return a
        },
        [{
          totalSavings: 0,
          pretaxSalary: computed.pretaxSalary
        }])
        let data = ChartFunctions.monthsToYears(xvalues,yvalues)
        data.xvalues = data.xvalues.map(v => v + native.currentAge)
        return data
      }
    },
    {
      name: 'initialData',
      compute: (native,computed,previous) => {
        return computed.dataOverTime.yvalues[1]
      }
    },
    {
      name: 'leftOver',
      compute: (native,computed,previous) => {
        return computed.initialData.leftOver
      }
    },
    {
      name: 'spendingPercentagesChart',
      compute: (native,computed,previous) => {
        let labels = ['federal taxes','fica','state taxes','total savings','left for discretionary spending']
        let yvalues = computed.dataOverTime.yvalues.slice(1).map(v => {
          return [v.taxes.federal,v.taxes.fica,v.taxes.state,v.savings.total,v.leftOver]
        })
        return {labels, yvalues}
      }
    },
    {
      name: 'netWorthChart',
      compute: (native,computed,previous) => {
        return { 
          xvalues: computed.dataOverTime.xvalues, 
          yvalues: computed.dataOverTime.yvalues.map(v => v.totalSavings)
        }
      }
    },
  ],
};
