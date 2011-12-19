helpers = require("../lib/helpers")

describe "toYYYYMMDD", ->
  it "should return formatted the date string", ->
    theDate = new Date("October 13, 1975 12:00:00")
    result = helpers.toYYYYMMDD(theDate)
    expect(result).toEqual "19751013"