dojo.provide("core.PageContentPane");
dojo.require("dijit.layout.ContentPane");
//dojo.require("dojox.uuid.generateRandomUuid");
// widget definition
dojo.declare(
	"core.PageContentPane", // name
	dijit.layout.ContentPane, // derive from
	{
		_page : null,
		_contextCoods : null,
		backgroundImage : "",
		backgroundColor : "",
		_contextCoods : { x : 100, y : 100 },
		canvasHeight : 6000,
		_bgImage : 'http://page.appspot.com/static/images/gridline10px_silver.gif',
		resetPage : function()
		{
			this._page = null;
			this.attr("content", '');
			this.setBackgroundImage(this._bgImage, true);
			dojo.style( this.containerNode, 'backgroundColor', 'silver');
		},
		getPageKey : function()
		{
			return this._page[PAGE_KEY];
		},
		setBackgroundColor:function(color)
		{
			dojo.style( this.containerNode, 'backgroundColor', color);
			this.backgroundColor = color;
		},
		clearBackgroundImage:function()
		{
			this.setBackgroundImage(this._bgImage, true);
			this.backgroundImage = '';
			if( this.backgroundColor )
				dojo.style( this.containerNode, 'backgroundColor', this.backgroundColor);
		},
		setBackgroundImage:function(uri, internal)
		{
			dojo.style( this.containerNode, 'backgroundImage', 'url(' + uri + ')');
			if(!internal)
				this.backgroundImage = uri;
		},
		setPage : function(page)
		{
			this.backgroundImage = '';
			this.backgroundColor = '';
			var sb = ['<div style="width:1px; height:', this.canvasHeight, 'px; z-index:-100;"/>'];
			if(page)
			{
				dojo.query("[widgetId]", dijit.byId('toolbar').containerNode).forEach(function(node){
					var w;
					if(node && (w=dijit.byId(node.getAttribute('widgetId'))))
					{
						w.attr('disabled', false);
					}
				});
				this._page = page;
				var content = page.content = dojo.fromJson(page.content);
				if(content['backgroundImage'])
					this.setBackgroundImage(content['backgroundImage']);
				else
					this.setBackgroundImage(this._bgImage, true);
				if(content['backgroundColor'])
					this.setBackgroundColor(content['backgroundColor']);
				else 
					this.setBackgroundColor('');
				if(content.controls)
				{
					for(var i=0;i<content.controls.length;i++)
					{
						var control = content.controls[i];
						var style_sb = [];
						for(var key in control.style)
			            {
							if( key == 'zIndex' )
							{
								style_sb.push( 'z-index' + ":" + control.style[key] + ";" );
							}
							else
							{
								style_sb.push( key + ":" + control.style[key] + ";" );
							}
			            }
						sb.push('<div style="');
						sb.push(style_sb.join(""));
						sb.push('" ');
						
						sb.push('dataIndex="');
						sb.push(i);
						sb.push('" ');
						
						sb.push('dojoType=');
						switch(control['type'])
				        {
				        	case 'Image':
				        		sb.push('"core.controls.Image"');
				        		break;
				        	case 'TextBox':
				        		sb.push('"core.controls.TextBox"');
				        		break;
				        	case 'Embed':
				        		sb.push('"core.controls.Embed"');
				        		break;
				        }
						for ( var key in control )
			            {
			                if ( key != "style" && 
			                	key != 'text' && key != 'type' 
			                		&& key != 'embed')
			                {
			                	sb.push(' ');
			                	sb.push(key);
			                	sb.push('="');
			                	sb.push(control[key]);
			                    sb.push('" ');
			                }
			            }
			            sb.push('>');
			            sb.push('</div>');   
					}
				}
			}
			this.attr("content", sb.join(""));
			try {
				window.defaultStatus = this._page.name;
			} catch(e){}
		},
		getRawPage : function()
		{
			return this._page;
		},
		getPage : function()
		{
			if(!this._page)
				return null;
			var json = {};
			json['backgroundImage'] = this.backgroundImage;
			json['backgroundColor'] = this.backgroundColor;
			if( typeof SAVE_PUBLIC_KEY != "undefined" )
				json['spk'] = this._page[SAVE_PUBLIC_KEY];
			if( typeof PAGE_KEY != "undefined" )
				json['pk'] = this._page[PAGE_KEY];
			json['controls'] = [];
			var w, widgets = dojo.query("[widgetId]", this.containerNode);
			for(var i=0;i<widgets.length;i++)
			{
				w = dijit.byId(widgets[i].id)
				if(w && w.isDesigner)
				{
					try
					{
						json['controls'].push( w.fromJson() );
					}
					catch(e)
					{
						alert('Failed: ' + w)
					}
				}
			}
			return json;
		},
	    createControl:function(widgetClass, contextCoods)
		{
	    	if( !contextCoods )
	    	{
	    		contextCoods = this._contextCoods;
	    	}
	    	dojo.publish("/designer/control/update");
		    var node = dojo.doc.createElement('div');	
		    dojo.style( node, "position", "relative" );
		    this.containerNode.appendChild(node);
	        var clazz = eval( widgetClass );
	        new clazz({style:this.generateControlStyle((contextCoods.x+this.containerNode.scrollLeft), 
	        		(contextCoods.y+this.containerNode.scrollTop))}, node);
	        contextCoods.x = contextCoods.x + 10;
	        contextCoods.y = contextCoods.y + 10;
		},
		generateControlStyle:function(x,y)
		{
		    var sb = [];
		    sb.push("width: 300px; height :100px;")
		    sb.push(dojo.string.substitute("left:${0}px;top:${1}px;", [x, y]));
		    return sb.join("");
		}
	}
);

dojo.mixin(core.PageContentPane, 
		{
			_ajax : null,
			getAjaxServices : function()
			{
				if( !core.PageContentPane._ajax )
				{
					core.PageContentPane._ajax = IS_FACEBOOK == false ? new core.AjaxServices() : new core.fb.AjaxServices();
				}
				return core.PageContentPane._ajax;
			}
		});
