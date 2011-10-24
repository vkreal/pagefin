dojo.provide("core.dialog._Dialog");
dojo.require("dijit.Dialog");
dojo.require("dijit.form.Button");
dojo.declare("core.dialog._Dialog", 
    [dijit.Dialog], 
{
	hide : function()
	{
		core.Container.showEmbed();
		this.inherited(arguments);
	},
    show:function(page, openerId, value)
    {
		core.Container.hideEmbed();
		this.inherited(arguments);
	}
});