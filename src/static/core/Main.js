dojo.provide("core.Main");
dojo.require("dojo.parser");
dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dijit.layout.BorderContainer");
dojo.require("dijit.layout.TabContainer");
dojo.require("dijit.layout.ContentPane");
dojo.require("dijit.form.DropDownButton");
dojo.require("dijit.TooltipDialog");
dojo.require("dijit.form.TextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.Toolbar");
dojo.require("dijit.ColorPalette");
dojo.require("dijit.Dialog");
dojo.require("dojox.layout.ResizeHandle");
dojo.require("dojox.layout.ExpandoPane");
dojo.require("dijit.layout.AccordionContainer");
dojo.require("dojo.dnd.Source");
dojo.require("core.Container");
dojo.require("core.Menu");
dojo.require("core.controls.Image");
dojo.require("core.dialog.Dialog");
dojo.require("core.dialog.NewPage");
dojo.require("core.AjaxServices");
dojo.require("core.PageContentPane");
dojo.require("core.Toolbar");
dojo.require("dojox.widget.Toaster");
dojo.require("core.dialog.SharePage");
dojo.require("core.controls.TextBox");
dojo.require("core.dialog.Editor");
dojo.require("core.dialog.OpenPage");
dojo.require("core.controls.Embed");
dojo.require("core.Standby");
dojo.require("core.NotifyBar");
dojo.require("core.dialog.Howto");
dojo.require("core.dialog.RenamePage");
dojo.require("core.dialog.MoreStuffPane");
(function() {
dojo.declare(
		"core.Main", // name
		null, // derive from
		{
			id : '{DCB559D5-5CB1-4c3f-A6DD-9C70C3CC86AB}',
			_isDirty : false,
			_ajax : null,
			_unSaveMessage : ' has unsaved changes. Save this page?',
			_interval : 4000,
			_timer : null,
			constructor : function()
			{
				this._ajax = core.PageContentPane.getAjaxServices();
				dojo.subscribe(this.id + '/action/dialog/new/ok', this, '_setCreated');
				dojo.subscribe(this.id + '/action/dialog/image/ok', this, '_setBackgroundImage');
				dojo.subscribe('/action/global', this, '_doGlobalAction');
				dojo.subscribe('/action/widget/add', this, '_doAddControl');
				dojo.subscribe('/designer/control/update', this, '_setDirty');
				dojo.addOnUnload(dojo.hitch(this, '_onUnload'));
				
			},
			_clearTimer : function()
			{
				if(this._timer)
				{
					window.clearInterval(this._timer);
				}
			},
			_startTimer : function()
			{
				this._clearTimer();
				this._timer = window.setInterval(dojo.hitch(this, "_timerSave"), this._interval);
			},
			_doSaveCallback : function(page, success)
			{
			},
			_timerSave : function()
			{
				if( this._isDirty )
				{
					var page = core.Main.getPage();
					if( page )
					{
						var rawPage = core.Main.getRawPage();
						this._doSave(page, dojo.hitch(this, '_doSaveCallback'));
					}
				}
			},
			_onUnload : function()
			{
			},
			_setDirty : function()
			{
				this._startTimer();
				this._isDirty = true;
			},
			_setBackgroundImage : function(uri)
			{
				var pane = core.Main.getPagePane();
				if( pane )
				{
					pane.setBackgroundImage(uri);
					this._setDirty();
				}
			},
			_setCreated : function(page)
			{
				var pane = core.Main.getPagePane();
				if( pane )
					pane.setPage(page);
			},
			_doAddControl : function(type, target)
			{
				var pane = core.Main.getPagePane();
				switch(type)
				{
					case 'text':
						pane.createControl('core.controls.TextBox', null);
						break;
					case 'image':
						pane.createControl('core.controls.Image', null);
						break;
					case 'embed':
						pane.createControl('core.controls.Embed', null);
						break;
				}
			},
			_share : function(rawPage)
			{
				var url = APP_ROOT + '/share/' + rawPage.pk
				window.open(url,"window"); 	
			},
			_doGlobalAction : function(action, target)
			{
				var pane = core.Main.getPagePane();
				if( !pane ) { return; }
				if( action == 'new' )
				{
					dijit.byId('inlineCreateDialog').show(null, this.id);
					return;
				}
				else if(action == 'open')
				{
					dijit.byId("inlineOpenDialog").show(null, this.id);
					return
			    }
				else if( action == 'help' )
				{
					dijit.byId("inlineHelpDialog").show(null, this.id);
				}
				var page = pane.getPage();
				if( page )
				{
					var rawPage = core.Main.getRawPage();
					switch(action)
					{
						case 'delete':
							if(confirm('Delete "' +rawPage['name']+ '", are you sure?'))
							{
								dijit.byId('__standby_mainApp').show();
								var thiz = this;
								this._isDirty = false;
								this._ajax.deletePage(rawPage[PAGE_KEY], rawPage[SAVE_PUBLIC_KEY], function(response){
									dijit.byId('__standby_mainApp').hide();
									if(!(response instanceof Error))
									{
										dijit.byId('btnSave').attr('disabled', true);
										//dijit.byId('btnOpen').attr('disabled', true);
										dijit.byId('btnPreview').attr('disabled', true);
										dijit.byId('btnShare').attr('disabled', true);
										dijit.byId('btnAddStuff').attr('disabled', true);
										dijit.byId('btnMore').attr('disabled', true);
										pane.resetPage();
										//dojo.query("[needpage]", dijit.byId('toolbar').containerNode).forEach(function(node){
										//	var w;
										//	if(node && (w=dijit.byId(node.getAttribute('widgetId'))))
											//{
										//		w.attr('disabled', true);
										//	}
										//});
									}
									else
									{
										alert('Oops... something went wrong, please try again in a few moments.');
									}
								});
							}
							break;
						case 'rename':
							dijit.byId("inlineRenamePageDialog").show(rawPage, this.id);
							break;
						case 'clearImage':
							if( pane.backgroundImage != '')
							{
								pane.clearBackgroundImage();
								this._setDirty();
							}
							break;
						case 'bgImage':
							dijit.byId("inlineImageDialog").show(null, this.id, pane.backgroundImage);
							break;
						case 'colorPalette':
							var color = target.value;
							pane.setBackgroundColor(color);
							this._setDirty();
							break;
						case 'share':
							this._share(rawPage);
							//dijit.byId("inlineShareDialog").show(core.Main.getRawPage(), this.id);
							break;
						case 'pageProp':
							dijit.byId("inlinePagePropertiesDialog").show(rawPage, this.id);
							break;
						case 'save':
							if(this._isDirty == true)
							{
								this._doSave(page, dojo.hitch(this, '_doSaveCallback'));
							}
							break;
						case 'preview':
							if(this._isDirty)
							{
								var save = confirm("'" + rawPage.name +"'" + this._unSaveMessage);
								if( save )
								{
									this._doSave(page, function(){
										window.open(rawPage.url,"window"); 
										delete rawPage;
									})
								}
								else {
									window.open(rawPage.url,"window");
								}
							}
							else
							{
								window.open(rawPage.url,"window"); 
							}
							break;
						
					}
				}
			},
			_doSave : function(page, callback)
			{
				if( page && this._isDirty )
				{
					this._clearTimer();
					this._isDirty = false;
					this._ajax.savePage(page, page[PAGE_KEY], page[SAVE_PUBLIC_KEY], callback);
				}
			}
		}
	);
	dojo.mixin(core.Main, 
	{
		_pagePane : null,
		log : function(message, page)
		{
			if( message && page )
			{
				var ajax = core.PageContentPane.getAjaxServices();
				ajax.log(page[PAGE_KEY], page[SAVE_PUBLIC_KEY], message);
			}
		},
		FB_StreamPublish:function()
		{
			var rawPage = core.Main.getRawPage();
			if( rawPage )
			{
				var name = rawPage.name.length > 50? rawPage.name.substring(0, 50) + '...' : rawPage.name;
				var attachments = {'name':name,'href':rawPage.url,'description':'created by ' + AP_PAGE_CREATOR}
			    var stream_text = 'created a web page and wants to share it with friends and family.';
			    function streamPublish()
				{
					 FB.Connect.streamPublish(stream_text, attachments, null, null,
		                     'Tell your friends and family below.',
		                     stream_callback);
				}
				function stream_callback(arg1, arg2, arg3)
				{
			    	if( arg2 && arg2['userData'] && arg2['userData'].error_code == 341)
			    	{	// user reach limit of streaming messages
			    		streamPublish();
			    	}
			    	else
			    	{
			    		core.Main.log('published page to stream with page url: ' + rawPage.url, rawPage);
			    	}
				}
				FB.Connect.requireSession(function(exception) {
					streamPublish();
				});
			}
		},
		getPagePane:function()
		{
			if( core.Main._pagePane == null )
				core.Main._pagePane = dijit.byId('pageContentPane');
			return core.Main._pagePane;
		},
		getPage:function()
		{
			var pane = core.Main.getPagePane();
			return pane ? pane.getPage() : null;
		},
		getRawPage:function()
		{
			var pane = core.Main.getPagePane();
			return pane ? pane.getRawPage() : null;
		},
	    instances : []
	});
})();