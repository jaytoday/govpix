
/**
 *  an autosuggest menu controller
 *
 *  this code was inspired by
 *    http://www.brandspankingnew.net/specials/ajax_autosuggest/ajax_autosuggest_autocomplete.html
 *  although it has been just about completely rewritten.
 *
 *  @param input_id    is the id of an html <input type=text> element
 *
 *
 *  the menu may be:
 *     created or not - if the
 *     open or hidden
 *     waiting to hide (will stay open if it regains focus before timeout)
 *
 */
mjt.Suggester = function (input_id) {

    ///////////////////////////////////////
    // controller parameters
    //  these set the behavior of the controller

    // id of <input type="text"/>
    this.input_id = null;  // set later

    // existing means that the final value must be
    //  an entry from a suggestion list, or the
    //  editor will never confirm.
    this.existing = false;

    // if true, a suggestion chosen from the list
    //  using TAB or ENTER or CLICK will finish
    //  the edit.
    this.autoconfirm = true;

    // template function to generate the menu
    this.menu_tfunc = null;

    //////////////////////
    // controller state

    // true if the suggestion menu is visible (even in loading state)
    // if menu_open is false, item must be 0
    this.menu_open = false;

    // null if no blur event has been received.  once the blur
    //  is received, this is a token from window.setTimeout().
    //  if we haven't gotten focus back after the timeout,
    //  we assume we're done.
    this.pending_blur = null;

    // null if no open is pending.  if the input text is newer
    //  than the menu, this is a token from window.setTimeout().
    //  this allows us to wait rather than sending queries on
    //  every keystroke.
    this.pending_create = null;

    // this.final = false;

    // id of the top menu div.  this is null if the menu
    // doesn't exist yet.
    this.menu_id = null;

    // this is the current text used to create this.menu_id,
    //  and should be null when menu_id is null.
    this.menu_value = null;

    // this is passed as application data to the menu template function
    this.menu_context = {};

    //////////////////////

    this.reset_menu_state();

    // finish init
    if (typeof input_id != 'undefined') {
        this.attach(input_id);
    }
};

/**
 *  clean up the per-completion state
 */
mjt.Suggester.prototype.reset_menu_state = function () {
    // index of the active (hilit) item.
    //  0 means none selected
    //  1..N are the corresponding suggestion items
    this.item = 0;

    // the data associated with the current menu choice.
    // this is needed when there's more to an item than
    // just the string you're completing on.
    // XXX this isnt set up very cleanly yet
    //this.suggestion_data = null

    this.chosen_suggestion = null

    // this is saved when the editor is created and restored on ESC
    //  or blur
    this.previous_value = null;

    var input = (typeof this.input_id === 'string') ?
                document.getElementById(this.input_id) : undefined;
    if (typeof input === 'object' && input !== null)
        this.previous_value = input.value;
    else
        this.previous_value = null;
};

/********   controller actions   ********/

/**
 *  attach the controller to an input field
 *  @param input_id    the id of an html <input type=text> element
 */
mjt.Suggester.prototype.attach = function (input_id) {
    this.input_id = input_id;

    var input = document.getElementById(this.input_id);
    this.previous_value = input.value;

    // this stops conflicts with firefox autocomplete
    input.setAttribute('autocomplete', 'off');

    var ctl = this;
    if (/MSIE/.test(navigator.userAgent)) {
        // IE doesn't fire keypress for arrow keys
        input.onkeydown  = function(ev) { return ctl.text_keypress(this,ev||window.event); };
    } else {
        // but onkeydown doesn't autorepeat so we prefer that otherwise
        input.onkeypress = function(ev) { return ctl.text_keypress(this,ev||window.event); };
    }

    input.onkeyup    = function(ev) { return ctl.text_keyup(this,ev||window.event); };
    input.onfocus    = function(ev) { return ctl.text_focus(this,ev||window.event); };

    input.focus();
};

/**
 *  detach the controller from the input field
 */
mjt.Suggester.prototype.detach = function () {
    var input = document.getElementById(this.input_id);
    var handlers = ['onkeypress', 'onkeyup', 'onfocus', 'onblur'];

    for (var i = 0; i < handlers.length; i++) {
        // TODO whats the right way to clean up handlers?
        input[handlers[i]] = '';
    }
};

/**
 *  create and show the popup menu.
 *  .open_menu() is a more useful wrapper.
 */
mjt.Suggester.prototype.create_menu = function () {
    if (this.menu_id) {
        mjt.warn('menu already created');
        return;
    }

    if (this.pending_create)
        clearTimeout(this.pending_create);
    this.pending_create = null;

    var input = document.getElementById(this.input_id);

    if (typeof input !== 'object' || input === null) {
        mjt.log('suggester text input #' + this.input_id + ' is unexpectedly missing');
        this.input_id = null;
        return;
    }

    this.menu_value = input.value;
    this.menu_open = true;

    var ctl = this;
    var cx = this.menu_context;
    this.menu_id = mjt.popup(this.menu_tfunc, [ctl, input.value, cx], {
       target: input,
       style: {
           left: 0,                        /* offset from input */
           top: input.offsetHeight - 5,    /* offset from input */
           width: input.offsetWidth
       }
    });
};

/**
 *  completely remove the menu from the DOM
 */
mjt.Suggester.prototype.destroy_menu = function () {
    if (!this.menu_id) {
        mjt.log('menu already destroyed');
        return;
    }

    var menu = document.getElementById(this.menu_id);
    menu.parentNode.removeChild(menu);

    // TODO scrapedown menu to avoid memory leaks

    this.menu_id = null;
    this.menu_value = null;
};


/**
 *  show the menu if hidden and still relevant, otherwise
 *   create a new one.
 *
 *  @param delay   an optional delay in msec to reduce query load
 */
mjt.Suggester.prototype.open_menu = function (delay) {
    if (typeof delay == 'undefined')
        delay = 200;

    if (this.menu_open) {
        mjt.warn('menu already open');
        return;
    }

    // reset the state
    this.reset_menu_state();

    var input = document.getElementById(this.input_id);
    if (this.menu_id !== null) {
        if (this.menu_value === input.value) {
            var menu = document.getElementById(this.menu_id);
            menu.style.visibility = 'visible';
            this.menu_open = true;
            return;
        } else {
            this.destroy_menu();
        }
    }

    // no hidden menu, create a new one

    if (delay === 0) {
        // create immediately
        this.create_menu();
        return;
    }

    if (this.pending_create)
        clearTimeout(this.pending_create);
    var ctl = this;
    this.pending_create = window.setTimeout(function () {
        ctl.create_menu();
    }, delay);
};

/**
 *  hide the menu without removing it from the DOM
 */
mjt.Suggester.prototype.close_menu = function () {
    if (this.pending_create) {
        clearTimeout(this.pending_create);
        this.pending_create = null;
    }

    if (!this.menu_open) {
        mjt.log('suggest controller: menu already closed', this.menu_id);
        return;
    }

    // if we have a menu, just hide it
    if (this.menu_id != null) {
        var menu = document.getElementById(this.menu_id);
        menu.style.visibility = 'hidden';
    }

    this.menu_open = false;

    if (this.pending_blur)
        clearTimeout(this.pending_blur);
    this.pending_blur = null;
};

/**
 *  close and re-open the menu with the current input text
 */
mjt.Suggester.prototype.refresh_menu = function () {
    if (this.menu_open)
        this.close_menu();
    this.open_menu();
};


/**
 * get a suggestion by item # and return the html element.
 */
mjt.Suggester.prototype.lookup_suggestion_elt = function (item) {
    if (typeof item == 'undefined')
        item = this.item;

    var menu = document.getElementById(this.menu_id);
    var suggs = $(menu).find('.suggestion');

    // mjt.log('looking for item ', item, ' of ', suggs.length,
    //         ' under ', this.menu_id);
    for (var ci = 0; ci < suggs.length; ci++) {
        var sugg = suggs[ci];
        var isugg = parseInt($(sugg).find('.suggestion_index').text());

        if (isugg === item)
            return sugg;
    }
    return undefined;
};

/**
 * get a suggestion by item # and return a dict of info about it
 */
mjt.Suggester.prototype.lookup_suggestion = function (item) {
    var elt = this.lookup_suggestion_elt(item);
    if (typeof elt === 'undefined')
        return undefined;

    var value = $(elt).find('.suggestion_value').text();

    var sugg = {
        item: item,
        suggestion_elt: elt,
        value: value
    };

    var info = $(elt).find('.suggestion_info').text();
    if (typeof info !== 'undefined')
        sugg.info = info;

    // XXX this is a query editor specific hack
    var datastr = elt.getAttribute('qe.suggestion_data');
    if (typeof datastr == 'string' && datastr.length > 0) {
        sugg.data = rison.decode(datastr);
        sugg.value = sugg.data.v;
    }

    //mjt.log('looked up sugg', sugg);

    return sugg;
};


mjt.Suggester.prototype.choose_suggestion = function (item) {
    if (typeof item == 'undefined')
        item = this.item;

    var input = document.getElementById(this.input_id);

    //mjt.log('choose', item);

    var newvalue;

    if (item === 0) {
        this.choose_value(input.value);
        this.close_menu();
        return;
    }

    var sugg = this.lookup_suggestion(item);

    if (typeof sugg != 'undefined') {
        this.chosen_suggestion = sugg;
        this.choose_value(sugg.value);
    } else
        this.choose_value(input.value);

    this.close_menu();
};


mjt.Suggester.prototype.choose_value = function (value) {
    var input = document.getElementById(this.input_id);

    //mjt.log('choose_value', value, input);

    if (!input) {
        mjt.warn('choose_value: missing <input>');
        return;
    } else if (input.value !== value) {
        input.value = value;
        this.destroy_menu();
    }
};

mjt.Suggester.prototype.complete_common_prefix = function () {
    mjt.log('complete_common');

    // choose_value();
};

/**
 *  explicitly remove input focus from the element, without
 *   triggering the onblur handler.
 */
mjt.Suggester.prototype.blur = function () {
    if (this.pending_blur) {
        clearTimeout(this.pending_blur);
        this.pending_blur = null;
    }
    var input = document.getElementById(this.input_id);
    if (typeof input !== 'object' || input === null)
        return;

    input.onblur = '';
    input.blur();
};

mjt.Suggester.prototype.abort_edit = function () {
    mjt.log('abort_edit', this);
    if (this.menu_open)
        this.close_menu();
    this.choose_value(this.previous_value);

    this.blur();

    this.callhook('onabort');
    this.reset_menu_state();
};

mjt.Suggester.prototype.finish_edit = function () {
    //mjt.log('finish');

    if (this.menu_open)
        this.close_menu();

    this.blur();

    this.callhook('onfinish', this.chosen_suggestion);
    this.reset_menu_state();
};

mjt.Suggester.prototype.edit_next = function () {
    mjt.log('edit_next');
};


mjt.Suggester.prototype.set_active_item = function (item) {
    // mjt.log('hilite_item', arguments);

    //var elt = document.getElementById(this.menu_id);

    // X unhilite the existing item
    $('#'+this.menu_id).find('.active_suggestion')
                       .removeClass('active_suggestion');

    this.item = item;

    if (item === 0)
        return;

    var sugg = this.lookup_suggestion_elt(item);

    // hilite the new item if found
    if (typeof sugg !== 'undefined') {
        $(sugg).addClass('active_suggestion');
        this.callhook('onchange', sugg);
    }
};

/********   controller helpers   ********/

mjt.Suggester.prototype.callhook = function (key) {
    var a = this[key];
    var args = [];
    for (var ai = 1; ai < arguments.length; ai++)
        args.push(arguments[ai]);

    if (typeof a == 'undefined')
        return;
    for (var i = 0; i < a.length; i++) {
        //mjt.log('calling suggestion hook', key, args, a[i]);
        a[i].apply(this, args);
    }
};

mjt.Suggester.prototype.addhook = function (key, cb) {
    if (typeof this[key] == 'undefined')
        this[key] = [];
    this[key].push(cb);
};


// is there a canonical list of these somewhere?
//  some of these i just made up...
// TODO: fill in from dom ones on MDC
mjt.Suggester.keycode_map = {
     9: 'TAB',
    13: 'ENTER',
    27: 'ESC',
    37: 'ARRLEFT',
    38: 'ARRUP',
    39: 'ARRRIGHT',
    40: 'ARRDN'
};


mjt.Suggester.event_key = function (ev) {
    var kc = ev.keyCode;
    var k = mjt.Suggester.keycode_map[kc];
    if (typeof k != 'undefined')
        return k;

    return kc;
};

// delta should be +1 or -1
mjt.Suggester.prototype.arrow_updown = function (delta) {
    if (!this.menu_open) {
        this.open_menu();
        return;
    }


    var item = this.item + delta;
    if (item < 0)
        return;
    /* this.nitems doesnt exist!
    if (item > this.nitems+1)
        return;
    */

    this.set_active_item(item);
};


/********   event handlers   ********/

/**
 *  onfocus= handler for the input element
 */
mjt.Suggester.prototype.text_focus = function (input, ev) {
    //mjt.log('text_focus', arguments);
    var ctl = this;
    input.onblur     = function(ev) { return ctl.text_blur(this,ev||window.event); };
    return true;
};

/**
 *  onblur= handler for the input element
 */
mjt.Suggester.prototype.text_blur = function (input, ev) {
    //mjt.log('text_blur', this.menu_open, arguments);

    // TODO could some of this messiness be removed using
    //  ev.relTarget to distinguish focus changes within the
    //  suggest ui from times when focus leaves the ui?

    // this should happen after a short delay, because sometimes
    //  the focus will be restored - e.g. after a click on a suggestion
    var ctl = this;
    var _blur_timeout = function () {
        ctl.abort_edit();
    };

    // unfortunately small values seem to cause race conditions -
    // the timer may fire before an onclick that triggered this onblur.
    // we basically have to wait this many msec to find out if
    // a click happened.
    // see also: the end of click_suggestion()
    if (this.pending_blur)
        clearTimeout(this.pending_blur);
    this.pending_blur = setTimeout(_blur_timeout, 200);

    return true;
};


/**
 *  onkeypress= handler for the input element
 */
mjt.Suggester.prototype.text_keypress = function (input, ev) {
    var k = mjt.Suggester.event_key(ev);
    //mjt.log('text_keypress', k, arguments);

    switch (k) {
      case 'ARRUP':
        this.arrow_updown(-1);
        return false;

      case 'ARRDN':
        this.arrow_updown(+1);
        return false;

      case 'ARRLEFT':
        // mjt.log('ilen', input.value.length, 'sel', input.selectionStart, input.selectionEnd);
        return true;

      case 'ARRRIGHT':
        //mjt.log('ilen', input.value.length, 'sel', input.selectionStart, input.selectionEnd);
        if (input.selectionStart < input.value.length)
            return true;

        this.complete_common_prefix();
        return false;

      case 'ENTER':
        if (this.menu_open) {
            this.choose_suggestion();
            if (!this.autoconfirm)
                return false;
        }

        this.finish_edit();
        return false;

      case 'TAB':
        if (this.menu_open) {
            this.choose_suggestion();
            if (!this.autoconfirm)
                return false;
        }
        this.finish_edit();

        if (this.next_edit_id) {
            this.edit_next();
            return false;
        }
        // if we don't have a next_edit, let the browser do its thing.
        return true;

      case 'ESC':
        if (this.menu_open) {
            this.close_menu();
            if (!this.autoconfirm)
                return false;
        }
        this.abort_edit();
        return false;

      default:
        // keypress is handled on keyup, after the field changes
        return true;
    }
    return true;
};


/**
 *  onkeyup= handler for the input element
 *
 *  this will trigger a new request for suggestions
 */
mjt.Suggester.prototype.text_keyup = function (input, ev) {
    var k = mjt.Suggester.event_key(ev);
    //mjt.log('text_keyup', k, input.value, arguments);

    if (typeof k == 'string') {
        switch (k) {
          case 'ARRLEFT':
          case 'ARRRIGHT':
            return true;
          default:
            // if it's named, we don't pass it
            return false;
        }
    }

    this.refresh_menu();
    return true;
};


mjt.Suggester.prototype.menu_mouseover = function (elt, ev) {
    var target = ev.srcElement || ev.target;
    //mjt.log('menu_mouseover', arguments);
};

mjt.Suggester.prototype.menu_mouseout = function (elt, ev) {
    var target = ev.srcElement || ev.target;
    //mjt.log('menu_mouseout', arguments);
    this.set_active_item(0);
};


mjt.Suggester.prototype.suggestion_mouseover = function (elt, ev) {
    var target = ev.srcElement || ev.target;
    var ix = parseInt($(elt).find('.suggestion_index').text());

    // mjt.log('suggestion_mouseover', ix, arguments);
    this.set_active_item(ix)
};

mjt.Suggester.prototype.suggestion_mouseout = function (elt, ev) {
    var target = ev.srcElement || ev.target;
    var ix = parseInt($(elt).find('.suggestion_index').text());

    // mjt.log('suggestion_mouseout', ix, arguments);
    //this.set_active_item(0);
};

mjt.Suggester.prototype.click_suggestion = function (elt, ev) {
    var target = ev.srcElement || ev.target;
    var ix = parseInt($(elt).find('.suggestion_index').text());

    if (!this.menu_open) {
        mjt.log('click_suggestion on closed menu', ix, arguments);
        return false;
    }

    //mjt.log('click_suggestion', ix, arguments);

    this.choose_suggestion(ix)

    if (this.autoconfirm) {
        this.finish_edit();
        return false;
    }

    /* clicking takes focus away from the textinput: restore it here.
     * see comment in text_blur */
    var input = document.getElementById(this.input_id);
    input.focus();

    if (this.pending_blur)
        clearTimeout(this.pending_blur);
    this.pending_blur = null;

    return false;
};

mjt.Suggester.standard_textinput = function (input_id, value) {
    // the edit form is too simple to be worth generating with mjt
    var div = document.createElement('div');
    var form = document.createElement('form');
    form.method = 'get';
    form.action = '#';
    form.style.display = 'inline';

    var formdiv = document.createElement('div');

    var input = document.createElement('input');
    input.type  = 'text';
    input.value = 'whatever';
    input.size  = 40;
    input.name  = 'qs';
    input.id    = input_id;

    formdiv.appendChild(input);
    form.appendChild(formdiv);
    div.appendChild(form);

    // these two don't work???
    form.onsubmit = function() { return false; };
    input.value = value;

    return div.innerHTML;
};

mjt.Suggester.edit_onclick = function (handler_elt, event, kws) {
    var target = event.srcElement || event.target;

    if (! target.id)
        target.id = mjt.uniqueid('edittext');


    var ctl = mjt.Suggester.edittext(target, undefined, undefined,
                                  undefined, kws.menufunc);

    for (var hk in ['onfinish', 'onabort']) {
        if (typeof kws[hk] == 'undefined') continue;
        ctl.addhook(hk, kws[hk]);
    }
    return false;
};

mjt.Suggester.edittext = function (elt, value, selector, tfunc, menu_tfunc) {
    if (elt.nodeName == 'INPUT')
        return false;

    // need to check if elt matches too:
    // elt = $(elt).parents(selector)[0];


    if (typeof value === 'undefined')
        value = elt.innerHTML;

    var input_id = mjt.uniqueid('edittmp');

    if (typeof tfunc != 'function') {
        elt.innerHTML = mjt.Suggester.standard_textinput(input_id, value);
    } else {
        // cross over into the .html file for textinput() mjt
        // TODO use a wrapper that does teardown
        elt.innerHTML = mjt.flatten_markup(tfunc(input_id, value));
    }

    // this is called when the edit completes
    var _finish_edittext = function () {
        var input = document.getElementById(this.input_id);

        if (!input) {
            mjt.warn("_finish_edittext: <input> is gone, cant find value");
            return false;
        }
        var value = input.value;

        var elt = this.edited_elt;
        // TODO use a wrapper that does teardown
        elt.innerHTML = value;

        return false;
    };

    // set up autocomplete once the template is filled in
    var ctl = new mjt.Suggester();
    ctl.edited_elt = elt;
    ctl.menu_tfunc = menu_tfunc;
    ctl.addhook('onfinish', _finish_edittext);
    ctl.addhook('onabort',  _finish_edittext);

    ctl.attach(input_id);

    return ctl;
};


/**
 * split a string into three (possibly empty) substrings,
 * such that the middle substring matches the "prefix" argument.
 *
 * originally from bsn.AutoSuggest
 *
 */
mjt.Suggester.splitmatch = function (val, prefix) {
    var st = val.toLowerCase().indexOf(prefix.toLowerCase());
    var se = st+prefix.length;
    return [val.substring(0,st),
            val.substring(st, st+se),
            val.substring(st+se)];
};
