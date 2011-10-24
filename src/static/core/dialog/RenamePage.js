dojo.provide("core.dialog.RenamePage");
dojo.require("core.dialog._Base");
dojo.declare("core.dialog.RenamePage", 
    [core.dialog._Base], 
{
	templateString: dojo.cache("core", "dialog/templates/RenamePage.htm"),
	_okClick : function()
	{
		var name = this.user_input.value;
		if( dojo.string.trim(name) == '' )
		{
			alert('Name can not be empty.'); 
			return;
		}
		// trim long name
		if(name.length > 100)
			name = name.substring(0, 100);
		var ajax = core.PageContentPane.getAjaxServices();
		var thiz = this;
		dijit.byId('__standby_inlineRenamePageDialog').show();
		ajax.renamePage(this.rawPage[PAGE_KEY], this.rawPage[SAVE_PUBLIC_KEY], name, function(response, ioArgs)
		{
			dijit.byId('__standby_inlineRenamePageDialog').hide();
			if(!(response instanceof Error))
			{
				thiz.rawPage['name'] = name;
				thiz._cancelClick();
				thiz = null;
			}
			else
			{
				alert('Oops... something went wrong, please try again in a few moments.');
			}
		});
	},
    show : function(page, openerId)
    {
		this.rawPage = page;
		this.user_input.value = page['name'];
    	this.inherited(arguments);
    }
});