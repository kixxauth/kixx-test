/* globals define, module */
(function (root, factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		define(['kixx-test'], factory);
	} else if (typeof module === 'object' && module.exports) {
		factory(module.exports);
	} else {
		root.KixxTest = {};
		factory(root.KixxTest);
	}
}(this, function(exports) {
	'use strict';

	function isNotFullString(s) {
		return !s || typeof s !== 'string';
	}

	function isNotFunction(fn) {
		return typeof fn !== 'function';
	}

	function linkFunctions(next, func) {
		return function link() {
			return func(next);
		};
	}

	function createEmitter(self) {
		self = self || {};

		var events = {};

		self.on = function on(type, handler) {
			if (type && typeof type === 'string' && typeof handler === 'function') {
				var handlers = events[type] || [];
				handlers.push(handler);
				events[type] = handlers;
			}
		};

		self.emit = function emit(type, event) {
			var handlers = events[type];

			if (handlers) {
				for (var i = handlers.length - 1; i >= 0; i--) {
					var handler = handlers[i];
					handler.call(self, event);
				}
			} else if (type === 'error') {
				throw event;
			}
		};

		self.removeListener = function removeListener(type, handler) {
			var handlers = events[type];
			var index;

			if (handlers) {
				for (var i = handlers.length - 1; i >= 0; i--) {
					if (handler && handler === handlers[i]) {
						index = i;
						continue;
					}
				}
			}

			handlers.splice(index, 1);
		};

		self.removeAllListeners = function removeAllListeners(type) {
			if (type) {
				events[type] = [];
			} else {
				events = {};
			}
		};

		return self;
	}

	function createDescribeBlock(self) {
		var runner = self.runner;
		var blockName = self.name;
		var parents = self.parents.slice();
		var fn = self.fn;
		var timeout = self.timeout;
		var beforeBlocks = [];
		var testBlocks = [];
		var afterBlocks = [];
		var blocks = [];

		parents.push(blockName);

		self.it = function it(name, fn) {
			if (isNotFullString(name)) {
				throw new Error('First argument to it() must be a non-empty String');
			}

			if (isNotFunction(fn)) {
				throw new Error('Second argument to it() must be a Function');
			}

			function decorateEvent(ev) {
				ev = ev || {};
				ev.type = 'test';
				ev.parents = parents.slice();
				ev.test = name;
				return ev;
			}

			function test(next) {
				runner.emit('blockStart', decorateEvent());

				var err;

				try {
					fn.call(null);
				} catch (e) {
					err = e;
				}

				if (err) runner.emit('error', decorateEvent(err));
				runner.emit('blockComplete', decorateEvent());

				next();
			}

			testBlocks.push(test);

			return self;
		};

		self.before = function before(fn, options) {
			if (isNotFunction(fn)) {
				throw new Error('First argument to before() must be a Function');
			}

			if (fn.length !== 1) {
				throw new Error('First argument to before() must be a Function with done() callback');
			}

			var TO;
			if (typeof options === 'number') {
				TO = options;
			} else {
				options = options || {};
				TO = typeof options.timeout === 'number' ? options.timeout : timeout;
			}

			function decorateEvent(ev) {
				ev = ev || {};
				ev.type = 'before';
				ev.parents = parents.slice();
				ev.test = null;
				ev.timelimit = TO;
				return ev;
			}

			function beforeBlock(next) {
				runner.emit('blockStart', decorateEvent());
				var complete = false;
				var timedout = false;
				var errorState = {};

				var timeoutHandle = setTimeout(function () {
					timedout = true;
					var err = new Error('Failed to run before() within the specified time limit ('+ TO +'ms).');
					err.timedout = true;
					done(decorateEvent(err));
				}, TO);

				function done(err) {
					clearTimeout(timeoutHandle);

					if (err && err !== errorState) {
						err.timedout = timedout;
						errorState = err;
						runner.emit('error', decorateEvent(err));
					}

					if (!complete) {
						complete = true;
						runner.emit('blockComplete', decorateEvent({timedout: timedout}));
						next();
					}
				}

				try {
					fn.call(null, done);
				} catch (err) {
					done(err);
				}
			}

			beforeBlocks.push(beforeBlock);

			return self;
		};

		self.after = function after(fn, options) {
			if (isNotFunction(fn)) {
				throw new Error('First argument to after() must be a Function');
			}

			if (fn.length !== 1) {
				throw new Error('First argument to after() must be a Function with done() callback');
			}

			var TO;
			if (typeof options === 'number') {
				TO = options;
			} else {
				options = options || {};
				TO = typeof options.timeout === 'number' ? options.timeout : timeout;
			}

			function decorateEvent(ev) {
				ev = ev || {};
				ev.type = 'after';
				ev.parents = parents.slice();
				ev.test = null;
				ev.timelimit = TO;
				return ev;
			}

			function afterBlock(next) {
				runner.emit('blockStart', decorateEvent());
				var complete = false;
				var timedout = false;
				var errorState = {};

				var timeoutHandle = setTimeout(function () {
					timedout = true;
					var err = new Error('Failed to run after() within the specified time limit ('+ TO +'ms).');
					err.timedout = true;
					done(decorateEvent(err));
				}, TO);

				function done(err) {
					clearTimeout(timeoutHandle);

					if (err && err !== errorState) {
						err.timedout = timedout;
						errorState = err;
						runner.emit('error', decorateEvent(err));
					}

					if (!complete) {
						complete = true;
						runner.emit('blockComplete', decorateEvent({timedout: timedout}));
						next();
					}
				}

				try {
					fn.call(null, done);
				} catch (err) {
					done(err);
				}
			}

			afterBlocks.push(afterBlock);

			return self;
		};

		self.describe = function describe(name, fn, options) {
			if (isNotFullString(name)) {
				throw new Error('First argument to describe() must be a non-empty String');
			}

			if (isNotFunction(fn)) {
				throw new Error('Second argument to describe() must be a Function');
			}

			var TO;
			if (typeof options === 'number') {
				TO = options;
			} else {
				options = options || {};
				TO = typeof options.timeout === 'number' ? options.timeout : timeout;
			}

			blocks.push(createDescribeBlock({
				runner: runner,
				name: name,
				parents: parents,
				fn: fn,
				timeout: TO
			}));

			return self;
		};

		self.getFunctionsArray = function () {
			var list = beforeBlocks.concat(testBlocks);

			for (var i = 0; i < blocks.length; i++) {
				list = list.concat(blocks[i].getFunctionsArray());
			}

			list = list.concat(afterBlocks);
			return list;
		};

		fn.call(null, self);
		return self;
	}

	exports.createRunner = function createRunner(options) {
		options = options || {};
		var self = createEmitter();
		var blocks = [];
		var timeout = typeof options.timeout === 'number' ? options.timeout : 5000;

		function getAllFunctions() {
			var functions = [];

			for (var i = 0; i < blocks.length; i++) {
				functions = functions.concat(blocks[i].getFunctionsArray());
			}

			return functions;
		}

		self.describe = function describe(name, fn, options) {
			if (isNotFullString(name)) {
				throw new Error('First argument to describe() must be a non-empty String');
			}

			if (isNotFunction(fn)) {
				throw new Error('Second argument to describe() must be a Function');
			}

			var TO;
			if (typeof options === 'number') {
				TO = options;
			} else {
				options = options || {};
				TO = typeof options.timeout === 'number' ? options.timeout : timeout;
			}

			blocks.push(createDescribeBlock({
				runner: self,
				name: name,
				parents: [],
				fn: fn,
				timeout: TO
			}));
			return self;
		};

		function onEnd() {
			self.emit('end');
		}

		self.run = function run() {
			var functions = getAllFunctions().reverse();
			var next = onEnd;

			for (var i = 0; i < functions.length; i++) {
				next = linkFunctions(next, functions[i]);
			}

			next();
		};

		return self;
	};
}));
