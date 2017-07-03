/* globals define, module */
(function (root, factory) {
	'use strict';
	if (typeof define === 'function' && define.amd) {
		define(['kixx-test'], factory);
	} else if (typeof module === 'object' && module.exports) {
		factory(module.exports);
	} else {
		root.kixxTest = {};
		factory(root.kixxTest);
	}
}(this, function(exports) {
	'use strict';

}));
