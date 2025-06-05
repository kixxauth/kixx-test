Kixx Test
=========
A small framework for writing tests in JavaScript environments.

Created by [Kris Walker](https://www.kriswalker.me) 2017 - 2025.

For usage examples and guidelines, see `examples/README.md`.

There is a reference script for setting up and running a folder of tests in `/test/run-tests.js`.

## Environment Support

| Env     | Version    |
|---------|------------|
| ECMA    | >= ES2022  |
| Node.js | >= 16.13.2 |
| Deno    | >= 1.0.0   |

This library is designed for use in an ES6 module environment requiring __Node.js >= 16.13.2__ or __Deno >= 1.0.0__. You could use it in a browser, but there are no plans to offer CommonJS or AMD modules. It targets at least [ES2022](https://node.green/#ES2022) and uses the optional chaining operator `?.`.

If you're curious: Node.js >= 16.13.2 is required for [ES6 module stabilization](https://nodejs.org/dist/latest-v18.x/docs/api/esm.html#modules-ecmascript-modules) and [ES2022 support](https://node.green/#ES2020).

Please don't bother running benchmarks on this library. Correctness and readability are design objectives. Conserving CPU cycles is not. It is very unlikely any utilities in this library would have a measureable performance impact on your application, and if they did you should probably be implementing something more optimized to your specific use case.

__Note:__ There is no TypeScript here. It would be waste of time for a library as small as this.

Copyright and License
---------------------
Copyright: (c) 2017 - 2025 by Kris Walker (www.kriswalker.me)

Unless otherwise indicated, all source code is licensed under the MIT license. See LICENSE for details.
