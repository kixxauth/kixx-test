Kixx Test
=========
An event emitting test runner for ECMAScript.

## Install in the browser:
__AMD__ and __Browserify__ are supported. Or include in your HTML:

```html
<script src="./kixx-test.js" type="text/javascript"></script>
```

Then use in your JavaScript:
```js
var KixxTest = window.KixxTest;
```

## Install in a Node.js project:
Install with NPM on the command line:
```
$ npm install --save kixx-test
```

Then use in your project:
```js
const KixxTest = require('kixx-test');
```

## Example

```js
var KixxTest = require('../kixx-test');
var assert = require('../node_modules/kixx-assert/').assert;

// Our test subject:
var Purchasing = {
    getMarketPurchasePrice: function (bid, ask) {
        var mid = Purchasing.getBidAskMidpoint(bid, ask);
        return Math.round(mid * 1000 + 20) / 1000;
    },

    getMarketSalePrice: function (bid, ask) {
        var mid = Purchasing.getBidAskMidpoint(bid, ask);
        return Math.round(mid * 1000 - 20) / 1000;
    },

    getBidAskMidpoint: function (bid, ask) {
        return Math.round((Math.round(bid * 1000) + Math.round(ask * 1000)) / 2) / 1000;
    }
};

var runner = KixxTest.createRunner();

// Define the first test block. Notice that it contains child blocks.
runner.describe('Purchasing', function (Block) {
    Block.describe('getMarketPurchasePrice', function (Block) {
        var bid = 10.222;
        var ask = 10.666;
        var result = null;
        var str = null;

        Block.before(function (done) {
            str = (bid + ask).toString();
            result = Purchasing.getMarketPurchasePrice(bid, ask);
            return done();
        });

        Block.it('would create a floating point error', function () {
            // str === 20.887999999999998
            assert.isGreaterThan(6, str.length);
        });

        Block.it('rounds to the nearest 1000th', function () {
            assert.isEqual(6, result.toString().length);
        });

        Block.it('returns a price 2/100 higher than the midpoint', function () {
            assert.isEqual(10.464, result);
        });
    });

    Block.describe('getMarketSalePrice', function (Block) {
        var bid = 10.222;
        var ask = 10.666;
        var result = null;
        var str = null;

        Block.before(function (done) {
            str = (bid + ask).toString();
            result = Purchasing.getMarketSalePrice(bid, ask);
            return done();
        });

        Block.it('would create a floating point error', function () {
            // str === 20.887999999999998
            assert.isGreaterThan(6, str.length);
        });

        Block.it('rounds to the nearest 1000th', function () {
            assert.isEqual(6, result.toString().length);
        });

        Block.it('returns a price 2/100 lower than the midpoint', function () {
            assert.isEqual(10.424, result);
        });
    });
});

// Test errors, including assertion errors are reported here.
runner.on('error', function (err) {
    console.error('Test Error:');
    console.error(err.stack || err.message);
});

runner.on('blockStart', function (block) {
    console.log(block);
    // Example output:
    // {
    //  type: 'test',
    //  parents: [ 'Purchasing', 'getMarketPurchasePrice' ],
    //  test: 'rounds to the nearest 1000th'
    // }
});

runner.on('blockComplete', function (block) {
    console.log(block);
    // Example output:
    // {
    //  type: 'test',
    //  parents: [ 'Purchasing', 'getMarketPurchasePrice' ],
    //  test: 'rounds to the nearest 1000th'
    // }
});

runner.on('end', function () {
    console.log('Testing complete');
});

// Finally, run our tests.
runner.run();

```

Copyright and License
---------------------
Copyright: (c) 2017 by Kris Walker (www.kixx.name)

Unless otherwise indicated, all source code is licensed under the MIT license. See MIT-LICENSE for details.

