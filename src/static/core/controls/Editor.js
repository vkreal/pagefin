dojo.provide("core.controls.Editor");
dojo.require("dijit.Editor");
dojo.require("dijit._editor.range");
dojo.require("dijit._editor.plugins.AlwaysShowToolbar");
dojo.require("dijit._editor.plugins.EnterKeyHandling");
dojo.require("dijit._editor.plugins.FontChoice");
dojo.require("dijit._editor.plugins.TextColor");
dojo.require("dijit._editor.plugins.LinkDialog");
dojo.declare("core.controls.Editor", 
    [dijit.Editor], 
{
	isDesigner : true,
    plugins : ["bold","italic","underline","strikethrough","|", "insertOrderedList","insertUnorderedList","|","justifyLeft","justifyRight","justifyCenter","justifyFull", "createLink"],
    extraPlugins: ['foreColor','hiliteColor', {name:'dijit._editor.plugins.FontChoice', command:'fontName', generic:true},'fontSize','insertImage'],
   	postCreate: function() 
	{
	    dojo.style( this.domNode, "border", "1px solid gray" );
	    this.inherited(arguments);
	}
});