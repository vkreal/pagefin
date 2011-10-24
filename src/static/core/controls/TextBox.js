dojo.provide("core.controls.TextBox");
dojo.require("core.Container");
dojo.require("dijit.Editor");
dojo.require("core.controls.Editor");
dojo.declare("core.controls.TextBox", 
    [core.Container], 
{
    help : "Click pencil to add text.",
   	postCreate: function() 
	{	    
	    this.inherited(arguments);
	    var p = this.getData();
	    if( p && p['text'] != null )
	    {
	    	this.setValue( p['text'], false );
	    }
	    else
	    	this.setValue( this.help, false );
	 //   this.connect( this.contentCanvas, 'onclick', dojo.hitch(this, 'onClickEdit'));
	},
	setValue : function(value, update)
	{
		this.contentCanvas.innerHTML = value;
		this.inherited(arguments); 
	},
	onClickEdit : function(evt)
	{
		dijit.byId("inlineRichTextDialog").show(null, this.id, this.getValue());
	},
	getValue:function()
	{
		return this.contentCanvas.innerHTML;
	},
	fromJson:function()
	{
	    var base = this.inherited(arguments); 
	    var oJson = {
	    	type: 'TextBox',
	    	text : this.getValue() == this.help ? null : this.getValue()
        }  
        return this.mergeFromJson(oJson, base);
	},
	toJsonString:function()
	{
	    return dojo.toJson( this.fromJson() );
	}
});
