
(function (fb) {

/*
 * from the client code.
 *
 * returns the value of a cookie given the cookie name.
 *
 */
fb.readCookie = function (name){
  var cookieValue = "";
  name += "=";
  if(document.cookie.length > 0){ 
    var offset = document.cookie.indexOf(name);
    if(offset != -1){ 
      offset += name.length;
      var end = document.cookie.indexOf(";", offset);
      if(end == -1) end = document.cookie.length;
      cookieValue = document.cookie.substring(offset, end);
    }
  }
  return cookieValue;
};

/*
 * parse the metaweb-user-info cookie
 * based on code from tim k and alee.
 */
fb.parse_metaweb_cookies = function () {
    function _cookieItem(c, i) {
        var s = c.indexOf('|'+i+'_');
        if (s != -1) {
            s = s + 2 + i.length;
            var e = c.indexOf('|',s);
            if (e != -1)
                return decodeURIComponent(c.substr(s,e-s));
        }
        return null;
    }

    mjt.freebase.freebase_user = null;

    // get user info from cookie:
    var cookieInfo = fb.readCookie("metaweb-user-info");
    if (cookieInfo.indexOf('A|') == 0) {
        // Using new cookie format (which is extensible and Unicode-safe)
        // 'g' = User GUID, 'u' = user account name, 'p' = path name of user obj
        // mimic the /type/user schema
        var user = { type: '/type/user' };
        user.id = _cookieItem(cookieInfo, 'p');
        user.guid = _cookieItem(cookieInfo, 'g');
        user.name = _cookieItem(cookieInfo, 'u');
        if (!user.id)
            user.id = user.guid;

        mjt.freebase.freebase_user = user;
    }
};

// run at startup
fb.parse_metaweb_cookies();

fb.FreebaseXhrTask = mjt.define_task(null);

fb.FreebaseXhrTask.prototype.init = function () {
    this.service = this._factory;
};

fb.FreebaseXhrTask.prototype.xhr_request = function (method, url, content_type, body) {
    url = this.service.service_url + url;
    this.xhr = fb.Xhr(method, url, content_type, body).enqueue();
    this.xhr
        .onready('xhr_ready', this)
        .onerror('error', this);
    return this;
};

fb.FreebaseXhrTask.prototype.xhr_form_post = function (url, form) {
    url = this.service.service_url + url;
    this.xhr = mjt.XhrFormPost(url, form).enqueue();
    this.xhr
        .onready('xhr_ready', this)
        .onerror('error', this);
    return this;
};

fb.FreebaseXhrTask.prototype.request = function () {
};

/**
 * handle responses from XHR requests to the metaweb service.
 * this handles the response envelope.
 */
fb.FreebaseXhrTask.prototype.xhr_ready = function (xhr) {
    // XXX hack for a bug in mqlwrite with query - 
    //  returns text/plain echoing the http request
    // http://bugs.metaweb.com/bugzilla/show_bug.cgi?id=6542
    if (/^POST/.test(xhr.responseText))
        return this.ready(null);

    // try to parse a json body regardless of status
    var ct = xhr.getResponseHeader('content-type');
    if (!ct.match(/^(application\/json|text\/javascript)(;.*)?$/))
        return this.error('/user/mjt/messages/json_response_expected',
                          'status: ' + xhr.status + ', content-type: ' + ct,
                          xhr.responseText);

    var o = mjt.json_to_js(xhr.responseText);
    this.envelope = o;

    if (o.code !== '/api/status/ok')
        return this.error(o.code,
                          o.messages[0].message);

    return this.ready(o.result);
};


//////////////////////////////////////////////////////////////////////

fb.MqlWrite = mjt.define_task(fb.FreebaseXhrTask,
                                    [{ name: 'query' }]);

fb.MqlWrite.prototype.init = function() {
    var qenv = { query: this.query };
    var qstr = mjt.json_from_js(qenv);

    return this.xhr_form_post('/api/service/mqlwrite',
                              { query: qstr });
};

//////////////////////////////////////////////////////////////////////

fb.FlushCache = mjt.define_task(fb.FreebaseXhrTask);

fb.FlushCache.prototype.init = function() {
    // an empty POST to the mqlwrite service updates our lastWriteTime.
    // we dont check the results at all though a low-level error will
    // bubble up.
    return this.xhr_form_post('/api/service/mqlwrite', {});
};

//////////////////////////////////////////////////////////////////////

/**
 *  mjt.task wrapper for freebase file upload service
 */
fb.Upload = mjt.define_task(fb.FreebaseXhrTask,
                          [{ name: 'content_type' },
                           { name: 'body' },
                           { name: 'values' }]);



fb.Upload.prototype.init = function() {
    var qenv = { query: this.query };
    var qstr = mjt.json_from_js(qenv);

    var path = '/api/service/upload';
    var qargs = mjt.formencode(this.values);
    if (qargs)
        path += '?' + qargs;

    return this.xhr_request('POST', path, this.content_type, this.body);
};


//////////////////////////////////////////////////////////////////////

/**
 *  mjt.task wrapper for freebase signin service
 */

fb.Signin = mjt.define_task(fb.FreebaseXhrTask,
                                  [{ name: 'username' },
                                   { name: 'password' }]);

fb.Signin.prototype.init = function() {
    if (typeof this.username == 'undefined')
        return this.xhr_form_post('/api/account/logout', {});

    return this.xhr_form_post('/api/account/login',
                              { username: this.username,
                                password: this.password })
        .ondone('clear_password', this);
};

fb.Signin.prototype.clear_password = function() {
    delete this.password;
    return this;
};

//////////////////////////////////////////////////////////////////////


})(mjt.services.FreebaseService.prototype);
