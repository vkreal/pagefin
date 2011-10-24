dojo.provide("core.controls.Image");
dojo.require("core.Container");
dojo.require("core.dialog.PhotoSelector");
dojo.declare("core.controls.Image", 
    [core.Container], 
{
    src : "",
    onClickEdit : function(evt)
	{
		dijit.byId("inlineImageDialog").show(null, this.id, this.src);
	},
	_setBackgroundImage : function(url)
	{
	   if( url )
	   {
	        this.setValue(url);
	        this.src = url;
	   }
	},
	fromJson:function()
	{
	    var base = this.inherited(arguments);
        var oJson = {
            type: 'Image',
            src : this.src
        }
        return this.mergeFromJson(oJson, base);
	},
	toJsonString:function()
	{
	    return dojo.toJson( this.fromJson() );
	},
	setValue:function(value, update)
	{
		this.contentCanvas.innerHTML = '<img style="height:100%; width:100%;" src="' + value + '"/>';
		this.inherited(arguments); 
	},
   	postCreate: function() 
	{	    
		dojo.subscribe(this.id + '/action/dialog/image/ok', this, '_setBackgroundImage');
	    this.inherited(arguments);
        if( this.src )
        {
        	this.setValue(this.src, false);
        }
        else
        {
        	this.contentCanvas.innerHTML = "Click pencil to add image."
        }
        this.connect( this.contentCanvas, 'onclick', dojo.hitch(this, 'onClickEdit'));
	}
});
    