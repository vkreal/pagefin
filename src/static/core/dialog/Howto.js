dojo.provide("core.dialog.Howto");
dojo.require("core.dialog._Base");
dojo.declare("core.dialog.Howto", 
    [core.dialog._Base], 
{
	templateString: dojo.cache("core", "dialog/templates/Howto.htm")
});