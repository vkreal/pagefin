dojo.provide("core.dialog.PhotoSelector");
dojo.require("core.dialog._Dialog");
dojo.declare("core.dialog.PhotoSelector", 
    [core.dialog._Dialog], 
{
	//__txtwebaddress
	showStandBy : function()
	{
		dijit.byId('__standby_inlineImageDialog').show();
	},
	hideStandBy : function()
	{
		dijit.byId('__standby_inlineImageDialog').hide();
	},
	postCreate : function()
	{
		this.inherited(arguments);
		this.connect(dojo.byId('__testLink'), 'onclick', '_testLink');
	},
	show : function(page, openerId, value)
    {
		this.openerId = openerId;
		this.txtwebaddress = dojo.byId('__txtwebaddress');
		
    	this.inherited(arguments);
    	if( value )
    		this.txtwebaddress.value = value;
    },
    _testLink:function()
    {
    	if( dojo.string.trim(this.txtwebaddress.value) != "" )
            window.open('/a/previewimage/?url=' + encodeURIComponent(this.txtwebaddress.value));
    },
    upload : function()
    {
    	this.showStandBy();
    	var page = dijit.byId('pageContentPane').getPage();
    	if( page && dojo.byId('the_file').value)
    	{
    		var ajax = core.PageContentPane.getAjaxServices();
    		ajax.uploadMedia(page, 
    				page[PAGE_KEY], 
    				page[SAVE_PUBLIC_KEY],
    				dojo.hitch(this, '_uploadDone'));
    	}
    },
    _uploadDone : function(response, ioArgs)
    {
    	dojo.byId('the_file').value = '';
    	this.hideStandBy();
    	if( response['url'] )
    	{
    		this.txtwebaddress.value = response['url'];
    		this._done(response['url']);
    	}
    	else
    	{
    		if( response['error'] )
    		{
    			alert(response['error']);
    		}
    		else
    		{
    			alert('Sorry, we had a problem processing the image provided.');
    		}
    	}
    },
    _done : function(url)
    {
    	dojo.publish(this.openerId + '/action/dialog/image/ok', [url]);
    	this.onCancel();
    },
    okClick : function()
    {
    	var tabContainer = dijit.byId('__image-dialog-tabs');
    	if( tabContainer.selectedChildWidget && tabContainer.selectedChildWidget.id == '__image-upload-tab' )
    	{
    		this.upload();
    	}
    	else
    	{
    		var url = dojo.string.trim(this.txtwebaddress.value);
        	if( !url )
        	{
        		alert('Image url can\'t be empty.');
        		return;
        	}
        	if( !this.validateURL(url) ){
        		return;
        	}
        	this._done(url);
    	}
    },
    validateURL:function(txtURL)
    {
	    var lengthValue = dojo.string.trim(txtURL);
	    var length = lengthValue.length;
	    if(length != 0)
	    {
	    	var j = new RegExp();
	    	j.compile("^[A-Za-z]+://[A-Za-z0-9-]+\.[A-Za-z0-9]+");
		    if (!j.test(lengthValue))
		    {
		    	alert("Please enter valid image URL.");
		    	return false;
		    }
    	}
	    return true;
    }
});