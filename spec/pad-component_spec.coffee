helpers = require("../lib/helpers")

describe "helpers.padComponent", ->
  it "should return a string with a leading zero when less than or equal to 9", ->
    result = helpers.padComponent(9)
    expect(result).toEqual "09"

  it "should return a string with when more than 9", ->
    result = helpers.padComponent(10)
    expect(result).toEqual "10"