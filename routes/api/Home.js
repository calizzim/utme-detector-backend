module.exports = class {
    constructor() { }
    getHomeValue(monthlyPayment, mortgageLengthYears = 30, interestRatePercent = 3) {
        let interestRate = interestRatePercent/1200
        let mortgageLengthMonths = mortgageLengthYears * 12
        return monthlyPayment * (
            (Math.pow(1+interestRate,mortgageLengthMonths)-1)/
            (interestRate*Math.pow(1+interestRate,mortgageLengthMonths))
        )
    }
}