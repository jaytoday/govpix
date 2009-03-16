

/**
 *  wrappers around mjt-0.6 that look more like mjt 0.5
 *
 */

mjt.freebase = new mjt.services.FreebaseService('http://www.freebase.com');


mjt.mqlread = function () {
    mjt.warn("mjt.mqlread() is deprecated, use mjt.freebase.MqlRead()");

    return mjt.freebase.MqlRead.apply(mjt.freebase, arguments);
};

/**
 *  this gets called with new() so faking it
 *    is a little challenging
 */
mjt.BlobGetTask = function () {
    mjt.warn(this, "new mjt.BlobGetTask() is deprecated, use mjt.freebase.TransGet()");
    var args = [mjt._init_existing_token, this]
        .concat(mjt.makeArray(arguments));
    mjt.freebase.TransGet.apply(mjt.freebase, args);
};

mjt.BlobGetTask.prototype = mjt.freebase.TransGet.prototype;




/**
 *
 *  generate a freebase thumbnail image url suitable for img src=
 *
 *  DEPRECATED
 *
 */
mjt.imgurl = function() {
    mjt.warn("mjt.imgurl() is deprecated, use mjt.freebase.imgurl()");
    return mjt.freebase.imgurl.apply(mjt.freebase, arguments);
}




//  XXX flatten_markup


/*

js/markup interface:

   markup -> string
    currently
     string = mjt.flatten_markup(markup-obj-or-array)
       should be tohtml(markup)?  or xml?  or ???

   markup -> dom
    currently
     mjt.run(id, tfunc)
       should be jQuery.fn.runmjt(tfunc, args)?
     should have mjt.dom(markup) 
       - creates the dom somewhere anonymous using innerHTML

     others: replace_html, ... in runtime


   object -> markup representation
     should be .toMarkup() by analogy to 
     this means something different right now -
      .toMarkup returns a flat string of html

     .toMarkupList() returns a list of markup objects
        
   string -> markup
     automatic - strings are valid markup and will be quoted automatically

   string -> unquoted markup
     markup = mjt.bless(string)
       note only works on strings, should work on lists
 
   
     

 later:
    mjt.dom(markup) 
       - installs events using jquery
       - runs mjt.script="ondomready" scripts
     to do this flatten_markup needs to accumulate more info:
       - deferred script="ondomready" and event installs
       - how about current task state - are any still waiting?
    - possible to turn Markup into a mjt.Task?
      but it needs to receive wait events too.
        mjt.script="ondomfinal" gets run when there are no more
          tasks active inside the container.
        mjt.script="ondocfinal" gets run when there are no more
          tasks active in the document


*/
