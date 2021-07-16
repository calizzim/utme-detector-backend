const fs = require("fs");
module.exports = class {
  constructor() {
    this.zipcodeToTaxrate = JSON.parse(
      fs.readFileSync("files/zipcodeToTaxrate.json")
    );
    this.countyToTaxrate = JSON.parse(
      fs.readFileSync("files/countyToTaxrate.json")
    );
    this.states = JSON.parse(fs.readFileSync("files/states.json"));
  }
  getAbbrev(state) {
    return this.states.find((o) => o.name == state).abbreviation;
  }
  getTaxrateZipcode(zipcode) {
    return this.zipcodeToTaxrate[zipcode];
  }
  getTaxrateCounty(state, county) {
    state = this.getAbbrev(state);
    county = String(county)
      .toLowerCase()
      .split(" ")
      .map((v) => v.charAt(0).toUpperCase() + v.slice(1))
      .join(" ");
    return this.countyToTaxrate[county + ", " + state];
  }
};
