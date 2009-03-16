

mjt.Xhr = mjt.define_task(null,
                          [{ name: 'method'},
                           { name: 'url'},
                           { name: 'content_type', 'default':null },
                           { name: 'body', 'default':null }]);

/**
 * mjt.Task wrapper around XMLHttpRequest
 *
 *  @param url          the url of the HTTP request
 *  @param cb           a function to be called with the XHR object when done
 *  @param [posttype]   if this is a POST, gives the content-type
 *  @param [postbody]   if this is a POST, gives the body for the request
 *
 *  the following HTTP header will be added:
 *    X-Metaweb-Request: 1 
 */
mjt.Xhr.prototype.init = function () {
    var xhr;

    if (typeof XMLHttpRequest != "undefined") {
        xhr = new XMLHttpRequest();
    } else if (typeof ActiveXObject != "undefined") {
        xhr = new ActiveXObject("MSXML2.XmlHttp");
    } else {
        return this.error('no XMLHttpRequest found');
    }
    
    this.xhr = xhr;
    return this;
};


mjt.Xhr.prototype.request = function () {
    var task = this;
    var xhr = this.xhr;

    xhr.onreadystatechange = function (e) {
        if (xhr.readyState != 4)
            return;

        xhr.onreadystatechange = function(){};

        if ((''+xhr.status).charAt(0) == '2')
            return task.ready(xhr);
        return task.error('bad_status_' + xhr.status, xhr.statusText);
    };

    xhr.open(this.method, this.url, true);

    if (this.content_type !== null)
        xhr.setRequestHeader('Content-Type', this.content_type);

    // this header is expected by freebase.com, should go away
    // in favor of jquery's header
    xhr.setRequestHeader('X-Metaweb-Request', '1');

    // this is added by jquery
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

    xhr.setRequestHeader('Content-Length', ''+this.body.length);

    var r = xhr.send(this.body);

    if (this.body !== null)
        body = null;

    return this;

};



/**
 *
 *
 */
mjt.XhrFormPost = function (url, form) {
    // TODO switch to multipart/form-data for efficiency
    var body = mjt.formencode(form);
    return mjt.Xhr('POST', url,
                   'application/x-www-form-urlencoded', body);
};
