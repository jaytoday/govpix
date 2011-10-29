
/**
 *
 *  mjt utility library:
 *
 *
 *
 *  functions not needed for mjt.task should be moved out.
 */


if (typeof mjt == 'undefined')
    mjt = {};

if (typeof mjt.services == 'undefined')
    mjt.services = {};

/**
 * this can be set using
 *  mjt.debug=1
 * in the url query to drastically increase verbosity.
 */
mjt.debug = 0;


mjt.DEPRECATED = function() {
    mjt.warn('deprecated in this version of mjt');
};

/**
 * generate a unique id (within the history of this script)
 *  based on a prefix.
 */
mjt.uniqueid = function (prefix) {
    var id = mjt._next_unique_id[prefix];
    if (typeof id !== 'number')
        id = 1;
    mjt._next_unique_id[prefix] = id + 1;

    //return prefix + ':' + id;
    return prefix + '_' + id;
};
mjt._next_unique_id = {};


if (typeof console != 'undefined' && typeof console.debug == 'function') {
    // firefox with firebug, or other with firebug lite
    /**
     * report an error.  accepts any number and kind of arguments.
     *
     */
    mjt.error = function () {
        console.error.apply(console, arguments);
        return '';
    };
    /**
     * report a warning.  accepts any number and kind of arguments.
     *
     */
    mjt.warn = function () {
        console.warn.apply(console, arguments);
        return '';
    };
    /**
     * unconditionally log a message.
     * accepts any number and kind of arguments.
     *
     */
    mjt.log = function () {
        console.log.apply(console, arguments);
        return '';
    };
    /**
     * unconditionally log a message.
     *
     */
    mjt.note = function () {
        if (mjt.debug)
            console.log.apply(console, arguments);
        return '';
    };
    /**
     * open a group in the logging output, if the
     *  logging implementation supports that.
     *
     */
    mjt.openlog = function () {
        if (mjt.debug)
            console.group.apply(console, arguments);
        return '';
    };
    /**
     * close a group begun using mjt.openlog().
     *
     */
    mjt.closelog = function () {
        if (mjt.debug)
            console.groupEnd.apply(console, arguments);
        return '';
    };

    mjt.assert = function (b) {
        // test here so that we can put a breakpoint inside
        if (!b) {
            console.error.apply(console, arguments);
            throw new Error('assertion failed');
        }
        return '';
    };

} else {
    // other, including safari 2's botched console.log
    mjt.error    = function () { mjt.spew('error', arguments); return '';};
    mjt.warn     = function () { mjt.spew('warning', arguments);  return '';};
    mjt.log      = function () { return ''; };
    mjt.note     = function () { return ''; };
    mjt.openlog  = function () { return ''; };
    mjt.closelog = function () { return ''; };
    mjt.assert   = function () { return ''; };
}


/**
 *
 * The list of characters that are ok in URIs.
 * this set is ok in query arguments and fragment contexts.
 * It is also ok for an url subpath (but not as a single path segment,
 * because '/' is considered ok).
 *
 * mjt takes pains to generate good-looking urls, so
 * it uses a different uri-encoder than the usual encodeURIComponent.
 */
mjt._uri_ok = {
        '~': true,  '!': true,  '*': true,  '(': true,  ')': true,
        '-': true,  '_': true,  '.': true,  ',': true,
        ':': true,  '@': true,  '$': true,
        "'": true,  '/': true
};

/**
 * this is like encodeURIComponent() but quotes fewer characters.
 * encodeURIComponent passes   ~!*()-_.'
 * mjt.formquote also passes   ,:@$/
 */
mjt.formquote = function(x) {
    // speedups todo:
    //   regex match exact set of uri_ok chars.
    //   chunking series of unsafe chars rather than encoding char-by-char
    var ok = mjt._uri_ok;

    if (/^[A-Za-z0-9_-]*$/.test(x))  // XXX add more safe chars
        return x;

    x = x.replace(/([^A-Za-z0-9_-])/g, function(a, b) {
        var c = ok[b];
        if (c) return b;

        return encodeURIComponent(b);
    });
    return x.replace(/%20/g, '+');
};


/**
 * generate a www-form-urlencoded string from a dictionary
 *  undefined values are skipped, but empty-string is included.
 */
mjt.formencode = function(values) {
    var qtext = [];
    var sep = '';
    var k, v, ki, ks = [];

    // keys are sorted for cache-friendliness
    for (k in values)
        ks.push(k);
    ks.sort();

    for (ki in ks) {
        k = ks[ki];
        v = values[k];
        if (typeof v == 'undefined') continue;

        qtext.push(sep);
        sep = '&';
        qtext.push(mjt.formquote(k));
        qtext.push('=');
        qtext.push(mjt.formquote(v));
    }
    return qtext.join('');
};

/**
 * parse a www-form-urlencoded string into a dict
 */
mjt.formdecode = function (qstr) {
    if (typeof qstr == 'undefined' || qstr == '')
        return {};

    var qdict = {};
    var qpairs = qstr.split('&');
    for (var i = 0; i < qpairs.length; i++) {
        var m = /^([^=]+)=(.*)$/.exec(qpairs[i]);

        if (!m) {
            mjt.warn('bad uri query argument, missing "="', qpairs[i]);
            continue;
        }

        // decodeURIComponent doesnt handle +
        var k = decodeURIComponent(m[1].replace(/\+/g,' '));
        var v = decodeURIComponent(m[2].replace(/\+/g,' '));
        qdict[k] = v;
    }
    return qdict;
};

/**
 * create a GET url from a base url and form values
 */
mjt.form_url = function(base, values) {
    var q = values && mjt.formencode(values);
    if (q == '')
        return base;
    return base + '?' + mjt.formencode(values);
};

//////////////////////////////////////////////////////////////////////

/**
 *
 * escape <>&" characters with html entities.
 *
 *  escaping " is only necessary in attributes but
 *   we do it in all text.
 *
 */
mjt.htmlencode = function (s) {
    if (typeof(s) != 'string')
        return '<span style="color:red">' + typeof(s) + ' ' + s + '</span>';
    return s.replace(/\&/g,'&amp;')
        .replace(/\</g,'&lt;')
        .replace(/\>/g,'&gt;')
        .replace(/\"/g,'&quot;');
};

/**
 * apply a javascript function, trapping exceptions
 */
mjt.apply_safe = function (func, thiss, args) {
    mjt.openlog('apply_safe', func, args);

    // add catch handler
    //  - look for func.signature and other useful info
    //  - interact better with firebug?

    try {
        return func.apply(thiss, args);
    } finally {
        mjt.closelog();
    }
};


/**
 * get an element from an id or the actual element
 *  dig inside iframes too.
 */
mjt.id_to_element = function (top) {

    if (typeof(top) == 'string') {
        var e = document.getElementById(top);
        if (!e) {
            mjt.note('no element with id ' + top);
            return null;
        } else {
            top = e;
        }
    }

    if (top.nodeName == 'IFRAME') {

        var idoc = (top.contentWindow || top.contentDocument);

        if (idoc.document)
            idoc = idoc.document;

        top = idoc.getElementsByTagName('body')[0]
    }
    return top;
}



/**
 * remove all event handlers in elt and its siblings and children
 */
mjt.teardown_dom_sibs = function (elt, elt_only) {
    while (elt !== null) {
        for (var k in elt) {
            //if (!elt.hasOwnProperty(k)) continue;

            if (/^on/.exec(k))
                elt[k] = null;
        }

        var c = elt.firstChild;
        if (c != null)
            mjt.teardown_dom_sibs(c);

        if (elt_only)
            break;

        elt = elt.nextSibling;
    }
};

/**
 * this turns a js builtin arguments object into a more
 * convenient stack frame representation that includes the
 * arguments indexed by name.
 */
mjt.reify_arguments = function (signature, arguments) {
    var m = /^(\S+)\(([^)]*)\)$/.exec(signature);
    var name = m[1];
    var argnames = m[2].split(',');
    var argd = {};
    var extras = [];

    for (var i = 0; i < argnames.length; i++) {
        argd[argnames[i]] = arguments[i];
    }
    for (; i < arguments.length; i++) {
        extras.push(arguments[i]);
    }

    var r = {
        argnames: argnames,
        args: args,
        extra_args: extras,
        callee: arguments.callee
    };

    return r;
}


// used when building next cursor
/**
 *
 */
mjt.shallow_extend = function (d) {
    var newd = {};
    for (var k in d) {
        if (d.hasOwnProperty(k))
            newd = d;
    }
    return newd;
};

/**
 *  create a callback or continuation function that
 *   acts like a "bound method".
 *
 *  @param method  the name of the method to be invoked in obj,
 *                 or a function to be called as a method
 *                 or <i>null</i> if obj should be called as a function.
 *  @param obj     the instance whose method should be invoked,
 *                 or a function to be invoked.
 *  @param ...     additional arguments are also bound.
 *  @returns       a "thunk" function (or "bound method") that
 *                 will call obj[method] with the bound arguments,
 *                 followed by whatever additional arguments
 *                 were passed to the thunk.
 *
 *  the object, method key, and any other arguments
 *   are bound when mjt.thunk(method, obj, ...) is
 *   invoked.
 *
 */
mjt.thunk = function (method, obj) {
    return mjt.vthunk(arguments);
};


/**
 *  create a thunk.
 *
 *  utility for function currying.
 *    similar to .partial()
 *
 *  this is used to implement on* handlers that
 *   thunk or curry their arguments.  rather than
 *   accepting a single callback function argument,
 *   you can accept a bound method with a partial
 *   argument list.
 *
 *  @returns a thunk object in most cases, unless the
 *  argument is a single callback function in which
 *  case it is returned untouched.
 *
 *  a thunk is a function object with the following
 *  additional properties:
 *   thunk.bound_this
 *   thunk.bound_func
 *   thunk.bound_args
 *   thunk.thunk_id
 *
 *  vthunk has several call forms:
 *
 *    vthunk(arguments) or
 *    vthunk([arg0, ...]))
 *      if the first argument is an array, vthunk treats it
 *        as the argument list and then tries one of the
 *        forms below:
 *
 *    vthunk(bound_method_name, bound_this, bound_arg_0, ...)
 *      if the first argument is a string, vthunk treats it
 *        as a method name.  the second argument must be an
 *        object, which will be bound as this.
 *
 *      when thunk(call_arg_0, ...) is executed, this will happen:
 *        bound_this[bound_method_name](bound_arg_0, ..., call_arg_0, ...)
 *
 *    vthunk(bound_function, bound_arg_0, ...)
 *      otherwise the first argument must be a function.
 *      bound_this will be set to null.
 *
 *      when thunk(call_arg_0, ...) is executed, this will happen:
 *        bound_function(bound_arg_0, ..., call_arg_0, ...)
 *      (except this===null inside bound_function, rather than this===window)
 *
 *    vthunk(bound_function)
 *      in this case the thunk doesn't actually do much
 *      except slow down calls, so we return bound_function
 *      as the thunk itself.
 *      no annotation of the function object is done since
 *      it may be shared.
 *      because we're getting out of the way, bound_function
 *      will be called with this===window.
 *
 */
mjt.vthunk = function () {
    var bound_this, bound_func, bound_args;

    var arg0 = arguments[0];
    if (typeof arg0 == 'object' && typeof arg0.length == 'number') {
        bound_args = mjt.makeArray(arg0);
        // XXX do anything with args[1:]?
    } else {
        bound_args = mjt.makeArray(arguments);
    }

    arg0 = bound_args.shift();
    if (typeof arg0 == 'string') {
        bound_this = bound_args.shift();
        bound_func = arg0;

        // it's technically ok if bound_this[bound_func] doesn't exist yet,
        //  but probably an error
        if (!mjt.isFunction(bound_this[bound_func])) {
            mjt.warn('mjt.thunk:', bound_func, 'is not a method of', bound_this);
        }
    } else {
        // pass "this" through when the thunk is called
        bound_this = null;
        bound_func = arg0;

        // bound_func really should be a function
        if (!mjt.isFunction(bound_func)) {
            mjt.error('mjt.thunk:', bound_func, 'is not a function');
        }
    }

    // these are for debugging recognition only
    var thunk_id = arguments.callee._next_thunk_id || 1;
    arguments.callee._next_thunk_id = thunk_id + 1;

    var thunk = function() {
        //mjt.log('CALL THUNK', thunk_id, obj, method);

        var self = arguments.callee;
        var call_args = self.bound_args.concat(mjt.makeArray(arguments));
        var obj = self.bound_this===null ? this : self.bound_this;
        var func = self.bound_func;
        if (typeof func == 'string')
            func = obj[func];

        if (!mjt.isFunction(func)) {
            mjt.error('mjt.thunk: bad function', self, self.bound_func, obj);
        }

        return func.apply(obj, call_args);
    };

    // a thunk is a javascript Function, for speed and
    //   for most common usage.
    // but it's nice to treat it like an object in some ways.
    // so instead of just capturing the environment we explicitly
    // save the bits we need.
    thunk.bound_this = bound_this;
    thunk.bound_func = bound_func;
    thunk.bound_args = bound_args;
    thunk.thunk_id = thunk_id;

    //mjt.log('NEW THUNK', thunk_id, thunk);

    return thunk;
}

/**
 *  call a thunk spec immediately, using the same signature
 *   as mjt.vthunk.  useful when you are ready to build
 *   a thunk but can call it immediately instead for
 *   speed.
 *
 *  @param this       this is passed through to the thunk
 *  @param thunkspec  an array describing the thunk
 *  @param ...        extra args are appended to the thunk call
 *  @returns          the result of calling the thunk
 *
 *  @see mjt.vthunk
 */
mjt.vcall = function (thunkspec) {
    // slow for now
    var call_args = mjt.makeArray(arguments).slice(1);
    return mjt.vthunk(thunkspec).apply(this, call_args);
};

/**
 *  call a thunk spec immediately.
 *   useful when you are ready to build
 *   a thunk but can call it immediately instead for
 *   speed.
 *
 *  @param this       this is passed through to the thunk
 *  @param thunkspec  an array describing the thunk
 *  @param call_args  an array of extra arguments
 *  @returns          the result of calling the thunk
 *
 *  @see mjt.vthunk
 */
mjt.vapply = function (thunkspec, call_args) {
    // slow for now
    return mjt.vthunk(thunkspec).apply(this, call_args);
};


/**
 *  set up names for packages and constructors and such.
 *
 *    doesn't work very well yet but better than not seeing
 *    the names at all.
 */
mjt.label_package = function (dotpath) {
    var path = dotpath.split('.');
    var o = window;
    while (path.length) {
        o = o[path.shift()];
    }

    if (typeof o == 'object' && o !== null)
        o._package_name = dotpath;
    else
        mjt.log('missing package', dotpath);

    // XXX really shouldn't special-case mjt.Task, even in this cautious way.
    for (var k in o) {
        var defn = o[k];
        if (mjt && mjt.Task
            && mjt.isFunction(defn)
            && typeof defn.prototype == 'object'
            && defn.prototype instanceof mjt.Task) {
            defn.prototype._task_class = dotpath + '.' + k;
        }
    }
};




/**
 *  this is a clone of jQuery.isFunction()
 */

mjt.isFunction = function (fn)  {
    // This may seem like some crazy code, but trust me when I say that this
    // is the only cross-browser way to do this. --John
    return !!fn && typeof fn != "string" && !fn.nodeName &&
    fn.constructor != Array && /function/i.test( fn + "" );
};

/**
 *  this is a clone of jQuery.makeArray()
 */
mjt.makeArray = function( a ) {
    var r = [];

    // Need to use typeof to fight Safari childNodes crashes
    if ( typeof a != "array" )
	for ( var i = 0, al = a.length; i < al; i++ )
	    r.push( a[i] );
    else
	r = a.slice( 0 );

    return r;
};
