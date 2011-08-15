require('../../helpers/Matchers.js');
var api = require('../../../index');
const API_TIMEOUT_MS = 5000;

describe('Releases Integration Tests', function() {
	var releases;

	beforeEach(function() {
		releases = new api.Releases();
		this.addMatchers({
			toHaveOkStatus: function() {
				return this.actual['@'].status === 'ok';
			}
		});
	});
	
	it("should return release from getDetails", function() {
    pending()
		var errorData,
			successData;
			
		releases.getDetails({ releaseid: 951866 }, function(err, data) {
			errorData = err;
			successData = data;
		});
		
		waitsFor(function() {
			return errorData || successData;
		}, "getDetails timed out", API_TIMEOUT_MS);
		
		runs(function() {
			expect(errorData).toBeFalsy();
			expect(successData).not.toBeFalsy();
			expect(successData).toHaveOkStatus();
		});		
	});
	
	it("should return return an error from getDetails when given no releaseId", function() {
    pending()
		var errorData,
			successData;
			
		releases.getDetails(null, function(err, data) {
			errorData = err;
			successData = data;
		});
		
		waitsFor(function() {
			return errorData || successData;
		}, "getDetails timed out", API_TIMEOUT_MS);
		
		runs(function() {
			expect(successData).toBeFalsy();
			expect(errorData).not.toBeFalsy();
		});		
	});

});
