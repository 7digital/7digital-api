sevendigital = require("../index")

require "./custom-matchers.js"

describe "Module entry point", ->
  it "should be the built 7digital API wrapper", ->
    expect(sevendigital.Artists).toBeDefined()
    expect(sevendigital.Artists).toBeAFunction()