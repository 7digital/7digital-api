var jasmine = require('jasmine-node'),
	sys = require('sys');

require.paths.unshift('../lib/');
require.paths.unshift('../support/');

for(var key in jasmine) {
  global[key] = jasmine[key];
}

var isVerbose = true,
	showColors = true,
	folderName = '/suites/unit';

process.argv.forEach(function(arg){
	switch(arg) {
		case '--color': 
			showColors = true; 
			break;
		case '--noColor': 
			showColors = false; 
			break;
		case '--quiet': 
			isVerbose = false; 
			break;
		case '--integration':
			folderName = '/suites/integration';
	}
});


require('./helpers/Matchers.js');
jasmine.executeSpecsInFolder(__dirname + folderName, function(runner, log){
  if (runner.results().failedCount === 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}, isVerbose, showColors);