module.exports = class {
  static monthsToYears(xvalues, yvalues) {
    let xzero = xvalues[0]; xvalues = xvalues.slice(1)
    let yzero = yvalues[0]; yvalues = yvalues.slice(1)

    xvalues = xvalues.filter(v => (v+1)%12==0).map(v => (v+1)/12)
    yvalues = yvalues.filter((v,i) => (i+1)%12==0)

    xvalues.unshift(xzero)
    yvalues.unshift(yzero)

    return { xvalues: xvalues, yvalues: yvalues }
  }
}