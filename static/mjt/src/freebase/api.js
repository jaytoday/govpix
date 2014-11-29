
/**
 *  Freebase service definitions using JsonP()
 *
 *   uses:
 *     json.js:  mjt.json_from_js()
 *     jsonp.js: JsonP()
 *     service.js: define_task()
 *     util.js:  thunk(), formquote, log(), error()
 *
 */

/**
 *  an instance of this class represents www.freebase.com
 *
 *  @param {url} the service url - default 'http://www.freebase.com'
 *
 */
mjt.services.FreebaseService = function(url) {
    this.service_url = url || this.default_service_url;

    if (typeof this.SchemaCache != 'undefined') {
        this.schema_cache = new this.SchemaCache(this);
    }

    // check for same origin to see if XMLHttpRequest is allowed to service_url
    this.xhr_ok = false;
    var loc = window.location.protocol + '//' + window.location.host;

    if (this.service_url == loc)
        this.xhr_ok = true;
};


if (typeof mjt.freebase == 'undefined')
    mjt.freebase = mjt.services.FreebaseService.prototype;

(function () {

// convenience for definitions below.
var freebase = mjt.freebase;

freebase.default_service_url = 'http://www.freebase.com';

/**
 *  @class a task which depends on an external mjt.JsonP task.
 *
 */
freebase.FreebaseJsonPTask = mjt.define_task();

freebase.FreebaseJsonPTask.prototype.init = function() {
    this.service = this._factory;
}

/**
 *  make a single jsonp request to freebase.com
 *
 */
freebase.FreebaseJsonPTask.prototype.service_request = function(path, form) {
    var url = this.service.service_url + path;

    this.jsonp = mjt.JsonP();
    this.jsonp.set_timeout()
        .jsonp_request_form(url, form, 'callback')
        .onready('handle_envelope', this)
        .onerror('handle_error_jsonp', this);

    return this;
};


/**
 *  handle a jsonp response from freebase.com
 *
 */
freebase.FreebaseJsonPTask.prototype.handle_envelope = function (o) {
    //mjt.log('freebase.BaseTask.handle_envelope', this, o);
    if (o.code != '/api/status/ok') {
        var msg = o.messages[0];
        return this.error(msg.code, msg.message);
    }
    return this.response(o);
};


/**
 *  handle errors at the jsonp layer
 *
 */
freebase.FreebaseJsonPTask.prototype.handle_error_jsonp = function() {
    mjt.warn('JSONP ERROR', arguments);
    this.error.apply(this, arguments);
};

/**
 *  send the request
 *
 *  "subclasses" of BaseTask should override this
 *
 */
freebase.FreebaseJsonPTask.prototype.request = function() {
    mjt.error('must override BaseTask.request()');
};

/**
 *  "subclasses" of BaseTask should override this
 *
 */
freebase.FreebaseJsonPTask.prototype.response = function(o) {
    mjt.error('must override BaseTask.response()');
};


//////////////////////////////////////////////////////////////////////

/**
 *
 */
freebase.MqlRead = mjt.define_task(freebase.FreebaseJsonPTask,
                          [{name:'query'},
                           {name:'args', 'default':{}}]);

/**
 *
 */
freebase.MqlRead.prototype.build_envelope = function () {
    var envelope = {
        query: this.query,
        escape: false
    };

    if (this.query instanceof Array) {
        if (typeof this.args.cursor == 'undefined' ||
            typeof this.args.cursor == 'boolean') {
            envelope.cursor = true;  // always ask for it for arrays
            this.start = 0;
        } else {
            envelope.cursor = this.args.cursor;
            // in this case we can't know this.start -
            //  it gets set in .next() which probably called us here.
            // this.start = undefined;
        }

        this.requested_count = this.query[0].limit || 100;
    }
    return envelope;
};

/**
 *
 */
freebase.MqlRead.prototype.request = function () {
    var envelope = this.build_envelope();

    var s = mjt.json_from_js(envelope);
    return this.service_request('/api/service/mqlread', { query: s });
};

/**
 *
 */
freebase.MqlRead.prototype.response = function(o) {
    //mjt.log('RESPONSE', o);

    if (o.result === null)
        return this.empty_result();

    if (typeof o.cursor === 'string')
        this.next_cursor = o.cursor;

    if (o.result instanceof Array) {
        this.count = o.result.length;

        this.more_available = false;

        // was the last read shorter than requested?
        // did the last read return cursor == false?
        if (this.count >= this.requested_count
            && this.next_cursor != false)
            this.more_available = true;
    }

    return this.ready(o.result);
};


/**
 *  creates a new read request that continues this
 *   query using the returned cursor.  by default it
 *   requests the same number of results as the last
 *   query.
 *  @param {reqcount} how many more results to request
 *  @returns the new instance of MqlRead
 */
freebase.MqlRead.prototype.next = function (reqcount) {
    if (this.state !== 'ready') {
        throw new Error('MqlRead.next(): bad state ' + this.state);
    }

    if (!this.more_available) {
        // app shouldn't be asking for more
        mjt.warn('paging .next(): no more items', this);
        return null;
    }

    // we're going to mess with the toplevel .limit, but
    //  everything else we copy.
    var q = mjt.shallow_extend(this.query[0]);

    if (typeof reqcount != 'undefined') {
        // XXX consider doing reqcount+1 to cope with bad graph cursor api
        q.limit = reqcount;
    }

    var task = this.service.MqlRead([q], { cursor: this.next_cursor });
    task.start = this.start + this.count;

    return task;
};


//////////////////////////////////////////////////////////////////////

/**
 *  @class bundles multiple MqlReads into a single HTTP request.
 *  @constructor
 *
 */
freebase.MqlReadMultiple = mjt.define_task(freebase.FreebaseJsonPTask);

freebase.MqlReadMultiple.prototype.init = function () {
    this.reads = {};
};

/**
 *
 */
freebase.MqlReadMultiple.prototype.request = function () {
    var queries = {};
    for (var k in this.reads)
        queries[k] = this.reads[k].build_envelope();
    var s = mjt.json_from_js(queries);
    return this.service_request('/api/service/mqlread', { queries: s });
};

/**
 *  add a new query
 *
 *  @param key  identifies the subquery
 *  @param q    the mql subquery
 *
 */
freebase.MqlReadMultiple.prototype.mqlread = function (key, task) {
    this.reads[key] = task;
    return this;
};

/**
 *
 */
freebase.MqlReadMultiple.prototype.response = function (o) {
    //mjt.log('RESPONSE', o);

    for (var k in this.reads) {
        var task = this.reads[k];
        task.handle_envelope(o[k]);
    }
    return this.ready(o.result);
};


//////////////////////////////////////////////////////////////////////

/**
 *
 */
freebase.TransGet = mjt.define_task(freebase.FreebaseJsonPTask,
                           [{ name:'id' },
                            { name:'trans_type', 'default': 'raw' },
                            { name:'values', 'default': null }]);

/**
 *
 */
freebase.TransGet.prototype.request = function() {
    if (this.values === null) this.values = {};
    var path = '/api/trans/' + this.trans_type + this.id;
    return this.service_request(path, this.values);
};

/**
 *
 */
freebase.TransGet.prototype.response = function(o) {
    return this.ready(o.result);
};

})();
