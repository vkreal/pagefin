dojo.provide("core.fb.AjaxServices");
dojo.require("dijit.Menu");
dojo.require("dojo.io.iframe");
dojo.require("core.AjaxServices");
// widget definition
dojo.declare(
	"core.fb.AjaxServices", // name
	core.AjaxServices, // derive from
	{
		getAlums:function(uid, callback)
		{
			var url = ['/fb/getalbums/?'];
			this._setQSValue(url, 'uid', uid, false );
	    	dojo.xhrGet({
		        url: APP_ROOT + url.join('') + '&' + window.location.search.replace('?', ''),
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
		getPhotos:function(aid, callback)
		{
			var url = ['/fb/getphotos/?'];
			this._setQSValue(url, 'aid', aid, true );
			this._setQSValue(url, 'uid', FACEBOOK_USER_ID, false );
	    	dojo.xhrGet({
		        url: APP_ROOT + url.join('') + '&' + window.location.search.replace('?', ''),
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
		toggleWelcomeMessage:function(v)
		{
			var url = ['/fb/togglewelcomemessage/?'];
			this._setQSValue(url, 'fuk', FACEBOOK_USER_KEY, true );
			this._setQSValue(url, 'v', v, true );
			this._setQSValue(url, 'uid', FACEBOOK_USER_ID, false );
	    	dojo.xhrGet({
		        url: APP_ROOT + url.join('') + '&' + window.location.search.replace('?', ''),
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
		getPage:function(pk, spk, callback)
		{
			var url = ['/fb/getpage/?'];
			this._setQSValue(url, SAVE_PUBLIC_KEY, spk, true );
			this._setQSValue(url, 'fuk', FACEBOOK_USER_KEY, true );
			this._setQSValue(url, 'uid', FACEBOOK_USER_ID, true );
			this._setQSValue(url, PAGE_KEY, pk, false );
	    	dojo.xhrGet({
		        url: APP_ROOT + url.join('') + '&' + window.location.search.replace('?', ''),
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
		getMyPages : function(page, callback)
		{
			var url = ['/fb/get/?'];
			this._setQSValue(url, 'fuk', FACEBOOK_USER_KEY, true );
		 	this._setQSValue(url, 'uid', FACEBOOK_USER_ID, true );
			this._setQSValue(url, 'p', page, false);
	    	dojo.xhrGet({
		        url: APP_ROOT + url.join('') + '&' + window.location.search.replace('?', ''),
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
		createPage : function(name, tags, recaptcha_challenge_field, recaptcha_response_field, callback)
		{
			var url = ['/fb/create/?'];
			this._setQSValue(url, 'fuk', FACEBOOK_USER_KEY, true );
		 	this._setQSValue(url, 'name', name, true );
		 	this._setQSValue(url, 'uid', FACEBOOK_USER_ID, true );
		 	this._setQSValue(url, 'tags', tags, false );
		 	dojo.xhrGet({
		        url: APP_ROOT + url.join('') + '&' + window.location.search.replace('?', ''),
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
		}
	}
);