
/**
 *
 *  augment the mjt.services.FreebaseService prototype with
 *  methods that fetch MQL schemas.
 *
 *
 */

(function (freebase) {

/**
 *  mql directives known to this code.
 *   this list is incomplete.
 */
freebase.mql_directives = {
    create: { write:1,
              valuetype: '/type/rawstring',
              values: ['unless_exists', 'unconditional', 'unless_connected'] },
    connect:{ write:1,
              valuetype: '/type/rawstring',
              values: ['insert', 'delete', 'update'] },
    sort: { valuetype: '/type/rawstring' },
    limit: { valuetype:'/type/int'},
    index: { valuetype:'/type/int'},
    optional: { valuetype: '/type/boolean',
                values:[{name:'true', value:true},
                        {name:'false', value:false}] }
};


freebase.mql_value_types = {  
    '/type/value': true,
    '/type/boolean': true,
    '/type/int': true,
    '/type/float': true,
    '/type/text': true,
    '/type/rawstring': true,
    '/type/datetime': true,
    '/type/uri': true
};
/*   '/type/key',  ?   */


/**
 *  @class
 *  @constructor
 */
freebase.SchemaCache = function (service) {
    this.service = service;
    this.cache = {};
};

freebase.SchemaCache.prototype.get = function(tid) {
    if (typeof tid == 'undefined') {
        throw new Error('bad type id');
    }

    var s = this.cache[tid];
    if (typeof s !== 'undefined')
        return s;

    if (tid.charAt(0) != '/') {
        throw new Error('bad schema id "' + tid + '"');
    }

    s = this.service.Schema(tid).enqueue();
    this.cache[tid] = s;
    return s;
};


freebase.SchemaCache.prototype.lookup = function(tid) {
    return this.cache[tid];
};


freebase.SchemaCache.prototype.make_schema_query = function (tid) {
    return {
        id: tid,
        name: null,
        type: '/type/type',
        default_property: null,
        '/freebase/type_hints/mediator': null,
        '/type/namespace/keys': [{
            type: '/type/key',
            value: null,
            optional:true,
            namespace: {
                id: null,
                name: null,
                type: '/type/property',

                schema: null,
                expected_type: null,
                unique: null,

                master_property: null,
                reverse_property: null,
                '/freebase/property_hints/disambiguator': null
            }
        }]
    };
}



/**
 *  a local copy of a mql /type/type object and its /type/propertys
 *  
 *  filling this in may require a network request, so it can
 *  be used as a mjt.Task.
 */
freebase.Schema = mjt.define_task(null, [{name: 'typeid'}]);


freebase.Schema.prototype.toString = function() {
    return '[' + this._task_id + ' ' + this.typeid + ']';
};


freebase.Schema.prototype.init = function() {
    this.props = {};
    this.props_by_id = {};

    var freebase = this._factory;
    var tq = freebase.schema_cache.make_schema_query(this.typeid);
    this._mqlread = freebase.MqlRead(tq);

    return this;
};

/**
 *  request the schema using jsonp
 *
 */
freebase.Schema.prototype.request = function() {
    // mjt.log('fetching schema ', this.typeid);

    return this._mqlread.onready('handle_response', this)
        .onerror('error', this)
        .enqueue();
};


/**
 *  handle a successful schema query
 *
 *  this modifies the original dict, which is a no-no.
 *
 *   the _key property is added for each property
 *
 */
freebase.Schema.prototype.handle_response = function(r) {
    this.name = r.name;
    this.default_property = r.default_property || 'name';

    this.props = {};
    this.props_by_id = {};

    var propkeys = r['/type/namespace/keys'];
    for (var i = 0; i < propkeys.length; i++) {
        var pk = propkeys[i];
        if (pk.namespace.unique === null)
            pk.namespace.unique = false;
        this.props[pk.value] = pk.namespace;
        this.props[pk.value]._key = pk.value;
        this.props_by_id[pk.namespace.id] = pk.namespace;
    }

    // XXX hack for /type/object/link
    if (this.typeid === '/type/object' && typeof this.props.link === 'undefined') {
        this.props.link = {
            name: 'link',
            expected_type: '/type/link',
            _key: 'link'
        };
    }

    // mjt.log(' ... got schema ', this.typeid, 'name', this.name);
    return this.ready(this);
};


/**
 *  return a task which will warm up the schema cache
 *
 *  work in progress - do not use.
 */
freebase.SchemaCache.prototype.getcore = function() {
    if (this.corefetch)
        return this.corefetch;

    var freebase = this._factory;

    var preload_types = ['/type/object', '/type/value'];
    var multi = this.corefetch = freebase.MqlReadMultiple()

    // pull some other language spec stuff - directives, ...
    // multi.mqlread(tidk, freebase.MqlRead(...);

    for (var i = 0; i < preload_types.length; i++) {
        var tid = preload_types[i];
        var tidk = tid;
        multi.mqlread(tidk, freebase.MqlRead(freebase.schema_cache.make_schema_query(tid)));
    }

    return multi.enqueue();
};


})(mjt.services.FreebaseService.prototype);
