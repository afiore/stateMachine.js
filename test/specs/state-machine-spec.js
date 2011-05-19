
if (typeof module !== 'undefined' && module.exports) {
  var _ = require('underscore');
  var stateMachine = require('../../lib/state-machine');
}


var Callbacks = function(){};
Callbacks.onExitOpened = jasmine.createSpy();
Callbacks.onEnterClosed =  jasmine.createSpy();
Callbacks.onClose = jasmine.createSpy();

var getSpec = function () {
      return function() {
        this.addState('opened', undefined, Callbacks.onExitOpened);
        this.addState('closed', Callbacks.onEnterClosed);
        this.addTransition('close', {from:'opened', to: 'closed'}, Callbacks.onClose);
        this.addTransition('open',  {from:'closed', to: 'opened'});
      };},

   //Pseudo constructor
    Door = function (name) {
      var instance = {name: name};

      _.extend(instance, stateMachine);
      instance.stateMachine(getSpec());
      return instance;
    },
    door;


describe('stateMachine', function () {

    it("The initial machine state should be the one declared first", function () {
      var door = Door('a');
      expect(door.currentState()).toBe('opened');
    });

    it("Should change state when a transition is executed", function () {
      var door = Door('b');
      door.close();
      expect(door.currentState()).toBe('closed');
      door.open();
      expect(door.currentState()).toBe('opened');
    });
    it("Should allow to create multiple instances", function () {
      var door1 = Door('c'), door2 = Door('d');
      door1.close();
      expect(door1.currentState()).toBe('closed');
      expect(door2.currentState()).toBe('opened');
    });

    it("Should bind and call the onEnter and onExit state callbacks", function () {
      var door;


      door = Door(); 
      door.close();
      expect(Callbacks.onExitOpened).toHaveBeenCalled();
 //     expect(callbacks.onExitOpened.thisValues[0].currentState).toBeDefined();
      expect(Callbacks.onEnterClosed).toHaveBeenCalled();
 //     expect(callbacks.onEnterClosed.thisValues[0].currentState).toBeDefined();
      expect(Callbacks.onClose).toHaveBeenCalled();
 //     expect(callbacks.onClose.thisValues[0].currentState).toBeDefined();
    });
    it("Should throw an error if, given the instance's current state, a transition is not possible", function () {
      var door = Door();
      door.close();
      expect(function () { door.close();}).toThrow(new Error(
        "Cannot execute transition 'close', current state is 'closed'"
      ));
    });
});


