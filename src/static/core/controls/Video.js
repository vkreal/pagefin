dojo.provide("core.controls.Video");
dojo.require("core.Container");
dojo.declare("core.controls.Video", 
    [core.Container], 
{
   	postCreate: function() 
	{	    
	    this.inherited("postCreate", arguments);
	},
    fromJson:function()
	{
	    var base = this.inherited("fromJson", arguments);
	    var oJson = {
	    	type: 'Video',
    //        id : this.id
        }  
        return this.mergeFromJson(oJson, base);
	},
	toJsonString:function()
	{
	    return dojo.toJson( this.fromJson() );
	}
});