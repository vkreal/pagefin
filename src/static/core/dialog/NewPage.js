dojo.provide("core.dialog.NewPage");
dojo.require("core.dialog._Base");
dojo.declare("core.dialog.NewPage", 
    [core.dialog._Base], 
{
	templateString: dojo.cache("core", "dialog/templates/NewPage.htm"),
    _okClick : function(evt)
    {
		var name = dojo.string.trim(this.name.value);
		var tags = dojo.string.trim(this.tags.value);
		if( name == '')
		{
			alert('Page name can\'t be empty.');
			return;
		}
		else if( tags == '' && IS_FACEBOOK == false )
		{
			alert('Tags can\'t be empty.');
			return;
		}
		var recaptcha_challenge = null;
		var recaptcha_response = null;
		tags = tags.split(',');
		var trimTags = [];
		if(this.Recaptcha && IS_FACEBOOK == false)
		{
			var recaptcha_response = Recaptcha.get_response();
			if( dojo.string.trim(recaptcha_response) == '')
			{
				alert('Recaptcha can\'t be empty.');
				return;
			}
			recaptcha_challenge = Recaptcha.get_challenge();
			recaptcha_response = Recaptcha.get_response();
		}
		// trim empty space and extra comma(s)
		for(var i=0;i<tags.length;i++)
		{
			var v = dojo.string.trim(tags[i]);
			if(v){
				trimTags.push(v.toLowerCase());
			}
		}
		dijit.byId('__standby_inlineCreateDialog').show();
		var ajax = core.PageContentPane.getAjaxServices();
		ajax.createPage(name, trimTags.join(','), recaptcha_challenge, recaptcha_response, dojo.hitch(this,"_handleCreatePage"));
    },
    _handleCreatePage : function(data)
	{
		if(data['error'] == true)
		{
			dijit.byId('__standby_inlineCreateDialog').hide();
			alert(data['message'] + ' captcha might be wrong.');
			return;
		}
		window.location = data['edit'];
	}
});