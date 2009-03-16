

/**
 *
 *
 */
mjt.global_scope = window;



/**
 *
 *
 */
mjt.Resource = function (restype, url, title, type) {
    this.restype = restype;
    this.url = url;
    this.title = title;
    this.type = type;
};



mjt.Resource.prototype.iframe_loaded = function(k, iframe) {
    var idoc = (iframe.contentWindow
                || iframe.contentDocument);
    // mjt.log('IFRLO', this, k, iframe);    
    if (idoc.document)
        idoc = idoc.document;
    var ibody = idoc.getElementsByTagName('body')[0];

    var load_t0 = (new Date()).getTime();
    
    //mjt.log('idoc', idoc.html, ibody, iframe, iframe.contentWindow.document);
    var reqpkg = new mjt.TemplatePackage();
    reqpkg.source = this.url;
    reqpkg.from_head(idoc.getElementsByTagName('head')[0]);

    var res = this;
    reqpkg.load_prereqs(function () {
        reqpkg.compile_document(ibody, []);

        // link.title gives a global variable to set
        // XXX this isn't great but it's backwards compatible
        reqpkg.tcall.defs._package = reqpkg;
        mjt.global_scope[res.title] = reqpkg.tcall.defs;

        var dt = (new Date()).getTime() - load_t0;
        mjt.note('loaded pkg', res.title, ' in ', dt, 'msec from ', reqpkg.source);

        k();
    });
};

/**
 *
 *
 */
mjt.Resource.prototype.load_resource = function (k) {
    //mjt.log('load_res', this.url, this);
    switch (this.restype) {
      case 'js':
        mjt.include_js_async(this.url, k);
        break;
      case 'mjt':
        mjt.dynamic_iframe_async(this.url, 
                                 mjt.vthunk(['iframe_loaded', this, k]));
        break;

      // XXX styles
      default:
        mjt.error('unknown resource type', this.restype)
        break;
    }
};



/**
 * asynchronously loads all remaining _prereqs.
 *  reinvokes itself until _prereqs is empty
 *  then calls continuation k()
 */
mjt.TemplatePackage.prototype.load_prereqs = function (k) {
    var pkg = this;
    if (!this._prereqs.length) {
        k();
        return;
    }

    var prereq = pkg._prereqs.shift();

    function resource_loaded() {
        //mjt.log('loaded prereq', prereq.url, prereq);
        pkg.load_prereqs(k);
    };

    mjt.note('loading prereq', prereq.url, prereq);
    prereq.load_resource(resource_loaded);
};

/**
 * compiles and evaluates the package.
 * all prereqs must already be present.
 * in the case of mjt.run the result is spliced in to the document,
 *  for mjt.load the resulting html is thrown away but the definitions
 *  kept.
 */
mjt.TemplatePackage.prototype.compile_document = function (top, targs) {
    this._top = top;

    if (this._prereqs.length) {
        mjt.error('missing prerequisites for template package', this, this._prereqs);
        throw new Error('missing prerequisites for template package');
    }
    
    if (typeof targs == 'undefined')
        targs = [];
    this._args = targs;

    var t0 = (new Date()).getTime();
    var template = new mjt.Template(top);
    this._template = template;


    var dt = (new Date()).getTime() - t0;
    //mjt.log('template compiled in ', dt, 'msec from ', this.source, template.compiler_dt);

    // copy the string table for template expansion
    this._tstrings = template.strings;
    this._template_fragments = [];
    for (var tsi = 0; tsi < this._tstrings.length; tsi++)
        this._template_fragments[tsi] = mjt.bless(this._tstrings[tsi]);

    this._codestr = template.codestr;

    this._codeblock = new mjt.Codeblock('#'+top.id, this._codestr);

    // evaluate the code string, generating an object with one
    //  function, 'rawmain()'.
    this._compiled = this._codeblock.evaluate();

    this.namespace = {
        _package: this
    };
    // build a template function around rawmain
    this.namespace.main = mjt.tfunc_factory("main()", this._compiled.rawmain,
                                            this, false, true)


    //mjt.log('RAWMAIN', this);


    // render the main() template function to create the
    // top-level TemplateCall, which includes both
    // toplevel mjt.def= definitions and the resulting
    // markup.
    var tcall = (new this.namespace.main()).render(this._args)
    this.tcall = tcall;
    tcall.pkg = this;
    tcall.template = template;

    //mjt.log('TCALL', tcall);


    // mjt.def= expressions in the template package
    // show up in tcall.defs.
    var defs = tcall.defs;
    for (var k in defs) {
        if (!defs.hasOwnProperty(k)) continue;
        this.namespace[k] = defs[k];
    }

    var dt = (new Date()).getTime() - t0;
    mjt.note('template loaded in ', dt, 'msec from ', this.source, tcall, tcall.defs);

    return this;
};






/**
 *  create an IFRAME that loads a particular uri.
 * 
 *  @param id  string  the HTML id= attribute for the new IFRAME.
 *  @param url uri     the uri to fetch.
 *  @returns   element the IFRAME dom element
 */
mjt.dynamic_iframe = function (id, url) {
    var iframe = document.createElement('iframe');
    if (typeof id == 'string')
        iframe.id = id;
    iframe.style.display = 'none';
    // the class="mjt_dynamic" tells the compiler to skip it
    iframe.className = 'mjt_dynamic';
    iframe.setAttribute('src', url);
    //mjt.log('created iframe src=', url, iframe.id);
    return iframe;
};

/**
 *  create an IFRAME that loads a particular uri, and
 *  invoke a callback when complete.
 * 
 *  @param url uri     the uri to fetch.
 *  @param k   function called when the load is complete.
 *  @return undefined (invokes k(element) with no arguments on load,
 *                     where element is the IFRAME dom element).
 */

mjt.dynamic_iframe_async = function (url, k) {
    var iframe = mjt.dynamic_iframe(mjt.uniqueid('mjt_iframe'), url);
    iframe.onload = function () {
        // works on firefox and hopefully safari
        k(iframe);
    };
    iframe.onreadystatechange = function () {
        // works on ie6
        if (iframe.readyState == 'complete') {
            k(iframe);
        }
    }
    document.getElementsByTagName('body')[0].appendChild(iframe);
};
