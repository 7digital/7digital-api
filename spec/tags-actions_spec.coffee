winston = require("winston")
api = require("../index").configure(logger: new winston.Logger(transports: []))

require "./custom-matchers.js"

describe "Tags actions", ->
  tags = undefined

  beforeEach ->
    tags = new api.Tags()

  it "should generate an all method for the default action", ->
    expect(tags.all).toBeDefined()
    expect(tags.all).toBeAFunction()