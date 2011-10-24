dojo.provide("core.dialog.Editor");
dojo.require("dijit.Editor");
dojo.require("dijit._editor.plugins.LinkDialog");
dojo.require("dijit._editor.plugins.FontChoice");
dojo.require("dijit._editor.plugins.TextColor");
dojo.require("core.dialog._Base");
dojo.declare("core.dialog.Editor", 
    [core.dialog._Base], 
{
	templateString: dojo.cache("core", "dialog/templates/Editor.htm"),
    show : function(page, openerId, value)
    {
    	this.inherited(arguments);
    	if( value )
    		this.editor.attr('value', value);
    },
    _okClick : function()
    {
    	dijit.byId(this.openerId).setValue(this.editor.attr('value'));
    	dijit.byId(this.dialogId).onCancel();
    }
});