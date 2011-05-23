# StateMachine.js

Yet another JavaScript implementation of the *Act as a state machine* pattern, designed to run on both node.js and the browser.

### Dependencies

* DocumentCloud's [underscore.js]() utility belt.
* Oliver Caldwell's implementation of [EventEmitter]().


### Running tests

In node:
    npm install -g jasmine-node
    cd <project_path>/test && jasmine-node specs

In the browser, just open `test/index.html` (both the HTTP:// and the file:// protocols will work).
