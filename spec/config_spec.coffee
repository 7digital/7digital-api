describe "config", ->
  config = require("../config")

  it "should have the default consumer key", ->
    expect(config.consumerkey).toEqual "YOUR_KEY_HERE"

  it "should have an empty oauthsecret", ->
    expect(config.consumersecret).toEqual "YOUR_SECRET_HERE"

  it "should have the path to the schema json", ->
    expect(config.schemapath).toMatch /assets\/7digital-api-schema.json$/

  it "should have debug", ->
    expect(config.debug).toEqual true

  it "should have the response format set to JSON by default", ->
    expect(config.format).toEqual "json"