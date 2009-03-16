
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
return slice;};mjt.Pager.prototype.slicetask=function(start,count){return mjt.PagerSlice(this,start,count);};mjt.Pager.prototype.slice=function(start,count,onready,onerror){this.slicetask(start,count).onready(onready).onerror(onerror);};(function(){var _tbl=[0x00000000,0x77073096,0xEE0E612C,0x990951BA,0x076DC419,0x706AF48F,0xE963A535,0x9E6495A3,0x0EDB8832,0x79DCB8A4,0xE0D5E91E,0x97D2D988,0x09B64C2B,0x7EB17CBD,0xE7B82D07,0x90BF1D91,0x1DB71064,0x6AB020F2,0xF3B97148,0x84BE41DE,0x1ADAD47D,0x6DDDE4EB,0xF4D4B551,0x83D385C7,0x136C9856,0x646BA8C0,0xFD62F97A,0x8A65C9EC,0x14015C4F,0x63066CD9,0xFA0F3D63,0x8D080DF5,0x3B6E20C8,0x4C69105E,0xD56041E4,0xA2677172,0x3C03E4D1,0x4B04D447,0xD20D85FD,0xA50AB56B,0x35B5A8FA,0x42B2986C,0xDBBBC9D6,0xACBCF940,0x32D86CE3,0x45DF5C75,0xDCD60DCF,0xABD13D59,0x26D930AC,0x51DE003A,0xC8D75180,0xBFD06116,0x21B4F4B5,0x56B3C423,0xCFBA9599,0xB8BDA50F,0x2802B89E,0x5F058808,0xC60CD9B2,0xB10BE924,0x2F6F7C87,0x58684C11,0xC1611DAB,0xB6662D3D,0x76DC4190,0x01DB7106,0x98D220BC,0xEFD5102A,0x71B18589,0x06B6B51F,0x9FBFE4A5,0xE8B8D433,0x7807C9A2,0x0F00F934,0x9609A88E,0xE10E9818,0x7F6A0DBB,0x086D3D2D,0x91646C97,0xE6635C01,0x6B6B51F4,0x1C6C6162,0x856530D8,0xF262004E,0x6C0695ED,0x1B01A57B,0x8208F4C1,0xF50FC457,0x65B0D9C6,0x12B7E950,0x8BBEB8EA,0xFCB9887C,0x62DD1DDF,0x15DA2D49,0x8CD37CF3,0xFBD44C65,0x4DB26158,0x3AB551CE,0xA3BC0074,0xD4BB30E2,0x4ADFA541,0x3DD895D7,0xA4D1C46D,0xD3D6F4FB,0x4369E96A,0x346ED9FC,0xAD678846,0xDA60B8D0,0x44042D73,0x33031DE5,0xAA0A4C5F,0xDD0D7CC9,0x5005713C,0x270241AA,0xBE0B1010,0xC90C2086,0x5768B525,0x206F85B3,0xB966D409,0xCE61E49F,0x5EDEF90E,0x29D9C998,0xB0D09822,0xC7D7A8B4,0x59B33D17,0x2EB40D81,0xB7BD5C3B,0xC0BA6CAD,0xEDB88320,0x9ABFB3B6,0x03B6E20C,0x74B1D29A,0xEAD54739,0x9DD277AF,0x04DB2615,0x73DC1683,0xE3630B12,0x94643B84,0x0D6D6A3E,0x7A6A5AA8,0xE40ECF0B,0x9309FF9D,0x0A00AE27,0x7D079EB1,0xF00F9344,0x8708A3D2,0x1E01F268,0x6906C2FE,0xF762575D,0x806567CB,0x196C3671,0x6E6B06E7,0xFED41B76,0x89D32BE0,0x10DA7A5A,0x67DD4ACC,0xF9B9DF6F,0x8EBEEFF9,0x17B7BE43,0x60B08ED5,0xD6D6A3E8,0xA1D1937E,0x38D8C2C4,0x4FDFF252,0xD1BB67F1,0xA6BC5767,0x3FB506DD,0x48B2364B,0xD80D2BDA,0xAF0A1B4C,0x36034AF6,0x41047A60,0xDF60EFC3,0xA867DF55,0x316E8EEF,0x4669BE79,0xCB61B38C,0xBC66831A,0x256FD2A0,0x5268E236,0xCC0C7795,0xBB0B4703,0x220216B9,0x5505262F,0xC5BA3BBE,0xB2BD0B28,0x2BB45A92,0x5CB36A04,0xC2D7FFA7,0xB5D0CF31,0x2CD99E8B,0x5BDEAE1D,0x9B64C2B0,0xEC63F226,0x756AA39C,0x026D930A,0x9C0906A9,0xEB0E363F,0x72076785,0x05005713,0x95BF4A82,0xE2B87A14,0x7BB12BAE,0x0CB61B38,0x92D28E9B,0xE5D5BE0D,0x7CDCEFB7,0x0BDBDF21,0x86D3D2D4,0xF1D4E242,0x68DDB3F8,0x1FDA836E,0x81BE16CD,0xF6B9265B,0x6FB077E1,0x18B74777,0x88085AE6,0xFF0F6A70,0x66063BCA,0x11010B5C,0x8F659EFF,0xF862AE69,0x616BFFD3,0x166CCF45,0xA00AE278,0xD70DD2EE,0x4E048354,0x3903B3C2,0xA7672661,0xD06016F7,0x4969474D,0x3E6E77DB,0xAED16A4A,0xD9D65ADC,0x40DF0B66,0x37D83BF0,0xA9BCAE53,0xDEBB9EC5,0x47B2CF7F,0x30B5FFE9,0xBDBDF21C,0xCABAC28A,0x53B39330,0x24B4A3A6,0xBAD03605,0xCDD70693,0x54DE5729,0x23D967BF,0xB3667A2E,0xC4614AB8,0x5D681B02,0x2A6F2B94,0xB40BBE37,0xC30C8EA1,0x5A05DF1B,0x2D02EF8D];mjt.crc32=function(str,crc){if(crc==window.undefined)crc=0;var n=0;var x=0;var tbl=_tbl;crc=crc^(-1);for(var i=0,iTop=str.length;i<iTop;i++){n=(crc^str.charCodeAt(i))&0xFF;crc=(crc>>>8)^tbl[n];}
return crc^(-1);};mjt.hash=function(s){return(mjt.crc32(s)+0x80000000).toString(16).toUpperCase();};})();mjt.JsonP=mjt.define_task();mjt.JsonP._cb={};mjt.JsonP.prototype.init=function(){this._urlbase=null;this._cached_result=undefined;this._cbid=null;this._f=mjt.thunk('jsonp_ready',this);this._f._jsonp=this;this.url=null;return this;};mjt.JsonP.prototype.install=function(){mjt.JsonP._cb[this._cbid]=this._f;var task=this;this.onready(function(o){task.mark_done('result arrived successfully');});this.onerror(function(code,msg,full){task.mark_done('error '+code+' '+msg)});};mjt.JsonP.prototype.request=function(){var cb=mjt.JsonP._cb[this._cbid];if(typeof cb==='undefined'){this.install();}else if(mjt.isFunction(cb)){cb._jsonp.onready('jsonp_ready',this).onerror('error_nest',this);return this;}else{mjt.error('bad state in callback table',this._cbid,typeof cb,cb,mjt.isFunction(cb));}
if(!this.url){mjt.warn('jsonp.url should be set, not',this.url,this);this.url=this._urlbase;}
if(1)
mjt.dynamic_script(undefined,this.url);else
mjt.include_js_async(this.url,function(){mjt.log('script tag completed');});return this;};mjt.JsonP.prototype.jsonp_ready=function(){if(typeof(this._timeout)!='undefined'){clearTimeout(this._timeout);this._timeout=null;}
this._cached_result=mjt.makeArray(arguments);return this.ready.apply(this,this._cached_result);};mjt.JsonP.prototype.jsonp_request_form=function(url,form,callback_param){var urlquery=typeof form=='string'?form:mjt.formencode(form);if(urlquery)
url+='?'+urlquery;var cbstr=callback_param+'='+this.generate_callback(url);var qchar;if(/\?/.test(url))
qchar='&';else
qchar='?';this.url=url+qchar+cbstr;return this.enqueue();};mjt.JsonP.prototype.generate_callback=function(urlbase){if(typeof urlbase=='undefined'){this._cbid=mjt.uniqueid('cb');return'mjt.JsonP._cb.'+this._cbid;}
this._urlbase=urlbase;this._cbid='c'+mjt.hash(this._urlbase);var cbsaved=mjt.JsonP._cb[this._cbid]
if(typeof cbsaved==='undefined')
return'mjt.JsonP._cb.'+this._cbid;if(typeof cbsaved!=='function'){mjt.warn('bad jsonp callback in table',this._cbid,cbsaved);return null;}
var jsonp=cbsaved._jsonp;if(jsonp._urlbase===this._urlbase)
return'mjt.JsonP._cb.'+this._cbid;mjt.log('repeated hash?',this._cbid,form);this._cbid=mjt.uniqueid('cb');return'mjt.JsonP._cb.'+this._cbid;};mjt.JsonP.prototype.mark_done=function(reason){var jsonp=this;mjt.JsonP._cb[this._cbid]=function(){mjt.log('JSONP already completed',jsonp._reason,'\nnew reason:',reason);};mjt.JsonP._cb[this._cbid]._jsonp=this;this._reason=reason;return this;};mjt.dynamic_script=function(tag_id,url,text){var head=document.getElementsByTagName('head')[0];var tag=document.createElement('script');tag.type='text/javascript';if(typeof tag_id=='string')
tag.id=tag_id;if(typeof url!=='undefined')
tag.src=url;if(typeof text!=='undefined'){if(/WebKit|Khtml/i.test(navigator.userAgent))
throw new Error('safari doesnt evaluate dynamic script text');tag.text=text;}
head.appendChild(tag);return tag;};mjt.include_js_async=function(url,k){var js=mjt.dynamic_script(null,url);if(/WebKit|Khtml/i.test(navigator.userAgent)){var iframe=mjt.dynamic_iframe();iframe.onload=k;document.getElementsByTagName('body')[0].appendChild(iframe);}else{js.onreadystatechange=function(){if(/complete|loaded/.test(js.readyState))
k();}
js.onload=k;}};mjt.services.FreebaseService=function(url){this.service_url=url||this.default_service_url;if(typeof this.SchemaCache!='undefined'){this.schema_cache=new this.SchemaCache(this);}
this.xhr_ok=false;var loc=window.location.protocol+'//'+window.location.host;if(this.service_url==loc)
this.xhr_ok=true;};if(typeof mjt.freebase=='undefined')
mjt.freebase=mjt.services.FreebaseService.prototype;(function(){var freebase=mjt.freebase;freebase.default_service_url='http://www.freebase.com';freebase.FreebaseJsonPTask=mjt.define_task();freebase.FreebaseJsonPTask.prototype.init=function(){this.service=this._factory;}
freebase.FreebaseJsonPTask.prototype.service_request=function(path,form){var url=this.service.service_url+path;this.jsonp=mjt.JsonP();this.jsonp.set_timeout().jsonp_request_form(url,form,'callback').onready('handle_envelope',this).onerror('handle_error_jsonp',this);return this;};freebase.FreebaseJsonPTask.prototype.handle_envelope=function(o){if(o.code!='/api/status/ok'){var msg=o.messages[0];return this.error(msg.code,msg.message);}
return this.response(o);};freebase.FreebaseJsonPTask.prototype.handle_error_jsonp=function(){mjt.warn('JSONP ERROR',arguments);this.error.apply(this,arguments);};freebase.FreebaseJsonPTask.prototype.request=function(){mjt.error('must override BaseTask.request()');};freebase.FreebaseJsonPTask.prototype.response=function(o){mjt.error('must override BaseTask.response()');};freebase.MqlRead=mjt.define_task(freebase.FreebaseJsonPTask,[{name:'query'},{name:'args','default':{}}]);freebase.MqlRead.prototype.build_envelope=function(){var envelope={query:this.query,escape:false};if(this.query instanceof Array){if(typeof this.args.cursor=='undefined'||typeof this.args.cursor=='boolean'){envelope.cursor=true;this.start=0;}else{envelope.cursor=this.args.cursor;}
this.requested_count=this.query[0].limit||100;}
return envelope;};freebase.MqlRead.prototype.request=function(){var envelope=this.build_envelope();var s=mjt.json_from_js(envelope);return this.service_request('/api/service/mqlread',{query:s});};freebase.MqlRead.prototype.response=function(o){if(o.result===null)
return this.empty_result();if(typeof o.cursor==='string')
this.next_cursor=o.cursor;if(o.result instanceof Array){this.count=o.result.length;this.more_available=false;if(this.count>=this.requested_count&&this.next_cursor!=false)
this.more_available=true;}
return this.ready(o.result);};freebase.MqlRead.prototype.next=function(reqcount){if(this.state!=='ready'){throw new Error('MqlRead.next(): bad state '+this.state);}
if(!this.more_available){mjt.warn('paging .next(): no more items',this);return null;}
var q=mjt.shallow_extend(this.query[0]);if(typeof reqcount!='undefined'){q.limit=reqcount;}
var task=this.service.MqlRead([q],{cursor:this.next_cursor});task.start=this.start+this.count;return task;};freebase.MqlReadMultiple=mjt.define_task(freebase.FreebaseJsonPTask);freebase.MqlReadMultiple.prototype.init=function(){this.reads={};};freebase.MqlReadMultiple.prototype.request=function(){var queries={};for(var k in this.reads)
queries[k]=this.reads[k].build_envelope();var s=mjt.json_from_js(queries);return this.service_request('/api/service/mqlread',{queries:s});};freebase.MqlReadMultiple.prototype.mqlread=function(key,task){this.reads[key]=task;return this;};freebase.MqlReadMultiple.prototype.response=function(o){for(var k in this.reads){var task=this.reads[k];task.handle_envelope(o[k]);}
return this.ready(o.result);};freebase.TransGet=mjt.define_task(freebase.FreebaseJsonPTask,[{name:'id'},{name:'trans_type','default':'raw'},{name:'values','default':null}]);freebase.TransGet.prototype.request=function(){if(this.values===null)this.values={};var path='/api/trans/'+this.trans_type+this.id;return this.service_request(path,this.values);};freebase.TransGet.prototype.response=function(o){return this.ready(o.result);};})();mjt.freebase.imgurl=function(cid,maxwidth,maxheight){var qargs={};if(typeof(maxwidth)=='number'){qargs.maxwidth=parseInt(''+maxwidth);}
if(typeof(maxheight)=='number'){qargs.maxheight=parseInt(''+maxheight);}
return mjt.form_url(this.service_url+'/api/trans/image_thumb/'
+mjt.formquote(cid),qargs);};mjt.freebase=new mjt.services.FreebaseService('http://www.freebase.com');mjt.mqlread=function(){mjt.warn("mjt.mqlread() is deprecated, use mjt.freebase.MqlRead()");return mjt.freebase.MqlRead.apply(mjt.freebase,arguments);};mjt.BlobGetTask=function(){mjt.warn(this,"new mjt.BlobGetTask() is deprecated, use mjt.freebase.TransGet()");var args=[mjt._init_existing_token,this].concat(mjt.makeArray(arguments));mjt.freebase.TransGet.apply(mjt.freebase,args);};mjt.BlobGetTask.prototype=mjt.freebase.TransGet.prototype;mjt.imgurl=function(){mjt.warn("mjt.imgurl() is deprecated, use mjt.freebase.imgurl()");return mjt.freebase.imgurl.apply(mjt.freebase,arguments);}
mjt.bless=function(html){return new mjt.Markup(html);}
mjt.Markup=function(html){this.html=html;};mjt.Markup.prototype.toMarkup=function(){return this.html;};(function(){function bad_markup_element(v,msg,markup){markup.push('<span style="outline-style:solid;color:red;">');if(msg){markup.push(msg);markup.push('</span>');}else{markup.push('bad markup element, type [');markup.push(typeof(v));markup.push(']</span>');}}
function flatn(x,markup){switch(typeof x){case'object':if(x===null){bad_markup_element(x,'[null]',markup);}else if(x instanceof Array){for(var i=0;i<x.length;i++)
flatn(x[i],markup);}else if(typeof x.toMarkupList==='function'){flatn(x.toMarkupList(),markup);}else if(typeof x.toMarkup==='function'){markup.push(x.toMarkup());}else{bad_markup_element(x,'[object]',markup);}
break;case'undefined':bad_markup_element(x,'[undefined]',markup);break;case'string':markup.push(mjt.htmlencode(x));break;case'boolean':markup.push(String(x));break;case'number':markup.push(String(x));break;case'function':bad_markup_element(x,'[function]',markup);break;};return markup;}
mjt.flatten_markup=function(v){return flatn(v,[]).join('');};})();mjt.error_html=function(e,codestr,target_id){var source=[];if(codestr&&e.lineNumber){var lineno=e.lineNumber;var lines=codestr.split('\n');if(lineno<0)
lineno=0;if(lineno>=lines.length)
lineno=lines.length-1;var line0=lineno-10;if(line0<0)line0=0;var cx=[];var line;source.push(mjt.bless(['\n<pre>']));for(line=line0;line<lineno;line++)
cx.push(lines[line]);source.push(cx.join('\n'));source.push(mjt.bless(['</pre>\n<pre style="color:red">']));source.push(lines[lineno]+'\n');source.push(mjt.bless(['</pre>\n<pre>']));cx=[];for(line=lineno+1;line<lines.length;line++)
cx.push(lines[line]);source.push(cx.join('\n'));source.push(mjt.bless(['</pre>\n']));}
var html=[mjt.bless(['<div class="mjt_error"']),(target_id?[mjt.bless([' id="']),target_id,mjt.bless(['"'])]:[]),mjt.bless(['>']),e.name,': ',e.message,source,mjt.bless(['</div>\n'])];html=html.concat(source);return html;};mjt.Codeblock=function(name,codestr){this.name=name;this.codestr=codestr;this.basefile=null;this.baseline=null;};mjt.Codeblock.prototype.handle_exception=function(msg,e){if(typeof e.mjt_error!='undefined')
return;var espec;if(!(e instanceof Error)){espec={name:'Unknown exception',fileName:'',message:''+e,};}else{espec={fileName:e.fileName,lineNumber:e.lineNumber,name:e.name,message:e.message,stack:e.stack};}
var filerx=this.basefile.replace(/(\W)/g,'\\$1')+':(\\d+)\n';filerx=new RegExp(filerx);if(typeof e.stack=='string'){var m=filerx.exec(e.stack);if(m.length){var lineno=parseInt(m[1])-this.baseline;if(lineno>0)
this.log_error_context(msg,e,lineno);}}else{if(e.fileName==this.basefile){var lineno=e.lineNumber-this.baseline;if(lineno>0){espec.lineNumber=lineno;espec.fileName='<generated code>';this.log_error_context(msg,e,lineno);}}}
e.mjt_error=espec;};mjt.Codeblock.prototype.log_error_context=function(msg,e,lineno){var cx=this.extract_context(this.codestr,lineno,5);var pfx='---'+lineno+'-->  ';var spc=[];for(var i=0;i<pfx.length;i++)
spc.push(' ');spc=spc.join('');var cxtext=[spc,cx.prev_lines.join('\n'+spc),'\n',pfx,cx.the_line,'\n',spc,cx.next_lines.join('\n'+spc)].join('');mjt.error('error',msg,'\n    '+e.name+': '+e.message+'\n',cxtext);};mjt.Codeblock.prototype.extract_context=function(codestr,lineno,radius){var source=[];var lines=codestr.split('\n');if(lineno<0)
lineno=0;if(lineno>=lines.length)
lineno=lines.length-1;var line0=lineno-radius;if(line0<0)line0=0;var prev_lines=[];for(line=line0;line<lineno;line++)
prev_lines.push(lines[line]);var the_line=lines[lineno];var next_lines=[];for(line=lineno+1;line<lines.length&&line<lineno+radius;line++)
next_lines.push(lines[line]);return{prev_lines:prev_lines,the_line:the_line,next_lines:next_lines};};mjt.Codeblock.prototype.evaluate=function(){var t0=(new Date()).getTime();mjt.debug&&mjt.spew('evaluating code '+this.name,[this.codestr]);var codestr=this.codestr;var result;if(0&&typeof console!='undefined'&&typeof console.trace=='function'){result=eval(codestr);}else if(typeof window.navigator.appName==='undefined'){result=eval(codestr);}else{try{null();}catch(e){this.baseline=e.lineNumber+2;this.basefile=e.fileName;}
try{result=eval(codestr);}catch(e){this.handle_exception('evaluating codeblock '+this.name,e);throw e;}}
var dt=(new Date()).getTime()-t0;mjt.note('evaluated code in ',dt,'msec, ',codestr.length,'chars');return result;};mjt.foreach=function(self,items,func){var i,l;if(typeof items==='string'||items instanceof Array||(typeof jQuery==='object'&&items instanceof jQuery)){l=items.length;for(i=0;i<l;i++)
func.apply(self,[i,items[i]]);}else if(typeof items==='object'){if(items.item===document.childNodes.item){l=items.length;for(i=0;i<l;i++)
func.apply(self,[i,items.item(i)]);}else{for(i in items)
if(items.hasOwnProperty(i))
func.apply(self,[i,items[i]]);}}};mjt.ref=function(name){var s=['<a href="view?name=',mjt.formquote(name),'">',mjt.htmlencode(name),'</a>'].join('');return new mjt.Markup(s);};mjt.TemplateCall=function(raw_tfunc){this.raw_tfunc=raw_tfunc;delete this._markup;}
mjt.TemplateCall.prototype.toMarkupList=function(){return this._markup;};mjt.TemplateCall.prototype.redisplay=function(){var tfunc=this.this_tfunc;var tcall=new tfunc();tcall.prev_tcall=this;tcall.subst_id=this.subst_id;tcall.render(this.targs).display();return tcall;};mjt.TemplateCall.prototype.display=function(target_id,targs){if(typeof target_id!='undefined')
this.subst_id=target_id;var top=mjt.id_to_element(this.subst_id);if(!top){return this;}
if(typeof this._markup!='undefined')
mjt.replace_html(top,this);return this;};mjt.TemplateCall.prototype.render=function(targs){var html;if(typeof targs!='undefined')
this.targs=targs;var raw_tfunc=this.raw_tfunc;try{if(0){var tstates=[];for(var t in this.tasks)
tstates.push(t+':'+this.tasks[t].state);mjt.openlog('applying',this.signature,this.targs,'to id=',this.subst_id+': '+tstates.join(' '));}
try{this._no_render=false;this._markup=raw_tfunc.apply(this,this.targs);}catch(e){if(e==mjt.NoDrawException){this._markup=undefined;}else{var codeblock=this.tpackage._codeblock;if(typeof codeblock!=='undefined'){mjt.log('codeblock',codeblock.name,this);e.tcall=this;codeblock.handle_exception('applying tfunc '+
this.signature,e);}else{throw e;}
var tstates=[];for(var t in this.tasks){var tt=this.tasks[t];if(typeof tt==='object'&&tt!==null){tstates.push(t+':'+tt.state);}else{tstates.push(t+':'+typeof tt);}}
this._markup=[mjt.bless('<h3>error applying '),this.signature,' to id=',this.subst_id,mjt.bless('</h3>'),'states:[',tstates.join(' '),']'];throw e;}}}finally{if(this._no_render)
this._markup=undefined;if(0){mjt.closelog();}}
return this;};mjt.TemplateCall.prototype.mktask=function(name,task){this.tasks[name]=task;var tcall=this;if(task.state=='init')
task.enqueue();return task.ondone(function(){tcall.render().display();});};mjt.tfunc_factory=function(signature,rawtfunc,tpackage,has_tasks,toplevel){var _inline_tcall=function(){var ctor=arguments.callee;if(this instanceof ctor){this.tasks={};this.defs={};return undefined;}
if(0&&!ctor.prototype.has_tasks&&!toplevel){return rawtfunc.apply(ctor.prototype,arguments);}
var self=new ctor();var targs=[];for(var ai=0;ai<arguments.length;ai++)
targs[ai]=arguments[ai];var tname=self.signature.replace(/\(.*\)$/,'');self.subst_id=mjt.uniqueid('tcall__'+tname);self.render(targs);return self;};_inline_tcall.prototype=new mjt.TemplateCall(rawtfunc);_inline_tcall.prototype.signature=signature;_inline_tcall.prototype.tpackage=tpackage;_inline_tcall.prototype.has_tasks=has_tasks;_inline_tcall.prototype.this_tfunc=_inline_tcall;return _inline_tcall;};mjt._internal_tcall={construct_only:true};mjt.NoDrawException=new Error('no redraw needed for this event');mjt.NoDrawException.name='NoDrawException';mjt.TemplatePackage=function(){this._top=null;this._codeblock=null;this.namespace=null;this._prereqs=[];this.source=null;};mjt.TemplatePackage.prototype.require=function(restype,url,title,type){var res=new mjt.Resource(restype,url,title,type);this._prereqs.push(res);};mjt.TemplatePackage.prototype.from_head=function(head){var elts=[];for(var e=head.firstChild;e!==null;e=e.nextSibling){if(e.nodeType!=1)
continue;elts.push(e);}
for(var i=0;i<elts.length;i++){var e=elts[i];switch(e.nodeName){case'TITLE':this.title=e.innerHTML;break;case'META':switch(e.name){case'description':this.summary=e.content;break;case'author':this.author=e.content;break;case'content-language':this.language=e.content;break;case'x-mjt-id':this.id=e.content;break;}
break;case'SCRIPT':break;case'STYLE':break;case'LINK':switch(e.rel){case'x-mjt-script':this.require('js',e.href,e.title,(e.type||'text/javascript'));break;case'x-mjt-import':this.require('mjt',e.href,e.title,(e.type||'text/x-metaweb-mjt'));break;case'stylesheet':case'alternate stylesheet':break;}
break;default:break;}}};mjt.kws=function(){var kws={};for(var i=0;i<arguments.length;i+=2){kws[arguments[i]]=arguments[i+1];}
return kws;};mjt.run=function(target,tfunc,targs){var target_id;if(typeof mjt.app=='undefined'){mjt.app=new mjt.App();}
if(typeof target==='string'){target_id=target;target=document.getElementById(target_id);}else if(typeof target==='object'){if(target.id=='')
target.id=mjt.uniqueid('run_target');target_id=target.id;}
if(typeof tfunc==='function'){var tcall=new tfunc();tcall.subst_id=target_id;tcall.render(targs).display();return tcall.defs;}
var pkg=new mjt.TemplatePackage();if(typeof(target)==='undefined'){pkg.from_head(document.getElementsByTagName('head')[0]);pkg.source=window.location.protocol+'//'
+window.location.host+window.location.pathname;target=document.createElement('div')
var body=document.getElementsByTagName('body')[0];var e=body.firstChild;while(e!==null){var tmp=e;e=e.nextSibling;if(tmp.nodeName==='IFRAME'&&tmp.className==='mjt_dynamic'){continue;}
body.removeChild(tmp);target.appendChild(tmp);}
if(1){target.id=mjt.uniqueid('mjt_body');target.style.display='none';body.appendChild(target);}
if(body.style.display=='none')
body.style.display='';}else{pkg.source=window.location.protocol+'//'
+window.location.host+window.location.pathname
+'#'+target_id;}
var tcall_defs=null;pkg.load_prereqs(function(){pkg.compile_document(target,targs);pkg.tcall.subst_id=target.id;pkg.tcall.display();tcall_defs=pkg.tcall.defs;});return tcall_defs;};mjt.load_element=function(top){var pkg=new mjt.TemplatePackage();pkg.source=window.location.protocol+'//'
+window.location.host+window.location.pathname
if(typeof top=='string'){pkg.source+='#'+top;top=document.getElementById(top);}
pkg.compile_document(top,[]);return pkg;};mjt.load=function(top){var pkg=mjt.load_element(top);return pkg.tcall.defs;};mjt.load_string=function(mjthtml){var tag=document.createElement('div');tag.innerHTML=mjthtml;return mjt.load_element(tag);};mjt.popup=function(tfunc,args,kws){if(typeof kws=='undefined')kws={};var id=kws.id?kws.id:mjt.uniqueid('_popup');var html=mjt.flatten_markup(tfunc.apply(null,args));var div=document.createElement('div');div.innerHTML=html;if(id)
div.id=id;var target=kws.target;var pos={x:0,y:0};if(typeof target!='undefined')
pos=mjt.get_element_position(target);for(var sk in kws.style){var sv=kws.style[sk];if(typeof sv=='number'){if(sk=='left'||sk=='right')
sv=(sv+pos.x)+'px';else if(sk=='top'||sk=='bottom')
sv=(sv+pos.y)+'px';else
sv=sv+'px';}
div.style[sk]=sv;}
if(typeof target!='undefined')
div.style.position='absolute';document.body.appendChild(div);return div.id;};mjt.get_element_position=function(elt){var x=0,y=0;while(elt.offsetParent){x+=elt.offsetLeft;y+=elt.offsetTop;elt=elt.offsetParent;}
if(elt.x)
x+=elt.x;if(elt.y)
y+=elt.y;return{x:x,y:y};};mjt.replace_innerhtml=function(top,html){var htmltext=mjt.flatten_markup(html);top.innerHTML=htmltext;};mjt.replace_html=function(top,html){var tmpdiv=document.createElement('div');var htmltext=mjt.flatten_markup(html);tmpdiv.innerHTML=htmltext;if(top.parentNode===null){mjt.warn('attempt to replace html that has already been replaced?');return;}
var newtop=tmpdiv.firstChild;if(newtop===null){mjt.warn('bad html in replace_innerhtml');return;}
if(newtop.nextSibling){mjt.warn('template output should have a single toplevel node');}
top.parentNode.replaceChild(newtop,top);if(newtop.style&&newtop.style.display=='none')
newtop.style.display='';};mjt.spew=function(msg,args){var output=document.createElement('div');var tag;var text;tag=document.createElement('h3');tag.style.backgroundColor='#fff0f0';tag.appendChild(document.createTextNode(msg));output.appendChild(tag);for(var ai=0;ai<args.length;ai++){var value=args[ai];if(value instanceof Array){tag=document.createElement('div');tag.innerHTML=mjt.flatten_markup(value);output.appendChild(tag);continue;}
tag=document.createElement('pre');if(typeof(value)=='string'){text=value;}else{try{text=mjt.json_from_js(value);}catch(e){text=''+value;}}
text=text.replace(/\r?\n/g,'\r\n');tag.appendChild(document.createTextNode(text));output.appendChild(tag);}
var container=document.getElementById('mjt_debug_output');if(!container)
container=document.getElementsByTagName('body')[0];container.appendChild(output);}
mjt.global_scope=window;mjt.Resource=function(restype,url,title,type){this.restype=restype;this.url=url;this.title=title;this.type=type;};mjt.Resource.prototype.iframe_loaded=function(k,iframe){var idoc=(iframe.contentWindow||iframe.contentDocument);if(idoc.document)
idoc=idoc.document;var ibody=idoc.getElementsByTagName('body')[0];var load_t0=(new Date()).getTime();var reqpkg=new mjt.TemplatePackage();reqpkg.source=this.url;reqpkg.from_head(idoc.getElementsByTagName('head')[0]);var res=this;reqpkg.load_prereqs(function(){reqpkg.compile_document(ibody,[]);reqpkg.tcall.defs._package=reqpkg;mjt.global_scope[res.title]=reqpkg.tcall.defs;var dt=(new Date()).getTime()-load_t0;mjt.note('loaded pkg',res.title,' in ',dt,'msec from ',reqpkg.source);k();});};mjt.Resource.prototype.load_resource=function(k){switch(this.restype){case'js':mjt.include_js_async(this.url,k);break;case'mjt':mjt.dynamic_iframe_async(this.url,mjt.vthunk(['iframe_loaded',this,k]));break;default:mjt.error('unknown resource type',this.restype)
break;}};mjt.TemplatePackage.prototype.load_prereqs=function(k){var pkg=this;if(!this._prereqs.length){k();return;}
var prereq=pkg._prereqs.shift();function resource_loaded(){pkg.load_prereqs(k);};mjt.note('loading prereq',prereq.url,prereq);prereq.load_resource(resource_loaded);};mjt.TemplatePackage.prototype.compile_document=function(top,targs){this._top=top;if(this._prereqs.length){mjt.error('missing prerequisites for template package',this,this._prereqs);throw new Error('missing prerequisites for template package');}
if(typeof targs=='undefined')
targs=[];this._args=targs;var t0=(new Date()).getTime();var template=new mjt.Template(top);this._template=template;var dt=(new Date()).getTime()-t0;this._tstrings=template.strings;this._template_fragments=[];for(var tsi=0;tsi<this._tstrings.length;tsi++)
this._template_fragments[tsi]=mjt.bless(this._tstrings[tsi]);this._codestr=template.codestr;this._codeblock=new mjt.Codeblock('#'+top.id,this._codestr);this._compiled=this._codeblock.evaluate();this.namespace={_package:this};this.namespace.main=mjt.tfunc_factory("main()",this._compiled.rawmain,this,false,true)
var tcall=(new this.namespace.main()).render(this._args)
this.tcall=tcall;tcall.pkg=this;tcall.template=template;var defs=tcall.defs;for(var k in defs){if(!defs.hasOwnProperty(k))continue;this.namespace[k]=defs[k];}
var dt=(new Date()).getTime()-t0;mjt.note('template loaded in ',dt,'msec from ',this.source,tcall,tcall.defs);return this;};mjt.dynamic_iframe=function(id,url){var iframe=document.createElement('iframe');if(typeof id=='string')
iframe.id=id;iframe.style.display='none';iframe.className='mjt_dynamic';iframe.setAttribute('src',url);return iframe;};mjt.dynamic_iframe_async=function(url,k){var iframe=mjt.dynamic_iframe(mjt.uniqueid('mjt_iframe'),url);iframe.onload=function(){k(iframe);};iframe.onreadystatechange=function(){if(iframe.readyState=='complete'){k(iframe);}}
document.getElementsByTagName('body')[0].appendChild(iframe);};mjt._eventcb={};mjt.Scope=function(template,parent,decl){this.template=template
if(!parent)parent=null;this.parent=parent;if(!decl)decl='[unnamed]';this.decl=decl;this.tasks={};this.toplevel=false;}
mjt.Template=function(top){this.strings=[];this.codestr=null;this.compiler_dt=null;this.buffer=[];this.code=[];this.scope=new mjt.Scope(this,null,'[toplevel]');this.scope.toplevel=true;top=mjt.id_to_element(top);this.compile_top(top);};mjt.Template.prototype.flush_string=function(no_output,ignore_whitespace){var s=this.buffer.join('');this.buffer=[];if(s=='')
return-1;if(ignore_whitespace&&/^\s*$/.exec(s))
return-1;var texti=this.strings.length;this.strings[texti]=s;if(mjt.debug){var indent='                                                  ';var commentstart='// ';var x=s.replace(/\r?\n/gm,'\r\n'+indent+commentstart);var c='__m[__n++]=__ts['+texti+'];';if(c.length<indent.length)
c+=indent.substr(c.length);this.code.push(c);this.code.push([commentstart,x,'\n'].join(''));}else if(!no_output){this.code.push('__m[__n++]=__ts['+texti+'];\n');}
return texti;};mjt.Template.prototype.warn=function(s){this.buffer.push('<span style="outline-style:solid;color:red;">');this.buffer.push(mjt.htmlencode(s));this.buffer.push('</span>');};mjt.Template.prototype.push_def=function(decl){this.scope=new mjt.Scope(this,this.scope,decl);}
mjt.Template.prototype.pop_def=function(){this.scope=this.scope.parent;}
mjt.Template.prototype.compile_task=function(name,e){var mq=e.firstChild.nodeValue;if(mq.match(/;\s*$/)){mjt.warn('mjt.task=',name,'definition should not end with a semicolon');mq=mq.replace(/;\s*$/,'');}
if(mq.match(/\/\/ /)){mjt.warn('"//" comments in mjt.task=',name,'definition will fail on IE6');}
this.flush_string();this.code.push('var '+name+' = this.tasks && this.tasks.'
+name+';\n');this.code.push('if (!'+name+') ');this.scope.has_tasks=true;this.code.push(name+' = this.mktask("'+name
+'", (\n'+mq+'));\n');};mjt.Template.prototype.compile_attrs=function(s){this.flush_string();var uvar=mjt.uniqueid('attrs');var tvar=mjt.uniqueid('attrs_i');this.code.push('var '+uvar+' = '+s+';\n');this.code.push('for (var '+tvar+' in '+uvar+') {\n');var x="' ' + @tvar + '=\"' + @uvar[@tvar] + '\"'".replace(/@tvar/g,tvar).replace(/@uvar/g,uvar);this.code.push('__m[__n++]=mjt.bless('+x+');\n');this.code.push('}\n');};mjt.Template.prototype.compile_text=function(s){var segs=s.split('$');if(segs.length==1){this.buffer.push(mjt.htmlencode(s));return;}
this.buffer.push(mjt.htmlencode(segs[0]));var escaped=true;var valid=true;var segi=1;var seg=segs[segi];while(segi<segs.length){if(escaped){escaped=false;if(seg==''&&segi<segs.length-1){this.buffer.push('$');segi++;seg=segs[segi];continue;}
var m=seg.match(/^(([A-Za-z0-9_.]+)|\{([^}]+)\}|\[([^\]]+)\])((.|\n)*)$/);if(m!=null){var expr=m[2];if(typeof(expr)=='undefined'||expr=='')
expr=m[3];if(typeof(expr)=='undefined'&&typeof(m[4]!='undefined'))
expr='mjt.ref("'+m[4]+'")';if(typeof(expr)=='undefined'){this.warn('bad $ substitution');}else{this.flush_string();this.code.push('__m[__n++]=('+expr+');\n');}
if(seg!=''||segi<segs.length-1)
seg=m[5];}else{this.warn('bad $ substitution');}}else{if(seg!=''){this.buffer.push(mjt.htmlencode(seg));}
escaped=true;segi++;seg=segs[segi];}}};mjt.Template.prototype.compile_onevent_attr=function(n,aname,avalue){this.flush_string();var uvar=mjt.uniqueid(aname+'_cb');this.code.push('var '+uvar+' = mjt.uniqueid("'+aname+'");\n');this.code.push('mjt._eventcb['+uvar+'] = function (event) {\n');this.code.push(avalue);this.code.push('}\n');return('return mjt._eventcb.${'+uvar+'}.apply(this, [event])');};mjt.Template.prototype.get_attributes=function(n,attrs,mjtattrs){var srcattrs=n.attributes;var a;var ie_dom_bs=/MSIE/.test(navigator.userAgent);for(var ai=0;ai<srcattrs.length;ai++){var attr=srcattrs[ai];if(!attr.specified)continue;var aname=attr.nodeName;var m=aname.match(/^mjt\.(.+)/);if(m){var mname=m[1];a={name:mname};mjtattrs[mname]=attr.nodeValue;if(mname=='src'){a.value=attr.nodeValue;attrs.push(a);}}}
for(var ai=0;ai<srcattrs.length;ai++){var attr=srcattrs[ai];if(!attr.specified)continue;var aname=attr.nodeName;var m=aname.match(/^mjt\.(.+)/);if(!m){if(aname=='src'&&(typeof mjtattrs.src!='undefined'))
continue;a={name:aname};if(aname.substr(0,2)=='on'){mjt.warn(a.name,'="..."','will break on IE6, use','mjt.'+aname);attrs.push(a);}
if(ie_dom_bs){if(aname=="style"){a.value=''+n.style.cssText;}else if(aname=='CHECKED'){aname='checked';a.value='1';}else{a.value=n.getAttribute(aname,2);if(!a.value)
a.value=attr.nodeValue;}}else{a.value=attr.nodeValue;}
if(typeof a.value=='number')
a.value=''+a.value;attrs.push(a);}}
if(ie_dom_bs&&n.nodeName=="INPUT"){a={name:'value',value:n.value};attrs.push(a);}};mjt.Template.prototype.compile_choose=function(cn,choose){var choose_state='init';var tablevar=false;var default_label=false;this.flush_string();if(choose){this.code.push('switch ('+choose+') {\n');choose_state='dispatch_init';}
var n=cn.firstChild;while(n!=null){var nextchild=n.nextSibling;var nt=n.nodeType;if(nt==3){if(n.nodeValue.match(/[^ \t\r\n]/)){mjt.warn('only whitespace text is allowed in mjt.choose, found','"'+n.nodeValue+'"');}
n=nextchild;continue;}
if(nt==1){var next_choose_state=choose_state;var mjtattrs={};var attrs=[];this.get_attributes(n,attrs,mjtattrs);var defaultcase=false;if(typeof(mjtattrs.when)!='undefined'){defaultcase=false;}else if(typeof(mjtattrs.otherwise)!='undefined'){defaultcase=true;}else{mjt.warn('all elements inside mjt.choose must have a mjt.when= or mjt.otherwise= attribute');break;}
if(choose_state=='init'){if(defaultcase){this.code.push('{\n');next_choose_state='closed';}else{this.code.push('if ('+mjtattrs.when+') {\n');next_choose_state='open';}}else if(choose_state=='open'){if(defaultcase){this.code.push('} else {\n');next_choose_state='closed';}else{this.code.push('} else if ('+mjtattrs.when+') {\n');next_choose_state='open';}}else if(choose_state.match(/^dispatch/)){if(choose_state!='dispatch_init')
this.code.push('break;\n');if(defaultcase){this.code.push('default:\n');next_choose_state='dispatch';}else{this.code.push('case ');this.code.push(mjt.json_from_js(mjtattrs.when));this.code.push(':\n');next_choose_state='dispatch';}}
this.compile_node(n,'in_choose');choose_state=next_choose_state;}
n=nextchild;}
this.flush_string();if(choose==''){this.code.push('}\n');}else{if(choose_state!='dispatch_init')
this.code.push('break;\n');this.code.push('};\n');}};mjt.Template.prototype.compile_node=function(n,choose_state){if(typeof(choose_state)=='undefined')
choose_state='none';var nt=n.nodeType;var tt=this;var subcompiler=function(n){var child=n.firstChild;while(child!=null){var nextchild=child.nextSibling;tt.compile_node(child);child=nextchild;}};var toplevel=this.scope.toplevel;if(nt==3){this.compile_text(n.nodeValue);return;}
if(nt==1){var mjtattrs={};var attrs=[];this.get_attributes(n,attrs,mjtattrs);var completions=[];var render_outer_tag=true;var generate_id=false;if(toplevel){mjtattrs.def='rawmain()';}
var tagname=n.nodeName;if(tagname.match(/script/i)){return;}
if(typeof(mjtattrs.task)!='undefined'){this.flush_string();this.compile_task(mjtattrs.task,n);return;}
if(typeof(mjtattrs.def)!='undefined'){this.flush_string();var defn=mjtattrs.def.match(/^([^(]+)\(([^)]*)\)$/);if(!defn){mjt.warn('bad mjt.def=',mjtattrs.def,': must contain an argument list');return;}
var defname=defn[1];var defargs=defn[2];if(mjt.debug){this.code.push('// mjt.def=');this.code.push(mjtattrs.def);this.code.push('\n');}
if(typeof(attrs.id)!='undefined'){mjt.warn('mjt.def=',mjtattrs.def,'must not have an id="..." attribute');}
this.code.push('var '+defname+' = ');this.code.push('function ('+defargs+') {\n');this.push_def(mjtattrs.def);if(toplevel){this.code.push('var __pkg = this.tpackage;\n');this.code.push('var __ts=__pkg._template_fragments;\n');}
this.code.push('var __m=[],__n=0;\n');generate_id=true;var t=this;completions.push(function(){var defscope=this.scope;this.pop_def();this.flush_string();this.code.push('return __m;\n');this.code.push('}\n');if(0){if(defscope.has_tasks){this.code.push(defname+'.has_tasks = true;\n');}
this.code.push(defname+'.signature = '+
mjt.json_from_js(mjtattrs.def)+';\n');}else{var has_tasks=false;if(defscope.has_tasks){has_tasks=true;}
if(!toplevel){var templatevar='__pkg';this.code.push(defname+' = mjt.tfunc_factory('+
mjt.json_from_js(mjtattrs.def)+', '+
defname+', '+templatevar+', '+
has_tasks+', '+
toplevel+');\n');}}
if(this.scope.parent&&this.scope.parent.toplevel)
this.code.push('this.defs.'+defname+' = '+defname+';\n');});}
if(typeof(mjtattrs['when'])!='undefined'){this.flush_string();if(choose_state!='in_choose')
mjt.warn('unexpected mjt.when, in choice state',choose_state);completions.push(function(){this.flush_string();});}
if(typeof(mjtattrs['otherwise'])!='undefined'){this.flush_string();if(choose_state!='in_choose')
mjt.warn('unexpected mjt.otherwise, in choice state ',choose_state);completions.push(function(){this.flush_string();});}
if(typeof(mjtattrs['for'])!='undefined'){this.flush_string();var matches=/^(\w+)(\s*,\s*(\w+))?\s+in\s+(.+)$/.exec(mjtattrs['for']);if(!matches){if(mjtattrs['for'].charAt(0)=='('){this.code.push('for '+mjtattrs['for']+' {\n');}else{mjt.warn('bad mjt.for= syntax');}
completions.push(function(){this.flush_string();this.code.push('}\n');});}else{var var1=matches[1];var var2=matches[3];var forexpr=matches[4];var itemid,indexid;if(!var2){indexid=mjt.uniqueid(var1+'_index');itemid=var1;}else{indexid=var1
itemid=var2;}
var itemsid=mjt.uniqueid(itemid+'_items');var funcvar=mjt.uniqueid('for_body');this.code.push('var '+itemsid+' = ('+forexpr+');\n');this.code.push('var '+funcvar+' = function ('
+indexid+', '+itemid+') {\n'
+itemid+' = '+itemsid+'['
+indexid+'];\n');var onceid=mjt.uniqueid('once');this.code.push('var '+onceid+' = 1;\n');this.code.push('while ('+onceid+'--) {\n');completions.push(function(){this.flush_string();this.code.push('} /* while once-- */\n');this.code.push('}; /* function '+funcvar+'(...) */\n');this.code.push('mjt.foreach(this, '+itemsid+', '+funcvar+');\n');});}}
if(typeof(mjtattrs['if'])!='undefined'){this.flush_string();this.code.push('if ('+mjtattrs['if']+') {\n');completions.push(function(){this.flush_string();this.code.push('}\n');});}
if(typeof(mjtattrs['elif'])!='undefined'){this.flush_string(false,true);this.code.push('else if ('+mjtattrs['elif']+') {\n');completions.push(function(){this.flush_string();this.code.push('}\n');});}
if(typeof(mjtattrs['else'])!='undefined'){this.flush_string(false,true);this.code.push('else {\n');completions.push(function(){this.flush_string();this.code.push('}\n');});}
if(typeof(mjtattrs.script)!='undefined'){switch(mjtattrs.script){case'':break;case'1':break;default:mjt.warn('reserved mjtattrs.script= value:',mjtattrs.script);break;}
this.flush_string();var textnode=n.firstChild;if(!textnode){render_outer_tag=false;subcompiler=function(n){};}else if(textnode.nodeType!=3||textnode.nextSibling){mjt.warn("the mjt.script element can only contain javascript text, not HTML.  perhaps you need to quote '<', '>', or '&' (this is unlike a <script> tag!)");}else{var txt=textnode?textnode.nodeValue:'';if(txt.match(/\/\/ /)){mjt.warn('"//" comments in mjt.script= definition will fail on IE6');}
this.code.push(txt);this.code.push('\n');render_outer_tag=false;subcompiler=function(n){};}}
if(typeof(mjtattrs.choose)!='undefined'){this.flush_string();var tt=this;subcompiler=function(n){tt.compile_choose(n,mjtattrs.choose);};}
if(typeof(mjtattrs.replace)!='undefined'){render_outer_tag=false
mjtattrs.content=mjtattrs.replace;}
if(typeof(mjtattrs.strip)!='undefined'){this.flush_string()}
for(var evname in mjtattrs){if(evname.substr(0,2)!='on')continue;a={name:evname,value:this.compile_onevent_attr(n,evname,mjtattrs[evname])};attrs.push(a);}
if(generate_id&&(!render_outer_tag||(typeof(mjtattrs.strip)!='undefined'))){mjt.warn('can\'t strip mjt.def="'+mjtattrs.def+'" tag yet');}
if(render_outer_tag){this.buffer.push('<');this.buffer.push(tagname);var myattrs=[];for(var ai=0;ai<attrs.length;ai++){myattrs.push(attrs[ai]);}
for(var ai=0;ai<myattrs.length;ai++){var a=myattrs[ai];if(a.name=='id'&&generate_id)
generate_id=false;if(typeof(a.value)=='function'){mjt.warn('ignoring function-valued attr',tagname,a.name,a.value);continue;}
this.buffer.push(' ');this.buffer.push(a.name);this.buffer.push('="');this.compile_text(a.value);this.buffer.push('"');}
if(generate_id){this.flush_string();this.code.push('if (this.subst_id) ');this.code.push('__m[__n++]=mjt.bless(\' id="\' + this.subst_id + \'"\');\n');}
if(typeof(mjtattrs.attrs)!='undefined'){this.compile_attrs(mjtattrs.attrs);}
this.buffer.push('>');}
if(typeof(mjtattrs.strip)!='undefined'){this.code.push('if (!('+mjtattrs['strip']+')) {\n');this.flush_string()
this.code.push('};\n');}
if(typeof(mjtattrs.content)!='undefined'){this.flush_string();this.code.push('__m[__n++]=('+mjtattrs.content+');\n');}else{subcompiler(n);}
if(typeof(mjtattrs.strip)!='undefined'){this.flush_string()}
if(render_outer_tag){this.buffer.push('</'+tagname+'>');}
if(typeof(mjtattrs.strip)!='undefined'){this.code.push('if (!('+mjtattrs['strip']+')) {\n');this.flush_string()
this.code.push('};\n');}
for(var ci=completions.length-1;ci>=0;ci--){completions[ci].apply(this,[]);}}};mjt.Template.prototype.compile_top=function(top){var t0=(new Date()).getTime();this.compile_node(top);var dt=(new Date()).getTime()-t0;mjt.note('compiled dom in ',dt,'msec');this.code.push('; var s = { rawmain: rawmain }; s;\n');this.codestr=this.code.join('');this.code=null;this.compiler_dt=(new Date()).getTime()-t0;};mjt.App=function(argschema){this.state=null;this.yui_history_id='mjtapp';this.argschema={'mjt.server':{key:'mjt.server',statekey:'service_url',validator:mjt.validators.service_host},'mjt.debug':{key:'mjt.debug',statekey:'debug',validator:mjt.validators.flag}};for(var k in argschema){this.argschema[k]=argschema[k];}
this._onstatechange={};this.init();};mjt.App.prototype.init=function(){this.init_state();mjt.service_url=this.state.service_url;mjt.debug=this.state.debug;mjt.urlquery=this.state;return this;};mjt.App.prototype.onstatechange=function(THUNK_ARGS){var tid=mjt.uniqueid('statecb');this._onstatechange[tid]=mjt.vthunk(arguments);return this;};mjt.App.prototype.refresh=function(){for(var k in this._onstatechange){this._onstatechange[k].apply(this,[]);}
return this;};mjt.App.prototype._handle_onhistory=function(rstate){mjt.log('yui setting state',rstate,typeof this.state);if(rstate===null){rstate=YAHOO.util.History.getCurrentState(this.yui_history_id);mjt.log('yui history onLoadEvent:',rstate);}else{mjt.log('yui history state:',rstate);}
this.state=rison.decode_object(rstate);this.refresh();};mjt.App.prototype.init_state=function(){var qstr=window.location.search;var qstate=null;if(typeof(qstr)=='string'&&qstr.length>0&&qstr.charAt(0)=='?')
this.state=qstate=this.decode_uristate(qstr.substr(1));else
this.state=this.decode_uristate('');if(typeof YAHOO==='undefined'||!YAHOO.util.History)
return this;var history=YAHOO.util.History;var init_state=history.getBookmarkedState(this.yui_history_id);if(!init_state){init_state=rison.encode_object(this.state)}
mjt.log('yui history initial state',init_state);history.register(this.yui_history_id,init_state,mjt.vthunk('_handle_onhistory',this))
if(qstate!==null){}
history.onLoadEvent.subscribe(mjt.vthunk('_handle_onhistory',this,null));history.initialize();return this;};mjt.App.prototype.mark_history=function(){if(this.yui_history_id===null){return;}
var rstate=rison.encode_object(this.state);YAHOO.util.History.navigate(this.yui_history_id,rstate);};mjt.App.prototype.freebase_init=function(){var url='http://www.freebase.com';if(typeof mjt.urlquery['mjt.server']!='undefined'){var server=mjt.urlquery['mjt.server'];if(server.substr(0,4)=='http')
url=server;else if(server=='.')
url=window.location.protocol+'//'
+window.location.host;else
url='http://'+server;}
mjt.service_url=url;};mjt.Validator=function(){};mjt.Validator.prototype.encode=function(v){if(v==this.default_value)
return undefined;return this.encodestr(v);};mjt.Validator.prototype.decode=function(v){if(typeof v=='undefined')
return this.default_value;return this.decodestr(v);};mjt.validators={};mjt.validators.flag=new mjt.Validator();mjt.validators.flag.default_value=false;mjt.validators.flag.encodestr=function(bool){return bool?'1':undefined;};mjt.validators.flag.decodestr=function(str){return str=='1'?true:false;};mjt.validators.service_host=new mjt.Validator();mjt.validators.service_host.default_value='http://www.freebase.com';mjt.validators.service_host.encodestr=function(server){var host=server.replace(/^http:\/\//,'');if(host==window.location.host)
return'.';return host;};mjt.validators.service_host.decodestr=function(server){if(server.substr(0,4)=='http')
url=server;else if(server=='.')
url=window.location.protocol+'//'+window.location.host;else
url='http://'+server;return url;};mjt.App.prototype.encode_uristate=function(values){var qd={};var state_encoded={};var k,argspec;var args_by_statekey={}
for(k in this.argschema){argspec=this.argschema[k];args_by_statekey[argspec.statekey]=argspec;}
for(k in this.state){argspec=args_by_statekey[k];if(typeof argspec!='undefined')
qd[k]=argspec.validator.encode(this.state[k]);else
qd[k]=this.state[k];}
for(k in values){argspec=args_by_statekey[k];if(typeof argspec!='undefined')
qd[k]=argspec.validator.encode(values[k]);else
qd[k]=values[k];}
for(k in qd){if(typeof qd[k]=='undefined')
delete qd[k];}
return mjt.formencode(qd);};mjt.App.prototype.decode_uristate=function(qstr){var state={};var qd=mjt.formdecode(qstr);var argspec,k;for(k in qd){argspec=this.argschema[k];if(typeof argspec!='undefined')
state[argspec.statekey]=argspec.validator.decode(qd[k]);else
state[k]=qd[k];}
for(k in this.argschema){argspec=this.argschema[k];var skey=argspec.statekey;if(!(skey in state))
state[skey]=argspec.validator.default_value;}
return state;};mjt.App.prototype.href=function(base,values){var qstr=this.encode_uristate(values);return base+(qstr?'?'+qstr:'');};