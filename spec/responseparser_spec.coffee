ResponseParser = require("../lib/responseparser")
winston = require("winston")
fs = require("fs")
path = require("path")

describe "responseparser", ->
  parser = new ResponseParser(
    format: "xml"
    logger: new winston.Logger(transports: [])
  )
  beforeEach ->
    @addMatchers toBeAnArray: ->
      @actual.constructor.toString().indexOf("Array") isnt -1

  it "should return xml when format is xml", ->
    callbackSpy = jasmine.createSpy()
    xml = fs.readFileSync(path.join(__dirname + "/responses/release-tracks-singletrack.xml"), "utf8")
    parser.parse callbackSpy, null, xml
    expect(callbackSpy).toHaveBeenCalled()
    expect(callbackSpy).toHaveBeenCalledWith null, xml

  it "should return xml when format is XML", ->
    callbackSpy = jasmine.createSpy()
    xml = fs.readFileSync(path.join(__dirname + "/responses/release-tracks-singletrack.xml"), "utf8")
    parser.format = "XML"
    parser.parse callbackSpy, null, xml
    expect(callbackSpy).toHaveBeenCalled()
    expect(callbackSpy).toHaveBeenCalledWith null, xml

  it "should return javascript object when format is not xml", ->
    callbackSpy = jasmine.createSpy()
    xml = fs.readFileSync(path.join(__dirname + "/responses/release-tracks-singletrack.xml"), "utf8")
    parser.format = "js"
    parser.parse callbackSpy, null, xml
    expect(callbackSpy).toHaveBeenCalled()
    expect(typeof callbackSpy.mostRecentCall.args[1]).toEqual "object"

  it "should merge the attributes of the response", ->
    callbackSpy = jasmine.createSpy()
    xml = fs.readFileSync(path.join(__dirname + "/responses/release-tracks-singletrack.xml"), "utf8")
    parser.format = "js"
    parser.parse callbackSpy, null, xml
    expect(callbackSpy.mostRecentCall.args[1]['@']).not.toBeDefined

  it "should normalise single resource responses into an array", ->
    callbackSpy = jasmine.createSpy()
    xml = fs.readFileSync(path.join(__dirname + "/responses/release-tracks-singletrack.xml"), "utf8")
    parser.format = "js"
    parser.parse callbackSpy, null, xml
    expect(callbackSpy).toHaveBeenCalled()
    response = callbackSpy.mostRecentCall.args[1]
    expect(response.tracks.track).toBeAnArray()

  # Note that basket items are one level deeper than other arrays, hence
  # the separate test.
  it "should normalise basket items into an array", ->
    callbackSpy = jasmine.createSpy()
    xml = fs.readFileSync(path.join(__dirname + "/responses/basket-additem.xml"), "utf8")
    parser.format = "js"
    parser.parse callbackSpy, null, xml
    expect(callbackSpy).toHaveBeenCalled()
    response = callbackSpy.mostRecentCall.args[1]
    expect(response.basket.basketItems).toBeAnArray()
