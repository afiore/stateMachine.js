!function (context) {
  'use strict';

  if (typeof module !== 'undefined' && module.exports) {
    this._ = require('underscore');
    this.StateMachine = require('../lib/state-machine');
  }

  function VendingMachine () {
    StateMachine.call(this);
    //product name => price
    this._productPrices = {
      apple: 5,
      banana: 6,
      carot: 3
    };
    //attributes
    this._moneyLoaded = 0;
    this._selectedProduct = null;
    this._timeout = null;

    //methods
    this.insertCoints = function (amount) {
      amount = parseInt(amount,10);
      if (amount > 0) {
        this._moneyLoaded = amount;
        this.loadMoney();
      }
    };

    this.buy = function (product) {
      if (!product in this._productPrices) {
        throw new Error("Product " + product + " is not available");
      }

      if (this._moneyLoaded >= this._productPrices[product]) {
      //perform transition
        this.selectProduct();
        this._selectedProduct = product;
        this.endTransaction();
      }
    };

    this._calculateChange = function () {
      var productPrice = this._productPrices[this._selectedProduct],
          changeDue = this._moneyLoaded - productPrice;

      if (changeDue) {
        this._returnChange(changeDue);
      }
    };

    this._returnChange = function (change) {
      alert('returning change:'+change);
    };

    this.initialize(function () {
      //states
      this.addState('off');
      this.addState('on');
      this.addState('money-loaded');
      this.addState('product-selected');
      //transitions
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


   if (typeof module !== 'undefined' && module.exports) {
     module.exports = VendingMachine;
   }
     else {
     context.VendingMachine = VendingMachine;
   }

}(this);
