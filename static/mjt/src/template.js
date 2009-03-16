

/**
 *  this implements the guts of mjt.for= iteration
 *
 *  it handles:
 *    javascript objects and arrays
 *    pseudo-arrays:
 *      js strings
 *      jQuery result sets 
 *      html DOM nodelists
 *
 *  it doesn't handle:
 *    js "arguments" objects
 *
 */
mjt.foreach = function(self, items, func) {
    var i,l;

    //mjt.log('foreach', typeof items, items, items instanceof Array);

    if (typeof items === 'string' || items instanceof Array
        || (typeof jQuery === 'object' && items instanceof jQuery)) {
        // string, array, or pseudo-array
        l = items.length;
        for (i = 0; i < l; i++)
            func.apply(self, [i, items[i]]);
    } else if (typeof items === 'object') {
        if (items.item  === document.childNodes.item) {
            // dom nodelist
            l = items.length;
            for (i = 0; i < l; i++)
                func.apply(self, [i, items.item(i)]);
        } else {
            // plain old js object
            for (i in items)
                if (items.hasOwnProperty(i))
                    func.apply(self, [i, items[i]]);
        }
    }
};

/**
 *
 * @private
 * unused for now... 
 *
 * generate a wikilink
 *  this is called when $[] is seen in the input
 *  it should really be part of a standard library
 *
 */
mjt.ref = function (name) {
    var s = ['<a href="view?name=',
             mjt.formquote(name), '">',
             mjt.htmlencode(name), '</a>'
             ].join('');
    return new mjt.Markup(s);
};

/**
 * @constructor
 * @class  A TemplateCall is a runtime template call.
 *   this includes the result of calling mjt.run(),
 *   or any nested ${...} calls to mql.def= template functions.
 *
 *  nested mql.def calls only need a TemplateCall instance
 *   if they contain mjt.task calls, but right now a TemplateCall
 *   is created for every function call.
 *
 *  an instance of TemplateCall is created for each
 *   template function, as a prototype for the calls
 *   to that function.  see tfunc_factory()
 *   for more comments about this.
 *
 */
mjt.TemplateCall = function (raw_tfunc) {
    // make available to template code under "this."
    this.raw_tfunc = raw_tfunc;
    delete this._markup;
}

/**
 *
 *
 */
mjt.TemplateCall.prototype.toMarkupList = function () {
    return this._markup;
};


/**
 *  redraw / redisplay / update the template call's generated markup.
 *  this preserves some state from one tcall to the next.
 */
mjt.TemplateCall.prototype.redisplay = function () {
    var tfunc = this.this_tfunc;

    //mjt.log('redisplay ', tfunc.prototype.signature, this);

    var tcall = new tfunc();
    tcall.prev_tcall = this;
    tcall.subst_id = this.subst_id;
    tcall.render(this.targs).display();
    return tcall;
};


/**
 *
 *
 */
mjt.TemplateCall.prototype.display = function (target_id, targs) {
    if (typeof target_id != 'undefined')
        this.subst_id = target_id;

    //mjt.log('display tf', this.signature, this.subst_id);

    var top = mjt.id_to_element(this.subst_id);

    if (!top) {
        //mjt.log('missing top ', this.subst_id, this);

        // fail silently - this often happens if the user hits
        // reload before the page has completed.
        return this;
    }

    if (typeof this._markup != 'undefined')
        mjt.replace_html(top, this);
    return this;
};


/**
 *
 *
 */
mjt.TemplateCall.prototype.render = function(targs) {
    var html;

    if (typeof targs != 'undefined')
        this.targs = targs;

    var raw_tfunc = this.raw_tfunc;

    try {
        if (0) {  // too verbose for normal debugging
            var tstates = [];
            for (var t in this.tasks)
                tstates.push(t + ':' + this.tasks[t].state);
            mjt.openlog('applying', this.signature, this.targs, 'to id=', this.subst_id + ': ' + tstates.join(' '));
        }
    
        try {
            this._no_render = false;
            this._markup = raw_tfunc.apply(this, this.targs);
            //mjt.log('no ren', (this instanceof mjt.TemplateCall), this._no_render, this.signature, this);
        } catch (e) {
            if (e == mjt.NoDrawException) {
                this._markup = undefined;
            } else {
                // if the template has a codeblock we may be able to
                // print some debug info.
                var codeblock = this.tpackage._codeblock;
                if (typeof codeblock !== 'undefined') {
                    mjt.log('codeblock', codeblock.name, this);
                    e.tcall = this;
                    codeblock.handle_exception('applying tfunc '+
                                               this.signature, e);
                } else {
                    throw e;
                }
                var tstates = [];
                for (var t in this.tasks) {
                    var tt = this.tasks[t];
                    if (typeof tt === 'object' && tt !== null) {
                        tstates.push(t + ':' + tt.state);
                    } else {
                        tstates.push(t + ':' + typeof tt);
                    }
                }
                this._markup = [mjt.bless('<h3>error applying '),
                        this.signature,
                        ' to id=', this.subst_id,
                        mjt.bless('</h3>'),
                        'states:[',
                        tstates.join(' '),
                        ']'];
                // re-throw the exception so other debuggers get a chance at it
                throw e;
            }
        }
    } finally {
        // do this inside finally so it happens even if the error 
        // is re-thrown
        if (this._no_render)
            this._markup = undefined;

        if (0) {  // too verbose for normal debugging
            mjt.closelog();
        }
    }
    return this;
};
/**
 *
 *  associates a task with a TemplateCall
 *
 */
mjt.TemplateCall.prototype.mktask = function(name, task) {
    //mjt.log('MKTASK', name, this);

    this.tasks[name] = task;

    //mjt.log('mktask', task);

    //
    // callback for query completion
    //
    var tcall = this;  // because "this" is wrong in closure

    // normally we warn if enqueue() is called twice, but
    // it's common in mjt templates where the enqueue()
    // is implicit.  so we avoid the warning here.
    if (task.state == 'init')
        task.enqueue();
    return task.ondone(function () {
        // right now all events are fired synchronously -
        // this is wasteful - if we depend on more than one
        // query and they arrive together we will fire twice, etc.
        tcall.render().display();
    });
};




//////////////////////////////////////////////////////////////////////

/**
 *
 *  the public name for a tfunc is actually a call
 *   to this wrapper.  this is because 
 *  a function created using mjt.def="tfunc(...)" needs to be
 *    called in several ways:
 *
 *   - within markup using ${tfunc(...)}
 *   - internally using new() to set up the __proto__ link.
 *   - recursively in order to hide the differences between those cases
 *
 *  not implemented yet:
 *    a template call may not actually need to construct
 *      an object.  this code tries to construct a new instance if
 *      the tfunc contains any mjt.task= declarations - in that case
 *      need a place to keep track of state while waiting for the task.
 *
 *    if we dont need a new instance we just use the TemplateCall
 *      instance.
 *
 *  @param signature  is a debugging name for the template function
 *  @param rawtfunc   is a function that returns markup 
 *  @param tpackage   is the TemplatePackage where rawtfunc was defined
 *  @param has_tasks  is true if rawtfunc included mjt.Task declarations
 *  @param toplevel   is true if rawtfunc has top-level scope
 *
 */
mjt.tfunc_factory = function (signature, rawtfunc, tpackage, has_tasks, toplevel) {

    var _inline_tcall = function () {  // varargs
        var ctor = arguments.callee;  // _inline_tcall
  
        //mjt.log('calling ' + signature);
        if (this instanceof ctor) {
            // this is filled in by running the tcall
            this.tasks = {};
            this.defs = {};

            // when called as a constructor, we create the template call
            //  object but dont actually expand it yet.
            //mjt.log(signature + ' called as constructor');
            return undefined;
        }

        // called as a plain function, presumably from ${ctor(...)}

        // if this is a lightweight call (no need for redisplays)
        //  then we just bind the TemplateCall as "this" rather than
        //  creating a new instance, and run it.
        // also make sure we dont need this.defs (for main() )

        // has_tasks is currently wrong

        if (0 && !ctor.prototype.has_tasks && !toplevel) {
            return rawtfunc.apply(ctor.prototype, arguments);
        }

  
        // if we werent called as a constructor, re-invoke
        //   ourselves that way to create an object.
        var self = new ctor();

        // copy arguments array
        var targs = [];
        for (var ai = 0; ai < arguments.length; ai++)
            targs[ai] = arguments[ai];

        // if we're called inline, generate a subst_id
        var tname = self.signature.replace(/\(.*\)$/,'');
        self.subst_id = mjt.uniqueid('tcall__' + tname);

        // update the generated markup
        // this is done eagerly so that the state is more predictable,
        //  but lazy update (on display rather than eval) would save
        //  computation in some cases.
        self.render(targs);

        // make arguments available to template code under "this."
        // self.stackframe = mjt.reify_arguments(self.signature, targs);

        // since werent called using new(), return this explicitly.
        // this means the template call object gets mixed into the
        // output stream, so it must have a .toMarkup() method...
        return self;
    };

    // provides this.raw_tfunc, the raw template expansion function
    _inline_tcall.prototype = new mjt.TemplateCall(rawtfunc);

    _inline_tcall.prototype.signature = signature;
    _inline_tcall.prototype.tpackage = tpackage;
    _inline_tcall.prototype.has_tasks = has_tasks;

    // this_tfunc is the constructor rather than the raw expansion code
    _inline_tcall.prototype.this_tfunc = _inline_tcall;

    return _inline_tcall;
};

/**
 *
 *
 */
mjt._internal_tcall = { construct_only: true };  // magic token


//////////////////////////////////////////////////////////////////////
/**
 * somehow indicate that this isnt an error...
 */
mjt.NoDrawException = new Error('no redraw needed for this event');
mjt.NoDrawException.name = 'NoDrawException';


/**
 *
 *  @constructor
 *  @class a TemplatePackage is a namespace of template functions,
 *  usually loaded from a single html document.
 *
 * @param name  is used for debugging only right now
 */
mjt.TemplatePackage = function () {
    // XXX leading underscores need to be rationalized
    this._top = null;
    this._codeblock = null;

    // namespace will contain at least 'main'
    //  and possibly other toplevel mjt.defs.
    // it is populated by evaluating _codeblock to build
    //  a function and evaluating that function to build
    //  the package's toplevel namespace.
    this.namespace = null;

    // put in a mjt.Resource?
    this._prereqs = [];
    // put in a mjt.Resource?
    // source url
    this.source = null;
};


// XXX should move to linker.js?  mjt.Resource?
mjt.TemplatePackage.prototype.require = function (restype, url, title, type) {
    var res = new mjt.Resource(restype, url, title, type);
    this._prereqs.push(res);
};


/**
 *
 * load template metadata from a dom document.
 * the metadata is encoded inside the html <head> element.
 *
 */
// XXX should move to linker.js?
mjt.TemplatePackage.prototype.from_head = function (head) {
    var elts = [];
    for (var e = head.firstChild; e !== null; e = e.nextSibling) {
        if (e.nodeType != 1)
            continue;
        // nodeType == NODE
        elts.push(e);
        /*
        elts.push({
            tagname: e.nodeName,
            body: e.innerHTML,
            attrs: {}
        }); */
    }
    /*
    var subelts = head.*;
    for (var i = 0; i < ; i++) {
        var e = subelts[i];
        elts.push({
            tagname: e.localName().toUpperCase,
            body: '',
            attrs: {}
        });
    }
    */

    for (var i = 0; i < elts.length; i++) {
        var e = elts[i];
        switch (e.nodeName) {
          case 'TITLE':
            this.title = e.innerHTML;
            break;
    
          case 'META':
            //d.push({ name: e.name, content: e.content, http_equiv: e.httpEquiv });
            switch (e.name) {
              case 'description':
                this.summary = e.content;
                break;
              case 'author':
                this.author = e.content;
                break;
              case 'content-language':
                this.language = e.content;
                break;
              case 'x-mjt-id':
                this.id = e.content;
                break;
            }
            break;
    
          case 'SCRIPT':
            // skip this, its already been evaluated by the browser
            //d.push({ type: e.type, src: e.src, text: e.text });
            break;
    
          case 'STYLE':
            //d.push({ media: e.media,  type: e.type, innerHTML: e.innerHTML });
            break;
    
          case 'LINK':
            //d.push({ rel: e.rel, href: e.href, type: e.type, title: e.title, id: e.id });
            switch (e.rel) {
              case 'x-mjt-script':
                this.require('js', e.href, e.title,
                             (e.type || 'text/javascript'));
                break;
              case 'x-mjt-import':
                this.require('mjt', e.href, e.title,
                             (e.type || 'text/x-metaweb-mjt'));
                break;
              case 'stylesheet':
              case 'alternate stylesheet':
                break;
            }
            break;
    
          default:
            break;
        }
    }
};
