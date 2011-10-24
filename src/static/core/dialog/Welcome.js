dojo.provide("core.dialog.Welcome");
dojo.require("core.dialog._Base");
dojo.declare("core.dialog.Welcome", 
    [core.dialog._Base], 
{
	templateString: dojo.cache("core", "dialog/templates/Welcome.htm")
});