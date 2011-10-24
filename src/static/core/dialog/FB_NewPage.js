dojo.provide("core.dialog.FB_NewPage");
dojo.require("core.dialog._Base");
dojo.declare("core.dialog.FB_NewPage", 
    [core.dialog._Base], 
{
	templateString: dojo.cache("core", "dialog/templates/FB_NewPage.htm"),
    _okClick : function(evt)
    {
		var name = dojo.string.trim(this.name.value);
		if( name == '')
		{
			alert('Page name can\'t be empty.');
			return;
		}
		var trimTags = [];
		dijit.byId('__standby_inlineCreateDialog').show();
		var ajax = core.PageContentPane.getAjaxServices();
		ajax.createPage(name, trimTags.join(','), null, null, dojo.hitch(this,"_handleCreatePage"));
    },
    _handleCreatePage : function(data)
	{
		if(data['error'] == true)
		{
			dijit.byId('__standby_inlineCreateDialog').hide();
			alert('Oops... something went wrong, please try again in a few moments.');
			return;
		}
		dojo.publish(this.openerId + '/action/dialog/new/ok', [data]);
		dijit.byId('__standby_inlineCreateDialog').hide();
		dijit.byId(this.dialogId).onCancel();
	}
});