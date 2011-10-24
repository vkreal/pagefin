dojo.provide("core.dialog.OpenPage");
dojo.require("core.dialog._Base");
dojo.declare("core.dialog.OpenPage", 
    [core.dialog._Base], 
{
	templateString: dojo.cache("core", "dialog/templates/OpenPage.htm"),
	errorMessage : 'Oops... something went wrong, please try again in a few moments.',
	postCreate : function()
	{
		core.dialog.OpenPage.init(this);
		this.inherited(arguments);
	},
	show : function(page, openerId, value)
	{
    	this.inherited(arguments);
    	this.getMyPages(0);
    },
    getMyPages : function(page)
    {
    	this.pageContainer.innerHTML = '';
    	dijit.byId('__standby_inlineOpenDialog').show();
    	var ajax = core.PageContentPane.getAjaxServices();
    	ajax.getMyPages(page, dojo.hitch(this, '_getMyPages2'));
    },
    _getMyPages2 : function(response, ioArgs)
    {
    	dijit.byId('__standby_inlineOpenDialog').hide();
    	if(!(response instanceof Error))
    	{
    		this.pageContainer.innerHTML = response;
    	}
    	else
    	{
    		this.pageContainer.innerHTML = this.errorMessage;
    	}
    },
    _prevNextClick : function(evt)
    {
    	this.getMyPages( evt.target.getAttribute('index') );
    },
    _okClick : function(evt)
    {
		
    },
    edit : function(pk, spk)
	{
    	dijit.byId('__standby_inlineOpenDialog').show();
    	var ajax = core.PageContentPane.getAjaxServices();
    	var thiz = this;
		ajax.getPage(pk, spk, function(response){
			dijit.byId('__standby_inlineOpenDialog').hide();
			thiz._cancelClick();
			if(!(response instanceof Error))
			{
				var pane = core.Main.getPagePane();
				pane.setPage(response);
			}
			else
			{
				alert(this.errorMessage);
			}
		});
	},
	share : function(pk)
	{
		
	},
	remove : function(pk, spk, page)
	{
		var thiz = this;
		var cb = function()
		{// hack for now, deleting last element on page cause issuse
		 // not fixing now.
			thiz.getMyPages(0);
		}
		var ajax = core.PageContentPane.getAjaxServices();
		ajax.deletePage(pk, spk, cb);
	}
});

dojo.mixin(core.dialog.OpenPage, 
{
	_inst : null,
	init : function(inst)
	{
		core.dialog.OpenPage._inst = inst;
	},
	getPage:function(page)
	{
		core.dialog.OpenPage._inst.getMyPages(page);
	},
	edit : function(pk, spk)
	{
		core.dialog.OpenPage._inst.edit(pk, spk);
	},
	share : function(pk)
	{
		core.dialog.OpenPage._inst.share(pk);
	},
	remove : function(pk, spk, page)
	{
		core.dialog.OpenPage._inst.remove(pk, spk, page);
	}
});
