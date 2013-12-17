var childProcess = require('child_process');
var serverProcess;
var processStarted;

before(function (done) {
	var nodeProcessPath;
	try {
		nodeProcessPath = require.resolve('api-stub');
		console.log('spawning node api-stub process : ', nodeProcessPath, '\n');

		serverProcess = childProcess.spawn('node', [nodeProcessPath], {});

		serverProcess.stdout.on('data', function (data) {
			if (!processStarted) {
				processStarted = true;
				done();
			}
		});

		serverProcess.stderr.on('data', function (data) {
			console.log('' + data);
		});
	} catch (e) {
		console.log('Make sure api-stub module is installed!');
	}
});

after(function () {
	console.log('\nshutting down api-stub process');
	serverProcess.kill('SIGKILL');
});
