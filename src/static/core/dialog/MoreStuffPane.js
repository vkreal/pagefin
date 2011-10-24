dojo.provide("core.dialog.MoreStuffPane");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._Templated");
dojo.require("dijit.form.Select");
dojo.declare("core.dialog.MoreStuffPane", 
    [dijit._Templated], 
{
	templateString: dojo.cache("core", "dialog/templates/MoreStuff.htm"),
	widgetsInTemplate : true,
	postCreate:function()
	{
		this.connect(this.borderWeight, 'onChange', '_onBorderWeightChange');
	},
	_onBorderWeightChange:function(evt)
	{
	}
});