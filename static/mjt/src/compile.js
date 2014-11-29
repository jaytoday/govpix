/**
 *  compile.js - compile a mjt template from the dom.
 *
 */


mjt._eventcb = {};

/**
 *
 *  @constructor
 *  @class mjt.Scope holds a stack of mjt.def= definitions.
 *
 */
mjt.Scope = function(template, parent, decl) {
    this.template = template
    if (!parent) parent = null;
    this.parent = parent;

    if (!decl) decl = '[unnamed]';
    this.decl = decl;

    this.tasks = {};

    this.toplevel = false;
}

/**
 *
 *  @constructor
 *  @class much of the Template class should really be TemplateCompiler
 *  as it holds the current state of the compilation.
 * this will get fixed when we support serializing compiled
 *  templates.
 *
 * most of this class will break out into TemplateCompiler.
 * the remainder moves to TemplatePackage.
 */

mjt.Template = function (top) {

    // template fragment strings.
    // these get copied into TemplatePackage._tstrings
    this.strings = [];

    // codestr gets copied into TemplatePackage._codestr
    this.codestr = null;

    // this is the compiler state
    this.compiler_dt = null;
    this.buffer = [];
    this.code = [];

    this.scope = new mjt.Scope(this, null, '[toplevel]');
    this.scope.toplevel = true;

    // do it
    top = mjt.id_to_element(top);
    this.compile_top(top);
};

/**
 *
 *
 */
mjt.Template.prototype.flush_string = function(no_output, ignore_whitespace) {
    var s = this.buffer.join('');
    this.buffer = [];

    if (s == '')
        return -1;

    if (ignore_whitespace && /^\s*$/.exec(s))
        return -1;

    var texti = this.strings.length;
    this.strings[texti] = s;

    if (mjt.debug) {
        // generate comments with the text in them

        var indent = '                                                  ';
        var commentstart = '// ';
        var x = s.replace(/\r?\n/gm, '\r\n' + indent + commentstart);

        var c = '__m[__n++]=__ts[' + texti + '];';
        if (c.length < indent.length)
            c += indent.substr(c.length);
        this.code.push(c);
        this.code.push([commentstart, x, '\n'].join(''));

    } else if (! no_output) {
        this.code.push('__m[__n++]=__ts[' + texti + '];\n');
    }

    return texti;
};
/**
 * warn into the template output
 */
mjt.Template.prototype.warn = function(s) {
    this.buffer.push('<span style="outline-style:solid;color:red;">');
    this.buffer.push(mjt.htmlencode(s));
    this.buffer.push('</span>');
};
/**
 * push the scope stack
 */
mjt.Template.prototype.push_def = function(decl) {
    this.scope = new mjt.Scope(this, this.scope, decl);
}
/**
 * pop the scope stack
 */
mjt.Template.prototype.pop_def = function() {
    this.scope = this.scope.parent;
}
/**
 *
 * compile code to create or reference a mjt task.
 *   the task is only created once, not on each redraw!
 *
 */
mjt.Template.prototype.compile_task = function(name, e) {
    // the query is in the text
    // XXX should fail/warn if more than one child
    var mq = e.firstChild.nodeValue;

    if (mq.match(/;\s*$/)) {
        mjt.warn('mjt.task=', name,
                 'definition should not end with a semicolon');
        mq = mq.replace(/;\s*$/, ''); // but fix it and continue
    }

    if (mq.match(/\/\/ /)) {
        // no way to fix this - IE doesnt preserve whitespace
        mjt.warn('"//" comments in mjt.task=', name,
                 'definition will fail on IE6');
        //mq = mq.replace(/\r?\n/g, '\r\n');
    }

    this.flush_string();
    //this.code.push('mjt.log("compile_task", this);\n');
    this.code.push('var ' + name + ' = this.tasks && this.tasks.'
                   + name + ';\n');

    this.code.push('if (!' + name + ') ');

    // mark the current function as requiring a TemplateCall
    this.scope.has_tasks = true;

    // note that we dont evaluate mq unless we're actually creating it.
    this.code.push(name + ' = this.mktask("' + name
                   + '", (\n' + mq + '));\n');
};

/**
 * compile a mjt.attrs clause
 */
mjt.Template.prototype.compile_attrs = function(s) {
    this.flush_string();

    var uvar = mjt.uniqueid('attrs');  // unique variable
    var tvar = mjt.uniqueid('attrs_i');  // unique variable
    this.code.push('var ' + uvar + ' = ' + s + ';\n');
    this.code.push('for (var ' + tvar + ' in ' + uvar + ') {\n');

    //var x = '" "+' + tvar + '+"=\""' + uvar + '[' + tvar + ']';

    var x = "' ' + @tvar + '=\"' + @uvar[@tvar] + '\"'"
        .replace(/@tvar/g,tvar).replace(/@uvar/g,uvar);
    this.code.push('__m[__n++]=mjt.bless(' + x + ');\n');

    //this.code.push('mjt_html.push(" " + ' + tvar + ' + "=");\n');
    //this.code.push('mjt_html.push(mjt.bless(\'"\'));\n');
    //this.code.push('mjt_html.push(' + uvar + '[' + tvar + '])\n');
    //this.code.push('mjt_html.push(mjt.bless(\'"\'));\n');
    this.code.push('}\n');
};
/**
 *
 * compile a text node or attribute value,
 *  looking for $$ or $var or ${expr} and expanding
 *
 */
mjt.Template.prototype.compile_text = function(s) {
    var segs = s.split('$');
    if (segs.length == 1) {
        this.buffer.push(mjt.htmlencode(s));
        return;
    }

    this.buffer.push(mjt.htmlencode(segs[0]));
    var escaped = true;
    var valid = true;
    var segi = 1;
    var seg = segs[segi];

    // this code could be much faster using better regexp-fu,
    // particularly using RegExp.lastIndex.  but it doesnt
    // show up as a big profiling hotspot...
    while (segi < segs.length) {
        if (escaped) {
            escaped = false;

            if (seg == '' && segi < segs.length - 1) {
                this.buffer.push('$');
                segi++;
                seg = segs[segi];
                continue;
            }

            var m = seg.match(/^(([A-Za-z0-9_.]+)|\{([^}]+)\}|\[([^\]]+)\])((.|\n)*)$/);
            if (m != null) {
                var expr = m[2];
                if (typeof(expr) == 'undefined' || expr == '')
                    expr = m[3];

                if (typeof(expr) == 'undefined' && typeof(m[4] != 'undefined'))
                    expr = 'mjt.ref("' + m[4] + '")';

                if (typeof(expr) == 'undefined') {
                    this.warn('bad $ substitution');
                } else {
                    this.flush_string();
                    this.code.push('__m[__n++]=(' + expr + ');\n');
                }

                // re-evaluate on the rest.
                if (seg != '' || segi < segs.length - 1)
                    seg = m[5];
            } else {
                this.warn('bad $ substitution');
            }
        } else {
            if (seg != '') {
                this.buffer.push(mjt.htmlencode(seg));
            }
            escaped = true;
            segi++;
            seg = segs[segi];
        }
    }
};

/**
 * generate the body of an onevent handler
 * UNLIKE HTML, event handlers use the lexical scope of the template function.
 *  this makes it much easier to write handlers for tags that are generated
 *  inside loops or functions.
 * the disadvantage is that we create lots of little anonymous functions, many of
 *  them unnecessary.  in many cases it would be safe to just inline the event
 *  handler rather than capturing the environment in a closure, but we cant tell
 *  whether an onevent handler has free variables so we always have to create the
 *  closure.
 * there are almost certainly leaks here - use something like
 *  MochiKit.signal for onevent management?
 */
mjt.Template.prototype.compile_onevent_attr = function (n, aname, avalue) {
    // TODO make sure aname is a known event handler.  we assume it's clean below.

    this.flush_string();

    // XXX this could leak over time, and there's no good
    //  way to gc these keys.  should hang off TemplateCall
    //  rather than mjt._cb so the closures will go away
    //  at some point.
    // probably event setup should be done using jquery once
    //  the dom is constructed.
    // also this really shouldn't use mjt._cb - if it ever breaks,
    //  fix it to use a separate callback table.

    var uvar = mjt.uniqueid(aname + '_cb');  // unique variable
    this.code.push('var ' + uvar + ' = mjt.uniqueid("' + aname + '");\n');
    // this.code.push('if (typeof this._cb == "undefined") this._cb = {};\n');
    this.code.push('mjt._eventcb[' + uvar + '] = function (event) {\n');
    this.code.push(avalue);
    this.code.push('}\n');

    // return the new onevent attribute string
    return ('return mjt._eventcb.${' + uvar + '}.apply(this, [event])');
};


/**
 *
 *
 */
mjt.Template.prototype.get_attributes = function(n, attrs, mjtattrs) {

    // extract mjt-specific attributes and put the rest in a list.
    //  expansion of dynamic attributes is done later.
    // this gets called alot.
    var srcattrs = n.attributes;
    var a;
    var ie_dom_bs = /MSIE/.test(navigator.userAgent);

    for (var ai = 0; ai < srcattrs.length; ai++) {
        var attr = srcattrs[ai];
        if (!attr.specified) continue;

        var aname = attr.nodeName;
        var m = aname.match(/^mjt\.(.+)/);
        if (m) {
            var mname = m[1];

            a = { name: mname };

            // we dont warn about unknown mjt attrs yet
            mjtattrs[mname] = attr.nodeValue;

            if (mname == 'src') {
                // mjt.src is used to hide src= attributes within
                //  the template so they arent fetched until the
                //  template is expanded.
                a.value = attr.nodeValue;
                attrs.push(a);
            }
        }
    }

    for (var ai = 0; ai < srcattrs.length; ai++) {
        var attr = srcattrs[ai];
        if (!attr.specified) continue;

        var aname = attr.nodeName;
        var m = aname.match(/^mjt\.(.+)/);
        if (!m) {
            // ignore src= attribute if mjt.src= is present.
            if (aname == 'src' && (typeof mjtattrs.src != 'undefined'))
                continue;
            a = { name: aname };

            // TODO: see
            //  http://tobielangel.com/2007/1/11/attribute-nightmare-in-ie

            // cant do vanilla onevent= on IE6 because the dom doesnt
            //  have access to the original string, only to the
            //  compiled js function.  use mjt.onevent=.
            if (aname.substr(0,2) == 'on') {
                mjt.warn(a.name, '="..."',
                         'will break on IE6, use',
                         'mjt.' + aname);
                attrs.push(a);
            }

            // we dont warn about unknown attrs (like "mql.")
            //  yet.

            if (ie_dom_bs) {
                if (aname == "style") {
                    // IE makes it hard to find out the style value
                    a.value = '' + n.style.cssText;
                } else if (aname == 'CHECKED') {
                    aname = 'checked';
                    a.value = '1';
                } else {
                    a.value = n.getAttribute(aname, 2);
                    if (!a.value)
                        a.value = attr.nodeValue;
                }
            } else {
                a.value = attr.nodeValue;
            }
            if (typeof a.value == 'number')  // some ie attributes
                a.value = '' + a.value;

            attrs.push(a);
        }
    }

    // IE doesnt show form value= as a node attribute
    if (ie_dom_bs && n.nodeName == "INPUT") {
        a = { name: 'value', value: n.value };
        attrs.push(a);
    }
};

/**
 *
 * compile a mjt.choose directive
 *
 */
mjt.Template.prototype.compile_choose = function(cn, choose) {
    var choose_state = 'init';
    var tablevar = false;
    var default_label = false;

    this.flush_string();

    if (choose) {
        this.code.push('switch (' + choose + ') {\n');
        choose_state = 'dispatch_init';
    }

    var n = cn.firstChild;
    while (n != null) {
        var nextchild = n.nextSibling;

        var nt = n.nodeType;

        if (nt == 3) { // TEXT_NODE
            if (n.nodeValue.match(/[^ \t\r\n]/)) {
                mjt.warn('only whitespace text is allowed in mjt.choose, found',
                         '"' + n.nodeValue + '"');
            }
            n = nextchild;
            continue;
        }

        if (nt == 1) { // ELEMENT_NODE
            var next_choose_state = choose_state;
            var mjtattrs = {};
            var attrs = [];
            this.get_attributes(n, attrs, mjtattrs);
            var defaultcase = false;

            if (typeof(mjtattrs.when) != 'undefined') {
                defaultcase = false;
            } else if (typeof(mjtattrs.otherwise) != 'undefined') {
                defaultcase = true;
            } else {
                mjt.warn('all elements inside mjt.choose must have a mjt.when= or mjt.otherwise= attribute');
                break;
            }


            //this.flush_string();

            if (choose_state == 'init') {
                if (defaultcase) {
                    this.code.push('{\n');
                    next_choose_state = 'closed';
                } else {
                    this.code.push('if (' + mjtattrs.when + ') {\n');
                    next_choose_state = 'open';
                }
            } else if (choose_state == 'open') {
                if (defaultcase) {
                    // for an if-else chain this is the final else
                    this.code.push('} else {\n');
                    next_choose_state = 'closed';
                } else {
                    this.code.push('} else if (' + mjtattrs.when + ') {\n');
                    next_choose_state = 'open';
                }
            } else if (choose_state.match(/^dispatch/)) {
                if (choose_state != 'dispatch_init')
                    this.code.push('break;\n');

                if (defaultcase) {
                    this.code.push('default:\n');
                    next_choose_state = 'dispatch';  // XXX dispatch_closed?
                } else {
                    this.code.push('case ');
                    this.code.push(mjt.json_from_js(mjtattrs.when));
                    this.code.push(':\n');
                    next_choose_state = 'dispatch';
                }
            }

            this.compile_node(n, 'in_choose');

            choose_state = next_choose_state;
        }

/*
if (nt != 1)
    print ('nt ' + nt)
*/

        n = nextchild;
    }

    this.flush_string();

    if (choose == '') {
        // end if-else chain
        this.code.push('}\n');
    } else {
        if (choose_state != 'dispatch_init')
            this.code.push('break;\n');
        // close switch statement
        this.code.push('};\n');
    }
};


/**
 *
 * compile a template from a dom representation.
 *
 */
mjt.Template.prototype.compile_node = function(n, choose_state) {
    if (typeof(choose_state) == 'undefined')
        choose_state = 'none';
    var nt = n.nodeType;
    var tt = this;
    var subcompiler = function(n) {
            var child = n.firstChild;
            while (child != null) {
                var nextchild = child.nextSibling;
                tt.compile_node(child);
                child = nextchild;
            }
    };

    var toplevel = this.scope.toplevel;


    if (nt == 3) { // TEXT_NODE
        this.compile_text(n.nodeValue);
        return;
    }

    if (nt == 1) { // ELEMENT_NODE
        // extract mjt-specific attributes and put the rest in a list.
        //  expansion of dynamic attributes is done later.
        var mjtattrs = {};
        var attrs = [];
        this.get_attributes(n, attrs, mjtattrs);
        var completions = []; // a stack but without all the function calls

        var render_outer_tag = true;
        var generate_id = false;


        if (toplevel) {
            mjtattrs.def = 'rawmain()';
        }

        var tagname = n.nodeName;

        if (tagname.match(/script/i)) {
            // passing <script> tags
            //  through is confusing and there seems to be a bug
            //  where the &quot; entities inside a <script> tag
            //  arent treated as " quotes.  &lt; works right though?
            // either way the script has been executed already by
            //  the time it gets to us, its scope doesn't correspond
            //  to what's in the template, generally it's confusing.

            //mjt.warn('use of the <script> tag is discouraged inside mjt templates');
            // but it happens in practice nevertheless.
            return;
        }

        if (typeof(mjtattrs.task) != 'undefined') {
            // should be an error to have other mjt.* attrs
            this.flush_string();
            this.compile_task(mjtattrs.task, n);
            return;  // elide the whole element
        }

        if (typeof(mjtattrs.def) != 'undefined') {
            this.flush_string();
            var defn = mjtattrs.def.match(/^([^(]+)\(([^)]*)\)$/ );

            if (! defn) {
                mjt.warn('bad mjt.def=', mjtattrs.def,
                         ': must contain an argument list');
                return;
            }
            var defname = defn[1];
            var defargs = defn[2];

            if (mjt.debug) {
                this.code.push('// mjt.def=');
                this.code.push(mjtattrs.def);
                this.code.push('\n');
            }

            if (typeof(attrs.id) != 'undefined') {
                mjt.warn('mjt.def=', mjtattrs.def,
                         'must not have an id="..." attribute');
            }

            // this is the actual function declaration
            this.code.push('var ' + defname + ' = ');
            this.code.push('function (' + defargs + ') {\n');

            this.push_def(mjtattrs.def);

            //this.code.push("mjt.log('TCALL', this);\n");

            if (toplevel) {
                this.code.push('var __pkg = this.tpackage;\n');
                this.code.push('var __ts=__pkg._template_fragments;\n');
            }

            this.code.push('var __m=[],__n=0;\n');

            // generate an id for the tcall
            generate_id = true;

            var t = this;
            completions.push(function () {
                var defscope = this.scope;
                this.pop_def();
                this.flush_string();
                this.code.push('return __m;\n');
                this.code.push('}\n');

                if (0) {
                    // if there were any mjt.tasks in this scope, record that
                    // on the compiled function.
                    if (defscope.has_tasks) {
                        this.code.push(defname + '.has_tasks = true;\n');
                    }
                    // record the declaration of the function for debugging
                    this.code.push(defname + '.signature = ' +
                                   mjt.json_from_js(mjtattrs.def) + ';\n');
                    //if (!toplevel)
                    //    this.code.push(defname + '.codeblock = this.package._codeblock;\n')
                } else {
                    // if there were any mjt.tasks in this scope, record that
                    // on the compiled function.
                    var has_tasks = false;
                    if (defscope.has_tasks) {
                        has_tasks = true;
                    }
                    //mjt.log('HAS_TASKS', mjtattrs.def, has_tasks);

                    if (!toplevel) {
                        var templatevar = '__pkg';
                        this.code.push(defname + ' = mjt.tfunc_factory(' +
                                       mjt.json_from_js(mjtattrs.def) + ', ' +
                                       defname + ', ' + templatevar + ', ' +
                                       has_tasks + ', ' +
                                       toplevel + ');\n');
                    }
                }
                if (this.scope.parent && this.scope.parent.toplevel)
                    this.code.push('this.defs.' + defname + ' = ' + defname + ';\n');
            });
        }

        if (typeof(mjtattrs['when']) != 'undefined') {
            this.flush_string();

            // make sure we are in a mjt.choose clause.
            //  if so, the containing compile_choose takes care of things
            if (choose_state != 'in_choose')
                mjt.warn('unexpected mjt.when, in choice state', choose_state);

            completions.push(function () {
                this.flush_string();
            });
        }

        if (typeof(mjtattrs['otherwise']) != 'undefined') {
            this.flush_string();

            // make sure we are in a mjt.choose clause.
            //  if so, the containing compile_choose takes care of things
            if (choose_state != 'in_choose')
                mjt.warn('unexpected mjt.otherwise, in choice state ', choose_state);

            completions.push(function () {
                this.flush_string();
            });
        }

        if (typeof(mjtattrs['for']) != 'undefined') {
            this.flush_string();

            // expect a python style "VAR in EXPR" loop declaration
            var matches = /^(\w+)(\s*,\s*(\w+))?\s+in\s+(.+)$/.exec(mjtattrs['for']);

            if (!matches) {
                // handle javascript style
                //   "(var i = 0 ; i < 3; i++)" declarations
                if (mjtattrs['for'].charAt(0) == '(') {
                    this.code.push('for ' + mjtattrs['for'] + ' {\n');
                } else {
                    mjt.warn('bad mjt.for= syntax');
                }
                completions.push(function () {
                    this.flush_string();
                    this.code.push('}\n');  // for (...)
                });
            } else {
                var var1 = matches[1];
                var var2 = matches[3];
                var forexpr = matches[4];
                var itemid, indexid;

                if (!var2) {   // "for v in items"
                    indexid = mjt.uniqueid(var1 + '_index');
                    itemid = var1;
                } else {       // "for k,v in items"
                    indexid = var1
                    itemid = var2;
                }

                var itemsid = mjt.uniqueid(itemid + '_items');

                var funcvar = mjt.uniqueid('for_body');

                this.code.push('var ' + itemsid + ' = (' + forexpr + ');\n');

                this.code.push('var ' + funcvar + ' = function ('
                               + indexid + ', ' + itemid + ') {\n'
                               + itemid + ' = ' + itemsid + '['
                               + indexid + '];\n');

                // hack to make "continue;" work inside mjt.for=
                var onceid = mjt.uniqueid('once');
                this.code.push('var ' + onceid + ' = 1;\n');
                this.code.push('while (' + onceid + '--) {\n');

                completions.push(function () {
                    this.flush_string();

                    this.code.push('} /* while once-- */\n');
                    this.code.push('}; /* function ' + funcvar + '(...) */\n');

                    this.code.push('mjt.foreach(this, ' + itemsid + ', ' + funcvar + ');\n');
                });
            }

        }

        if (typeof(mjtattrs['if']) != 'undefined') {
            this.flush_string();

            this.code.push('if (' + mjtattrs['if'] + ') {\n');

            completions.push(function () {
                this.flush_string();
                this.code.push('}\n');
            });
        }

        if (typeof(mjtattrs['elif']) != 'undefined') {
            this.flush_string(false, true);  // skip whitespace text

            this.code.push('else if (' + mjtattrs['elif'] + ') {\n');

            completions.push(function () {
                this.flush_string();
                this.code.push('}\n');
            });
        }

        if (typeof(mjtattrs['else']) != 'undefined') {
            this.flush_string(false, true);  // skip whitespace text

            this.code.push('else {\n');

            completions.push(function () {
                this.flush_string();
                this.code.push('}\n');
            });
        }

        if (typeof(mjtattrs.script) != 'undefined') {
            // later, the particular value will probably specify an event
            // that should trigger the script.  for now it's run inline.
            switch (mjtattrs.script) {
                case '':
                    break;
                case '1':
                    // accepted for backwards compat
                    break;
                default:
                    mjt.warn('reserved mjtattrs.script= value:', mjtattrs.script);
                    break;
            }

            // TODO should play better with other mjt.* attrs
            this.flush_string();
            var textnode = n.firstChild;
            if (!textnode) {
                // dont expand anything inside mjt.script
                render_outer_tag = false;
                subcompiler = function (n) { };
            } else if (textnode.nodeType != 3 || textnode.nextSibling) {
                mjt.warn("the mjt.script element can only contain javascript text, not HTML.  perhaps you need to quote '<', '>', or '&' (this is unlike a <script> tag!)");
            } else {
                var txt = textnode ? textnode.nodeValue : '';

                if (txt.match(/\/\/ /)) {
                    // no way to fix this - IE doesnt preserve whitespace
                    mjt.warn('"//" comments in mjt.script= definition will fail on IE6');
                    //txt = txt.replace(/\r?\n/g, '\r\n');
                }
                this.code.push(txt);
                this.code.push('\n');

                // dont expand anything inside mjt.script
                render_outer_tag = false;
                subcompiler = function (n) { };
            }
        }

        if (typeof(mjtattrs.choose) != 'undefined') {
            this.flush_string();

            var tt = this;
            subcompiler = function(n) {
                tt.compile_choose(n, mjtattrs.choose);
            };
        }

        if (typeof(mjtattrs.replace) != 'undefined') {
            render_outer_tag = false
            // behaves like mjt.content but strips the outer tag
            mjtattrs.content = mjtattrs.replace;
        }

        if (typeof(mjtattrs.strip) != 'undefined') {
            this.flush_string()
        }

        // handle mjt.onevent attrs
        for (var evname in mjtattrs) {
            if (evname.substr(0,2) != 'on') continue;
            a = { name: evname,
                  value: this.compile_onevent_attr(n, evname, mjtattrs[evname])
                };
            attrs.push(a);
        }

        if (generate_id && (!render_outer_tag
                            || (typeof(mjtattrs.strip) != 'undefined'))) {

            // XXX really only a problem with contained tasks
            mjt.warn('can\'t strip mjt.def="' + mjtattrs.def + '" tag yet');
        }

        if (render_outer_tag) {
            // the surrounding tag may not get included in the
            // output if it contains some special attributes.
            this.buffer.push('<');
            this.buffer.push(tagname);

            var myattrs = [];

            for (var ai = 0; ai < attrs.length; ai++) {
                myattrs.push(attrs[ai]);
            }

            for (var ai = 0; ai < myattrs.length; ai++) {
                var a = myattrs[ai];

                if (a.name == 'id' && generate_id)
                    generate_id = false;

                if (typeof(a.value) == 'function') {
                    mjt.warn('ignoring function-valued attr',
                              tagname, a.name, a.value);
                    continue;
                }

                this.buffer.push(' ');
                this.buffer.push(a.name);
                this.buffer.push('="');
                // XXX potentially incompatible with mjt.strip!
                this.compile_text(a.value);
                this.buffer.push('"');
            }

            if (generate_id) {   // XXX incompatible with mjt.strip
                this.flush_string();

                this.code.push('if (this.subst_id) ');
                this.code.push('__m[__n++]=mjt.bless(\' id="\' + this.subst_id + \'"\');\n');
            }

            // XXX note this cant override other attrs yet!
            if (typeof(mjtattrs.attrs) != 'undefined') {
                this.compile_attrs(mjtattrs.attrs);
            }

            this.buffer.push('>');
        }

        if (typeof(mjtattrs.strip) != 'undefined') {
            this.code.push('if (!(' + mjtattrs['strip'] + ')) {\n');
            this.flush_string()
            this.code.push('};\n');
        }

        if (typeof(mjtattrs.content) != 'undefined') {
            this.flush_string();
            this.code.push('__m[__n++]=(' + mjtattrs.content + ');\n');
        } else {
            subcompiler(n);
        }


        if (typeof(mjtattrs.strip) != 'undefined') {
            this.flush_string()
        }

        if (render_outer_tag) {
            this.buffer.push('</' + tagname + '>');
        }

        if (typeof(mjtattrs.strip) != 'undefined') {
            // XXX should keep result of previous expr evaluation -
            // right now we re-eval to see if stripping is in order.
            this.code.push('if (!(' + mjtattrs['strip'] + ')) {\n');
            this.flush_string()
            this.code.push('};\n');
        }

        for (var ci = completions.length-1; ci >= 0 ; ci--) {
            completions[ci].apply(this, []);
        }
    }
};

/**
 *
 * compile the template
 *
 */
mjt.Template.prototype.compile_top = function(top) {
    var t0 = (new Date()).getTime();

    this.compile_node(top);
    var dt = (new Date()).getTime() - t0;
    mjt.note('compiled dom in ', dt, 'msec');

    this.code.push('; var s = { rawmain: rawmain }; s;\n');
    this.codestr = this.code.join('');
    this.code = null;   // for gc

    this.compiler_dt = (new Date()).getTime() - t0;
};



