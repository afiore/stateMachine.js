
if (typeof module !== 'undefined' && module.exports) {
  var _ = require('underscore');
  var EventEmitter = require('../../vendor/EventEmitter');
  var StateMachine = require('../../lib/state-machine');
}

var Door = function (spyOnMethods) {
    spyOnMethods = spyOnMethods || [];
    var door = new StateMachine();
    door.name = _.uniqueId('door_');

    _.each(spyOnMethods, function (method) {
      door[method] = jasmine.createSpy(method + 'spy');
    });

    door.initialize(function () {
        this.addState('opened', undefined, this.onExitOpened);
        this.addState('closed', this.onEnterClosed);
        this.addTransition('close', {from:'opened', to: 'closed'}, this.onClose);
        this.addTransition('open',  {from:'closed', to: 'opened'});
    });
    return door;
   };

describe('StateMachine', function () {

    it("The initial machine state should be the one declared first", function () {
      var door = Door();
      expect(door.currentState()).toBe('opened');
    });

    it("Should change state when a transition is executed", function () {
      var door = Door();
      door.close();
      expect(door.currentState()).toBe('closed');
      door.open();
      expect(door.currentState()).toBe('opened');
    });

    it("Should allow to create multiple instances", function () {
      var door1 = Door(), door2 = Door();
      door1.close();
      expect(door1.currentState()).toBe('closed');
      expect(door2.currentState()).toBe('opened');
    });

    it("Should bind and call the onEnter and onExit state callbacks", function () {
      var door = Door(['onExitOpened','onEnterClosed','onClose']); 
      door.close();
      expect(door.onExitOpened).toHaveBeenCalled();
      expect(door.onEnterClosed).toHaveBeenCalled();
      expect(door.onClose).toHaveBeenCalled();
    });


    it("Should throw an error if, given the instance's current state, a transition is not possible", function () {
      var door = Door();
      door.close();
      expect(function () { door.close();}).toThrow(new Error(
        "Cannot execute transition 'close', current state is 'closed'"
      ));
    });

    it("It should fire two events ('state:close', and 'state-changed') when a transition is exectued", function() {
      var door = Door(),
          onClosed = jasmine.createSpy('onClosed-spy'),
          onStateChanged = jasmine.createSpy('onStateChange-spy');

      door.on('state:closed', onClosed);
      door.on('state-change', onStateChanged);
      door.close();
      expect(onClosed).toHaveBeenCalled();
      expect(onStateChanged).toHaveBeenCalledWith('closed',undefined);
    });


});

