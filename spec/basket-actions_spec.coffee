winston = require("winston")
api = require("../index").configure(logger: new winston.Logger(transports: []))

require "./custom-matchers.js"

describe "Basket actions", ->
  basket = undefined
  beforeEach ->
    basket = new api.Basket()

  it "should generate a create method for the create action", ->
    expect(basket.create).toBeDefined()
    expect(basket.create).toBeAFunction()

  it "should generate a get method for the default action", ->
    expect(basket.get).toBeDefined()
    expect(basket.get).toBeAFunction()

  it "should generate an addItem method for the addItem action", ->
    expect(basket.addItem).toBeDefined()
    expect(basket.addItem).toBeAFunction()

  it "should generate a removeItem method for the removeItem action", ->
    expect(basket.removeItem).toBeDefined()
    expect(basket.removeItem).toBeAFunction()