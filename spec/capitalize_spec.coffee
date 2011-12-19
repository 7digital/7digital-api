helpers = require("../lib/helpers")

describe "helpers.capitalize", ->
  it "should capitalise the first letter of a string", ->
    result = helpers.capitalize("seven")
    expect(result[0]).toEqual "S"
    expect(result).toEqual "Seven"