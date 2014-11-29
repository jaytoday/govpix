
/**
 * try to generate a reasonable javascript error report in html.
 *
 * @param e Error             the javascript error object
 * @param codestr string      the source code where the error is located
 * @param [target_id] string  value to use for id= in the generated markup
 * @returns Markup the generated html as a Markup object
 *
 */
mjt.error_html = function (e, codestr, target_id) {
    // IE has .description as well
    // e.fileName, e.lineNumber
    // e.stack

    var source = [];

    if (codestr && e.lineNumber) {
        var lineno = e.lineNumber;
        var lines = codestr.split('\n');

        if (lineno < 0)
            lineno = 0;
        if (lineno >= lines.length)
            lineno = lines.length - 1;

        var line0 = lineno - 10;
        if (line0 < 0) line0 = 0;

        var cx = [];
        var line;

        source.push(mjt.bless(['\n<pre>']));
        for (line = line0; line < lineno; line++)
            cx.push(lines[line]);
        source.push(cx.join('\n'));

        source.push(mjt.bless(['</pre>\n<pre style="color:red">']));
        source.push(lines[lineno] + '\n');
        source.push(mjt.bless(['</pre>\n<pre>']));

        cx = [];
        for (line = lineno+1; line < lines.length; line++)
            cx.push(lines[line]);
        source.push(cx.join('\n'));
        source.push(mjt.bless(['</pre>\n']));

    }

    var html = [mjt.bless(['<div class="mjt_error"']),
                (target_id ? [mjt.bless([' id="']), target_id, mjt.bless(['"'])]
                   : []),
                mjt.bless(['>']),
                e.name, ': ',
                e.message,
                source,
                mjt.bless(['</div>\n'])
                ];
    html =  html.concat(source);
    return html;
};

/**
 *
 *  @constructor
 *  @class mjt.Codeblock is a wrapper around eval() that
 *   allows better debugging of the evaluated code.
 *   mjt does lots of run-time code generation, and
 *   most javascript runtimes are very bad at tracking
 *   eval source code.
 */
mjt.Codeblock = function (name, codestr) {
    this.name = name;
    this.codestr = codestr;
    this.basefile = null;
    this.baseline = null;
};

/**
 *  it is expected that the error will be re-thrown after
 *   calling this function.
 *
 */
mjt.Codeblock.prototype.handle_exception = function (msg, e) {
    // XXX revisit this
    //  for now it isn't tracking line numbers correctly
    //   so these messages are a waste of time.
//    return;

    // if a codeblock closer to the error already saw this,
    //  bail (we could print more of the stack here)
    if (typeof e.mjt_error != 'undefined')
        return;

    var espec;

    if (!(e instanceof Error)) {
        espec = {
            name: 'Unknown exception',
            fileName: '',
            message: ''+e,
        };
    } else {
        espec = {
            fileName: e.fileName,
            lineNumber: e.lineNumber,
            name: e.name,
            message: e.message,
            stack: e.stack // firefox only?
        };
    }

    var filerx = this.basefile.replace(/(\W)/g, '\\$1') + ':(\\d+)\n';
    filerx = new RegExp(filerx);

    if (typeof e.stack == 'string') {
        // log error info about the deepest generated stackframe
        //  even if the error occurred in a deeper call
        var m = filerx.exec(e.stack);
        if (m.length) {
            var lineno = parseInt(m[1]) - this.baseline;
            if (lineno > 0)
                this.log_error_context(msg, e, lineno);
        }
    } else {
        // if no stack, we only show context if the exception
        //  was within generated code (since that's the only
        //  frame we have a line number for).
        // try to guess if this is from a codeblock eval
        if (e.fileName == this.basefile) {
            var lineno = e.lineNumber - this.baseline;
            if (lineno > 0) {
                espec.lineNumber =  lineno;
                espec.fileName =  '<generated code>';
                this.log_error_context(msg, e, lineno);
            }
        }
    }

    // hang the extra info off the error object for handlers upstack
    e.mjt_error = espec;
};

mjt.Codeblock.prototype.log_error_context = function (msg, e, lineno) {
    var cx = this.extract_context(this.codestr, lineno, 5);

    var pfx = '---' + lineno + '-->  ';
    var spc = [];
    for (var i = 0; i < pfx.length; i++)
        spc.push(' ');
    spc = spc.join('');

    var cxtext = [spc, cx.prev_lines.join('\n'+spc),
                   '\n', pfx, cx.the_line, '\n',
                   spc, cx.next_lines.join('\n'+spc)].join('');

    mjt.error('error', msg,
              '\n    ' + e.name + ': ' + e.message + '\n',
              cxtext);
};

/**
 *
 * extract a particular line from a block of (presumably) source code.
 * the line in question is placed in cx.the_line
 * arrays of the previous and next RADIUS lines are placed in
 *   cx.prev_lines and cx.next_lines respectively.
 * cx is initialized to {} if not passed in.
 * returns cx
 *
 */
mjt.Codeblock.prototype.extract_context = function (codestr, lineno, radius) {
    var source = [];

    var lines = codestr.split('\n');

    if (lineno < 0)
        lineno = 0;
    if (lineno >= lines.length)
        lineno = lines.length - 1;

    var line0 = lineno - radius;
    if (line0 < 0) line0 = 0;

    var prev_lines = [];
    for (line = line0; line < lineno; line++)
        prev_lines.push(lines[line]);

    var the_line = lines[lineno];

    var next_lines = [];
    for (line = lineno+1; line < lines.length && line < lineno + radius; line++)
        next_lines.push(lines[line]);

    return {
        prev_lines: prev_lines,
        the_line: the_line,
        next_lines: next_lines
    };
};

/**
 *
 *
 */
mjt.Codeblock.prototype.evaluate = function () {
    // evaluate the code string, generating a new function object
    // that can be used to instantiate the template as a string of
    // html.

    var t0 = (new Date()).getTime();

    mjt.debug && mjt.spew('evaluating code ' + this.name, [this.codestr]);

    // //@line doesn't seem to work on firefox 1.5?
    // TODO try this to clean up line numbers on firefox
    //  - could use bogus high line number if we're decoding it
    //    ourselves, using the high section as a tag to find the eval src.
    /*
    var codestr = [//     '//@line 100000\n',
                   this.codestr,
                   '\n; var s = { main: main }; s;\n'].join('');
    */

    var codestr = this.codestr;
    var result;

    // fireclipse (and firebug 1.1?) have sweeter eval debugging,
    //  so we let any errors past.
    // TODO can we check firebug version?
    if (0 && typeof console != 'undefined' && typeof console.trace == 'function') {
        result = eval(codestr);
    } else if (typeof window.navigator.appName === 'undefined') {
        // rhino + env.js - should have a better check than missing appName!
        result = eval(codestr);
    } else {
        // otherwise do what we can.
        // more suggestions on easier debugging here:
        //  http://www.nabble.com/Partial-solution-to-debugging-eval()-code-t3191584.html
        //  http://www.almaden.ibm.com/cs/people/bartonjj/fireclipse/test/DynLoadTest/WebContent/DynamicJavascriptErrors.htm
        // magic to get the current line number
        try { null(); } catch (e) { this.baseline = e.lineNumber + 2; this.basefile = e.fileName; }
        try {
            result = eval(codestr);
        } catch (e) {
            this.handle_exception('evaluating codeblock '+this.name, e);
            throw e;    // re-throw for other debuggers
        }
    }

    var dt = (new Date()).getTime() - t0;
    mjt.note('evaluated code in ', dt, 'msec, ', codestr.length, 'chars');

    return result;
};


//
//  ideally, mjt.Codeblock.prototype.evaluate should be the last
//  function in the file.  this reduces ambiguity with the bizarre
//  eval() linenumbers.
//
