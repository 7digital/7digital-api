api = require "../index"

require "./custom-matchers.js"

describe "Tracks actions", ->
  releases = undefined
  tracks = undefined

  beforeEach ->
    tracks = new api.Tracks()

  it "should generate a getChart method for the chart action", ->
    expect(tracks.getChart).toBeDefined()
    expect(tracks.getChart).toBeAFunction()

  it "should generate a getDetails method for the details action", ->
    expect(tracks.getDetails).toBeDefined()
    expect(tracks.getDetails).toBeAFunction()

  it "should generate a getPreview method for the preview action", ->
    expect(tracks.getPreview).toBeDefined()
    expect(tracks.getPreview).toBeAFunction()

  it "should generate a search method for the search action", ->
    expect(tracks.search).toBeDefined()
    expect(tracks.search).toBeAFunction()
