winston = require("winston")
api = require("../index").configure(logger: new winston.Logger(transports: []))

require "./custom-matchers.js"

describe "Artists actions", ->
  artists = undefined
  beforeEach ->
    artists = new api.Artists()

  it "should generate a browse method for the browse action", ->
    expect(artists.browse).toBeDefined()
    expect(artists.browse).toBeDefined()

  it "should generate a getChart method for the chart action", ->
    expect(artists.getChart).toBeDefined()
    expect(artists.getChart).toBeAFunction()

  it "should generate a getDetails method for the details action", ->
    expect(artists.getDetails).toBeDefined()
    expect(artists.getDetails).toBeAFunction()

  it "should generate a getReleases method for the releases action", ->
    expect(artists.getReleases).toBeDefined()
    expect(artists.getReleases).toBeAFunction()

  it "should generate a search method for the search action", ->
    expect(artists.search).toBeDefined()
    expect(artists.search).toBeAFunction()

  it "should generate a getTopTracks method for the toptracks action", ->
    expect(artists.getTopTracks).toBeDefined()
    expect(artists.getTopTracks).toBeAFunction()

  it "should generate a getTags method for the tags action", ->
    expect(artists.getTags).toBeDefined()
    expect(artists.getTags).toBeAFunction()

  it "should generate a getTopByTags method for the bytag/top action", ->
    expect(artists.getTopByTags).toBeDefined()
    expect(artists.getTopByTags).toBeAFunction()