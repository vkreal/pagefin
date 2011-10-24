dojo.provide("core.dialog.Dialog");
dojo.require("core.dialog._Dialog");
dojo.declare("core.dialog.Dialog", 
    [core.dialog._Dialog], 
{
	Recaptcha : false,
	postCreate : function()
	{
		this.inherited(arguments);
		dojo.subscribe('/action/dialog/cancel',this,"_cancelClick");
	},
	_cancelClick : function()
	{
		this.onCancel();
	},
    show:function(page, openerId, value)
    {
		this.inherited(arguments);
		if(this.Recaptcha && typeof Recaptcha != "undefined")
		{
			Recaptcha.create("6LeqlggAAAAAAD6PLuAYU9EyveQXs8JoAI4RR-Wz",
				"recaptcha_div", 
				{
				   theme: "red",
				   callback: Recaptcha.focus_response_field
				});
		}
		var child = dojo.query("[widgetId]", this.containerNode)[0];
		if( child && child.getAttribute('widgetId'))
		{
			var w = dijit.byId( child.getAttribute('widgetId') );
			if( w && w.show )
				w.show(page, openerId, value);
		}
	}
});