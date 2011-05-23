if (typeof module !== 'undefined' && module.exports) {
  var _              = require('underscore'),
      VendingMachine = require('../../example/vending-machine'),
      instance;
}

describe('VendingMachine', function () {
  beforeEach(function () {
    instance = new VendingMachine();
    instance.switchOn();
  });
  afterEach(function () {
    instance = null;
  });

  it('should be switched on', function () {
    expect(instance.currentState()).toBe('on');
  });
  it('#buy("banana") should do nothing if money has not been loaded', function() {
      instance.buy('banana');
      expect(instance.currentState()).toBe('on');
  });
  it('#insertCoints(3) should generate a transition to the "money-loaded" state', function () {
    instance.insertCoints(3);
    expect(instance.currentState()).toBe('money-loaded');
  });
  it('#insertCoints("FAKE") should not trigger the #selectProduct() transition', function () {
    instance.insertCoints('FAKE');
    expect(instance.currentState()).toBe('on');
  });
  it('#insertCoints(3); #buy("banana") should not complete a transaction', function () {
    spyOn(instance, 'endTransaction');
    instance.insertCoints(3);
    instance.buy('banana');
    expect(instance.endTransaction).not.toHaveBeenCalled();
    expect(instance.currentState()).toBe('money-loaded');
  });
  it('#insertCoints(6); #buy("banana") should complete it instead', function () {
    spyOn(instance,'_returnChange');
    instance.insertCoints(6);
    instance.buy('banana');
    expect(instance.currentState()).toBe('on');
    expect(instance._returnChange).not.toHaveBeenCalled();
  });
  it('#insertCoints(8); #buy("banana") should return the right change', function () {
    spyOn(instance,'_returnChange');
    instance.insertCoints(8);
    instance.buy('banana');
    expect(instance._returnChange).toHaveBeenCalledWith(2);
  });


});
