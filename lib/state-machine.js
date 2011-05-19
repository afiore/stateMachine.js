!function (context) {
  'use strict';


  //import underscore into the module scope when running node

  if (typeof module !== 'undefined' && module.exports) {
     this._ = require('underscore');
  }


  var stateMachine = {

  /*
   * Implements a state transition as an instance method.
   *
   * While changing the state, the method will also trigger the
   * 'onEnter' and the 'onExit' hooks (defined through addState),
   * as well as triggering the optional onTransition callback.
   * Finally, it will try to emit an event (this assumes that the instance
   * implements the evented-object trait).
   * 
   *
   * method             - name of the instance method.
   * enterState         - the entering state.
   * onTransition       - the optional transition callback.
   *
   *
   * returns nothing.
   */

   _implementInstanceMethod: function (method, fromTo, onTransition) {
    var from = fromTo.from,
        enterState  = fromTo.to,
        oldState    = this.currentState(),
        callbackMessage;


    // throw an error if method name is already defined
    if (method in this) {
      throw new Error("An instance method named '" + method +
                      "' already exists, cannot implement transition method");
    }

    this[method] = _.bind(function () {
      var onExit = this._getOnExit(this._currentState),
          onEnter = this._getOnEnter(enterState);

      //throw an error if transition is not allowed
      //(e.g. ...from primary school to Phd)

      if (! _.include(fromTo.from, this._currentState )) {
        throw new Error("Cannot execute transition '" + method +
                        "', current state is '"+ this._currentState + "'");
      }

      //run the onExit hook
      if (onExit) {
        onExit.call(this);
      }

      //set current state
      this._currentState = enterState;

      //run the onExit hook
      if (onEnter) {
        onEnter.call(this);
      }

      //run onTransition callback
      if (onTransition) {
        callbackMessage = onTransition.call(this);
      }

      // Emit state transition events
      //this._doEmit(enterState, callbackMessage);

    }, this);
  },

  /**
   * Wrapper for emitting events using either bean (browser) or node.js event emitter
   *
   * enterState - the entering state
   * exitState  - the exiting state
   * message    - the message to be sent with the event
   *
   */

  _doEmit: function (enterState, data) {
    //if the instance implements the evented object trait, use it
    if (this.emit) {
      //emit both a specific and a  generic event
      this.emit('state:'+enterState, data);
      this.emit('state-change', {
        currentState: enterState,
        data: data
      });
    }
  },


 /* Public:
  *
  * Adds a state to the state machine.
  *
  * state          - the state name
  * onEnter        - a callback to be executed before the object enters in this state (optional).
  * onExit         - a callback to be executed before the object leaves this state (optional).
  *
  */
  _addState: function (state, onEnter, onExit) {

    //first run... set first defined state as default
    if (_.isNull(this._currentState)) {
      this._currentState = state;

      //run onEnter callback
      if (onEnter) {
        onEnter.call(this);
      }

      // Emit
      //this._doEmit(this._currentState, null);
    }

    this._definedStates.push({
      name: state,
      onEnter: onEnter,
      onExit : onExit
    });

  },

  /**
   * Public:
   * Defines a state transition and implements it as a callable instance method.
   *
   * transition   - the name of the transition.
   * fromTo       - an object mapping the state change.
   *                from: one or several valid previous state names.
   *                to: one and only one state name.
   * onTransition - a callback function that will be executed with the transition (optional).
   *
   *
   */
  _addTransition: function (transition, fromTo, onTransition) {
    onTransition = onTransition || null;
    //always cast the 'from' attribute as an array
    if (_.isString(fromTo.from)) {
      fromTo.from = [fromTo.from];
    }
    this._validateTransitionStates(transition,fromTo);
    this._implementInstanceMethod(transition, fromTo, onTransition);
  },

  /*
   *
   * Gets the onExit function for a state
   *
   * state   - the state for which we want to retrieve a hook
   *
   */
   _getOnExit: function (state) {
     return this._getStateHook(state, 'onExit');
   },
  /*
   *
   * Gets the onExit function for a state
   *
   * state   - the state for which we want to retrieve a hook
   *
   */
   _getOnEnter: function (state) {
     return this._getStateHook(state, 'onEnter');
   },
  /*
   * Gets a state enter/exit hook function
   *
   * state         - the state for which we want to retrieve a hook
   * hookType      - whether this is an 'onEnter' or an 'onExit' hook
   *
   */
   _getStateHook: function (state, stateType) {
     var stateInfo = _.detect(this._definedStates, function (stateObj) {
       return stateObj.name === state;
     });
     if (stateInfo && stateType in stateInfo) {
       return stateInfo[stateType];
     }
  },
   /*
    * Makes sure that the states involved in the transition are defined.
    *
    * transition    - the transition name
    * fromTo        - the map of states involved
    *
    * returns nothing
    */
    _validateTransitionStates: function (transition, fromTo) {
      var fromToList = [],
          stateNames = _.pluck(this._definedStates,'name');
      _.each(['from','to'], function (attr) {
        if (! attr in fromTo) {
          throw new Error("Missing "+ attr + "key in '"+transition + "' transition");
        }
      });

      fromToList = _.uniq(_.flatten(
        fromTo.from.concat( [fromTo.to] )
      ));

      _.each(fromToList, function (state) {
        if (! _.include(stateNames, state)) {
          throw new Error("Undefined state "+ state + " in '"+transition+"' transition");
        }                                                                                            });
   },

   _currentState: null,
   _definedStates: [],

  /*
   * Public:
   * Gets the current machine state
   *
   *
   * returns a state identifier string.
   */
   currentState: function () {
     return this._currentState;
   },


  /*
   * Public:
   *
   * Defines and initialises the state machine.
   *
   * specFunction - a function defining the state machine states and transitions
   *
   * returns nothing
   *
   */

   stateMachine: function(specFunction) {
     var that = {
       addState: _.bind(this._addState, this),
       addTransition: _.bind(this._addTransition, this)
     };

     specFunction.apply(that);
   }

  };


   (typeof module !== 'undefined' && module.exports) ?
     (module.exports = stateMachine) :
     (context['stateMachine'] = stateMachine);

}(this);
