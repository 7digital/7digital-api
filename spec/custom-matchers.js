beforeEach(function() {

	this.addMatchers({
		toBeAFunction: function() {
			return typeof this.actual === 'function';
		},
		
		toHavePrototypeOf: function(proto) {
			return this.actual.prototype == proto.prototype;
		},
		toHaveOkStatus: function() {
			return this.actual['@'].status === 'ok';
		}
	});

});
