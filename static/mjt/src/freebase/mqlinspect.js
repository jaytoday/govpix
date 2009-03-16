/**
 *
 *  augment the mjt.services.FreebaseService prototype with
 *  a task to fetch "complete" property info from an object
 *
 *
 */

(function (freebase) {

var make_inspector_query = function (id) {
    return {
          id: id,
          name: null,
          type: [],

          '/type/reflect/any_master': [{
            optional:true,
            id: null,
            name: null,
            link: {
              master_property: {
                id: null,
                schema: null
              }
            }
          }],

          '/type/reflect/any_reverse': [{
            optional:true,
            id: null,
            name: null,
            link: {
              master_property: {
                id:null,
                schema: null,
                expected_type: null,
                reverse_property: {
                  id: null,
                  schema: null,
                  optional: true
                }
              }
            }
          }],

          '/type/reflect/any_value': [{
            optional:true,
            value: null,
            link: {
              master_property: {
                id:null,
                schema: null,
                expected_type: null
              },
            }
          }],

          't:/type/reflect/any_value': [{
            optional:true,
            type: '/type/text',
            value: null,
            lang: null,
            link: {
              master_property: {
                id:null,
                schema: null
              },
            }
          }],
          
          '/type/object/creator': [{
            optional:true,
            id:null,
            name:null
          }],
          '/type/object/permission': [{
            optional:true,
            id:null,
            name:null
          }],
          '/type/object/timestamp': [{
            optional:true,
            value: null,
          }],

          '/type/object/key': [{
            optional:true,
            value: null,
            namespace: null
          }],
          '/type/namespace/keys': [{
            optional:true,
            value: null,
            namespace: null
          }]
    };
}

freebase.Inspect = mjt.define_task(null,
                                   [{name: 'id'}])


freebase.Inspect.prototype.init = function () {
    this.service = this._factory;
    var q = make_inspector_query(this.id);
    this.mqlread = this.service.MqlRead(q).enqueue()
    return this.require(this.mqlread);
}

freebase.Inspect.prototype.request = function () {
    var result = this.mqlread.result;
    var proptypes = {};
    function pushtype(propdesc, prop) {
        var tid = propdesc.schema;
        if (typeof proptypes[tid] == 'undefined')
            proptypes[tid] = {};
        if (typeof proptypes[tid][propdesc.id] == 'undefined')
            proptypes[tid][propdesc.id] = [];
        proptypes[tid][propdesc.id].push(prop);
    }
    var pi, ps;
    
    ps = result['/type/reflect/any_master'];
    if (ps === null) ps = [];
    for (pi = 0; pi < ps.length; pi++)
        pushtype(ps[pi].link.master_property, ps[pi]);

    ps = result['/type/reflect/any_value'];
    if (ps === null) ps = [];
    for (pi = 0; pi < ps.length; pi++) {
        var propdesc = ps[pi].link.master_property;

        // /type/text values are queried specially
        //  so that we can get the lang, so ignore
        //  them here.
        if (propdesc.expected_type == '/type/text')
            continue

        pushtype(propdesc, ps[pi]);
    }

    ps = result['t:/type/reflect/any_value'];
    if (ps === null) ps = [];
    for (pi = 0; pi < ps.length; pi++)
        pushtype(ps[pi].link.master_property, ps[pi]);

    function pushprop(propid) {
        var ps = result[propid];
        if (ps === null)
            return;

        var keyprop = {
            id: propid,
            schema: propid.replace(/\/[^\/]+$/, '')
        };
        for (var pi = 0; pi < ps.length; pi++)
            pushtype(keyprop, ps[pi]);
    }

    pushprop('/type/object/key');
    pushprop('/type/namespace/keys');

    pushprop('/type/object/creator');
    pushprop('/type/object/permission');
    pushprop('/type/object/timestamp');

    ps = result['/type/reflect/any_reverse'];
    if (ps === null) ps = [];
    for (pi = 0; pi < ps.length; pi++) {
        var prop = ps[pi];
        var propdesc = prop.link.master_property.reverse_property;

        // synthetic property descriptor for the reverse of
        //  a property with no reverse descriptor.
        // note the bogus id starting with '-'.
        if (propdesc === null) {
            /*
            var schema = prop.link.master_property.expected_type;
             */
            var schema = 'other';
            propdesc = {
                id: '-' + prop.link.master_property.id,
                schema: schema
            };
        }
        pushtype(propdesc, prop);
    }

    this.id = result.id
    this.name = result.name
    this.type = result.type
    return this.ready(proptypes);
};

})(mjt.services.FreebaseService.prototype);
