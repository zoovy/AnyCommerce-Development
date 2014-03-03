(function($) {
	$.widget("ui.tlc",{
		options : {
			templateid : null, //optional.  if set, the template will be appended to the target element.
//having any data is optional. A template ID only can be specified, thus allowing an instance to be added to the DOM w/ no interpolation.
			dataset : {}, //used to interpolate the template. can be passed in directly or can be set w/ datapointer/extendByDatapointers
			datapointer : null, //can be used to set data. ($._app.data[datapointer] )
			extendByDatapointers : new Array(), //an array of datapointers. will merge all the data into one object prior to translation
//if dataAttribs is set, these will be added to this.element as both s data- .  data- will be prepended if not already set.
			dataAttribs : null,
			verb : 'transmogrify' //acceptable values are transmogrify, translate or template (transmogrify requires template and does both apply template and translate).
			// for verb, may later offer a dwiw which tries to intelligently guess what to do. 
			},
		_init : function(){
			var o = this.options;
			//one of these three must be set or running this doesn't really serve any purpose.
			if(o.templateid || o.dataset || o.datapointer || !$.isEmptyObject(extendByDatapointers))	{
				//first, resolve 'dataset' so that singular object can be used for any translations.
				if(o.datapointer)	{
					$.extend(o.dataset,$._app.data[o.datapointer]);
					}
				if(!$.isEmptyObject(o.extendByDatapointers))	{
					this._handleDatapointers();
					}
				if($._app.vars.debug == 'tlc')	{
					dump("BEGIN tlc _init. verb: "+o.verb); dump(o.dataset);
					}
				if(o.verb == 'transmogrify')	{
					var $instance = this.transmogrify();
					this._handleDataAttribs($instance);
					this.element.append($instance);		
					}
				else if(o.verb == 'translate')	{
//					dump(" -> o.dataset"); dump(o.dataset);
					var $instance = this.translate();
					this._handleDataAttribs($instance);
					}
				else if(o.verb == 'template')	{
					var $instance = this.template();
					this._handleDataAttribs($instance);
					this.element.append($instance);
					}
				else	{
					dump("in tlc() jquery function, an invalid verb ["+o.verb+"] was specified.","warn");
					}
				}
			else	{
				dump('In $.tlc, no templateid or data was supplied. tlc is not going to accomplish anything without either data or a template.','warn');
				}
			}, //_init

		_setOption : function(option,value)	{
			$.Widget.prototype._setOption.apply( this, arguments ); //method already exists in widget factory, so call original.
			}, //_setOption
		_handleDatapointers : function()	{
			var o = this.options;
			//'data' could be a pointer, which we don't want to modify, so we extend a blank object and add data in the mix.
			//add all the datapointers into one object. 'may' run into issues here if keys are shared. shouldn't be too much of an issue in the admin interface.
			if(o.extendByDatapointers.length)	{
				dump(" -> datapointers have been extended for tlc");
				var L = o.extendByDatapointers.length;
				for(var i = 0; i < L; i += 1)	{
					if($._app.data[o.extendByDatapointers[i]])	{
						$.extend(true,this.options.dataset,$._app.data[o.extendByDatapointers[i]]);
						}
					}
				}
			},
		_handleDataAttribs : function($tag)	{
			var o = this.options;
	//		_app.u.dump(" -> eleAttr is NOT empty");
			if(!$.isEmptyObject(o.dataAttribs) && $tag instanceof jQuery)	{
				var tmp = {};
				for(var index in o.dataAttribs)	{
					if(typeof o.dataAttribs[index] == 'object')	{
						//can't output an object as a string. later, if/when data() is used, this may be supported.
						}
					else if(index.match("^[a-zA-Z0-9_\-]*$"))	{
						tmp[((index.indexOf('data-') === 0) ? '' : 'data-' + index).toLowerCase()] = o.dataAttribs[index]
						}
					else	{
						//can't have non-alphanumeric characters in 
						}
					}
				if(!$.isEmptyObject(tmp)){
	//				dump(" -> obj: "); dump(tmp);
					$tag.attr(tmp).data(o.dataAttribs);
					}

				}
			},
		template : function()	{
			return new tlc().getTemplateInstance(this.options.templateid);
			},
		translate : function()	{
			if($._app.vars.debug == 'tlc')	{dump(" dataset for tlc: "); dump(this.options.dataset);}
			return new tlc().translate(this.element,this.options.dataset);
			},
		transmogrify : function()	{
			var self = this;
//the tlc core code and this plugin are intentionally independant. allows tlc to be run directly. ex: buildQueriesFromTemplate
			var instance = new tlc();
			var $tmp = instance.runTLC({
				templateid : self.options.templateid,
				dataset : self.options.dataset
				});
			return $tmp
			}
		
		});

	})(jQuery);



//creates an instance of the template, in memory.
//interpolates all data-tlc on that template.
//returns the template.
var tlc = function()	{
//used w/ peg parser for tlc errors.
	this.buildErrorMessage = function(e) {
		dump(e);
		return e.line !== undefined && e.column !== undefined ? "Line " + e.line + ", column " + e.column + ": " + e.message : e.message;
		}

	this.createTemplate = function(templateid)	{
		if(templateid)	{
			var $tmp = $($._app.u.jqSelector('#',templateid));
			return $._app.model.makeTemplate($tmp,templateid);
			}
		else	{dump("Unable to execute maketemplate in tlc.createTemplate because no templateid was specified."); return false;}
		}
	
	this.getTemplateInstance = function(templateid)	{
		if($._app.vars.debug == 'tlc')	{
			dump(" -> tlc.getTemplateInstance was executed for templateid: "+templateid);
			}

		var r; //what is returned. either a jquery instance of the template OR false (invalid template)
		if(templateid && $._app.templates[templateid])	{
			r = $._app.templates[templateid].clone(true);
			}
		else if(this.createTemplate(templateid))	{ //createTemplate returns a boolean.
			r = $._app.templates[templateid].clone(true);
			}
		else	{r = false} //invalid template.
		return r;
		}

// ### FUTURE -> allows --datapointer='appProductDetail' to be set and this could be used to gather what datasets should be acquired.
// would return an object.
//	this.gatherDatapointers = function(){}'

	this.translate = function($ele,dataset)	{
//		dump(" -> dataset: "); dump(dataset);
		if($ele instanceof jQuery && dataset)	{
			var _self = this;
			$("[data-tlc]",$ele).addBack("[data-tlc]").each(function(index,value){ //addBack ensures the container element of the template parsed if it has a tlc.
				var $tag = $(this), tlc = $tag.data('tlc');
//			dump("----------------> start new $tag <-----------------");
			if($._app.vars.debug == 'tlc')	{
				dump(" >>>>> " + $(this).data('tlc'));
				}
				var commands = false;
				try{
					commands = window.pegParser.parse(tlc);
					}
				catch(e)	{
					dump(_self.buildErrorMessage(e)); dump(tlc);
					}
	
				if(commands && !$.isEmptyObject(commands))	{
					_self.executeCommands(commands,{
						tags : {
							'$tag' : $tag
							}, //an object of tags.
						focusTag : '$tag' //the pointer to the tag that is currently in focus.
						},dataset);
					}
				else	{
					dump("couldn't parse a tlc",'warn');
					//could not parse tlc. error already reported.
					}
	//			dump("----------------> end $tag <-----------------");
				});
			}
		else	{
			dump(" -> Either $ele is not an instance of jquery ["+($ele instanceof jQuery)+"] or an empty dataset was passed into tlc.translate. dataset follows:"); dump(dataset);
			}

		}


//This is where the magic happens. Run this and the translated template will be returned.
// p.dataset is the data object. dataset was used instead of data to make it easier to search for.
// ### TODO -> once all the legacy transmogrify's are gone, change this command to transmogrify
	this.runTLC = function(P)	{

//		var startTime = new Date().getTime(); // dump("BEGIN runTLC: "+startTime); // ### TESTING -> this is not necessary for deployment.
		
		var _self = this; //'this' context is lost within each loop.
		var $t = _self.getTemplateInstance(P.templateid);
		if($t instanceof jQuery)	{
			_self.translate($t,P.dataset);
			}
		else	{
			//invalid template
			}
//		dump("END runTLC: "+(new Date().getTime() - startTime)+" milliseconds"); //if you uncomment this, also uncomment the 'startTime' var near the top.
		return $t;
		} //runTLC

//used in 'apply' and possibly elsewhere. changes the args arrays into a single object for easy lookup.
	this.args2obj = function(args,globals)	{
//		dump(" ----> args: "); dump(args); 
		var r = {};
		if(!$.isEmptyObject(args))	{
			for(var i = 0, L = args.length; i < L; i += 1)	{
				var type = (args[i].type == 'longopt' && args[i].value) ? args[i].value.type : args[i].type;
//				dump(" -> type: "+type);
				if(args[i].value == null)	{r[args[i].key] = true} //some keys, like append or media, have no value and will be set to null.
				else if(type == 'variable')	{
					r[args[i].key] = globals.binds[args[i].value.value];
					}
				else	{
					r[args[i].key] = args[i].value.value;
					}
//				r[args[i].key+"_type"] = (args[i].type == 'longopt') ? args[i].value.type : args[i].type;
				}
			}
		return r;
		}

//The vars object should match up to what the s are on the image tag. It means the object used to create this instance can also be passed directly into a .attr()
	this.makeImageURL	= function(vars)	{
		var r;
		if(vars['data-filename'])	{
			if(vars['data-bgcolor'] && vars['data-bgcolor'].charAt(0) == '#')	{vars['data-bgcolor'] = vars['data-bgcolor'].substr(1)}
			var url = '';
	//In an admin session, the config.js isn't loaded. The secure domain is set as a global var when a domain is selected or can be retrieved from adminDomainList
	//In an admin session, the config.js isn't loaded. The secure domain is set as a global var when a domain is selected or can be retrieved from adminDomainList
			if($._app.u.thisIsAnAdminSession())	{
				if(location.protocol === 'file:')	{
					url = 'http:\/\/'+(_app.vars.domain);
					}
				else	{
					url = 'https:\/\/'+($._app.vars['media-host'] || $._app.data['adminDomainList']['media-host']);
					}
				//make sure domain ends in a /
				if(url.charAt(url.length) != '/')	{
					url+="\/"
					}
				url += "media\/img\/"+$._app.vars.username+"\/";
				}
			else	{
				url = (location.protocol === 'https:') ? zGlobals.appSettings.https_app_url : zGlobals.appSettings.http_app_url;
				url += "media\/img\/"+$._app.vars.username+"\/";
				}
			var sizing = (vars.width ? "-W"+vars.width : "")+(vars.height ? "-H"+vars.height : "")+(vars['data-bgcolor'] ? "-B"+vars['data-bgcolor'] : "")+(vars['data-minimal'] ? "-M" : "")+"/"+vars['data-filename'];
			r = url+(sizing.substr(1)); //don't want the first character to be a -. all params are optional, stripping first char is the most efficient way to build the path.
			}
		else	{
			
			}
		return r
		}

/*
This should return an img tag OR the url, based on whether the formatter is img or imageurl
'media' -> generate a media library instance for the var passed.
'src' -> use the value passed (/some/image/path.jpg)
The tag passed in will either be focusTag OR the $tag passed in.
	-> here, the tag can be used for read only purposes. The 'verb' handles updating the tag.
if neither media or src, something is amiss.
This one block should get called for both img and imageurl but obviously, imageurl only returns the url.
*/
	this.apply_formatter_img = function(formatter,$tag,argObj,globals)	{
		var r = true,filePath;
		argObj.media = argObj.media || {};
		var mediaParams;
		
		if(argObj.media)	{
			//build filepath for media lib
			//default = true is use focusTag. default = $tag says to use another, already defined, tag so focus shifts within this function, but focusTag does NOT change.
			if(typeof argObj.default === 'string')	{
				if(globals.tags[argObj.default])	{
					$tag = globals.tags[argObj.default]
					}
				else	{
					dump("Formatter img/imageurl specified "+argObj.default+" as the tag src, but that tag has not been defined",'warn');
					}
				}

			if(argObj.default)	{
				dump(" -> use s of tag to build image path");
				//here need to check if default is set to a tag. not sure how, docs are not specific.
				if($tag.is('img'))	{
					mediaParams = {'width':$tag.attr('width'),'height':$tag.attr('height'),'data-bgcolor':$tag.data('bgcolor'),'data-minimal':$tag.data('minimal'),'data-filename':argObj.media};
					filePath = this.makeImageURL(mediaParams);
					}
				else	{
					r = false;
					//the command to pull s from the tag is invalid because the tag isn't an image.
					}
				}
			else	{
				mediaParams = {'width':argObj.width,'height':argObj.height,'data-bgcolor':argObj.bgcolor,'data-minimal':(argObj.minimal ? argObj.minimal : 0),'data-filename':argObj.media};
				filePath = this.makeImageURL(mediaParams);
				}
			}
		else if(argObj.src && argObj.src.value)	{
			//do nothing here, but is valid (don't get into 'else' error handling).
			}
		else	{
			r = false;
			//either media or src left blank. OR media is tru and the var specified doesn't exist.
			dump("Something was missing for apply_img.\nif media.type == 'variable' then globals.binds[argObj.media.value] must be set.\nor src not specified on appy img OR media is set but globals.binds is not.");
			dump("globals: "); dump(globals);
			dump(" -> argObj: "); dump(argObj);
			}

		if(filePath && formatter == 'img')	{
			var $tmp = $("<div \/>").append($("<img \/>").attr(mediaParams).attr('src',filePath));
			r = $tmp.html();
			}
		else if(filePath)	{
			r = filePath;
			}
		else	{} //some error occured. should have already been written to console by now.

		return r;
		}
	
	this.apply_verb_select = function($tag,argObj,globals)	{
		var dataValue = globals.binds[globals.focusBind]; //shortcut.
		if($tag.is(':checkbox'))	{
			if(dataValue == "" || Number(dataValue) === 0)	{
				$tag.prop({'checked':false,'defaultChecked':false}); //have to handle unchecking in case checked=checked when template created.
				}
			else	{
//the value here could be checked, on, 1 or some other string. if the value is set (and we won't get this far if it isn't), check the box.
				$tag.prop({'checked':true,'defaultChecked':true});
				}
			}
		else if($tag.is(':radio'))	{
//with radio's the value passed will only match one of the radios in that group, so compare the two and if a match, check it.
			if($tag.val() == dataValue)	{$tag.prop({'checked':true,'defaultChecked':true})}
			}
		else if($tag.is('select') && $tag.attr('multiple') == 'multiple')	{
			if(typeof dataValue === 'object')	{
				var L = dataValue.length;
				for(var i = 0; i < L; i += 1)	{
					$('option[value="' + dataValue[i] + '"]',$tag).prop({'selected':'selected','defaultSelected':true});
					}
				}
			}
		else	{
			$tag.val(dataValue);
			$tag.prop('defaultValue',dataValue); //allows for tracking the difference onblur.
			}
		}

	this.handle_apply_verb = function(verb,$tag,argObj,globals){
		switch(verb)	{
//new Array('empty','hide','show','add','remove','prepend','append','replace','input-value','select','state','attrib'),
			case 'empty': $tag.empty(); break;
			case 'hide': $tag.hide(); break;
			case 'show': $tag.show(); break;

			//add and remove work w/ either 'tag' or 'class'.
			case 'add' : 
				if(argObj.class)	{$tag.addClass(argObj.class)}
				else if(argObj.tag)	{
					// ### TODO -> not done yet. what to do? add a tag? what tag? where does it come from?
					}
				break; 
			case 'remove':
				if(argObj.class)	{$tag.removeClass(argObj.class)}
				else if(argObj.tag)	{
					$tag.remove();
					}
				else	{
					dump("For apply, the verb was set to remove, but neither a tag or class were defined. argObj follows:",'warn'); dump(argObj);
					}
				break; 
			
			case 'prepend': $tag.prepend(globals.binds[globals.focusBind]); break;
			case 'append': $tag.append(globals.binds[globals.focusBind]); break;
			case 'replace': $tag.replaceWith(globals.binds[globals.focusBind]); break;
			case 'input-value':
				$tag.val(globals.binds[globals.focusBind]);
				break;
			case 'select' :
				this.apply_verb_select($tag,argObj,globals); //will modify $tag.
				break;
			case 'state' :
				// ### TODO -> not done yet.
				break;  
			case 'attrib':
				$tag.attr(argObj.attrib,globals.binds[globals.focusBind]);
				break;
			}
		}

	this.handle_apply_formatter = function(formatter,$tag,argObj,globals)	{
		switch(formatter)	{
			case 'text':
				if(globals.binds[argObj.text])	{
					var $tmp = $("<div>").append(globals.binds[argObj.text]);
					globals.binds[argObj.text] = $tmp.text();
					globals.focusBind = argObj.text;
					}
				else	{
					dump("For command "+cmd+" formatter set to text but scalar passed is not defined in globals.binds",'warn');
					}
				break;
			case 'html':
				globals.focusBind = argObj.html;
				break;
			case 'img':
				globals.binds[globals.focusBind] = this.apply_formatter_img(formatter,$tag,argObj,globals);
				break;
			case 'imageurl':
				globals.binds[globals.focusBind] = this.apply_formatter_img(formatter,$tag,argObj,globals); //function returns an image url
				break;
			}
		}

	this.comparison = function(op,p1,p2)	{
		var r = false;
//		console.log(" -> op: "+op,"p1 = "+p1,"p2 = "+p2);
		switch(op)	{
			case "eq":

				if(p1 == p2){ r = true;} break;
			case "ne":
				if(p1 != p2){ r = true;} break;
			case "gt":
				if(Number(p1) > Number(p2)){r = true;} break;
			case "lt":
				if(Number(p1) < Number(p2)){r = true;} break;
			case "true":
				if(p1){r = true;}; break;
			case "false":
				if(!p1){r = true;}; break;
			case "blank":
				if(p1 == ''){r = true;}; break;
			case "notblank":
				if(p1 == false || p1 == 'undefined' || p1 == null){r = false;}
				else	{r = true;}
				break;
			case "null":
				if(p1 == null){r = true;}; break;
			case "notnull":
				if(p1 != null){r = true;}; break;
			case "regex":
				var regex = new RegExp(p2);
				if(regex.exec(p1))	{r = true;}
				break;
			case "notregex":
				var regex = new RegExp(p2);
				if(!regex.exec(p1))	{r = true;}
				break;
// and/or allow commands to be chained.
//--and (FUTURE) -> this is for chaining, so if and is present, 1 false = IsFalse.
//--or (FUTURE) -> this is for chaining, so if and is present, 1 true = IsTrue.
/*			case "and":
				if(p1 != null){r = true;}; break; // ### FUTURE -> not done
			case "or":
				if(p1 != null){r = true;}; break; // ### FUTURE -> not done.
*/			}
//		dump(" -> comparison: "+op+" and r: "+r);
		return r;
		}



/* //////////////////////////////     FORMATS	 \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ */

//passing the command into this will verify that the format exists (whether it be core or not)

	this.format_currency = function(arg,globals)	{
		var r = "$"+globals.binds[globals.focusBind]+" ("+arg.value.value+")";
		globals.binds[globals.focusBind] = r
		return r;
		} //currency
	this.format_prepend = function(arg,globals)	{
		var r = arg.value.value+globals.binds[globals.focusBind];
		globals.binds[globals.focusBind] = r
		return r;
		} //prepend
	this.format_append = function(arg,globals)	{
		var r = globals.binds[globals.focusBind]+arg.value.value;
		globals.binds[globals.focusBind] = r
		return r;
		} //append
	this.format_truncate = function(arg,globals)	{
		var
			r = globals.binds[globals.focusBind].toString(), //what is returned. Either original value passed in or a truncated version of it.
			len = arg.value.value;
		if(!len || isNaN(len)){}
		else if(r.length <= len){}
		else	{
			if (r.length > len) {
				r = r.substring(0, len); //Truncate the content of the string
				r = $.trim(r.replace(/\w+$/, '')); //go back to the end of the previous word to ensure that we don't truncate in the middle of a word. trim trailing whitespace.
				r += '&#8230;'; //Add an ellipses to the end
				globals.binds[globals.focusBind] = r;
				}
			}
		return r;
		} //truncate
	this.format_uriencode = function(arg,globals)	{
		var r = encodeURI(globals.binds[globals.focusBind]);
		globals.binds[globals.focusBind] = r
		return r;
		} //truncate

//TLC/Render formats could be stores in 1 of a variety of places.  Either in extension.renderFormats, extension.tlcFormats, controller.tlcFormats, controller.renderFormats or within tlc itself (core).
//The function uses the tlc statement to determine where to get the formatting function from and then to execute that format.
// extension#format indicate the extension and function name.
// --legacy indicates it's a renderFormat. if legacy isn't set, it's a tlc format.
	this.format_from_module = function(cmd,globals,dataset)	{
//		dump(" -> non 'core' based format. not handled yet"); // dump(' -> cmd'); dump(cmd); dump(' -> globals'); dump(globals);
//		dump(" -> cmd.args: "); dump(cmd.args);
		var moduleFormats, argObj = this.args2obj(cmd.args,globals);
		var r = true; //what is returned. if false is returned, the rest of the statement is NOT executed.
// ### FUTURE -> once renderFormats are no longer supported, won't need argObj or the 'if' for legacy (tho it could be left to throw a warning)
		if(argObj.legacy)	{
			if($._app.ext[cmd.module] && $._app.ext[cmd.module].renderFormats && typeof $._app.ext[cmd.module].renderFormats[cmd.name] == 'function')	{
				$._app.ext[cmd.module].renderFormats[cmd.name](globals.tags[globals.focusTag],{'value': (globals.focusBind ? globals.binds[globals.focusBind] : dataset),'bindData':argObj})
				r = false; //when a renderFormat is executed, the rest of the statement is not run. renderFormats aren't designed to work with this and their predicability is unknown. so is their life expectancy.
				}
			else	{
				dump("A renderFormat was defined, but does not exist.  name: "+cmd.name+" in extension "+cmd.module,'warn')
				}
			}
		else	{
			if(cmd.module == 'controller')	{
				moduleFormats = $._app.tlcFormats
				}
			else if($._app.ext[cmd.module] && $._app.ext[cmd.module].tlcFormats)	{
				moduleFormats = $._app.ext[cmd.module].tlcFormats;
				}
			else	{}
	
			if(moduleFormats && typeof moduleFormats[cmd.name] === 'function')	{
				r = moduleFormats[cmd.name]({'command':cmd,'globals':globals,'value': (globals.focusBind ? globals.binds[globals.focusBind] : dataset)},this); // ### TODO -> discuss. this passes in entire data object if no bind is present.
				
				//tlcFormats do NOT kill the rest of the statement like legacy/renderformats do.
				}
			else if(moduleFormats)	{
				dump("A tlcFormat was defined, but does not exist.  name: "+cmd.name+" in extension "+cmd.module)
				}
			else	{
				dump("Could not ascertain module formats for the following command: ","error"); dump(cmd);
				}
			}
		return r;
		}



/* //////////////////////////////     TYPE HANDLERS		 \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ */

/*
There are a few 'types' that can be specified:
BIND (setting a var)
IF (conditional logic) 
Block (set for the statements inside an IF IsTrue or IsFalse). contains an array of statements.
command (everything else that's supported).
returning a 'false' here will exit the statement loop.
*/

	this.handleType_command = function(cmd,globals,dataset)	{
		var r = true;
//		dump(" -> cmd.name: "+cmd.name); //dump(cmd);
		try{
			if(cmd.module == 'core' && typeof this['handleCommand_'+cmd.name] == 'function')	{
				this['handleCommand_'+cmd.name](cmd,globals);
				}
			else	{
				r = this.format_from_module(cmd,globals,dataset);
				}
			}
		catch(e){
			dump("An error occured when attempting to execute the command. command follows: ");
			dump(cmd);
			dump(e);
			r = false; //will stop processing of statement.
			}
		return r;
		}

	this.handleType_BIND = function(cmd,globals,dataset)	{
//		dump("Now we bind"); dump(dataset);
//		dump(" jsonpath: "+jsonPath(dataset, '$'+cmd.Src.value));
		//scalar type means get the value out of the data object.
		//jsonpath nests returned values in an array.
		globals.binds[cmd.Set.value] = (cmd.Src.type == 'scalar') ? jsonPath(dataset, '$'+cmd.Src.value)[0] : cmd.Src.value;

//		dump(" -> cmd.Src.value = "+cmd.Src.value+" = "); dump(globals.binds[cmd.Set.value]);
		globals.focusBind = cmd.Set.value; // dump(" -> globals.focusBind: "+globals.focusBind);
		return cmd.Set.value;
		}
	
	this.handleType_IF = function(cmd,globals,dataset)	{
//		dump("BEGIN handleIF"); //dump(cmd);
		var p1; //first param for comparison.
		var args = cmd.When.args;
		var action = 'IsTrue'; //will be set to false on first false (which exits loop);
		//NOTE -> change '2' to args.length to support multiple args. ex: if (is $var --lt='100' --gt='5') {{ apply --append; }};

//SANITY -> in args, args[0] is the variable declaration (type/value).  args[1]+ is the comparison (key, type, value where key = comparison operand).
		
		if(args.length)	{
			if(args[0].type == 'variable')	{
//				dump(" -> args[0].value: "+args[0].value);
				p1 = globals.binds[args[0].value];
				}
			else	{
				dump("In tlc.handleType_IF, an unhandled type was set on the if",'warn');
				}
//			dump(" -> p1: "+p1);
			for(var i = 1, L = 2; i < L; i += 1)	{
				var p2;
				if(args[i].type == 'longopt')	{
					p2 = (args[i].value == null) ? args[i].value : args[i].value.value;
					}
				else {p2 = args[i].value || null}
				if(this.comparison(args[i].key,p1,p2))	{}
				else {
					action = 'IsFalse';
					break;
					}
				}
//			dump(" -> action: "+action);
			if(cmd[action])	{
				this.executeCommands(cmd[action].statements,globals,dataset);
				}
			else	{} //would get here if NOT true, but no isFalse was set. I guess technically you could also get here if isTrue and no isTrue set.
			}
		return (action == 'isTrue' ? true : false);
		}

	


/* //////////////////////////////     COMMAND HANDLERS		 \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ */

	this.handleCommand_format = function(cmd,globals)	{
		var format = cmd.args[0].key, r;
//		dump(' -> cmd: '); dump(cmd);
		if(cmd.module == 'core' && this['format_'+format])	{
			for(var i = 0, L = cmd.args.length; i < L; i += 1)	{
				try	{
					this['format_'+cmd.args[i].key](cmd.args[i],globals);
					}
				catch(e)	{}
				}
			}
		else	{
			dump(" -> invalid core format ["+format+"] specified.",'warn');
			//invalid format specified.
			}
		return r;
		}

//passing the command into this will verify that the apply exists (whether it be core or not)
//may be able to merge this with the handleCommand_format. We'll see after the two are done and if the params passed into the functions are the same or no.
// NOTE -> stopped on 'apply' for now. B is going to change the way the grammer hands back the response. Once he does that, I'll need to flatten the array into a hash to easily test if 'empty' or some other verb is set.
	this.handleCommand_apply = function(cmd,globals)	{
//		dump(" -> BEGIN handleCommand_apply"); dump(cmd);
		var r = true;
		if(cmd.module == 'core')	{
			var
				verbs = new Array('empty','hide','show','add','remove','prepend','append','replace','input-value','select','state','attrib'),
				formatters = new Array('img','imageurl','text','html'),
				argObj = this.args2obj(cmd.args,globals), //an object is used to easily check if specific apply commands are present
				$tag = globals.tags[(argObj.tag || globals.focusTag)],
				numVerbs = 0, numFormatters = 0, theVerb = null, theFormatter = null;

			//count the number of verbs.  Only 1 is allowed.
			for(var index in argObj)	{
				if($.inArray(index,verbs) >= 0)	{
					theVerb = index;
					numVerbs++;
					}
				else if($.inArray(index,formatters) >= 0)	{
					theFormatter = index;
					numFormatters++;
					}
				else	{
					//okay to get here. likely just some argument for the verb or formatter
					}
				}
			
//			dump("numVerbs: "+numVerbs+" theVerb: "+theVerb+" theFormat: "+theFormatter+" numFormats: "+numFormatters);
			//formatter is optional, but only 1 can be specified.
			if(numVerbs === 1 && numFormatters <= 1)	{

				if(theFormatter)	{
//					dump(" -> a formatter ["+theFormatter+"] is set. process that first.");
					this.handle_apply_formatter(theFormatter,$tag,argObj,globals);
					}
				
				this.handle_apply_verb(theVerb,$tag,argObj,globals);

				}
			else if(numVerbs === 0)	{
				dump("For the following command no verb was specified on the apply. Exactly 1 verb must be specified.",'warn'); dump(cmd); dump(argObj);
				}
			else	{
				dump("For command (below) either more than 1 verb or more than 1 formatter was specified on the apply. Exactly 1 of each is allowed per command.",'warn');
				dump(cmd);
				}

			}
		else if(cmd.module && cmd.module.indexOf('#') >= 0)	{
			dump(" -> non 'core' based apply. not handled yet");
			//use format in extension.
			}
		else	{
			dump(" -> invalid core apply specified");
			r = false;
			//invalid format specified.
			}
		return r;
		}

	
	this.handleCommand_render = function(cmd,globals){
//		dump(">>>>> BEGIN tlc.handleCommand_render. value: "); dump(globals.binds[globals.focusBind]);
		var argObj = this.args2obj(cmd.args,globals); //an object is used to easily check if specific apply commands are present
//		dump(" -> cmd: "); dump(cmd);
		if(globals.tags[globals.focusTag])	{
			if(argObj.wiki)	{
				var $tmp = $("<div>").append(globals.binds[globals.focusBind]);
var $tmp = $('<div \/>'); // #### TODO -> cross browser test this wiki solution. it's a little different than before.
myCreole.parse($tmp[0], globals.binds[globals.focusBind],{},argObj.wiki); //the creole parser doesn't like dealing w/ a jquery object.

				//r = wikify($tmp.text()); //###TODO -> 
				globals.binds[globals.focusBind] = $tmp.html();
				$tmp.empty().remove();
				}
			else if(argObj.html)	{
				//if the content is already html, shouldn't have to do anything to it.
				}
			else if(argObj.dwiw)	{
				// ###TODO -> need to determine if content is wiki or html.
				}
			else	{
				//unrecognized command.
				}
			}
		return globals.tags[globals.focusTag];
		}
		
	this.handleCommand_stringify = function(cmd,globals)	{
		globals.binds[globals.focusBind] = JSON.stringify(globals.binds[globals.focusBind])
		return globals.binds[globals.focusBind];
		}

	this.handleCommand_transmogrify = function(cmd,globals)	{
//		dump(" ->>>>>>> templateid: "+cmd.args[0].value); //dump(this.args2obj(cmd.args));
		var tmp = new tlc();
		globals.tags[globals.focusTag].append(tmp.runTLC({templateid:cmd.args[0].value,data:this.data}));
		//this will backically instantate a new tlc (or whatever it's called)
		}

	this.handleCommand_is = function(cmd,globals)	{
		var value = globals.binds[globals.focusBind], r = false;
		for(var i = 0, L = cmd.args.length; i < L; i += 1)	{
			value = this.comparison(cmd.args[i].key,value,cmd.args[i].value.value);
			}
		globals.binds[globals.focusBind] = value;
		return value;
		}

	this.handleCommand_math = function(cmd,globals)	{
		var value = Number(globals.binds[globals.focusBind]);
		if(!isNaN(value))	{
			for(var i = 0, L = cmd.args.length; i < L; i += 1)	{
				switch(cmd.args[i].key)	{
					case "add":
						value += cmd.args[i].value.value; break;
					case "sub":
						value -= cmd.args[i].value.value; break;
					case "mult":
						value *= cmd.args[i].value.value; break;
					case "div":
						value /= cmd.args[i].value.value; break;
					case "precision":
						value = value.toFixed(cmd.args[i].value.value); break;
					case "percent":
						value = (value/100).toFixed(0); break;
					}
				}
			globals.binds[globals.focusBind] = value;
			}
		else	{
			dump(" -> handleCommand_math was run on a value ["+globals.binds[globals.focusBind]+" which is not a number.");
			}
		return value;
		}

	this.handleCommand_datetime = function(cmd,globals)	{

		var value = globals.binds[globals.focusBind];
		var argObj = this.args2obj(cmd.args,globals), d = new Date(value*1000);


		if(isNaN(d.getMonth()+1))	{
			dump("In handleCommand_datetime, value ["+value+"] is not a valid time format for Date()",'warn');
			}
//### FUTURE
//		else if(argObj.out-strftime)	{}
		else if (argObj.out == 'pretty')	{
			var shortMon = new Array('Jan','Feb','Mar','Apr','May','June','July','Aug','Sep','Oct','Nov','Dec');
			value = (shortMon[d.getMonth()])+" "+d.getDate()+" "+d.getFullYear()+ " "+d.getHours()+":"+((d.getMinutes()<10?'0':'') + d.getMinutes());
			}
		else if(argObj.out == 'mdy')	{
			value = (d.getMonth()+1)+"/"+d.getDate()+"/"+d.getFullYear();
			}
		else	{
			//invalid or no 'out' specified.
			}
		globals.binds[globals.focusBind] = value;
		return value;
		}


//can be triggered by runTLC OR by handleType_Block.
	this.executeCommands = function(commands,globals,dataset)	{
//		dump(" -> running tlcInstance.executeCommands"); //dump(commands);
		//make sure all the globals are defined. whatever is passed in will overwrite the defaults. that happens w/ transmogrify
		var theseGlobals = $.extend(true,{
			binds : {}, //an object of all the binds set in args.
			tags : {
				'$tag' : ''
				}, //an object of tags.
			focusBind : '', //the pointer to binds of the var currently in focus.
			focusTag : '$tag' //the pointer to the tag that is currently in focus.
			},globals);

		for(var i = 0, L = commands.length; i < L; i += 1)	{
//			dump(i+") commands[i]: handleCommand_"+commands[i].type); //dump(commands[i]);
			if(commands[i].type == 'command')	{
				if(this.handleType_command(commands[i],theseGlobals,dataset))	{} //continue
				else	{
//					dump(" -> early exit of statement loop caused on cmd: "+commands[i].name+" (normal if this was legacy/renderFormat)");
					//handleCommand returned a false. That means either an error occured OR this executed a renderFormat. stop processing.
					break;
					}
				}
			else if(commands[i].type == 'IF')	{
				this['handleType_IF'](commands[i],theseGlobals,dataset);
				}
			else if(commands[i].type == 'BIND')	{
				this['handleType_BIND'](commands[i],theseGlobals,dataset);
				}
			else	{
				//unrecognized type.
				}

			}
		}
	
//This is intendted to be run on a template BEFORE the data is in memory. Allows for gathering what data will be necessary.
	this.getBinds = function(templateid)	{
		
		var _self = this; //'this' context is lost within each loop.
		var $t = _self.getTemplateInstance(templateid), bindArr = new Array();

		$("[data-tlc]",$t).addBack("[data-tlc]").each(function(index,value){ //addBack ensures the container element of the template parsed if it has a tlc.
			var $tag = $(this), tlc = $tag.data('tlc');

			var commands = false;
			try{
				commands = window.pegParser.parse(tlc);
				}
			catch(e)	{
				dump(_self.buildErrorMessage(e)); dump(tlc);
				}
			if(commands && !$.isEmptyObject(commands))	{
				var L = commands.length;
				for(var i = 0; i < L; i += 1)	{
					if(commands[i].type == 'BIND' && commands[i].Src.type == 'scalar' && $.inArray(commands[i].Src.value,bindArr) < 0 )	{
						bindArr.push(commands[i].Src.value.substr(1)); //for what this is used for, the preceeding period is not desired.
						}
					}
				}
			else	{
				dump("couldn't parse a tlc",'warn');
				//could not parse tlc. error already reported.
				}
			});
		return bindArr;
		} //end getBinds

	} //end