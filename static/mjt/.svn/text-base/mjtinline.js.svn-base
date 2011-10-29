//
//  this is designed to load mjt from an inline <script> tag
//
//  once included, it waits for the the DOM to load and searches
//   for a tag with class="mjtinline" that encloses the <script> tag.
//  it then runs that element as a Mjt template.
//

if (typeof mjtinline !== 'object') {
    window.mjtinline = {};

    mjtinline['MJT_JS_URL'] = null;  // default

    // NOTE this line can be changed to point to a particular
    //  url for mjt.js.  if null then mjtinline.js will search
    //  the dom for the mjtinline.js SCRIPT tag and look for
    //  mjt.js in the same location.
    mjtinline.mjt_js_url = mjtinline.MJT_JS_URL;

    mjtinline.count = 0;

    mjtinline.pending = [];
    mjtinline.pending_timeout = null;

    // should be hooked to ondomready or such
    mjtinline.onready = function () {
        for (var i = 0; i < mjtinline.pending.length; i++) {
            var id = mjtinline.pending[i];
            var elt = document.getElementById(id);
            while (elt) {
                if (/mjtinline/.exec(elt.className))
                    break;
                elt = elt.parentNode;
            }
            // console.log('mjtinline running', id, elt);
            if (elt) {
                elt.className = '';  // BUG this blows away other classes too
                mjt.run(elt);
            } else {
                alert('mjtinline.js: couldn\'t find parent element with class="mjtinline"');
            }
        }
    };

    mjtinline.run = function () {
        // if mjt is not loaded, load it.

        if (typeof mjt !== 'object') {
            if (typeof mjtinline.mjt_js_url !== 'string') {
                // try to guess the url of this js file.
                var nodes = document.getElementsByTagName('script');
                for (var i = 0; i < nodes.length; i++) {
                    var script = nodes[i];
                    var src = script.src || '';
                    var m = /^(.+)\/mjtinline.js$/.exec(src);
                    if (m) {
                        mjtinline.mjt_js_url = m[1]+'/mjt.js';
                        break;
                    }
                }
            }

            if (typeof mjtinline.mjt_js_url !== 'string')
                alert('mjtinline.js: mjtinline.mjt_js_url must be set');

            // console.log('mjtinline loading mjt.js');
            document.write('<script type="text/javascript" src="' + mjtinline.mjt_js_url + '"></script>');
        }

        // generate a marker in the page, to be revisited when page loading completes
        var uniqid = '__mjtinline_' + (mjtinline.count++);

        // console.log('mjtinline found', uniqid);

        // leave a placeholder behind to mark this script tag
        document.write('<span id="' + uniqid + '"></span>')

        mjtinline.pending.push(uniqid);

        if (mjtinline.pending_timeout === null)
            mjtinline.pending_timeout = window.setTimeout(mjtinline.await_ready, 100);
    };


    mjtinline.await_ready = function () {
        var retry = false;

        mjtinline.pending_timeout = null;

        if (typeof mjt !== 'object')
            retry = true;

        for (var i = 0; i < mjtinline.pending.length; i++) {
            var id = mjtinline.pending[i];
            if (id === null)
                continue;

            var elt = document.getElementById(id);
            // console.log('mjtinline checking', id, elt);
            if (elt)
                continue;

            // any missing id causes us to wait.  this is probably
            //  too brittle, it could cause us to wait forever because
            //  of a local error.
            retry = true;
            break;
        }

        if (retry) {
            mjtinline.pending_timeout = window.setTimeout(mjtinline.await_ready, 100);
        } else {
            mjtinline.onready();
            mjtinline.pending = [];
        }
    };
}

mjtinline.run();
