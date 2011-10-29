
/**
 *  asynchronous task framework
 *
 *  a task works like a callback but with more goodies.
 *  tasks provide:
 *   - a simple state machine: 'init' -> 'wait' -> ( 'ready' or 'error' )
 *   - separate .onready(...) and .onerror(...) callbacks.
 *     callbacks can be specified as functions or as bound methods
 *     using the syntax of mjt.vthunk().
 *   - optional timeout
 *   - optional prerequisites (other tasks that must be ready)
 *   - chaining of the above functions (inspired by jQuery)
 *
 *  uses:
 *    util.js
 *
 */


// unique value to signal ok constructor usage
mjt._safe_constructor_token = ['safe_constructor_token'];




// unique value to signal that the object has already
// been constructed and a new one shouldn't be created.
// this is a backwards compatability hack.
mjt._init_existing_token = ['init_existing_token'];


/**
 *  @class a class representing an asynchronous task
 *
 *  the state machine cycle of a task is
 *    init --> wait --> ( ready | error )
 *
 *  you can request a callback for either or both of
 *    the two final states.  if the callback is another
 *    instance of mjt.Task, it will use a special interface?
 *
 *  @see mjt.Task.onready
 *  @see mjt.Task.onerror
 *  @see mjt.Task.ondone
 *
 *  @constructor this constructor should never be called explicitly.
 *
 */
mjt.Task = function () {
    // nothing should be done in here - this used as a base class
    // use mjt.Task.prototype.init for initializing instance vars

    if (arguments.length !== 1 ||
        arguments[0] !== mjt._safe_constructor_token) {
            mjt.error('new mjt.Task() is illegal');
            throw new Error("don't call mjt.Task()");
   }
};

/**
 *  string pretty-printer
 */
mjt.Task.prototype.toString = function() {
    return '[' + this._task_id + ']';
};

/**
 *  html pretty-printer
 */
mjt.Task.prototype.toMarkup = function () {
    return '<span class="mjt_task">task '
        + this._task_id + ':' + this.task.state + '</span>';
};



/**
 *  Return a new task factory function.
 *
 *  @param sooper a superclass task type, or undefined/null/false
 *  @param params a list of parameter declarations.
 *  @returns a Task type - this should be called without "new"
 *
 *  @see mjt.Task.prototype.init
 */
mjt.define_task = function(sooper, params) {
    var task_ctor = function () {
        var obj;
        var args = mjt.makeArray(arguments);

        // called with new: check that this was intentional
        if (this instanceof arguments.callee) {
            // mjt.log('CTORCALL', arguments.callee);
            /*
            if (args.length > 0 &&
                args[0] === mjt._init_existing_token) {
                args.shift();
                obj = args.shift();
                obj._factory = this;
            } else */ if (args.length !== 1 ||
                args[0] !== mjt._safe_constructor_token) {
                //mjt.error('Task class should not be invoked with new ()');
                throw new Error('Task class should not be invoked with new ()');
            } else {
                // called internally: do nothing
                return undefined;
            }
        } else if (args.length > 0 && args[0] === mjt._init_existing_token) {
            // this case is only used by the blobgettask compat wrapper
            // and could go away...
            args.shift();
            obj = args.shift();
            obj._factory = this;
        } else {

            // called without new
            // recursively invoke ourselves as a constructor
            //  to set obj.__proto__=ctor.
            // we deliberately use "new" here to skip any
            //  instance initialization.
            obj = new arguments.callee(mjt._safe_constructor_token);
            obj._factory = this;

            //mjt.log('FUNCALL', arguments.callee);
        }

        // invoke the constructors from base to leaf.
        //  this means reversing the inheritance chain first.
        var tmpa = [];
        for (var tmp = obj.__proto__;
                 tmp !== Object.prototype;
                 tmp = tmp.__proto__) {
            tmpa.push(tmp);
        }
        while (tmpa.length) {
            var proto = tmpa.pop();
            if (proto.hasOwnProperty('init'))
                proto.init.apply(obj, args);
        }
        return obj;
    };

    // set up a superclass
    if (!sooper)
        sooper = mjt.Task;

    // the subclass prototype is an instance of the superclass
    task_ctor.prototype = new sooper(mjt._safe_constructor_token);

    task_ctor.prototype.parameters = params || [];
    return task_ctor;
};



/**
 *  the default timeout for set_timeout, in milliseconds.
 *  this is currently set to 10 seconds.
 *  the value has not been tuned for general use.
 *  the freebase.com service will usually time out a
 *   request after 8 seconds so longer than that.
 *
 *  @type int (milliseconds)
 *  @see mjt.Task.set_timeout
 */
mjt.Task._default_timeout = 10000;

/**
 *  a dict of tasks that are in wait state.
 *
 */
mjt.Task.pending = null;

// waiting callbacks
mjt.Task._on_pending_empty = [];

/**
 *  return a new mjt.Task that will notify when
 *   the list of pending tasks becomes empty.
 *
 */
mjt.Task.await_pending_empty = function () {
    var t = mjt.Task();

    if (this.pending === null)
        return t.ready();
    this._on_pending_empty.push(t);
    return t;
};

/**
 *  add a task to the pending list
 *
 */
mjt.Task.add_pending = function (task) {
    if (this.pending === null)
        this.pending = {};
    this.pending[task._task_id] = task;
};

/**
 *  remove a task from the pending list, and notify
 *  if the pending list is empty.
 *
 */
mjt.Task.delete_pending = function (task) {
    delete this.pending[task._task_id];
    var pending_empty = true;
    for (var pk in this.pending) {
        pending_empty = false;
        break;
    }
    if (pending_empty)
        this.pending = null;

    while (this.pending == null && this._on_pending_empty.length)
        this._on_pending_empty.shift().ready();
};


mjt.Task.show_pending = function() {
    // warn about any remaining pending tasks
    for (var k in this.pending) {
        var task = this.pending[k];
        mjt.warn('task still pending', k, task);
    }
}

/**
 *  set up instance variables from this.parameters and arguments
 *
 *  @param ... arguments are interpreted according to this.parameters
 *  @returns this
 *  this[param.name] is set for each argument
 *
 *  right now parameters only have .name but later
 *  they may have defaults and docstrings.
 *
 */
mjt.Task.prototype.init = function() {
    //mjt.log('TASK INIT', this.parameters, arguments);

    mjt.assert(typeof this.state === 'undefined');
    this.state = 'init';

    this._onready = [];
    this._onerror = [];
    this._timeout = null;
    this._prereqs = {};

    var idseed = this._task_class ? this._task_class : 'task';
    //mjt.note('TASK', idseed, this, this.__proto__);

    this._task_id = mjt.uniqueid(idseed);

    mjt.Task.add_pending(this);

    for (var i = 0; i < this.parameters.length; i++) {
        var param = this.parameters[i];
        this[param.name] = typeof arguments[i] != 'undefined'
            ? arguments[i] : param['default'];
    }
    return this;
};


/**
 *  set a failure timeout on a task
 *
 */
mjt.Task.prototype.set_timeout = function (msec) {
    if (typeof msec === 'undefined')
        msec = mjt.Task._default_timeout;

    if (this._timeout !== null)
        mjt.error('timeout already set');

    this._timeout = setTimeout(mjt.thunk('timeout', this), msec);

    return this;
};

mjt.Task.prototype.clear_timeout = function () {
    // clear any timeout if present
    if (this._timeout !== null) {
        clearTimeout(this._timeout);
        this._timeout = null;
    }

    return this;
};



/**
 *  add a task dependency.
 *
 * if you only depend on one task, it's probably simpler
 *  to just use onready and onerror on that task.  if you
 *  have to wait for multiple tasks to succeed before
 *  finishing, use this.
 *
 * @see mjt.Task.enqueue
 * @see mjt.Task.request
 *
 * if any prereq tasks go into error state, so does this.
 * when *all* required tasks are ready, this.request() is called.
 * otherwise, wait.
 *
 * @parm task  the task depended upon
 */
mjt.Task.prototype.require = function (prereq) {
    // if we are already ready, adding prereqs is illegal
    if (this.state !== 'init')
        throw new Error('task.enqueue() already called - too late for .require()');

    // avoid dependency bookkeeping if prereq is already ready
    if (prereq.state == 'ready')
        return this;

    // if we are already in error state, we're not going anywhere.
    if (this.state == 'error')
        return this;

    // ok, we're in wait state

    // pass on any immediate errors
    if (prereq.state == 'error')
        return this._prereq_error(prereq);

    // ok, we're both in wait state.  set up the dependency.
    this._prereqs[prereq._task_id] = prereq;
    prereq
        .onready('_prereq_ready', this, prereq)
        .onerror('_prereq_error', this, prereq)

    return this;
};

/**
 *  declare that no more prereqs are needed.
 *
 *  you *must* call this if you have called .require(),
 *   or the ready state will never be reached.
 *
 * @parm task  the task depended upon
 *
 * @see mjt.Task.require
 */
mjt.Task.prototype.enqueue = function () {
    if (this.state == 'error')
        return this;

    if (this.state !== 'init') {
        mjt.warn('enqueue() called twice?');
    }

    this.state = 'wait';

    return this._prereqs_check();
};

mjt.Task.prototype._prereqs_check = function () {
    // if prereqs have been cleaned out, we already did this
    if (this._prereqs === null)
        return this;

    // if there are any remaining prereqs, bail
    for (var prereq in this._prereqs)
        return this;

    if (this.state == 'init')
        return this;

    // looks like all prereqs are ready
    //  (since error prereqs cause errors immediately)
    this._prereqs = null;
    this.request();
    return this;
};


/**
 *  called when all prerequisites are ready
 *
 *  "subclasses" may override this method to
 *  do anything once prerequisites are ready.
 *
 *  many of the properties and methods here are
 *  marked hidden with _ prefixing to avoid namespace
 *  conflicts.  subclasses should avoid the _ prefix.
 *
 */
mjt.Task.prototype.request = function() {
    // should be overridden
    return this.ready();
};



// callback when a prerequisite task succeeds
mjt.Task.prototype._prereq_ready = function (prereq) {
    if (this._prereqs === null)
        return this;
    delete this._prereqs[prereq._task_id];
    return this._prereqs_check();
};

// callback when a prerequisite task fails
mjt.Task.prototype._prereq_error = function (prereq) {
    if (this._prereqs === null)
        return this;

    // errors get passed through immediately
    this._prereqs = null;
    var msg = prereq.messages[0];
    return this.error(msg.code, msg.message);
};


/**
 *  request a callback if the task reaches 'ready' state
 *
 */
mjt.Task.prototype.onready = function (THUNK_ARGS) {
    if (this.state == 'ready') {
        mjt.vcall(arguments, this.result);
    } else if (this._onready instanceof Array) {
        this._onready.push(mjt.vthunk(arguments));
    }
    return this;
};

/**
 *  request a callback if the task reaches 'error' state
 *
 */
mjt.Task.prototype.onerror = function (THUNK_ARGS) {
    if (this.state == 'error') {
        var code = this.messages[0].code;
        var message = this.messages[0].message;
        var full = this.messages[0].text;

        mjt.vcall(arguments, code, message, full);
    } else if (this._onerror instanceof Array) {
        this._onerror.push(mjt.vthunk(arguments));
    }
    return this;
};

/**
 *  request a callback if the task reaches
 *   either 'ready or 'error' state.
 *
 */
mjt.Task.prototype.ondone = function (THUNK_ARGS) {
    this.onready.apply(this, arguments);
    this.onerror.apply(this, arguments);
    return this;
};

// internal, common to ready() and error()
mjt.Task.prototype._state_notify = function (state, callbacks, args) {

    if (!mjt.Task.debug) {
        // fastpath if debug is turned off
        for (var i = 0; i < callbacks.length; i++) {
            var cb = callbacks[i];
            cb.apply(this, args);
        }
        return this;
    }

    mjt.openlog('TASK', state.toUpperCase(), ''+this, this);

    try {
        for (var i = 0; i < callbacks.length; i++) {
            var cb = callbacks[i];

            if (typeof cb.bound_func !== 'undefined')
                mjt.openlog('-on'+state, ''+cb.bound_this+'.', cb.bound_func, cb.bound_args, cb);
            else
                mjt.openlog('-on'+state, cb);
            try {
                cb.apply(this, args);
            } finally {
                mjt.closelog();
            }
        }
    } finally {
        mjt.closelog();
    }

    return this;
};


/**
 *   put the task in ready state, saving the result arg
 *
 */
mjt.Task.prototype.ready = function (result) {
    // XXX replace this with a wait and retry?
    if (this._prereqs !== null) {
        for (var k in this._prereqs) {
            if (typeof this._prereqs[k] == 'undefined')
                continue;

            mjt.error('task.ready() called with remaining prereqs', this);
            throw new Error('task.ready() called with remaining prereqs');
            break;
        }
    }

    // skipping .enqueue() is allowed if you have no prereqs
    if (this.state == 'init') {
        this._prereqs = null;
        this.state = 'wait';
    }

    if (this.state !== 'wait') {
        throw new Error('task.ready() called in bad state');
    }

    this._onerror = null;
    this.clear_timeout();
    this.state = 'ready';

    var callbacks = this._onready;
    this._onready = null;

    this.result = result;

    this._state_notify('ready', callbacks, [result]);

    mjt.Task.delete_pending(this);
    return this;
};

// internal
mjt.Task.prototype._error = function (messages, error_chain) {
    this._prereqs = null;
    this._onready = null;
    this.clear_timeout();

    var callbacks = this._onerror;
    this._onerror = null;

    //mjt.warn('task error', ''+this, messages);

    // skipping .enqueue() is allowed if you have no prereqs
    if (this.state == 'init') {
        this._prereqs = null;
        this.state = 'wait';
    }
    if (this.state !== 'wait') {
        throw new Error('task.error() called in bad state');
    }

    this.state = 'error';

    this.messages = messages;

    // nothing is done with this yet
    //  we only report the first error that caused a failure.
    this._error_chain = error_chain;

    var args = [messages[0].code, messages[0].message, messages[0].full];

    this._state_notify('error', callbacks, args);

    mjt.Task.delete_pending(this);
    return this;
};


/**
 *   put the task in error state, saving the error args
 *
 */
mjt.Task.prototype.error = function (code, message, full) {
    var messages = [{
        code: code,
        message: message,
        text: (typeof full !== 'undefined') ? full : ''
    }];
    return this._error(messages);
};

/**
 *   put the task in error state, passing the error
 *   through from another failed task.
 *
 */
mjt.Task.prototype.error_nest = function (failed_task) {
    return this._error(failed_task.messages, failed_task);
};



/**
 *   re-entry point if the task has a timeout set.
 *
 */
mjt.Task.prototype.timeout = function () {
    // the timeout has fired - erase the token so
    //  we don't try to cancel it later.
    this._timeout = null;

    return this.error('/user/mjt/messages/task_timeout',
                      'task timed out - possible unreachable server?');
};

/**
 *   convenience for empty result set error
 *
 */
mjt.Task.prototype.empty_result = function () {
    return this.error('/user/mjt/messages/empty_result',
                      'no results found');
};

/**
 *   convenience for unanticipated result types
 *
 */
mjt.Task.prototype.unanticipated  = function () {
    return this.error('/user/mjt/messages/unanticipated_format',
                      'unanticipated server return format');
};

mjt.Task.debug = mjt.debug;
