
/**
 * external entry point to create markup from a trusted string.
 */
mjt.bless = function (html) {
    return new mjt.Markup(html);
}

/**
 * constructor for Markup objects, which contain strings
 *  that should be interpreted as markup rather than quoted.
 */
mjt.Markup = function (html) {
    this.html = html;
};

/**
 * any object can define a toMarkup() method and
 *  return a representation of itself as a markup
 *  stream.
 */
mjt.Markup.prototype.toMarkup = function () {
    return this.html;
};

(function () {
    function bad_markup_element(v, msg, markup) {
        markup.push('<span style="outline-style:solid;color:red;">');
        if (msg) {
            markup.push(msg);
            markup.push('</span>');
        } else {
            // could use __proto__ for more info about objects
            markup.push('bad markup element, type [');
            markup.push(typeof(v));
            markup.push(']</span>');
        }
    }

    function flatn(x, markup) {
        //mjt.log('flatn', x);
        switch (typeof x) {
          case 'object':
            if (x === null) {
                bad_markup_element(x, '[null]', markup); // null
            } else if (x instanceof Array) {
                for (var i = 0; i < x.length; i++)
                    flatn(x[i], markup);
            } else if (typeof x.toMarkupList === 'function') {
                flatn(x.toMarkupList(), markup);
            } else if (typeof x.toMarkup === 'function') {
                markup.push(x.toMarkup());
            } else {
                bad_markup_element(x, '[object]', markup);
            }
            break;
          case 'undefined':
            bad_markup_element(x, '[undefined]', markup);
            break;
          case 'string':
            markup.push(mjt.htmlencode(x));
            break;
          case 'boolean':
            markup.push(String(x));
            break;
          case 'number':
            markup.push(String(x));
            break;

          // could eval functions like genshi, this could
          //   allow lazier construction of the result
          //   strings with possible lower memory footprint.
          //   might be important because of the lame ie6 gc.
          //   right now it all gets generated and joined
          //   from a single list anyway.
          case 'function':
            bad_markup_element(x, '[function]', markup);
            break;
        };
        return markup;
    }

    /**
     * hopefully fast function to flatten a nested markup list
     *  into a string.
     *   instances of Markup are passed through
     *   bare strings are html encoded
     *   other objects are errors
     *
     * this would be a good optimization target to speed up 
     *  template rendering, it is one of the closest things
     *  there is to an inner loop.
     */
    mjt.flatten_markup = function (v) {
        return flatn(v, []).join('');
    };
})();

