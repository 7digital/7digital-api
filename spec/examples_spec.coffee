describe "Examples", ->
  describe "CustomConfig example", ->
    exec = require("child_process").exec
    path = require("path")
    it "should return return some releases", ->
      processReturned = false
      exec "node " + path.join(__dirname, "../examples/customconfig.js"), assertOutput = (err, stdout, stderr) ->
        result = undefined
        expect(err).toBeFalsy()
        expect(stdout).toMatch "releases"
        processReturned = true

      waitsFor (->
        processReturned
      ), "Timed out waiting for process to return", 5000

  describe "SimpleClient example", ->
    exec = require("child_process").exec
    path = require("path")
    it "should return return some releases", ->
      processReturned = false
      exec "node " + path.join(__dirname, "../examples/simpleclient.js"), assertOutput = (err, stdout, stderr) ->
        result = undefined
        expect(err).toBeFalsy()
        expect(stdout).toMatch "releases"
        processReturned = true

      waitsFor (->
        processReturned
      ), "Timed out waiting for process to return", 5000

  describe "Default Action  example", ->
    exec = require("child_process").exec
    path = require("path")
    it "should return return some tags", ->
      processReturned = false
      exec "node " + path.join(__dirname, "../examples/default-action.js"), assertOutput = (err, stdout, stderr) ->
        result = undefined
        expect(err).toBeFalsy()
        expect(stdout).toMatch "tags"
        processReturned = true

      waitsFor (->
        processReturned
      ), "Timed out waiting for process to return", 5000