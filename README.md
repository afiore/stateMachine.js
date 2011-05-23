# StateMachine.js

My own JavaScript re-interpretation of Ruby on Rails' pluging [Acts as a state machine](https://github.com/rubyist/aasm), designed to run on both node and the browser.
Provides a convenient mechanism for defining a set of machine states and the possible transitions between them.

## Usage


    function VendingMachine () {
      StateMachine.call(this);
      ...
      this.initialize(function () {
        this.addState('off');
        this.addState('on');
        this.addState('money-loaded');
        this.addState('product-selected');

        this.addTransition('switchOn', {
          from: 'off',
          to: 'on'
        });
        this.addTransition('switchOff', {
          from: 'on',
          to: 'off'
        });
        this.addTransition('loadMoney', {
            from: 'on',
            to: 'money-loaded'
          },
          function () {
            var self = this;
            //reset timeout if one already has been set
            if (this._timeout) {
              clearTimeout(this._timeout);
            }
            this._timeout = setTimeout(function () {
              self.endTransaction();
            }, 120000);
          }
        );
        this.addTransition('selectProduct', {
          from: 'money-loaded',
          to: 'product-selected'
        });
        this.addTransition('endTransaction', {
             from: ['product-selected', 'money-loaded'],
             to: 'on'
           },
           function () {
             this._calculateChange();
             this._selectedProduct = null;
             this._moneyLoaded = 0;
           }
        );
      });
    }
    _.extend(VendingMachine.prototype, StateMachine.prototype);

See [example/vending-machine.js](https://github.com/afiore/stateMachine.js/blob/master/example/vending-machine.js) for the complete snippet.

## API

### States

    currentState()

Returns the instance's current state.

---

    addState(state, onEnter, onExit)

Defines a machine state.

Parameters:

- _state_: the name of a machine state (String).
- _onEnter:_ a callback to be executed when the object enters the state (Function, optional).
- _onExit:_ a callback to be executed when the object leaves the state (Function, optional).

Events:

When entering a state, the object will fire two events using the [EventEmitter](http://nodejs.org/docs/v0.4.7/api/events.html) API:

- `state:<state-name>`: an event suitable for handling a single specific state change (will also pass along a `data` argument if the `onEnter` callback returns a value).
- `state-change`: a generic event suitable for handling several state changes through a single function.

event listener example:

        vendingMachine.on('state-change', function onStateChange(enteringState, data) {
          switch (enteringState) {
            case 'money-loaded':
              console.info('money has been loaded');
              break;
            case 'off':
            ...
          }
        });

### Transitions

    addTransition(transitionName, fromTo, onTransition)

Defines a valid transition between machine states and implements it as an executable instance method.

Parameters:

- _transitionName:_ the name of the transition and of the method thereof (String).
- _fromTo:_  An object mapping from what to what internal states the machine may transit (Object). 
  While the `from` key may be either a string or an array of multiple strings, the value of the `to` key must always be a single string.
- _onTransition:_ a callback to be executed after the state change.

A transition method will always throw an error if the instance's current state is not valid for that specific transition (that is, if the value returned by `#currentState()` is not one of those specified in the `from` value of `fromTo` parameter).

---

Notes:

- The object's initial state is implicitly set to the one added first.
- In both `addState` and `addTransition` callbacks, the value of `this` is automatically bound to the instance object.
- If the `onEnter` or the `onTransition` callbacks return a value, this is passed along to event listeners as the `data` argument (see the `onStateChange` function in the example above).

## Dependencies

StateMachine.js requires the following third party libraries:

* DocumentCloud's [underscore.js](http://documentcloud.github.com/underscore) (JavaScript functional programming utility belt).
* Oliver Caldwell's cross-platform implementation of nodejs [EventEmitter](https://github.com/Wolfy87/EventEmitter/) API.
* [Jasmine](https://github.com/pivotal/jasmine) and [Jasmine-node](https://github.com/pivotal/jasmine-nodejs) (Unit testing)


## Running the test suite

In nodejs:

    npm install -g underscore jasmine-node
    cd <project_path>/test && jasmine-node specs

In the browser, just open `test/index.html` (both the HTTP:// and the file:// protocols will work).

## TODO

- Allow to define custom conditions (elsewhere dubbed *guards*) whereby transitions may or may not be executed.
- Write more examples.
- Make the API more dry.
