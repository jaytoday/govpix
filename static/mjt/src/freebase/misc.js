

mjt.freebase.imgurl = function(cid, maxwidth, maxheight) {
    var qargs = {};
    if (typeof(maxwidth) == 'number') {
        qargs.maxwidth = parseInt('' + maxwidth);  // clean up
    }
    if (typeof(maxheight) == 'number') {
        qargs.maxheight = parseInt('' + maxheight);  // clean up
    }

    // XXX is this the right quoting?  only if id is a guid!
    return mjt.form_url(this.service_url + '/api/trans/image_thumb/'
                        + mjt.formquote(cid),
                        qargs);
};


