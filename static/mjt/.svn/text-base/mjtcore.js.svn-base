
if(typeof mjt=='undefined')
window.mjt={};mjt.NAME='mjt';mjt.VERSION='0.6.0';mjt.LICENSE="========================================================================\n"+"Copyright (c) 2007, Metaweb Technologies, Inc.\n"+"All rights reserved.\n"+"\n"+"Redistribution and use in source and binary forms, with or without\n"+"modification, are permitted provided that the following conditions\n"+"are met:\n"+"    * Redistributions of source code must retain the above copyright\n"+"      notice, this list of conditions and the following disclaimer.\n"+"    * Redistributions in binary form must reproduce the above\n"+"      copyright notice, this list of conditions and the following\n"+"      disclaimer in the documentation and/or other materials provided\n"+"      with the distribution.\n"+"\n"+"THIS SOFTWARE IS PROVIDED BY METAWEB TECHNOLOGIES ``AS IS'' AND ANY\n"+"EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE\n"+"IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR\n"+"PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL METAWEB TECHNOLOGIES BE\n"+"LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR\n"+"CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF\n"+"SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR\n"+"BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,\n"+"WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE\n"+"OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN\n"+"IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.\n"+"========================================================================\n";if(typeof mjt=='undefined')
mjt={};if(typeof mjt.services=='undefined')
mjt.services={};mjt.debug=0;mjt.DEPRECATED=function(){mjt.warn('deprecated in this version of mjt');};mjt.uniqueid=function(prefix){var id=mjt._next_unique_id[prefix];if(typeof id!=='number')
id=1;mjt._next_unique_id[prefix]=id+1;return prefix+'_'+id;};mjt._next_unique_id={};if(typeof console!='undefined'&&typeof console.debug=='function'){mjt.error=function(){console.error.apply(console,arguments);return'';};mjt.warn=function(){console.warn.apply(console,arguments);return'';};mjt.log=function(){console.log.apply(console,arguments);return'';};mjt.note=function(){if(mjt.debug)
console.log.apply(console,arguments);return'';};mjt.openlog=function(){if(mjt.debug)
console.group.apply(console,arguments);return'';};mjt.closelog=function(){if(mjt.debug)
console.groupEnd.apply(console,arguments);return'';};mjt.assert=function(b){if(!b){console.error.apply(console,arguments);throw new Error('assertion failed');}
return'';};}else{mjt.error=function(){mjt.spew('error',arguments);return'';};mjt.warn=function(){mjt.spew('warning',arguments);return'';};mjt.log=function(){return'';};mjt.note=function(){return'';};mjt.openlog=function(){return'';};mjt.closelog=function(){return'';};mjt.assert=function(){return'';};}
mjt._uri_ok={'~':true,'!':true,'*':true,'(':true,')':true,'-':true,'_':true,'.':true,',':true,':':true,'@':true,'$':true,"'":true,'/':true};mjt.formquote=function(x){var ok=mjt._uri_ok;if(/^[A-Za-z0-9_-]*$/.test(x))
return x;x=x.replace(/([^A-Za-z0-9_-])/g,function(a,b){var c=ok[b];if(c)return b;return encodeURIComponent(b);});return x.replace(/%20/g,'+');};mjt.formencode=function(values){var qtext=[];var sep='';var k,v,ki,ks=[];for(k in values)
ks.push(k);ks.sort();for(ki in ks){k=ks[ki];v=values[k];if(typeof v=='undefined')continue;qtext.push(sep);sep='&';qtext.push(mjt.formquote(k));qtext.push('=');qtext.push(mjt.formquote(v));}
return qtext.join('');};mjt.formdecode=function(qstr){if(typeof qstr=='undefined'||qstr=='')
return{};var qdict={};var qpairs=qstr.split('&');for(var i=0;i<qpairs.length;i++){var m=/^([^=]+)=(.*)$/.exec(qpairs[i]);if(!m){mjt.warn('bad uri query argument, missing "="',qpairs[i]);continue;}
var k=decodeURIComponent(m[1].replace(/\+/g,' '));var v=decodeURIComponent(m[2].replace(/\+/g,' '));qdict[k]=v;}
return qdict;};mjt.form_url=function(base,values){var q=values&&mjt.formencode(values);if(q=='')
return base;return base+'?'+mjt.formencode(values);};mjt.htmlencode=function(s){if(typeof(s)!='string')
return'<span style="color:red">'+typeof(s)+' '+s+'</span>';return s.replace(/\&/g,'&amp;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;').replace(/\"/g,'&quot;');};mjt.apply_safe=function(func,thiss,args){mjt.openlog('apply_safe',func,args);try{return func.apply(thiss,args);}finally{mjt.closelog();}};mjt.id_to_element=function(top){if(typeof(top)=='string'){var e=document.getElementById(top);if(!e){mjt.note('no element with id '+top);return null;}else{top=e;}}
if(top.nodeName=='IFRAME'){var idoc=(top.contentWindow||top.contentDocument);if(idoc.document)
idoc=idoc.document;top=idoc.getElementsByTagName('body')[0]}
return top;}
mjt.teardown_dom_sibs=function(elt,elt_only){while(elt!==null){for(var k in elt){if(/^on/.exec(k))
elt[k]=null;}
var c=elt.firstChild;if(c!=null)
mjt.teardown_dom_sibs(c);if(elt_only)
break;elt=elt.nextSibling;}};mjt.reify_arguments=function(signature,arguments){var m=/^(\S+)\(([^)]*)\)$/.exec(signature);var name=m[1];var argnames=m[2].split(',');var argd={};var extras=[];for(var i=0;i<argnames.length;i++){argd[argnames[i]]=arguments[i];}
for(;i<arguments.length;i++){extras.push(arguments[i]);}
var r={argnames:argnames,args:args,extra_args:extras,callee:arguments.callee};return r;}
mjt.shallow_extend=function(d){var newd={};for(var k in d){if(d.hasOwnProperty(k))
newd=d;}
return newd;};mjt.thunk=function(method,obj){return mjt.vthunk(arguments);};mjt.vthunk=function(){var bound_this,bound_func,bound_args;var arg0=arguments[0];if(typeof arg0=='object'&&typeof arg0.length=='number'){bound_args=mjt.makeArray(arg0);}else{bound_args=mjt.makeArray(arguments);}
arg0=bound_args.shift();if(typeof arg0=='string'){bound_this=bound_args.shift();bound_func=arg0;if(!mjt.isFunction(bound_this[bound_func])){mjt.warn('mjt.thunk:',bound_func,'is not a method of',bound_this);}}else{bound_this=null;bound_func=arg0;if(!mjt.isFunction(bound_func)){mjt.error('mjt.thunk:',bound_func,'is not a function');}}
var thunk_id=arguments.callee._next_thunk_id||1;arguments.callee._next_thunk_id=thunk_id+1;var thunk=function(){var self=arguments.callee;var call_args=self.bound_args.concat(mjt.makeArray(arguments));var obj=self.bound_this===null?this:self.bound_this;var func=self.bound_func;if(typeof func=='string')
func=obj[func];if(!mjt.isFunction(func)){mjt.error('mjt.thunk: bad function',self,self.bound_func,obj);}
return func.apply(obj,call_args);};thunk.bound_this=bound_this;thunk.bound_func=bound_func;thunk.bound_args=bound_args;thunk.thunk_id=thunk_id;return thunk;}
mjt.vcall=function(thunkspec){var call_args=mjt.makeArray(arguments).slice(1);return mjt.vthunk(thunkspec).apply(this,call_args);};mjt.vapply=function(thunkspec,call_args){return mjt.vthunk(thunkspec).apply(this,call_args);};mjt.label_package=function(dotpath){var path=dotpath.split('.');var o=window;while(path.length){o=o[path.shift()];}
if(typeof o=='object'&&o!==null)
o._package_name=dotpath;else
mjt.log('missing package',dotpath);for(var k in o){var defn=o[k];if(mjt&&mjt.Task&&mjt.isFunction(defn)&&typeof defn.prototype=='object'&&defn.prototype instanceof mjt.Task){defn.prototype._task_class=dotpath+'.'+k;}}};mjt.isFunction=function(fn){return!!fn&&typeof fn!="string"&&!fn.nodeName&&fn.constructor!=Array&&/function/i.test(fn+"");};mjt.makeArray=function(a){var r=[];if(typeof a!="array")
for(var i=0,al=a.length;i<al;i++)
r.push(a[i]);else
r=a.slice(0);return r;};(function(){var m={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'},s={array:function(x){var a=['['],b,f,i,l=x.length,v;for(i=0;i<l;i+=1){v=x[i];f=s[typeof v];if(f){v=f(v);if(typeof v=='string'){if(b){a[a.length]=',';}
a[a.length]=v;b=true;}}}
a[a.length]=']';return a.join('');},'boolean':function(x){return String(x);},'null':function(x){return"null";},'undefined':function(x){mjt.warn('mjt.json_from_js: undefined value is illegal in JSON');return"[[[ERROR: undefined value]]]";},number:function(x){return isFinite(x)?String(x):'null';},object:function(x){if(x){if(x instanceof Array){return s.array(x);}
var a=['{'],b,f,i,v;for(i in x){v=x[i];f=s[typeof v];if(f){v=f(v);if(typeof v=='string'){if(b){a[a.length]=',';}
a.push(s.string(i),':',v);b=true;}}}
a[a.length]='}';return a.join('');}
return'null';},string:function(x){if(/["\\\x00-\x1f]/.test(x)){x=x.replace(/([\x00-\x1f\\"])/g,function(a,b){var c=m[b];if(c){return c;}
c=b.charCodeAt();return'\\u00'+
Math.floor(c/16).toString(16)+
(c%16).toString(16);});}
return'"'+x+'"';}};mjt.json_from_js=function(v){return s[typeof v](v);};})();mjt.json_to_js=function(s){try{if(/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/.test(s.replace(/\\./g,'@').replace(/"[^"\\\n\r]*"/g,''))){return eval('('+s+')');}
throw new SyntaxError('json_to_js');}catch(e){return false;}};mjt._safe_constructor_token=['safe_constructor_token'];mjt._init_existing_token=['init_existing_token'];mjt.Task=function(){if(arguments.length!==1||arguments[0]!==mjt._safe_constructor_token){mjt.error('new mjt.Task() is illegal');throw new Error("don't call mjt.Task()");}};mjt.Task.prototype.toString=function(){return'['+this._task_id+']';};mjt.Task.prototype.toMarkup=function(){return'<span class="mjt_task">task '
+this._task_id+':'+this.task.state+'</span>';};mjt.define_task=function(sooper,params){var task_ctor=function(){var obj;var args=mjt.makeArray(arguments);if(this instanceof arguments.callee){if(args.length!==1||args[0]!==mjt._safe_constructor_token){throw new Error('Task class should not be invoked with new ()');}else{return undefined;}}else if(args.length>0&&args[0]===mjt._init_existing_token){args.shift();obj=args.shift();obj._factory=this;}else{obj=new arguments.callee(mjt._safe_constructor_token);obj._factory=this;}
var tmpa=[];for(var tmp=obj.__proto__;tmp!==Object.prototype;tmp=tmp.__proto__){tmpa.push(tmp);}
while(tmpa.length){var proto=tmpa.pop();if(proto.hasOwnProperty('init'))
proto.init.apply(obj,args);}
return obj;};if(!sooper)
sooper=mjt.Task;task_ctor.prototype=new sooper(mjt._safe_constructor_token);task_ctor.prototype.parameters=params||[];return task_ctor;};mjt.Task._default_timeout=10000;mjt.Task.pending=null;mjt.Task._on_pending_empty=[];mjt.Task.await_pending_empty=function(){var t=mjt.Task();if(this.pending===null)
return t.ready();this._on_pending_empty.push(t);return t;};mjt.Task.add_pending=function(task){if(this.pending===null)
this.pending={};this.pending[task._task_id]=task;};mjt.Task.delete_pending=function(task){delete this.pending[task._task_id];var pending_empty=true;for(var pk in this.pending){pending_empty=false;break;}
if(pending_empty)
this.pending=null;while(this.pending==null&&this._on_pending_empty.length)
this._on_pending_empty.shift().ready();};mjt.Task.show_pending=function(){for(var k in this.pending){var task=this.pending[k];mjt.warn('task still pending',k,task);}}
mjt.Task.prototype.init=function(){mjt.assert(typeof this.state==='undefined');this.state='init';this._onready=[];this._onerror=[];this._timeout=null;this._prereqs={};var idseed=this._task_class?this._task_class:'task';this._task_id=mjt.uniqueid(idseed);mjt.Task.add_pending(this);for(var i=0;i<this.parameters.length;i++){var param=this.parameters[i];this[param.name]=typeof arguments[i]!='undefined'?arguments[i]:param['default'];}
return this;};mjt.Task.prototype.set_timeout=function(msec){if(typeof msec==='undefined')
msec=mjt.Task._default_timeout;if(this._timeout!==null)
mjt.error('timeout already set');this._timeout=setTimeout(mjt.thunk('timeout',this),msec);return this;};mjt.Task.prototype.clear_timeout=function(){if(this._timeout!==null){clearTimeout(this._timeout);this._timeout=null;}
return this;};mjt.Task.prototype.require=function(prereq){if(this.state!=='init')
throw new Error('task.enqueue() already called - too late for .require()');if(prereq.state=='ready')
return this;if(this.state=='error')
return this;if(prereq.state=='error')
return this._prereq_error(prereq);this._prereqs[prereq._task_id]=prereq;prereq.onready('_prereq_ready',this,prereq).onerror('_prereq_error',this,prereq)
return this;};mjt.Task.prototype.enqueue=function(){if(this.state=='error')
return this;if(this.state!=='init'){mjt.warn('enqueue() called twice?');}
this.state='wait';return this._prereqs_check();};mjt.Task.prototype._prereqs_check=function(){if(this._prereqs===null)
return this;for(var prereq in this._prereqs)
return this;if(this.state=='init')
return this;this._prereqs=null;this.request();return this;};mjt.Task.prototype.request=function(){return this.ready();};mjt.Task.prototype._prereq_ready=function(prereq){if(this._prereqs===null)
return this;delete this._prereqs[prereq._task_id];return this._prereqs_check();};mjt.Task.prototype._prereq_error=function(prereq){if(this._prereqs===null)
return this;this._prereqs=null;var msg=prereq.messages[0];return this.error(msg.code,msg.message);};mjt.Task.prototype.onready=function(THUNK_ARGS){if(this.state=='ready'){mjt.vcall(arguments,this.result);}else if(this._onready instanceof Array){this._onready.push(mjt.vthunk(arguments));}
return this;};mjt.Task.prototype.onerror=function(THUNK_ARGS){if(this.state=='error'){var code=this.messages[0].code;var message=this.messages[0].message;var full=this.messages[0].text;mjt.vcall(arguments,code,message,full);}else if(this._onerror instanceof Array){this._onerror.push(mjt.vthunk(arguments));}
return this;};mjt.Task.prototype.ondone=function(THUNK_ARGS){this.onready.apply(this,arguments);this.onerror.apply(this,arguments);return this;};mjt.Task.prototype._state_notify=function(state,callbacks,args){if(!mjt.Task.debug){for(var i=0;i<callbacks.length;i++){var cb=callbacks[i];cb.apply(this,args);}
return this;}
mjt.openlog('TASK',state.toUpperCase(),''+this,this);try{for(var i=0;i<callbacks.length;i++){var cb=callbacks[i];if(typeof cb.bound_func!=='undefined')
mjt.openlog('-on'+state,''+cb.bound_this+'.',cb.bound_func,cb.bound_args,cb);else
mjt.openlog('-on'+state,cb);try{cb.apply(this,args);}finally{mjt.closelog();}}}finally{mjt.closelog();}
return this;};mjt.Task.prototype.ready=function(result){if(this._prereqs!==null){for(var k in this._prereqs){if(typeof this._prereqs[k]=='undefined')
continue;mjt.error('task.ready() called with remaining prereqs',this);throw new Error('task.ready() called with remaining prereqs');break;}}
if(this.state=='init'){this._prereqs=null;this.state='wait';}
if(this.state!=='wait'){throw new Error('task.ready() called in bad state');}
this._onerror=null;this.clear_timeout();this.state='ready';var callbacks=this._onready;this._onready=null;this.result=result;this._state_notify('ready',callbacks,[result]);mjt.Task.delete_pending(this);return this;};mjt.Task.prototype._error=function(messages,error_chain){this._prereqs=null;this._onready=null;this.clear_timeout();var callbacks=this._onerror;this._onerror=null;if(this.state=='init'){this._prereqs=null;this.state='wait';}
if(this.state!=='wait'){throw new Error('task.error() called in bad state');}
this.state='error';this.messages=messages;this._error_chain=error_chain;var args=[messages[0].code,messages[0].message,messages[0].full];this._state_notify('error',callbacks,args);mjt.Task.delete_pending(this);return this;};mjt.Task.prototype.error=function(code,message,full){var messages=[{code:code,message:message,text:(typeof full!=='undefined')?full:''}];return this._error(messages);};mjt.Task.prototype.error_nest=function(failed_task){return this._error(failed_task.messages,failed_task);};mjt.Task.prototype.timeout=function(){this._timeout=null;return this.error('/user/mjt/messages/task_timeout','task timed out - possible unreachable server?');};mjt.Task.prototype.empty_result=function(){return this.error('/user/mjt/messages/empty_result','no results found');};mjt.Task.prototype.unanticipated=function(){return this.error('/user/mjt/messages/unanticipated_format','unanticipated server return format');};mjt.Task.debug=mjt.debug;mjt.PagerSlice=mjt.define_task(null,[{name:'pager'},{name:'start'},{name:'count'}]);mjt.PagerSlice.prototype.init=function(){this.chunks=this.pager.slice_chunks(this.start,this.count);var chunks=this.chunks;for(var i=0;i<chunks.length;i++)
this.require(chunks[i]);return this.enqueue();};mjt.PagerSlice.prototype.request=function(){var chunks=this.chunks;var results=[];var end=this.start+this.count;for(var i=0;i<chunks.length;i++){var chunk=chunks[i];var starti=this.start-chunk.start
if(starti<0)continue;var count=starti+this.count;if(starti+count>chunk.count)
count=chunk.count-starti;if(count<=0)continue;if(starti==0&&count==chunk.count)
results=results.concat(chunk.result);else
results=results.concat(chunk.result.slice(starti,count));}
return this.ready(results);};mjt.Pager=function(first_chunk){this.chunks=[];this.chunks_waiting=0;this.add_chunk(first_chunk);};mjt.Pager.prototype._next_chunk=function(count){var last_chunk=this.chunks[this.chunks.length-1];var task=last_chunk.next(count);this.add_chunk(task);return task;};mjt.Pager.prototype.add_chunk=function(task){task.enqueue();this.chunks_waiting++;task.onready('chunk_ready',this).onerror('chunk_error',this);this.chunks.push(task);return this;};mjt.Pager.prototype.chunk_ready=function(){this.chunks_waiting--;};mjt.Pager.prototype.chunk_error=function(){this.chunks_waiting--;};mjt.Pager.prototype.slice_chunks=function(start,count){var slice=[];var end=start+count;var chunks=this.chunks;var nexti=0;for(var ci=0;ci<chunks.length;ci++){var chunk=this.chunks[ci];if(chunk.start>=end)continue;if(chunk.start+chunk.end<=start)continue;slice.push(chunk);nexti=chunk.start+chunk.count;}
if(end>nexti){slice.push(this._next_chunk(end-nexti));}
return slice;};mjt.Pager.prototype.slicetask=function(start,count){return mjt.PagerSlice(this,start,count);};mjt.Pager.prototype.slice=function(start,count,onready,onerror){this.slicetask(start,count).onready(onready).onerror(onerror);};