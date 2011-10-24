dojo.provide("core.dialog._Base");
dojo.require("dijit._Templated");
dojo.require("dijit._Widget");
dojo.require("dojo.parser"); 
dojo.require("dojox.layout.ResizeHandle"); 
dojo.require("dojo.dnd.Moveable"); 
dojo.declare("core.dialog._Base", 
    [dijit._Widget, dijit._Templated], 
{
	widgetsInTemplate:true,
	dialogId : '',
	openerId : '',
	Recaptcha : true,
    show : function(page, openerId)
    {
		if( openerId )
			this.openerId = openerId;
    },
    _cancelClick : function()
    {
    	if (this.dialogId)
    		dijit.byId(this.dialogId).onCancel();
    }
});