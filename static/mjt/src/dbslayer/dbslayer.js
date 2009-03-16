
//
//  mjt.Task wrapper around the dbslayer http/mysql gateway
//
//  see http://dbslayer.org/projects/dbslayer
//
//  the dbslayer code must be running a patch to accept the
//  CALLBACK property in its toplevel envelope.  this patch
//  has been submitted to the dbslayer developers
//


DbslayerTask = mjt.define_task(null,
                               [{ name: 'url' },
                                { name: 'sql'} ]);

DbslayerTask.prototype.host = 'taco.metaweb.com:9090';

DbslayerTask.prototype.init = function() {
};

DbslayerTask.prototype.request = function() {
    this.jsonp = mjt.JsonP();

    // harder to do the hashing trick for caching
    //  because we can't just append the callback=
    //  string to the url at the last moment.  skip it.
    var cbid = this.jsonp.generate_callback();

    var q = {
        SQL: this.sql,
        STAT: true,
        HOST_INFO: true,
//      CLIENT_INFO: true,
//      SERVER_VERSION: true,
//      SLAYER_HELP: true,
        CALLBACK: cbid
    };


    var qstr = mjt.formquote(mjt.json_from_js(q));
    this.jsonp.url = this.url + '/db?' + qstr;

    this.jsonp.set_timeout()
        .enqueue()
        .onready('handle_envelope', this)
        .onerror('error', this);

    return this;
};

//
// handle a query response.
//
DbslayerTask.prototype.handle_envelope = function(o) {
    if ('RESULT' in o) {
        //if (!(this.result instanceof Array))
        //    result = [o.RESULT];
        return this.ready(o.RESULT);
    }

    if ('ERROR' in o) {
        mjt.warn('dbslayer error', o);
        return this.error(o.ERROR);
    }

    if ('MYSQL_ERROR' in o)
        return this.error('dbslayer.mysql.' + o.MYSQL_ERRNO, o.MYSQL_ERROR);

    return this.unanticipated()
};

