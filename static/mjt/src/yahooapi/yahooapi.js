

if (typeof mjt == 'undefined') mjt = {};
if (typeof mjt.yahooapi == 'undefined') mjt.yahooapi = {};

mjt.yahooapi.service_url = 'http://api.search.yahoo.com';
mjt.yahooapi.APP_ID = 'YahooDemo';


/**
 *  base "class" for specific yahoo api service wrappers
 */
mjt.yahooapi.BaseTask = mjt.define_task();

/**
 *  make a yahoo jsonp request
 *
 */
mjt.yahooapi.BaseTask.prototype.yahoo_request = function(path, form) {
    form.output = 'json';
    form.appid = mjt.yahooapi.APP_ID;
    var url = mjt.yahooapi.service_url + path;

    this.jsonp = mjt.JsonP();
    this.jsonp.set_timeout()
         .onready('handle_envelope', this)
         .onerror('handle_service_error', this)
         .jsonp_request_form(url, form, 'callback');

    return this;
};


/**
 *  handle a yahoo jsonp response
 *
 */
mjt.yahooapi.BaseTask.prototype.handle_envelope = function (o) {
    //mjt.log('yahooapi.BaseTask.handle_envelope', this, o);

    if ('ResultSet' in o) {
        if (o.ResultSet.totalResultsAvailable == 0)
            return this.empty_result();
        else
            return this.ready(o.ResultSet);
    }

    if ('Error' in o)
        return this.error('yahooapi',
                          o.Error.Title,
                          o.Error.Message.join('\n'));

    return this.unanticipated();
};


/**
 *  handle errors at the jsonp layer
 *
 */
mjt.yahooapi.BaseTask.prototype.handle_service_error = function() {
    mjt.warn('yahoo envelop error', arguments);
    this.error.apply(this, arguments);
    return this;
};

/**
 *  send the request
 *
 *  "subclasses" of BaseTask should override this
 *
 */
mjt.yahooapi.BaseTask.prototype.request = function() {
    mjt.error('must override BaseTask.request()');
};


//////////////////////////////////////////////////////////////////////


mjt.yahooapi.ImageSearch = mjt.define_task(mjt.yahooapi.BaseTask,
                                           [ { name: 'query'} ]);

mjt.yahooapi.ImageSearch.prototype.request = function () {
    return this.yahoo_request('/ImageSearchService/V1/imageSearch',
                              { query: this.query });
};


