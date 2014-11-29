//////////////////////////////////////////////////////////////////////


/**
 *
 * wrap arguments in a dict.  this is useful inside ${...} in mjt
 *  templates, where you can't use {} as an object literal.
 *
 */
mjt.kws = function () {
    var kws = {};
    for (var i = 0; i < arguments.length; i += 2) {
        kws[arguments[i]] = arguments[i+1];
    }
    return kws;
};


/**
 *
 * walk the html dom, extracting mjt.* attributes, recording
 *   and compiling templates, queries, and template insertion sites.
 *
 */
mjt.run = function (target, tfunc, targs) {
    //mjt.log('mjt.run', target, tfunc, targs);
    var target_id;

    // there is always a single app
    if (typeof mjt.app == 'undefined') {
        mjt.app = new mjt.App();
    }

    if (typeof target === 'string') {
        target_id = target;
        target = document.getElementById(target_id);
    } else if (typeof target === 'object') {
        //mjt.log('mjt.run id ', typeof target.id, target_id, target);
        if (target.id == '')
            target.id = mjt.uniqueid('run_target');
        target_id = target.id;
    }

    if (typeof tfunc === 'function') {
        var tcall = new tfunc();
        tcall.subst_id = target_id;
        tcall.render(targs).display();
        return tcall.defs;
    }

    var pkg = new mjt.TemplatePackage();

    // if called with no args
    //   get package metadata from <head>
    //   compile the <body>
    if (typeof(target) === 'undefined') {

        // get package metadata from this page's <head>
        pkg.from_head(document.getElementsByTagName('head')[0]);

        pkg.source = window.location.protocol + '//'
            + window.location.host + window.location.pathname;
        // pull the template contents of <body> into a subdiv
        target = document.createElement('div')

        var body = document.getElementsByTagName('body')[0];
        var e = body.firstChild;
        while (e !== null) {
            var tmp = e;
            e = e.nextSibling;

            if (tmp.nodeName === 'IFRAME'
                && tmp.className === 'mjt_dynamic') {
                continue;
            }

            body.removeChild(tmp);
            target.appendChild(tmp);
        }

        // TODO can this be removed if we refer to target by
        //  element rather than by id?
        if (1) {
            target.id = mjt.uniqueid('mjt_body');
            target.style.display = 'none';
            body.appendChild(target);
        }

        // strip off any display='none' on <body>
        if (body.style.display == 'none')
            body.style.display = '';

    } else {
        pkg.source = window.location.protocol + '//'
            + window.location.host + window.location.pathname
            + '#' + target_id;
    }

    var tcall_defs = null;

    pkg.load_prereqs(function () {
        pkg.compile_document(target, targs);

        pkg.tcall.subst_id = target.id;
        //mjt.log('mjt.run compiled', target_id);
        pkg.tcall.display();

        // set a variable in the containing scope - this
        // will only make a difference if pkg.compile_document is
        // called synchronously.
        tcall_defs = pkg.tcall.defs;
    });

    // if compile_document succeeds synchronously (no need to
    // wait for dependencies), then this will be set.
    return tcall_defs;
};

/**
 *
 * walk the html dom, extracting mjt.* attributes, recording
 *   and compiling templates, queries, and template insertion sites.
 *
 */
mjt.load_element = function (top) {
    //mjt.log('mjt.load', top);

    var pkg = new mjt.TemplatePackage();
    pkg.source = window.location.protocol + '//'
        + window.location.host + window.location.pathname

    if (typeof top == 'string') {
        pkg.source += '#' + top;
        top = document.getElementById(top);
    }

    pkg.compile_document(top, []);
    return pkg;
};

/**
 *
 * compile an element and return the namespace.  this is used by old style
 *  explicit iframe package import.
 *
 */
mjt.load = function (top) {
    var pkg = mjt.load_element(top);
    //mjt.log('mjt.load compiled', pkg);
    return pkg.tcall.defs;
};


/**
 *
 * compile a mjt string.  returns the TemplatePackage.
 *
 */
mjt.load_string = function (mjthtml) {
    var tag = document.createElement('div');
    //tag.style.display = 'none';
    tag.innerHTML = mjthtml;
    return mjt.load_element(tag);
};

//////////////////////////////////////////////////////////////////////

/**
 *
 * attach a popup with the given html to a textinput field.
 *
 */
mjt.popup = function (tfunc, args, kws) {
    if (typeof kws == 'undefined') kws = {};
    var id = kws.id ? kws.id : mjt.uniqueid('_popup');

    var html = mjt.flatten_markup(tfunc.apply(null, args));

    var div = document.createElement('div');
    div.innerHTML = html;

    // extract the mjt-generated node with the special id
    // this is kind of ugly but there are extra layers otherwise?
    if (id)
        div.id = id;

    // get position of target textfield
    var target = kws.target;

    var pos = {x: 0, y: 0};
    if (typeof target != 'undefined')
        pos = mjt.get_element_position(target);

    // position according to kws.style,
    //  interpreting some of the values as relative
    //  to the target input position.
    for (var sk in kws.style) {
        var sv = kws.style[sk];
        if (typeof sv == 'number') {
            if (sk == 'left' || sk == 'right')
                sv = (sv + pos.x) + 'px';
            else if (sk == 'top' || sk == 'bottom')
                sv = (sv + pos.y) + 'px';
            else
                sv = sv + 'px';
        }
        div.style[sk] = sv;
    }

    if (typeof target != 'undefined')
        div.style.position = 'absolute';

    document.body.appendChild(div);

    return div.id;
};

/**
 *
 * helper to get the coordinates of an element relative to toplevel
 *
 */
mjt.get_element_position = function (elt) {
    var x = 0, y = 0;

    while (elt.offsetParent) {
        x += elt.offsetLeft;
        y += elt.offsetTop;
        elt = elt.offsetParent;
    }

    // handle the toplevel
    if (elt.x)
        x += elt.x;
    if (elt.y)
        y += elt.y;

    return {x:x, y:y};
};


//////////////////////////////////////////////////////////////////////


/**
 *  DEPRECATE
 *
 */
mjt.replace_innerhtml = function (top, html) {
    var htmltext = mjt.flatten_markup(html);
//    if (top.firstChild) mjt.teardown_dom_sibs(top.firstChild, true);
    top.innerHTML = htmltext;
};

/**
 *
 *
 */
mjt.replace_html = function (top, html) {
    var tmpdiv = document.createElement('div');
    var htmltext = mjt.flatten_markup(html);
    tmpdiv.innerHTML = htmltext;

    //mjt.log(htmltext);

    if (top.parentNode === null) {
        mjt.warn('attempt to replace html that has already been replaced?');
        return;
    }

    var newtop = tmpdiv.firstChild;

    if (newtop === null) {
        // should quote the htmltext and insert that?
        mjt.warn('bad html in replace_innerhtml');
        return;
    }

    //mjt.log('replacetop', newtop, top);
    if (newtop.nextSibling) {
        mjt.warn('template output should have a single toplevel node');
    }

//    mjt.teardown_dom_sibs(top, true);

    top.parentNode.replaceChild(newtop, top);

    // this is kind of unusual behavior, but it's hard to figure
    // out where else to do it.
    if (newtop.style && newtop.style.display == 'none')
        newtop.style.display = '';    // to use default or css style
};



/**
 * debug logging utility
 *  the argument processing should be rationalized here,
 *  and it should become an internal function.
 */
mjt.spew = function (msg, args) {
    var output = document.createElement('div');
    var tag;
    var text;

    tag = document.createElement('h3');
    tag.style.backgroundColor = '#fff0f0';
    tag.appendChild(document.createTextNode(msg));
    output.appendChild(tag);

    for (var ai = 0; ai < args.length; ai++) {
        var value = args[ai];

        if (value instanceof Array) {
            tag = document.createElement('div');
            tag.innerHTML = mjt.flatten_markup(value);
            output.appendChild(tag);
            continue;
        }

        tag = document.createElement('pre');

        if (typeof(value) == 'string') {
            text = value;
        } else {
            // try to format each arg as json if possible
            try {
                text = mjt.json_from_js(value);
            } catch (e) {
                text = '' + value;
            }
        }

        text = text.replace(/\r?\n/g, '\r\n');
        tag.appendChild(document.createTextNode(text));
        output.appendChild(tag);
    }

    var container = document.getElementById('mjt_debug_output');
    if (!container)
        container = document.getElementsByTagName('body')[0];
    container.appendChild(output);
}
