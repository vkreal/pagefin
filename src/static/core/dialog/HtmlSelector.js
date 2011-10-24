dojo.provide("core.dialog.HtmlSelector");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit._Templated");
dojo.require("dijit._Widget");
dojo.require("core.dialog._Base");
dojo.declare("core.dialog.HtmlSelector", 
    [core.dialog._Base], 
{
	templateString: dojo.cache("core", "controls/templates/HtmlSelector.htm")
});