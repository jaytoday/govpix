
/**
 *
 *  a minimal js test frame work
 *
 *  tsetse.TestSet is probably my favorite classname ever.
 *
 */
if (typeof tsetse == 'undefined')
    tsetse = {};

// low-level logging function
tsetse._log = function(div, level, args) {
    //if (console && console.debug)
    //    console.log('TSETSE._LOG', div, level, args);
    if (typeof div == 'undefined' || div === null)
        div = document.getElementsByTagName('body')[0];
    var msg = document.createElement('div');
    msg.className = 'message ' + level;
    for (var i = 0; i < args.length; i++) {
        var arg = args[i];
        if (typeof arg !== 'string')
            arg = rison.encode(arg);

        var argelt = document.createElement('span');

        // XXX remove mjt ref
        argelt.innerHTML = mjt.htmlencode(arg);
        msg.appendChild(argelt);
    }
    div.appendChild(msg);
};

/**
 *  log all arguments (like firebug)
 */
tsetse.log = function() {
    return tsetse._log(null, 'log', arguments);
};

/**
 *  log warning, printing all arguments (like firebug)
 */
tsetse.warn = function() {
    return tsetse._log(null, 'warn', arguments);
};

/**
 *  log error, printing all arguments (like firebug)
 */
tsetse.error = function() {
    return tsetse._log(null, 'error', arguments);
};


/**
 *  a list of all testsets that have been created
 */
tsetse.all_testsets = [];


/**
 * parse a www-form-urlencoded string into a dict.
 *
 * this should be identical to mjt.formdecode
 */
tsetse.formdecode = function (qstr) {
    if (typeof qstr == 'undefined' || qstr == '')
        return {};

    var qdict = {};
    var qpairs = qstr.split('&');
    for (var i = 0; i < qpairs.length; i++) {
        var m = /^([^=]+)=(.*)$/.exec(qpairs[i]);

        if (!m) {
            tsetse.warn('bad uri query argument, missing "="', qpairs[i]);
            continue;
        }

        // decodeURIComponent doesnt handle +
        var k = decodeURIComponent(m[1].replace(/\+/g,' '));
        var v = decodeURIComponent(m[2].replace(/\+/g,' '));
        qdict[k] = v;
    }
    return qdict;
};


//////////////////////////////////////////////////////////////////////

/**
 *  @class an ordered group of tests
 */
tsetse.TestSet = function (id) {
    this.testset_id = id;
    this.test_names = []
    this.tests = {};
    tsetse.all_testsets.push(this);
};


/**
 *  add a test to the testset.
 *
 *  @param name  the name of the test (should be a valid js identifier)
 *  @param f     a function to run the test, called with this=new Test().
 */
tsetse.TestSet.prototype.def = function(name, f) {
    this.tests[name] = new tsetse.Test(this, name, f);
    this.test_names.push(name);
};

/**
 *  this provides a way to comment out a test.def() temporarily
 */
tsetse.TestSet.prototype.notdef = function(name, f) {
};

/**
 *  run all the tests in the testset
 */
tsetse.TestSet.prototype.run_all = function(shorts, div) {
    if (typeof div == 'undefined') {
        div = document.getElementsByTagName('body')[0];
    }

    if (typeof shorts == 'undefined') {
        shorts = document.createElement('div');
        div.appendChild(shorts);
    }

    for (var i = 0; i < this.test_names.length; i++) {
        var shortx = null;
        var name = this.test_names[i];
        var testdiv = document.createElement('div');
        div.appendChild(testdiv);

        var test = document.createElement('div');
        div.appendChild(testdiv);

        if (shorts) {
            shorts.className = 'short_indicators';
            shortx = document.createElement('span');
            shortx.innerHTML = '&nbsp;&nbsp;&nbsp;';
            shorts.appendChild(shortx);
        }

        this.tests[name].run(testdiv, shortx);
    }
};

/**
 *  clean up and complain about any tests that have
 *  neither succeeded nor failed.
 */
tsetse.TestSet.prototype.cleanup = function() {
    for (var i = 0; i < this.test_names.length; i++) {
        var name = this.test_names[i];
        var test = this.tests[name];
        if (test.state == 'wait') {
            test.warn('test timed out');
            test.fail()
        }
    }
};


/**
 *  @class one of these is created for each test that is run.
 *
 *  @param name  the name of the test (should be a valid js identifier)
 *  @param f     a function to run the test, called with this=new Test().
 */
tsetse.Test = function (testset, name, f) {
    this.state = 'init';
    this.testset = testset;
    this.test_id = 't__' + this.testset.testset_id + '_' + name;
    //this.index = this.testset.length;
    this.name = name;
    this.f = f;
    this.messagediv = null;
    this.indicator = null;
};

/**
 *  run this test
 */
tsetse.Test.prototype.run = function (div, shortx) {
    this.state = 'wait';
    this.messagediv = div;
    this.indicator = shortx || null;
    div.id = this.test_id;
    div.className = 'test_log';

    var msg = document.createElement('h4');
    msg.innerHTML = this.name;
    div.className = 'test_init';
    if (this.indicator)
        this.indicator.className = 'test_init';
    div.appendChild(msg);

    try {
        this.f();
    } catch (e) {
        this.fail('exception ', e.name, e.message,
                  e.fileName + ':' + e.lineNumber);
        throw e;
    }
}


tsetse.Test.prototype.log = function() {
    return tsetse._log(this.messagediv, 'log', arguments);
};

tsetse.Test.prototype.warn = function() {
    return tsetse._log(this.messagediv, 'warn', arguments);
};

tsetse.Test.prototype.error = function() {
    return tsetse._log(this.messagediv, 'error', arguments);
};

tsetse.Test.prototype.assert = function(b) {
    if (!b) {
        this.fail('assertion failed');
    }
    return this;
};

/**
 *  mark the test as succeeded
 */
tsetse.Test.prototype.ok = function () {
    if (this.state != 'wait') {
        this.warn('late ok(), was', this.state);
        return;
    }
    this.state = 'ok';
    this.messagediv.className = 'test_ok';
    if (this.indicator)
        this.indicator.className = 'test_ok';
    this.log('test ok', arguments);
};

/**
 *  mark the test as failed
 */
tsetse.Test.prototype.fail = function () {
    if (this.state != 'wait') {
        this.warn('late fail(), was', this.state);
        return;
    }
    this.messagediv.className = 'test_fail';
    this.state = 'fail';
    if (this.indicator)
        this.indicator.className = 'test_fail';
    this.warn('test fail', arguments);
};
