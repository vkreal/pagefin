dojo.provide("core.controls.HtmlBox");
dojo.require("core.Container");
dojo.require("core.dialog.HtmlSelector");
dojo.declare("core.controls.HtmlBox", 
    [core.Container], 
{
	text : "",
    help : "Click pencil to add HTML.",
   	postCreate: function() 
	{	    
	    this.inherited("postCreate", arguments);
	},
	onClickEdit : function(evt)
	{
	},
	fromJson:function()
	{ 
	    var base = this.inherited(arguments);
	    var oJson = {
	    	type: 'HtmlBox',
            text : this.text;
        }
        return this.mergeFromJson(oJson, base);
	},
	toJsonString:function()
	{
	    return dojo.toJson( this.fromJson() );
	}
});