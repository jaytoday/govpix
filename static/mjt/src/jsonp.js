/**
 *
 *  JSONP implementation using mjt.Task
 *
 *  includes several unusual features
 *   - generate JSONP callback= string using hash for better caching
 *   - javascript request cache
 *
 *  uses:
 *    service.js: all
 *    fetch.js:  dynamic_script and include_js_async()
 *    util.js:   thunk(), formencode(), uniqueid()
 *               makeArray(), isFunction(),
 *               log(), warn(), error()
 *    crc32.js:  hash()
 *
 */

mjt.JsonP = mjt.define_task();
mjt.JsonP._cb = {};

mjt.JsonP.prototype.init = function () {
    this._urlbase = null;
    this._cached_result = undefined;
    this._cbid = null;

    this._f = mjt.thunk('jsonp_ready', this);
    this._f._jsonp = this;

    this.url = null;

    return this;
};

/**
 *  set up the callback table entry.
 *
 *  setting it up means we own it and
 *  are responsible for maintainance
 *  and clean up here too.
 *
 */
mjt.JsonP.prototype.install = function () {
    //mjt.log('new jsonp', this._cbid);
    mjt.JsonP._cb[this._cbid] = this._f;

    // make sure we clean up afterward.
    var task = this;
    this.onready(function(o) {
        task.mark_done('result arrived successfully');
    });
    this.onerror(function(code, msg, full) {
        task.mark_done('error ' + code + ' ' + msg)
    });
};

/**
 *  send a jsonp request to a complete url
 *
 *
 */
mjt.JsonP.prototype.request = function () {
    var cb = mjt.JsonP._cb[this._cbid];

    if (typeof cb === 'undefined') {
        this.install();
    } else if (mjt.isFunction(cb)) {
        // found an existing request - subscribe to it
        // mjt.log('found jsonp', this._cbid, typeof cb);

        // piggy-back on the pre-existing task.
        //  this works well because jsonp passes its arguments
        //  through to ready() unmodified.  in this case we're
        //  doing the reverse.
        cb._jsonp.onready('jsonp_ready', this)
            .onerror('error_nest', this);
        return this;
    } else {
        mjt.error('bad state in callback table', this._cbid,
                  typeof cb, cb, mjt.isFunction(cb));
    }

    if (!this.url) {
        mjt.warn('jsonp.url should be set, not', this.url, this);
        this.url = this._urlbase;
    }

    if (1)
        mjt.dynamic_script(undefined, this.url);
    else
        mjt.include_js_async(this.url, function () {
            // this will fire before the timeout if the
            //  service returns non-200 or non-javascript.
            // should cancel the task if it's not already
            //  completed?
            mjt.log('script tag completed');
        });

    return this;
};

/**
 *  handle normal completion of a JSONP request
 *
 *  @param ... all arguments will be passed on to the ready() call
 */
// XXX varargs
mjt.JsonP.prototype.jsonp_ready = function () {
    // clear any timeout if present
    if (typeof(this._timeout) != 'undefined') {
        clearTimeout(this._timeout);
        this._timeout = null;
    }

    // pass all arguments through to each pending callback
    // XXX note this copy of the arguments array is shared
    //  across requests, it must really be deepcopied for
    //  each if you want to handle request rewriting.
    this._cached_result = mjt.makeArray(arguments);

    return this.ready.apply(this, this._cached_result);
};



mjt.JsonP.prototype.jsonp_request_form = function (url, form, callback_param) {
    var urlquery = typeof form == 'string' ? form : mjt.formencode(form);
    if (urlquery)
        url += '?' + urlquery;

    var cbstr = callback_param + '=' + this.generate_callback(url);
    // append the callback= argument to the url
    var qchar;
    if (/\?/.test(url))
        qchar = '&';
    else
        qchar = '?';

    this.url = url + qchar + cbstr;

    return this.enqueue();
};


/**
 *  generate a callback id
 *
 *  @param [urlbase]    an url describing the query
 *  @returns            the JSONP callback string
 */
mjt.JsonP.prototype.generate_callback = function (urlbase) {
    if (typeof urlbase == 'undefined') {
        this._cbid = mjt.uniqueid('cb');
        return 'mjt.JsonP._cb.' + this._cbid;
    }

    this._urlbase = urlbase;

    this._cbid = 'c' + mjt.hash(this._urlbase);

    // check that we don't have a hash collision.
    // if we do, we can fallback to mjt.uniqueid() without loss
    // of correctness, but we lose the cacheability.
    var cbsaved = mjt.JsonP._cb[this._cbid]
    if (typeof cbsaved === 'undefined')
        return 'mjt.JsonP._cb.' + this._cbid;

    if (typeof cbsaved !== 'function') {
        mjt.warn('bad jsonp callback in table', this._cbid, cbsaved);
        return null;
    }

    var jsonp = cbsaved._jsonp;

    // if urlbase matches, use the same
    if (jsonp._urlbase === this._urlbase)
        return 'mjt.JsonP._cb.' + this._cbid;

    // in the case of a hash collision we have to
    // suffer a bit.  it would be nice to re-use
    // mjt.JsonP._cb[cbid] for multiple responses, but there's
    // no good way to tell that the responses came from
    // a particular url.  so we have to generate a fresh
    // callback.  right now the colliding query isn't
    // really cacheable - that could be fixed by rehashing
    // instead of bailing to mjt.uniqueid()
    mjt.log('repeated hash?', this._cbid, form);

    // use a fresh cb and fall through.
    this._cbid = mjt.uniqueid('cb');

    return 'mjt.JsonP._cb.' + this._cbid;
};

/**
 *  handle completion - mark the request as completed already.
 *
 *  same for ready or error.
 */
mjt.JsonP.prototype.mark_done = function (reason) {
    //mjt.log('JSONPDONE', reason);
    var jsonp = this;
    mjt.JsonP._cb[this._cbid] = function () {
        mjt.log('JSONP already completed', jsonp._reason, '\nnew reason:', reason);
    };
    mjt.JsonP._cb[this._cbid]._jsonp = this;

    this._reason = reason;
    return this;
};

/**
 * create a dynamic script tag and appends it to HEAD
 *
 * @param [tag_id] string  an id= for the SCRIPT tag
 * @param [url]    uri     the src= url
 * @param [text]   string  literal javascript text
 * @returns    domelement  the new SCRIPT node
 *
 */
mjt.dynamic_script = function (tag_id, url, text) {
    var head = document.getElementsByTagName('head')[0];
    var tag = document.createElement('script');
    tag.type = 'text/javascript';
    if (typeof tag_id == 'string')
        tag.id = tag_id;
    if (typeof url !== 'undefined')
        tag.src = url;
    if (typeof text !== 'undefined') {
        // see http://tobielangel.com/2007/2/23/to-eval-or-not-to-eval
        if(/WebKit|Khtml/i.test(navigator.userAgent))
            throw new Error('safari doesnt evaluate dynamic script text');
        tag.text = text;
    }

    head.appendChild(tag);
    return tag;
};


/**
 * evaluate javascript code from a uri, and invoke a callback
 *  when done.
 *
 * @param url uri to fetch the javascript from.
 * @param k   function called when the load is complete.
 * @return undefined invokes k() with no arguments later.
 *
 * hopefully browser-independent function to generate a
 * dynamic <script> tag with completion callback.
 * this is needed when we don't get to send a callback= parameter.
 * i don't think this method reports http errors though.
 *
 * original from:
 *   <a href="http://www.phpied.com/javascript-include-ready-onload/">phpied.com</a>
 * safari iframe hack from:
 *   <a href="http://pnomolos.com/article/5/dynamic-include-of-javascript-in-safari">pnomolos.com</a>
 *
 * nix added completion function and hopeful safari future-proofing
 *
 */
mjt.include_js_async = function (url, k) {
    var js = mjt.dynamic_script(null, url);

    // Safari doesn't fire onload= on script tags.  This hack
    // loads the script into an iframe too, and assumes that the
    // <script> will finish before the onload= fires on the iframe.
    if(/WebKit|Khtml/i.test(navigator.userAgent)) {
        var iframe = mjt.dynamic_iframe();
        // Fires in Safari
        iframe.onload = k;
        document.getElementsByTagName('body')[0].appendChild(iframe);
    } else {
        // Fires in IE, also modified the test to cover both states
        js.onreadystatechange = function () {
            if (/complete|loaded/.test(js.readyState))
                k();
        }
        // Fires in FF
        // (apparently recent versions of webkit may fire this too - nix)
        js.onload = k;
    }
};
