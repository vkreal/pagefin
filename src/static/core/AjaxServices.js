dojo.provide("core.AjaxServices");
dojo.require("dijit.Menu");
dojo.require("dojo.io.iframe");
// widget definition
dojo.declare(
	"core.AjaxServices", // name
	null, // derive from
	{
		_rpcRoot : '/a/',
		log : function(page_key, save_key, message)
		{
			var url = [this._rpcRoot, 'logger/?'];
			this._setQSValue(url, SAVE_PUBLIC_KEY, save_key, true );
			this._setQSValue(url, 'message', message, true );
			this._setQSValue(url, PAGE_KEY, page_key, false );
	    	dojo.xhrGet({
		        url: APP_ROOT + url.join(''),
		        handleAs: "text",
		        sync : false,
		        load: function(response, ioArgs) 
		        {
		        },
			    error: function(response, ioArgs) 
		        {
		        }
		    });
		},
		getMyPages : function(page, callback)
		{
			var url = [this._rpcRoot, 'get/?'];
			this._setQSValue(url, 'p', page, false);
	    	dojo.xhrGet({
		        url: APP_ROOT + url.join(''),
		        handleAs: "text",
		        sync : false,
		        load: function(response, ioArgs) 
		        {
	    			callback(response, ioArgs);
		        },
			    error: function(response, ioArgs) 
		        {
		        	callback(response, ioArgs);
		        }
		    });
		},
		renamePage : function(page_key, save_key, name, callback)
		{
			var url = [this._rpcRoot, 'rename/?'];
			this._setQSValue(url, SAVE_PUBLIC_KEY, save_key, true );
			this._setQSValue(url, 'name', name, true );
			this._setQSValue(url, PAGE_KEY, page_key, false );
	    	dojo.xhrGet({
		        url: APP_ROOT + url.join(''),
		        handleAs: "json",
		        sync : false,
		        load: function(response, ioArgs) 
		        {
	    			callback(response, ioArgs);
		        },
			    error: function(response, ioArgs) 
		        {
		        	callback(response, ioArgs);
		        }
		    });
		},
		deletePage : function(page_key, save_key, callback)
		{
			var url = [this._rpcRoot, 'delete/?'];
			this._setQSValue(url, SAVE_PUBLIC_KEY, save_key, true );
			this._setQSValue(url, PAGE_KEY, page_key, false );
	    	dojo.xhrGet({
		        url: APP_ROOT + url.join(''),
		        handleAs: "json",
		        sync : false,
		        load: function(response, ioArgs) 
		        {
	    			callback(response, ioArgs);
		        },
			    error: function(response, ioArgs) 
		        {
		        	callback(response, ioArgs);
		        }
		    });
		},
		uploadMedia : function(page, page_key, save_key, callback)
		{
			if( page )
			{
				var url = [this._rpcRoot, 'upload/?'];
				this._setQSValue(url, SAVE_PUBLIC_KEY, save_key, true );
				this._setQSValue(url, PAGE_KEY, page_key, false );
				dojo.io.iframe.send({
					url: APP_ROOT + url.join(''),
					form: dojo.byId('__uploadForm'),
					handleAs: "json",
					method: "POST",
					preventCache: true,
					handle: function(response, ioArgs){
						callback(response, ioArgs);
					}
				});
			}
		},
		savePage : function(page, page_key, save_key, callback)
		{
			if( page )
			{
				var url = [this._rpcRoot, 'save/?'];
				this._setQSValue(url, SAVE_PUBLIC_KEY, save_key, true );
				this._setQSValue(url, PAGE_KEY, page_key, false );
				var sJson = dojo.toJson(page);
				var hidden = dojo.byId('__saveHidden');
				hidden.value = sJson;
				dojo.io.iframe.send({
					url: APP_ROOT + url.join(''),
					form: dojo.byId('__saveForm'),
					handleAs: "html",
					method: "POST",
					timeoutSeconds: 5,
					preventCache: true,
					handle: function(response, ioArgs){
						if(!(response instanceof Error)){
							dojo.publish("systemToasterTopic", 
								[ "Saved..."]
							);
						}else{
							alert('Oops... something went wrong, please try again in a few moments.');
						}
						if( callback )
						{
							callback(page, !(response instanceof Error));
						}
					}
				});
			}
		},
		createPage : function(name, tags, recaptcha_challenge_field, recaptcha_response_field, callback)
		{
			var url = [this._rpcRoot, 'create/?'];
		 	this._setQSValue(url, 'name', name, true );
		 	this._setQSValue(url, 'tags', tags, true );
		 	this._setQSValue(url, 'recaptcha_challenge_field', recaptcha_challenge_field, true );
		 	this._setQSValue(url, 'recaptcha_response_field', recaptcha_response_field, false );
		 	dojo.xhrGet({
		        url: APP_ROOT + url.join(''),
		        handleAs: "json",
		        sync : false,
		        load: function(response, ioArgs) 
		        {
	    			callback(response, ioArgs);
		        },
			    error: function(response, ioArgs) 
		        {
		        	callback(response, ioArgs);
		        }
		    });
		},
		_handleCreatePage : function(callback, data, ioArgs)
		{
			callback(data, ioArgs);
		},
		_setQSValue : function( sb, k, v, amp)
		{
		    sb.push( k );
		    sb.push( '=' );
		    sb.push( encodeURIComponent(v) );
		    if( amp )
		        sb.push( '&' );
		}
	}
);