
/**
 *
 * Reified Mql data structures for query manipulation,
 *  with type inference.
 *
 * Note that this is in no way an implementation of MQL,
 *  it is hopefully good enough to be useful but it is
 *  incorrect in many ways.
 */

(function (freebase) {

/**
 *
 * a schema-aware MQL query object. 
 *
 * @param query   the mql query as a javascript object tree
 */
freebase.MqlQuery = mjt.define_task (null, [{name:'query'}]);


freebase.MqlQuery.prototype.init = function () {
    this.service = this._factory;
    this.qtop = this.service.QObject(null, {_:this.query}, this);
    this.qprop = this.qtop.props._;
    this.qobject = this.qprop.value;

    // the recursive construction of qtop should have
    // created lots of requirements for us.  when
    // they are all ready, set ourselves to ready.
    this.enqueue();
};

/*
freebase.MqlQuery.prototype.enqueue = function () {
throw new Error ('bad eqn');
}
*/

freebase.MqlQuery.prototype.request = function () {
    //mjt.warn('MQLQUERY TOP READY', this);
    this.ready();
};


//
//   untested but hopefully useful for parsing mql errors
//    with error_inside:"." markers.
//
freebase.MqlQuery.prototype.find_mql_error_inside = function (d, path) {
    //mjt.log('fmei', d, path);
    if (typeof path === 'undefined')
        path = [];

    if (d === null)
        return undefined;

    if (d instanceof Array) {
        for (var i = 0; i < d.length; i++) {
            if (typeof d[i] != 'object' || d[i] === null) continue;

            path.push(i);
            var ip = this.find_mql_error_inside(d[i], path);
            if (ip) return ip;
            path.pop();
        }
    } else {
        for (var k in d) {
            if (!d.hasOwnProperty(k)) continue;

            if (k == 'error_inside') {
                if (d[k] != '.')
                    path.push(d[k]);
                return path;
            }

            if (typeof d[k] != 'object' || d[k] === null) continue;

            path.push(k);
            var kp = this.find_mql_error_inside(d[k], path);
            if (kp) return kp;
            path.pop();
        }
    }

    return undefined;
}




/**
 *
 *  QObject requires data from the net, so it is a task.
 * 
 *  @class QObject represents a node in a MQL query.
 *
 */
freebase.QObject = mjt.define_task(null,
                               [{ name: 'qprop' },
                                { name: 'obj' },
                                { name: 'mq' }
                                ]);

freebase.QObject.prototype.toString = function() {
    return '[' + this._task_id + ' ' + this.pathstr + ']';
};

/**
 *
 * Reified Mql data structures for query manipulation,
 *  with type inference.
 *
 * @param qprop   the QProperty containing this QObject, or null
 * @param obj     a mql json tree
 * @param {mq}    the toplevel mqlquery (required iff qprop==null)
 */
freebase.QObject.prototype.init = function () {
    this.service = this._factory;
    // use info from qprop if present
    if (this.qprop) {
        this.mq = this.qprop.mq;
        this.pathstr = this.qprop.pathstr;
        this.depth = this.qprop.depth;
        this.type = this.qprop.vtype;
    } else {
        this.pathstr = null;
        this.depth = 0;
        // this.type = undefined
    }

    var o = this.obj;

    // check for mql type override
    if (typeof o.type == 'string')
        this.type = o.type;

    //mjt.log('MKOBJ', this.type, this);

    if (!this.type) {
        // we couldn't find the type without
        // context, so add a dependency on
        // the property.
        if (this.qprop)
            this.require(this.qprop);
    }

    // initialize the properties
    this.props = {};
    for (var k in this.obj) {
        if (!this.obj.hasOwnProperty(k))
            continue;
        this.props[k] = this.service.QProperty(this, k)
    }

/*
    var m = /^directive:(.+)$/.exec(tid);
    if (m) {
        var d = freebase.mql_directives[m[1]];
        if (typeof d !== 'undefined')
            return this.get(d.valuetype);
    }
 */

    // need the schema to continue
    if (this.type && this.type.charAt(0) == '/')
        this.require(this.service.schema_cache.get(this.type));
    this.enqueue();
};

/**
 *  called when all prerequisites are ready
 *
 */
freebase.QObject.prototype.request = function () {
    if (!this.type && this.qprop)
        this.type = this.qprop.vtype;

    if (!this.type && this.pathstr === null)
        return this.ready();

    this._schema = this.service.schema_cache.get(this.type);
    this._schema
        .onready('ready', this, this)
        .onerror('error_nest', this);

    // sort props in a useful default order?
}


// inferred types might be dirty after this
freebase.QObject.prototype.add_property = function (k, v) {
    if (typeof this.obj[k] !== 'undefined') {
        mjt.warn('add_property: already defined', k, this);
        return this.props[k];
    }
    this.obj[k] = v;
    this.props[k] = this.service.QProperty(this, k);
    return this.props[k];
};


// inferred types might be dirty after this
freebase.QObject.prototype.del_property = function (k) {
    if (typeof this.obj[k] === 'undefined') {
        mjt.warn('del_property: missing', k, this);
        return;
    }
    var v = this.obj[k];
    var prop = this.props[k];

    delete this.obj[k];
    delete this.props[k];

    return;
};




freebase.QObject.prototype.follow = function (path, istart) {
    if (typeof istart == 'undefined')
        istart = 0;
    var qo = this;
    var qp = null;
    for (var i = istart; i < path.length; i++) {
        var k = path[i];
        if (typeof k == 'number' && qo instanceof Array) {
            qo = qo[k];
        } else if (typeof k == 'string' && qo && qo.props && k in qo.props) {
            qp = qo.props[k];
            qo = qp.value;
        } else {
            return null;
        }
    }
    return qp;
};

freebase.QObject.prototype.follow_all = function (path) {
// UNFINISHED
    var qo = this;
    for (var i = 0; i < path.length; i++) {
        qo = qo.props[path[i]];
        if (qo instanceof Array) {
            return qo.follow_all(path.slice(i));
        }
    }
    return qo;
};

freebase.QObject.prototype.show = function () {
    mjt.log('QO', this.pathstr, this.type, '{');

    for (var k in this.props) {
        if (!this.props.hasOwnProperty(k)) continue;
        var prop = this.props[k];
        prop.show();
    }

    mjt.log('}');
};


/**
 *
 *  QProperty requires data from the net, so it is a task.
 * 
 *  @class QProperty represents a link in a MQL query.
 *
 *  @constructor
 *  @param qo   the QObject containing this QProperty
 *  @param key  the property key within qo
 */
freebase.QProperty = mjt.define_task(null,
                                 [{name: 'qo'},
                                  {name: 'key'}]);

freebase.QProperty.prototype.toString = function() {
    return '[' + this._task_id + ' ' + this.pathstr + ']';
};

freebase.QProperty.prototype.init = function () {
    this.service = this._factory;
    this.value = null;

    // inherit the MqlQuery
    this.mq = this.qo.mq;

    var k = this.key;
    var qo = this.qo;
    var otype = qo.type;

    if (qo.pathstr !== null)
        this.pathstr = qo.pathstr + '.' + k;
    else
        this.pathstr = '';
    this.depth = qo.depth + 1;

    // the toplevel MqlQuery task depends on all 
    //  QProperties, which makes it wait for all
    //  schemas to be loaded and types to be computed.
    this.mq.require(this);

    //mjt.log('MKPROP', this.pathstr, otype, this);

    //mjt.log(' implicit otype from container', otype);

    this.schema_id = null;
    this.prop_key = null;

    // figure out what we can about the property without
    //  requiring our parent object's schema.
    if (this.lookup_prop_static()) {
        if (typeof this.directive == 'object' && this.directive.write) {
            // XXX mark the query as a write
            this.mq.is_write = true;
        }
        //mjt.log(' explicit otype from property key',
        //        this.schema_id, this.prop_key,
        //        'was', otype, '/', k);

        if (this.schema_id.charAt(0) == '/')
            this.require(this.service.schema_cache.get(this.schema_id));
    } else {
        //mjt.log('NO STATIC INFO FOR', this.key);

        this.require(this.service.schema_cache.get('/type/object'));
        this.require(this.service.schema_cache.get('/type/value'));
        //this.require(this.service.schema_cache.getcore());
     
        this.require(qo);
    }

    // now recurse to any contained objects

/*
    var v = o[k];
    var vo;

    if (v instanceof Array) {
        this.is_array = true;
        if (v.length > 0)
            vo = v[0];
        else
            vo = null;
    } else {
        this.is_array = false;
        vo = v;
    }
*/

    // build QObject(s) for the property's value(s),
    // implicitly mapping over array-valued props.
    this.is_array = false;
    var v = qo.obj[k];
    if (v instanceof Array) {
        this.is_array = true;
        // XXX sort: [...] directive or other array handling?
        //  use vtype to tell?
        this.value = [];
        for (var i = 0; i < v.length; i++) {
            var vv = v[i];
            if (typeof vv == 'object' && vv !== null) {
                this.value.push(this.service.QObject(this, vv));
            } else {
                this.value.push(vv);
            }
        }
    } else if (typeof v == 'object' && v !== null) {
        this.value = this.service.QObject(this, v);
    } else {
        this.value = v;
    }

/*
    if (vtype) {
mjt.warn('XXX set _vtype -> vtype', this, vtype);
        this.vtype = vtype;
    }

mjt.warn('_SCHID', this.schema_id, this);
*/
    if (this.schema_id) {
        // wait for the necessary schema to continue
        if (this.schema_id.charAt(0) == '/')
            this.require(this.service.schema_cache.get(this.schema_id));
    }

    return this.enqueue();
};

/**
 *  complete the initialization of the QProperty once
 *   the schema is loaded.
 *
 */
freebase.QProperty.prototype.request = function () {

    if (this.qo.path === null) {
        this._descriptor = null;
        this._unique = false;

        return this.ready();
    }
    var k = this.key;
    var pathstr = this.pathstr;

    // try /type/object and /type/value again since we must have the schema
    //  requiring our parent object's schema.
    if (this.lookup_prop_static()) {
        //mjt.log(' explicit otype from property key',
        //        this.schema_id, this.prop_key,
        //        'was', this.key);
    } else {
        if (! this.qo._schema) {
            mjt.warn('MISSING SCHEMA for', this.qo.type, this.qo);
            throw new Error('should have schema at this point');
            //return this.error('should have schema at this point');
        }

        // look up in the QObject's schema
        var prop = this.qo._schema.props[k];

        if (typeof(prop) != 'undefined') {
            this.from_pdesc(prop);
        } else {
            // couldn't find the property, and we have all the schemas
            // we think we need.
            mjt.warn('unable to resolve property', k, 'in context', this.qo);

            // do our best
            this.schema_id = this.qo.type;

            return this;
        }
    }

    // at this point we should have it all

    if (this.schema_id == 'toplevel' || this.schema_id == 'directive') {
        return this.ready();
    };


    if (!this.schema_id || this.schema_id.charAt(0) != '/') {
        mjt.log('bailing with non-id schema_id');
        throw new Error('should have schema at this point');
        //return this.error('should have schema at this point');
    }

    var schema = this.service.schema_cache.lookup(this.schema_id);

    if (!schema || schema.state != 'ready') {
        mjt.log('bailing on schema not present or ready');
        throw new Error('should have schema at this point');
        //return this.error('should have schema at this point');
    }

    //mjt.log('QP.SCHRED', this.schema_id, this, schema, this.vtype, this.key);

/*
    var propdesc = schema.props[this.key];

    if (typeof propdesc == 'undefined')
        mjt.warn('undefined property', this.key, schema, this);
    else
        this.from_pdesc(propdesc);
*/

    //mjt.log('lookup', this.id, this.key, this.vtype, schema.props ? schema.props[this.key] : 'no props');

    return this.ready()
};


freebase.QProperty.prototype.show = function () {
    mjt.log('PROP  ' + this.pathstr + ' (' + this.schema_id + ') : ' + this.vtype);

    function showval(v) {
        if (v instanceof Array) {
            mjt.log('A ', v.length);
            for (var i = 0; i < v.length; i++) {
                showval(v[i]);
            }
        } else if (v instanceof freebase.QObject) {
            v.show();
        } else if (typeof v === 'object' && v !== null) {
            mjt.log('error - shouldnt be any plain objects left');
        }
    }
    showval(this.value);
};

/**
 *
 * try to figure out the property schema id just from the
 *  property name.  this works for explicit property names,
 *  and for properties of /type/object and /type/value.
 *
 * sets this.schema_id and this.prop_key on success
 *
 */
freebase.QProperty.prototype.lookup_prop_static = function () {
    var k = this.key;

    if (k in freebase.mql_directives) {
        this.schema_id = 'directive';
        this.vtype = freebase.mql_directives[k].valuetype;
        this.directive = freebase.mql_directives[k];
        return true;
    }

    // this is a fake property for the top level object,
    // so that every query object belongs to some query property.
    if (k == '_') {
        this.schema_id = 'toplevel';
        this.vtype = '/type/object';
        this.prop_key = '_';  // XXX needed?
        return true;
    }

    // mimic mql's useful obliviousness to : prefixes
    k = k.replace(/^.*:/, '');

    // and to comparison ops
    k = k.replace(/[<>]|([<>~|]=)$/, '');

    // check if the property key has a / in it.
    var m = /^(.+)\/([^\/]+)/.exec(k);
    if (m) {
        this.schema_id = m[1];
        // assert this.key == m[2] ?
        this.prop_key = m[2];

        var tsch = this.service.schema_cache.lookup(this.schema_id);
        if (tsch && tsch.state == 'ready') {
            mjt.assert(this.prop_key in tsch.props);
            this.from_pdesc(tsch.props[this.prop_key]);
        }
        return true;
    }

    var osch = this.service.schema_cache.lookup('/type/object');

//mjt.warn('XXXXXX', osch, k);
    if (osch && osch.state == 'ready' && k in osch.props) {
        this.from_pdesc(osch.props[k]);
        return true;
    }

    var vsch = this.service.schema_cache.lookup('/type/value');
    if (vsch && vsch.state == 'ready' && k in vsch.props) {
        this.from_pdesc(vsch.props[k]);
        return true;
    }

    return false;
};


freebase.QProperty.prototype.from_pdesc = function (prop) {
    this._descriptor = prop;
    this._unique = prop.unique ? true : false;

    this.schema_id = prop.schema;
    this.vtype = prop.expected_type;
    // assert this.key == prop.key?
    this.prop_key = prop._key;
};



/*
        var tsch = this.service.schema_cache.lookup(this.schema_id);
        if (tsch && tsch.props && tsch.props[k]) {
            ret.expected_type = tsch.props[k].expected_type;
            ret.unique = tsch.props[k].unique;
        }
        return ret;
*/


/**
 *
 * parse mql property keys in a particular type context
 * 
 * this isn't a method of Schema because in many cases
 *  it doesn't actually need to know what the current
 *  implicit type is.
 *
 */
freebase.QProperty.prototype.lookup_prop_id = function(tid) {
    var r = this.lookup_prop_static();
    if (r !== null)
        return r;

    var tsch = this.service.schema_cache.lookup(tid);
    var sch = null;

    if (tsch && tsch.state == 'ready') {
        prop = tsch.props[k];
        sch = tsch;
    }

    if (typeof(prop) != 'undefined') {
        //mjt.log('prop', prop);
        return {
            type: '/type/property',
            id: sch.id + '/' + k,
            schema: sch.id,
            key: k,
            expected_type: prop.expected_type,
            unique: prop.unique
        };
    }

    if (typeof (tid) != 'undefined') {
        return {
            type: '/type/property',
            id: tid + '/' + k,
            schema: tid,
            key: k,
            unique: false
        };
    }
};


/**
 *  find the expected type for a mql property based on key
 *   
 *  @param schema is the implicit schema from context
 */
freebase.QProperty.prototype.lookup_expected_type_id = function(schema) {
    var k = this.key;
    var pinfo = this.lookup_prop_id(schema.id);

    if (pinfo.type == 'directive')
        return 'directive:' + k;

    var schema = this.service.schema_cache.lookup(pinfo.schema);

    // mjt.log('sssp', pinfo);

    // if (schema)
    //     mjt.log('ssss', schema.id, '/', k, schema.state, typeof schema.props);

    if (typeof schema == 'object'
        && schema.state == 'ready'
        && typeof schema.props == 'object'
        && schema.props != null) {

        var ss = schema.props[pinfo.key];
        if (typeof ss == 'undefined')
            return undefined;

        // mjt.log(ss.expected_type, 'from', schema.id, pinfo.key, '.expected type');
        return ss.expected_type;
    }

    //mjt.log('lookup_prop', schema.id, schema.state, k, ss);

    return undefined;
};


/**
 *  query editor command: expand
 *
 */
freebase.QProperty.prototype.expand = function () {
    var v = this.qo.obj[this.key];
    var vo = v;
    var v_is_array = false;
    if (v instanceof Array) {
        v_is_array = true;
        if (v.length > 0)
            vo = v[0];
        else
            vo = null;
    }

    var dkey = 'id';

    var vt = this.vtype;
    if (vt) {
        var s = mql.schema_cache.lookup(vt);
        if (s && s.state == 'ready') {
            dkey = s.default_property;
            //mjt.log('expandq got schema for', vt, dkey, s.result);
        } else {
            //mjt.log('expandq missing schema for', vt);
        }
    }

    this.qo.obj[this.key] = {};
    this.qo.obj[this.key][dkey] = vo;
    if (v_is_array)
        this.qo.obj[this.key] = [this.qo.obj[this.key]];

};

/**
 *  query editor command: collapse
 *
 */
freebase.QProperty.prototype.collapse = function () {
    var v = this.qo.obj[this.key];
    var vo = v;
    var v_is_array = false;
    if (v instanceof Array) {
        v_is_array = true;
        if (v.length > 0)
            vo = v[0];
        else
            vo = null;
    }

    var srepr = null;

    var dkey = 'id';
    if (!dkey in vo)
        dkey = 'value';
    if (!dkey in vo)
        dkey = 'name';

    var vt = this.vtype;
    if (vt) {
        var s = mql.schema_cache.lookup(vt);
        if (s && s.state == 'ready') {
            dkey = s.default_property;
        }
    }

    srepr = vo[dkey];
    if (typeof srepr === 'undefined')
        srepr = null;

    if (v_is_array) {
        if (srepr == null) {
            this.qo.obj[this.key] = [];
        } else {
            this.qo.obj[this.key] = [srepr];
        }
    } else {
        this.qo.obj[this.key] = srepr;
    }

};

/**
 *  query editor command: request_unique
 *
 */
freebase.QProperty.prototype.request_unique = function () {
    //mjt.log('rm', this);
    if (this.qo.obj[this.key].length < 1)
        this.qo.obj[this.key] = null;
    else
        this.qo.obj[this.key] = this.qo.obj[this.key][0];
};

/**
 *  query editor command: request_multiple
 *
 */
freebase.QProperty.prototype.request_multiple = function () {
    //mjt.log('add', this);
    if (this.qo.obj[this.key] == null)
        this.qo.obj[this.key] = [];
    else
        this.qo.obj[this.key] = [this.qo.obj[this.key]];
};

/**
 *  query editor command: request_null
 *
 */
freebase.QProperty.prototype.request_null = function () {
    if (this.qo.obj[this.key] instanceof Array)
        this.qo.obj[this.key] = [];
    else
        this.qo.obj[this.key] = null;
};


//
// reverse a property constraint.
//
// mq will be be modified.
// currently this is very limited.
//
freebase.QProperty.reverse_constraint = function (q, subq) {
    /*mjt.log('prop', this, this.master_property, this.reverse_property);*/

    // TODO:
    //  smarter handling of /type/key
    //  prepend 'uniqprefix:' to generated property names
    //    to avoid conflict with user-specified constraints.
    //  arbitrarily complex subq
    //  collapse occurrences of any_reverse when possible

    if (this.expected_type === '/type/key') {
        subq = { namespace: subq };
    }

    if (this.master_property) {
        q[this.master_property] = subq
    } else if (this.reverse_property) {
        q[this.reverse_property] = subq
    } else {
        if (typeof subq === 'string')
            subq = { id: subq };

        // copy the toplevel to avoid modifying subq.
        subq = $.extend({}, {
            link: { master_property: this.id }
        });

        q['/type/reflect/any_reverse'] = [ subq ];
    };

    //mjt.log('REVCON', subq, this, q);
};

//
// unfinished!
//
// this works with bare javascript objects.
// it should work with QProperty/QObject instead
// so that it can take advantage of type inference.
//
// experimental code to re-dangle a tree
// returns a pair of the redangled tree and the reversed path
// very ignorant of reverse properties right now
//   tree is a tree
//   path is a list of keys which lead to the new root
//
// returns an object with properties
//   tree: the new root
//   path: the path from the new root to the old root
//
// arrays in the path are stripped
//
//  var tree = { aa: 'a', bb: 'b', cc: { yy: 'foo', xx: { c: 'bar' } } };
//  mjt.log('pivoted ', freebase.Schema.pivot(tree, ['cc', 'xx']));
//
//   
freebase.redangle = function (tree, path) {
mjt.log('redang', tree, path);
    var k = path[0];
    var subpath = path.slice(1);

    if (tree instanceof Array) {
        return redangle(tree[k], subpath);
    }

    // if path is empty, we don't have to do anything
    if (path.length == 0)
        return { tree: tree, path: [] };

    // make a copy of the current root since we're going to modify it
    //  note we only need to do this for the root... after that the
    //  newroot copy will do it...
    var oldroot = {};
    for (var tk in tree) {
        if (!tree.hasOwnProperty(tk)) continue;
        oldroot[tk] = tree[tk];
    }

    //   take the first step down the path
    //   this will be the next root
    // make a copy since we're going to modify it
    var subtree = tree[k];
    var newroot = {};
    for (var tk in subtree) {
        if (!subtree.hasOwnProperty(tk)) continue;
        newroot[tk] = subtree[tk];
    }

    // remove the link from old root to new root
    delete oldroot[k];

    // add the reverse link
    // XXX should check that revk isn't already present,
    //  we're screwed if so.
    var revk = '-' + k;
    newroot[revk] = oldroot


    // recurse on newroot
    pair = redangle(newroot, subpath);

    pair.path.push(revk);

mjt.log('leaving', pair.tree, pair.path);

    return pair;
};





})(mjt.freebase);
