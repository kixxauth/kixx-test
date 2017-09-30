/* globals require, console, KixxTest, KixxAssert */
/* eslint no-console: "off" */
(function (modules) {
	'use strict';
	var KixxTest = modules.KixxTest;
	var KixxAssert = modules.KixxAssert;
	var assert = KixxAssert.assert;
	var helpers = KixxAssert.helpers;
	var AssertionError = KixxAssert.AssertionError;

	// Immutable setter.
	function set(source, vals) {
		var newObject = {};
		var keys = helpers.keys(source).concat(helpers.keys(vals));

		for (var i = keys.length - 1; i >= 0; i--) {
			var key = keys[i];
			newObject[key] = helpers.has(key, vals) ? vals[key] : source[key];
		}

		return newObject;
	}

	// Extend kixx-assert with capability to test for thrown errors.
	KixxAssert.use(function (KA) {
		KA.assert.throwsWithMessage = function throwsWithMessage(expected, block, message) {
			var reason;

			try {
				block();
				reason = 'did not throw';
			} catch (err) {
				// String match.
				if (typeof expected === 'string' && (err.message || '').indexOf(expected) === -1) {
					reason = 'error message "'+ err.message +'" does not contain "'+ expected +'"';

				// RegExp match.
				} else if (expected.test && !expected.test(err.message || '')) {
					reason = 'error message "'+ err.message +'" does not match '+ expected;
				}
			}

			if (reason && message) {
				throw new AssertionError(message +' :: '+ reason, null, throwsWithMessage);
			}
			if (reason) {
				throw new AssertionError(reason, null, throwsWithMessage);
			}

			return true;
		};
	});

	// Test setup, teardown, nested blocks, execution order and event attributes.
	(function () {
		var subject = KixxTest.createRunner();
		var errors = [];
		var events = [];
		var counter = 0;
		var layer1Cleared = false;
		var layer2aCleared = false;
		var layer2bCleared = false;
		var layer3Cleared = false;

		var timeoutHandle = setTimeout(function () {
			assert.isNotOk(true, 'test block timeout');
		}, 100);

		subject.on('error', function (err) {
			// console.error(err);
			errors.push(err);
		});

		subject.on('blockStart', function (block) {
			events.push(set(block, {eventType: 'blockStart'}));
		});

		subject.on('blockComplete', function (block) {
			events.push(set(block, {eventType: 'blockComplete'}));
			counter++;
		});

		subject.on('end', function () {
			var x;

			clearTimeout(timeoutHandle);
			subject.removeAllListeners();

			assert.isEqual(0, errors.length, 'no errors reported');
			assert.isOk(layer1Cleared, 'layer1 cleared');
			assert.isOk(layer2aCleared, 'layer2a cleared');
			assert.isOk(layer2bCleared, 'layer2b cleared');
			assert.isOk(layer3Cleared, 'layer3 cleared');

			x = events[0];
			assert.isEqual('before', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('blockStart', x.eventType);

			x = events[1];
			assert.isEqual('before', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('blockComplete', x.eventType);

			x = events[2];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('blockStart', x.eventType);
			assert.isEqual('should have set the scope', x.test);

			x = events[3];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('blockComplete', x.eventType);
			assert.isEqual('should have set the scope', x.test);

			x = events[4];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('blockStart', x.eventType);
			assert.isEqual('is positioned correctly', x.test);

			x = events[5];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('blockComplete', x.eventType);
			assert.isEqual('is positioned correctly', x.test);

			x = events[6];
			assert.isEqual('before', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2a', x.parents[1]);
			assert.isEqual('blockStart', x.eventType);

			x = events[7];
			assert.isEqual('before', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2a', x.parents[1]);
			assert.isEqual('blockComplete', x.eventType);

			x = events[8];
			assert.isEqual('before', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2a', x.parents[1]);
			assert.isEqual('layer 3', x.parents[2]);
			assert.isEqual('blockStart', x.eventType);

			x = events[9];
			assert.isEqual('before', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2a', x.parents[1]);
			assert.isEqual('layer 3', x.parents[2]);
			assert.isEqual('blockComplete', x.eventType);

			x = events[10];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2a', x.parents[1]);
			assert.isEqual('layer 3', x.parents[2]);
			assert.isEqual('blockStart', x.eventType);
			assert.isEqual('should have set the scope', x.test);

			x = events[11];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2a', x.parents[1]);
			assert.isEqual('layer 3', x.parents[2]);
			assert.isEqual('blockComplete', x.eventType);
			assert.isEqual('should have set the scope', x.test);

			x = events[12];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2a', x.parents[1]);
			assert.isEqual('layer 3', x.parents[2]);
			assert.isEqual('blockStart', x.eventType);
			assert.isEqual('should have parent scope', x.test);

			x = events[13];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2a', x.parents[1]);
			assert.isEqual('layer 3', x.parents[2]);
			assert.isEqual('blockComplete', x.eventType);
			assert.isEqual('should have parent scope', x.test);

			x = events[14];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2a', x.parents[1]);
			assert.isEqual('layer 3', x.parents[2]);
			assert.isEqual('blockStart', x.eventType);
			assert.isEqual('is positioned correctly', x.test);

			x = events[15];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2a', x.parents[1]);
			assert.isEqual('layer 3', x.parents[2]);
			assert.isEqual('blockComplete', x.eventType);
			assert.isEqual('is positioned correctly', x.test);

			x = events[16];
			assert.isEqual('after', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2a', x.parents[1]);
			assert.isEqual('layer 3', x.parents[2]);
			assert.isEqual('blockStart', x.eventType);

			x = events[17];
			assert.isEqual('after', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2a', x.parents[1]);
			assert.isEqual('layer 3', x.parents[2]);
			assert.isEqual('blockComplete', x.eventType);

			x = events[18];
			assert.isEqual('after', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2a', x.parents[1]);
			assert.isEqual('blockStart', x.eventType);

			x = events[19];
			assert.isEqual('after', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2a', x.parents[1]);
			assert.isEqual('blockComplete', x.eventType);

			x = events[20];
			assert.isEqual('before', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2b', x.parents[1]);
			assert.isEqual('blockStart', x.eventType);

			x = events[21];
			assert.isEqual('before', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2b', x.parents[1]);
			assert.isEqual('blockComplete', x.eventType);

			x = events[22];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2b', x.parents[1]);
			assert.isEqual('blockStart', x.eventType);
			assert.isEqual('should have set the scope', x.test);

			x = events[23];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2b', x.parents[1]);
			assert.isEqual('blockComplete', x.eventType);
			assert.isEqual('should have set the scope', x.test);

			x = events[24];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2b', x.parents[1]);
			assert.isEqual('blockStart', x.eventType);
			assert.isEqual('should have parent scope', x.test);

			x = events[25];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2b', x.parents[1]);
			assert.isEqual('blockComplete', x.eventType);
			assert.isEqual('should have parent scope', x.test);

			x = events[26];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2b', x.parents[1]);
			assert.isEqual('blockStart', x.eventType);
			assert.isEqual('is positioned correctly', x.test);

			x = events[27];
			assert.isEqual('test', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2b', x.parents[1]);
			assert.isEqual('blockComplete', x.eventType);
			assert.isEqual('is positioned correctly', x.test);

			x = events[28];
			assert.isEqual('after', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2b', x.parents[1]);
			assert.isEqual('blockStart', x.eventType);

			x = events[29];
			assert.isEqual('after', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('layer 2b', x.parents[1]);
			assert.isEqual('blockComplete', x.eventType);

			x = events[30];
			assert.isEqual('after', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('blockStart', x.eventType);

			x = events[31];
			assert.isEqual('after', x.type);
			assert.isEqual('layer 1', x.parents[0]);
			assert.isEqual('blockComplete', x.eventType);

			console.log('Pass: Nested describe blocks');
		});

		subject.describe('layer 1', function (layer1) {
			var layer1Scope;

			// The "after" block for layer 1.
			layer1.after(function (done) {
				layer1Scope = null;
				layer1Cleared = true;
				done();
			});

			// layer 2a (will be run following layer 1 tests).
			layer1.describe('layer 2a', function (layer2a) {
				var layer2aScope;

				layer2a.before(function (done) {
					setTimeout(function () {
						layer2aScope = true;
						done();
					}, 2);
				});

				layer2a.after(function (done) {
					layer2aScope = null;
					layer2aCleared = true;
					done();
				});

				// layer 3 will be run after layer 2a setup.
				layer2a.describe('layer 3', function (layer3) {
					var layer3Scope;

					layer3.before(function (done) {
						layer3Scope = true;
						done();
					});

					layer3.after(function (done) {
						layer3Scope = null;
						layer3Cleared = true;
						done();
					});

					layer3.it('should have set the scope', function () {
						assert.isEqual(true, layer3Scope, 'layer3Scope is true');
					});

					layer3.it('should have parent scope', function () {
						assert.isEqual(true, layer2aScope, 'layer2aScope is true');
					});

					layer3.it('is positioned correctly', function () {
						assert.isEqual(7, counter);
					});
				});
			});

			// layer 1 tests will be run after layer 1 setup
			layer1.it('should have set the scope', function () {
				assert.isEqual(true, layer1Scope, 'layer1Scope is true');
			});

			// layer 1 tests will be run after layer 1 setup
			layer1.it('is positioned correctly', function () {
				assert.isEqual(2, counter);
			});

			// layer 2b will be run after layer 1 setup, layer 2a setup and teardown,
			// and layer3 setup and teardown.
			layer1.describe('layer 2b', function (layer2b) {
				var layer2bScope;

				layer2b.before(function (done) {
					layer2bScope = true;
					done();
				});

				layer2b.after(function (done) {
					setTimeout(function () {
						layer2bScope = null;
						layer2bCleared = true;
						done();
					}, 2);
				});

				layer2b.it('should have set the scope', function () {
					assert.isEqual(true, layer2bScope, 'layer2bScope is true');
				});

				layer2b.it('should have parent scope', function () {
					assert.isEqual(true, layer1Scope, 'layer1Scope is true');
				});

				layer2b.it('is positioned correctly', function () {
					assert.isEqual(13, counter);
				});
			});

			// layer 1 setup at the end, but run first.
			layer1.before(function (done) {
				setTimeout(function () {
					layer1Scope = true;
					done();
				}, 2);
			});
		});

		subject.run();
	}());

	// Test assertion error.
	(function () {
		var subject = KixxTest.createRunner();
		var errors = [];
		var started = 0;
		var completed = 0;

		subject.on('blockStart', function () {
			started += 1;
		});

		subject.on('blockComplete', function () {
			completed += 1;
		});

		subject.on('error', function (err) {
			errors.push(err);
		});

		subject.on('end', function () {
			var e;

			subject.removeAllListeners();

			assert.isGreaterThan(0, started);
			assert.isEqual(started, completed);

			e = errors[0];
			assert.isEqual('Thrown in before()', e.message);
			assert.isEqual('layer 1', e.parents[0]);
			assert.isEqual('before', e.type);

			e = errors[1];
			assert.isEqual('Passed in before()', e.message);
			assert.isEqual('layer 1', e.parents[0]);
			assert.isEqual('layer 2', e.parents[1]);
			assert.isEqual('before', e.type);

			// "it" tests are not executed if there is an error in the before block
			// e = errors[2];
			// assert.isEqual('Thrown', e.message);
			// assert.isEqual('layer 1', e.parents[0]);
			// assert.isEqual('layer 2', e.parents[1]);
			// assert.isEqual('test', e.type);

			e = errors[2];
			assert.isEqual('Passed in after()', e.message);
			assert.isEqual('layer 1', e.parents[0]);
			assert.isEqual('layer 2', e.parents[1]);
			assert.isEqual('after', e.type);

			e = errors[3];
			assert.isEqual('Thrown in after()', e.message);
			assert.isEqual('layer 1', e.parents[0]);
			assert.isEqual('after', e.type);

			console.log('Pass: Proper handling of assertion errors');
		});

		subject.describe('layer 1', function (subject) {
			subject.before(function (done) {
				throw new Error('Thrown in before()');
				done(); // eslint-disable-line no-unreachable
			});

			subject.after(function (done) {
				throw new Error('Thrown in after()');
				done(); // eslint-disable-line no-unreachable
			});

			subject.describe('layer 2', function (subject) {
				subject.before(function (done) {
					done(new Error('Passed in before()'));
				});

				subject.after(function (done) {
					done(new Error('Passed in after()'));
				});

				subject.it('throws', function () {
					throw new Error('Thrown');
				});

				// Throwing an error in an asynchronous block is not catchable.
				//
				// subject.it('async - throws error', function () {
				// 	setTimeout(function () {
				// 		throw new Error('Async - Thrown');
				// 	}, 5);
				// });
			});
		});

		subject.run({timeout: 10});
	}());

	// Test timeout errors.
	(function () {
		var now = new Date();
		var startTime = now.getTime();
		var subject = KixxTest.createRunner();
		var errors = [];

		subject.on('error', function (err) {
			errors.push(err);
		});

		subject.on('end', function () {
			var now = new Date();
			var runtime = now.getTime() - startTime;

			assert.isEqual(4, errors.length, 'number of "immediate" errors');
			assert.isGreaterThan(6, runtime, 'runtime is greater than number of blocks x 2');
			assert.isLessThan(15, runtime, 'but too not much more');

			setTimeout(function () {
				assert.isEqual(5, errors.length, 'total error count');

				var assertErrorMessage = assert.isMatch(/^Failed to [a-z\s()]+ within the specified time limit \([\d]{1}ms\).$/);
				var assertIsTrue = assert.isEqual(true);
				var e;

				e = errors[0];
				assertErrorMessage(e.message);
				assertIsTrue(e.timedout);
				assert.isEqual('before', e.type);
				assert.isEqual('layer 1', e.parents[0]);
				assert.isEqual(2, e.timelimit);

				e = errors[1];
				assertErrorMessage(e.message);
				assertIsTrue(e.timedout);
				assert.isEqual('before', e.type);
				assert.isEqual('layer 1', e.parents[0]);
				assert.isEqual('layer 2', e.parents[1]);
				assert.isEqual(2, e.timelimit);

				e = errors[2];
				assert.isEqual('Thrown Error', e.message);
				assert.isEqual('after', e.type);
				assert.isEqual('layer 1', e.parents[0]);
				assert.isEqual('layer 2', e.parents[1]);
				assert.isEqual(2, e.timelimit);

				e = errors[3];
				assertErrorMessage(e.message);
				assertIsTrue(e.timedout);
				assert.isEqual('after', e.type);
				assert.isEqual('layer 1', e.parents[0]);
				assert.isEqual(2, e.timelimit);

				e = errors[4];
				assert.isEqual('Late Bloomer', e.message);
				assert.isEqual(false, e.timedout);
				assert.isEqual('after', e.type);
				assert.isEqual('layer 1', e.parents[0]);
				assert.isEqual('layer 2', e.parents[1]);
				assert.isEqual(2, e.timelimit);

				console.log('Pass: Proper handling of timeouts');
			}, 50);
		});

		subject.describe('layer 1', function (subject) {
			subject.before(function (done) {
				setTimeout(done, 5);
			});

			subject.after(function (done) {
				setTimeout(done, 5);
			});

			subject.describe('layer 2', function (subject) {
				subject.before(function (done) {
					setTimeout(done, 5);
				});

				subject.after(function (done) {
					setTimeout(function () {
						done(new Error('Late Bloomer'));
					}, 25); // Enough time for all previous tests to timeout.

					throw new Error('Thrown Error');
				});
			});
		}, {timeout: 2});

		subject.run();
	}());

	(function () {
		var subject = KixxTest.createRunner();

		subject.describe('programmer errors', function (subject) {
			assert.throwsWithMessage('First argument to describe() must be a non-empty String', function () {
				subject.describe();
			}, 'runner.describe() without arguments');

			assert.throwsWithMessage('Second argument to describe() must be a Function', function () {
				subject.describe('xxx');
			}, 'runner.describe() without block argument');

			assert.throwsWithMessage('First argument to after() must be a Function', function () {
				subject.after();
			}, 'block.after() without arguments');

			assert.throwsWithMessage('First argument to before() must be a Function', function () {
				subject.before();
			}, 'block.before() without arguments');

			assert.throwsWithMessage('First argument to it() must be a non-empty String', function () {
				subject.it();
			}, 'block.it() without arguments');

			assert.throwsWithMessage('Second argument to it() must be a Function', function () {
				subject.it('xxx');
			}, 'block.it() without block argument');

			console.log('Pass: Throw proper programmer errors');
		});
	}());

}(function () {
	'use strict';
	var modules = {};

	if (typeof require === 'undefined') {
		modules.KixxTest = KixxTest;
		modules.KixxAssert = KixxAssert;
	} else {
		modules.KixxTest = require('./kixx-test');
		modules.KixxAssert = require('kixx-assert');
	}

	return modules;
}()));
