/* **************************************************************

   Copyright 2013 Zoovy, Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

************************************************************** */





var store_zephyrapp = function(_app) {
	var theseTemplates = new Array('');
	var r = {


////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\



	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = false; //return false if extension won't load for some reason (account config, dependencies, etc).
				
			
				_app.rq.push(['templateFunction','productTemplate','onDeparts',function(P) {
					var $container = $('#recentlyViewedItemsContainer');
					$container.show();
					$("ul",$container).empty(); //empty product list
					$container.anycontent({data:_app.ext.myRIA.vars.session}); //build product list
					}]);
					
				_app.rq.push(['templateFunction','categoryTemplate','onCompletes', function(P){
					var breadcrumb = P.navcat.split(".");
					var topNavcat = "."+breadcrumb[1];
					$('#sideBarLeft [data-navcat="'+topNavcat+'"] .subCatList').show();
					}]);
					
				_app.rq.push(['templateFunction','categoryTemplate','onDeparts', function(P){
					var breadcrumb = P.navcat.split(".");
					var topNavcat = "."+breadcrumb[1];
					$('#sideBarLeft [data-navcat="'+topNavcat+'"] .subCatList').hide();
					}]);	
		
					
				_app.rq.push(['templateFunction', 'productTemplate','onCompletes',function(P) {
					var $context = $(_app.u.jqSelector('#',P.parentID));
					
					$('#sideBarRight').hide();
					$('#contentArea').removeClass('sideBarRightShow');
					$('#contentArea').addClass('sideBarRightHide');
					
					$('.responsiveDropdown').hide();
					
					$('.randomList', $context).each(function(){
						_app.ext.store_zephyr_app.u.randomizeList($(this));
						});
				}]);
				
				
				_app.rq.push(['templateFunction', 'checkoutTemplate','onCompletes',function(P) {
					var $context = $(_app.u.jqSelector('#',P.parentID));
					
					$('#sideBarRight').hide();
					$('#contentArea').removeClass('sideBarRightShow');
					$('#contentArea').addClass('sideBarRightHide');
					
					$('.responsiveDropdown').hide();
				}]);
				
				_app.rq.push(['templateFunction', 'cartTemplate', 'onCompletes',function(P){
					var $context = $(_app.u.jqSelector('#',P.parentID));
					
					$('.responsiveDropdown').hide();
				}]);
				
				_app.rq.push(['templateFunction', 'homepageTemplate','onCompletes',function(P) {
					var $context = $(_app.u.jqSelector('#',P.parentID));
					
					$('#sideBarRight').show();
					$('#contentArea').removeClass('sideBarRightHide');
					$('#contentArea').addClass('sideBarRightShow');
					
					$('.responsiveDropdown').show();
					
					$('.randomList', $context).each(function(){
						_app.ext.store_zephyr_app.u.randomizeList($(this));
						});
				}]);	
				
				_app.rq.push(['templateFunction', 'categoryTemplate','onCompletes',function(P) {
					var $context = $(_app.u.jqSelector('#',P.parentID));
					
					$('#sideBarRight').show();
					$('#contentArea').removeClass('sideBarRightHide');
					$('#contentArea').addClass('sideBarRightShow');
					
					$('.responsiveDropdown').show();
				}]);
				
				_app.rq.push(['templateFunction', 'searchTemplate','onCompletes',function(P) {
					var $context = $(_app.u.jqSelector('#',P.parentID));
					
					$('#sideBarRight').show();
					$('#contentArea').removeClass('sideBarRightHide');
					$('#contentArea').addClass('sideBarRightShow');
					
					$('.responsiveDropdown').show();
				}]);
				
				_app.rq.push(['templateFunction', 'customerTemplate','onCompletes',function(P) {
					var $context = $(_app.u.jqSelector('#',P.parentID));
					
					$('#sideBarRight').show();
					$('#contentArea').removeClass('sideBarRightHide');
					$('#contentArea').addClass('sideBarRightShow');
					
					$('.responsiveDropdown').hide();
					
					if(P.show == "login" || P.show =="createaccount" || P.show == "recoverpassword"){
						$('.sideline', $context).hide();
						$('.mainColumn',$context).width("100%");
					} else{
						$('.sideline', $context).show();
					}
	
				}]);	
				
				_app.rq.push(['templateFunction', 'companyTemplate','onCompletes',function(P) {
					var $context = $(_app.u.jqSelector('#',P.parentID));
					
					$('#sideBarRight').show();
					$('#contentArea').removeClass('sideBarRightHide');
					$('#contentArea').addClass('sideBarRightShow');
				}]);
				
				$('.ddMenuBtn').on('click',function(event){
					_app.ext.store_zephyrapp.a.showDropDown($(this).parent());
					event.stopPropagation();
					});	
					
				_app.rq.push(['templateFunction', 'productTemplate','onCompletes',function(P) {
					var $context = $(_app.u.jqSelector('#',P.parentID));
					
					$('.childDropdown',$context).children().each(function(){
						var pid=$(this).val();
						if(pid){
							var $opt=$(this);
							
							var tagObj = {
								"callback":function(rd){
									if(_app.ext.store_product.u.productIsPurchaseable(pid)){
										// do nothing muy bueno
										}
									else{
										$opt.attr('disabled','disabled');
										}
									}
								}
							
							_app.ext.store_product.calls.appProductGet.init(pid,tagObj,"immutable");
							_app.model.dispatchThis("immutable");
							}
						});
					
					$('.childDropdown',$context).on('change',function(event){
						var pid = $(this).val();
						$('.inventoryContainer',$context).empty().anycontent({"datapointer":"appProductGet|"+pid})
						});
					}]);
				
				
				_app.rq.push(['templateFunction','customerTemplate','onCompletes',function(infoObj){
					if(infoObj.show == 'login' && infoObj.callback){
						$('#loginArticle form.loginForm').data('callback', infoObj.callback);
						}
					}]);
				_app.rq.push(['templateFunction','customerTemplate','onDeparts',function(infoObj){
					$('#loginArticle form.loginForm').removeData('callback', infoObj.callback);
					}]);
				r = true;
				
				return r;
				
				},
			
			onError : function()	{
//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
//you may or may not need it.
				_app.u.dump('BEGIN admin_orders.callbacks.init.onError');
				}
			},
			startExtension: {
				onSuccess : function()	{
					var temp = JSON.parse(_app.storageFunctions.readLocal('recentlyViewedItems'));
					var oldTime = JSON.parse(_app.storageFunctions.readLocal('timeStamp'));
					var d = new Date().getTime();
					if(d - oldTime > 90*24*60*60*1000) {
						var expired = true;
					}
					else {
						var expired = false;
					}
					if(temp && !expired){
						_app.ext.myRIA.vars.session.recentlyViewedItems = temp;
						_app.u.dump(_app.ext.myRIA.vars.session.recentlyViewedItems);
						var $container = $('#recentlyViewedItemsContainer');
						$container.show();
						$("ul",$container).empty(); //empty product list
						$container.anycontent({data:_app.ext.myRIA.vars.session}); //build product list
					}
				},
				onError : function()	{
				}
			}
		}, //callbacks



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//actions are functions triggered by a user interaction, such as a click/tap.
//these are going the way of the do do, in favor of app events. new extensions should have few (if any) actions.
		a : {
			showDropDown : function ($container) {
				//_app.u.dump('showing');
				//console.log($container.data('timeoutNoShow'));
				if(!$container.data('timeoutNoShow') || $container.data('timeoutNoShow')=== "false") {
					var $dropdown = $(".dropdown", $container);
					var height = 0;
					$dropdown.show();
					if($dropdown.data('width')){
						$dropdown.css("width",$dropdown.data('width'));
					}
					
					if($dropdown.data('height')){
						height = $dropdown.data('height');
					} else{
						$dropdown.children().each(function(){
							height += $(this).outerHeight();
						});
					}
					if($container.data('timeout') && $container.data('timeout')!== "false"){
						clearTimeout($container.data('timeout'));
						$container.data('timeout','false');
					}
					$dropdown.stop().animate({"height":height+"px"}, 500);
					$(".ddMenuBtn",$container).animate({"height":"44px"}, 100);
					
					$('html, .ddMenuBtn').on('click.dropdown',function(){
						//hide the dropdown
						_app.u.dump('hiding');
						$(".dropdown", $container).stop().animate({"height":"0px"}, 500);
						$(".ddMenuBtn",$container).animate({"height":"36px"}, 500);
						if($container.data('timeout') && $container.data('timeout')!== "false"){
							$container.data('timeout')
							$container.data('timeout','false');
						}
						$container.data('timeout',setTimeout(function(){$(".dropdown", $container).hide();},500));
						
						//clean up after ourselves
						$('html, .ddMenuBtn').off('click.dropdown')
					});
					return true;
					}
				return false;
				},
			showSearchBar: function ($container){
				if (!$('.searchSection').hasClass('searchShow')){
					$('.searchSection').addClass('searchShow').show();
					}
				else{
					$('.searchSection').removeClass('searchShow').hide();
					}
				}
			
			}, //Actions

////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//renderFormats are what is used to actually output data.
//on a data-bind, format: is equal to a renderformat. extension: tells the rendering engine where to look for the renderFormat.
//that way, two render formats named the same (but in different extensions) don't overwrite each other.
		renderFormats : {
			prodChildOption: function($tag, data){
				$tag.val(data.value.pid);
				if(data.value['%attribs']['amz:grp_varvalue']){
					$tag.text(data.value['%attribs']['amz:grp_varvalue']);
					}
				else{
					$tag.text(data.value['%attribs']['zoovy:prod_name']);
					}
				},
			inventoryAvailQty : function($tag,data){
				if(data.value['%attribs']['zoovy:grp_type'] == 'PARENT'){
					// do nothing
					}
				else {
					var inv = _app.ext.store_product.u.getProductInventory(data.value.pid);
					if(inv > 0){
						$tag.append('In Stock Now (Qty avail: '+inv+')');
						}
					else{
					//	Taking out for time being since we already have an out of stock msg
					//	$tag.append('This product is currently out of stock');
						}
					}
				},
				
			inventoryAvailQtyCart : function($tag,data){
				if(data.value['%attribs']['zoovy:grp_type'] == 'PARENT'){
					// do nothing
					}
				else {
					var inv = _app.ext.store_product.u.getProductInventory(data.value.product);
					if(inv > 0){
						$tag.append('In Stock Now (Qty avail: '+inv+')');
						}
					else{
					//	Taking out for time being since we already have an out of stock msg
					//	$tag.append('This product is currently out of stock');
						}
					}
				}
			
			}, //renderFormats
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

//utilities are typically functions that are exected by an event or action.
//any functions that are recycled should be here.
		u : {
			randomizeList : function($list){
				$list.children().shuffle();
				},
			cacheRecentlyViewedItems: function ($container){
				_app.u.dump ('Caching product to recently viewed');
				var d = new Date().getTime();
				_app.storageFunctions.writeLocal('recentlyViewedItems', _app.ext.myRIA.vars.session.recentlyViewedItems);
				_app.storageFunctions.writeLocal('timeStamp',d);// Add timestamp
				},
			addItemToCart : function($form,obj){
				var $childSelect = $('.prodChildren.active select', $form);
				if($childSelect.length > 0){
					if($childSelect.val()){
						_app.calls.cartItemAppend.init({"sku":$childSelect.val(), "qty":$('input[name=qty]',$form).val()},{},'immutable');
						_app.model.destroy('cartDetail');
						_app.calls.cartDetail.init({'callback':function(rd){
							if(obj.action === "modal"){
								showContent('cart',obj);
								}
							}},'immutable');
						_app.model.dispatchThis('immutable');
						}
					else {
						$form.anymessage(_app.u.errMsgObject("You must select an option"));
						}
					}
				else {
					_app.ext.myRIA.u.addItemToCart($form, obj);
					}
				},
			loginFormSubmit : function($form){
				var formJSON = $form.serializeJSON();
				_app.u.dump(formJSON);
				var errors = '';
				var callback = $form.data('callback') || function(){showContent('customer',{'show':'myaccount'});};
				if(_app.u.isValidEmail(formJSON.login) == false){
					errors += "Please provide a valid email address<br \/>";
					}
				if(!formJSON.password)	{
					errors += "Please provide your password<br \/>";
					}
					
				if(errors == ''){
					_app.calls.appBuyerLogin.init({"login":formJSON.login,"password":formJSON.password},{'callback':function(tagObj){
						_app.vars.cid = _app.data[tagObj.datapointer].cid;
						_app.ext.myRIA.u.handleLoginActions();
						callback();
					}});
					_app.calls.refreshCart.init({},'immutable'); //cart needs to be updated as part of authentication process.
//					_app.calls.buyerProductLists.init('forgetme',{'callback':'handleForgetmeList','extension':'store_prodlist'},'immutable');
					
					_app.model.dispatchThis('immutable');
					}
				else {
					$form.anymessage({'message':errors});
					}
				}
			}, //u [utilities]

//app-events are added to an element through data-app-event="extensionName|functionName"
//right now, these are not fully supported, but they will be going forward. 
//they're used heavily in the admin.html file.
//while no naming convention is stricly forced, 
//when adding an event, be sure to do off('click.appEventName') and then on('click.appEventName') to ensure the same event is not double-added if app events were to get run again over the same template.
		e : {
			
			
			revealation : function($ele,p)	{
				p.preventDefault();
				var $container = $ele.closest("[data-revealation-role='container']");
				if($container.length)	{
					var $content = $("[data-revealation-role='content']");
					if($content.is(":visible"))	{$content.slideUp();}
					else	{$content.slideDown();}
					$("[data-app-click='store_zephyrapp|revealation']",$container).toggle();
					}
				else	{
					$('#globalMessaging').anymessage({"message":"For zephyr.e.revealation, no data-revealation-role='container' found as parent of trigger element.","gMessage":true});
					}
				return false;
				}
			
			
			} //e [app Events]
		} //r object.
	return r;
	}