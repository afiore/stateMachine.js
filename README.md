# StateMachine.js

My own JavaScript re-interpretation of the Ruby on Rails' pluging [Acts as a state machine](https://github.com/rubyist/aasm), designed to run on both node and the browser.
This is implemented as a prototype providing a convenient mechanism for defining a set of internal machine states as well as a set of valid transitions between them.


### API

#### States

    currentState()

Getter method to obtain the object's current state.

    addState(state, onEnter, onExit)

Defines a machine state.

**Parameters:**

- _state_: the name of a state (String).
- _onEnter:_ a callback  to be executed when the object enters the present state (Function, optional). 
- _onExit:_ a callback  to be executed when the object leaves the present state (Function, optional).

When entering a state, the object will use the EventEmitter API to fire two events:

- `state:<state-name>` an event notifying listeners that the machine has entered a specific state (will also pass a data value when the onEnter function returns a value). 
- `state-change` a generic event suitable for listening to several state changes with a single function.

    vendingMachine.on('state-change', function onStateChange(enteringState, data) {
      switch (enteringState) {
        case 'money-loaded':
          console.info('money has been loaded');
          break;
        case 'off':
          ...
      } 
    });

#### Transitions

    addTransition(transitionName, fromTo, onTransition)

Defines a valid transition between machine states and implements it dynamically as a callable instance method.

**Parameters:**

- _transitionName:_ the name of the transition (String) and of the instance.
- _fromTo:_  An object mapping from what to what states the machine may transit (Object). While the `from` key may be either a string or an array of multiple strings, the value of the `to` key must always be a single string.
- _onTransition:_ a callback to be executed after the transition.

A transition method will throw an error if the instance is not on one of its valid states (that is, one of the values specified in the `from` value of `fromTo` map).


**Notes:**

- The object's initial state will default to the one added first.
- In both `addState` and `addTransition` callbacks, the value of `this` is automatically bound to the instance object.
- If the `onEnter` or the `onTransition` callbacks return a value, this is passed along to event listeners as the `data` argument (see the `onStateChange` function above).

### Usage example


### Dependencies

* DocumentCloud's [underscore.js]() utility belt.
* Oliver Caldwell's implementation of [EventEmitter]().

###

Building


### Running tests

In node:
    npm install -g jasmine-node
    cd <project_path>/test && jasmine-node specs

In the browser, just open `test/index.html` (both the HTTP:// and the file:// protocols will work).

### TODO
