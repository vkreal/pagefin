dojo.provide("core.dialog.EmbedSelector");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._Templated");
dojo.require("dijit._Widget");
dojo.require("core.dialog._Base");
dojo.declare("core.dialog.EmbedSelector", 
    [core.dialog._Base], 
{
	templateString: dojo.cache("core", "dialog/templates/EmbedSelector.htm"),
	show : function(page, openerId, value)
    {
    	this.inherited(arguments);
    	if( value )
    		this.__txtEmbed.value = value;
    },
	postCreate:function()
	{
		this.connect(dijit.byId(this.dialogId), 'hide', '_hide');
	},
	_hide : function()
	{
		if( this.openerId && dijit.byId(this.openerId)._cancelClick )
			dijit.byId(this.openerId)._cancelClick();
	},
	_okClick:function()
	{
		var value = this.__txtEmbed.value;
		dijit.byId(this.openerId).setValue(value);
    	this._cancelClick();
	},
	_cancelClick : function()
	{
		dijit.byId(this.dialogId).onCancel();
		this._hide();
	}
});