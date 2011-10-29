
/**
 *
 *  based on json.js 2006-04-28 from json.org
 *  license: http://www.json.org/license.html
 *
 *  hacked so it doesn't mess with Object.prototype
 *
 *
 */
/*

    This file adds these methods to JavaScript:

        mjt.json_from_js(obj)

            This function produces a JSON text from a javascript
            value. The value must not contain any cyclical references.

        mjt.json_to_js()

            This function parses a JSON text to produce an object or
            array. It will return false if there is an error.
*/
(function () {
    var m = {
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        s = {
            array: function (x) {
                var a = ['['], b, f, i, l = x.length, v;
                for (i = 0; i < l; i += 1) {
                    v = x[i];
                    f = s[typeof v];
                    if (f) {
                        v = f(v);
                        if (typeof v == 'string') {
                            if (b) {
                                a[a.length] = ',';
                            }
                            a[a.length] = v;
                            b = true;
                        }
                    }
                }
                a[a.length] = ']';
                return a.join('');
            },
            'boolean': function (x) {
                return String(x);
            },
            'null': function (x) {
                return "null";
            },
            'undefined': function (x) {
                mjt.warn('mjt.json_from_js: undefined value is illegal in JSON');
                return "[[[ERROR: undefined value]]]";
            },
            number: function (x) {
                return isFinite(x) ? String(x) : 'null';
            },
            object: function (x) {
                if (x) {
                    if (x instanceof Array) {
                        return s.array(x);
                    }
                    var a = ['{'], b, f, i, v;
                    for (i in x) {
                        v = x[i];
                        f = s[typeof v];
                        if (f) {
                            v = f(v);
                            if (typeof v == 'string') {
                                if (b) {
                                    a[a.length] = ',';
                                }
                                a.push(s.string(i), ':', v);
                                b = true;
                            }
                        }
                    }
                    a[a.length] = '}';
                    return a.join('');
                }
                return 'null';
            },
            string: function (x) {
                if (/["\\\x00-\x1f]/.test(x)) {
                    x = x.replace(/([\x00-\x1f\\"])/g, function(a, b) {
                        var c = m[b];
                        if (c) {
                            return c;
                        }
                        c = b.charCodeAt();
                        return '\\u00' +
                            Math.floor(c / 16).toString(16) +
                            (c % 16).toString(16);
                    });
                }
                return '"' + x + '"';
            }
        };

    mjt.json_from_js = function (v) {
        return s[typeof v](v);
    };

})();

// XXX possibly relevant for IE6
// from http://tech.groups.yahoo.com/group/json/message/660
// > there is a bug in IE6 in which the greedy quantifiers cause the
// > regexp to run in exponential time. When the text gets big, IE gets
// > really really slow.

mjt.json_to_js = function (s) {
    try {
        if (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/.test(s.
                    replace(/\\./g, '@').
                    replace(/"[^"\\\n\r]*"/g, ''))) {

            return eval('(' + s + ')');
        }
        throw new SyntaxError('json_to_js');
    } catch (e) {
        return false;
    }
};

