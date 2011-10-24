dojo.provide("core.controls.Embed");
dojo.require("core.Container");
dojo.require("core.dialog.EmbedSelector");
dojo.declare("core.controls.Embed", 
    [core.Container], 
{
	embed : "",
	_oEmbed : null,
    help : "Click pencil to add embed.",
    _div : null,
    hideEmbed : function()
    {
		var div = this._getDiv();
		if( div )
			dojo.style(div, 'visibility', 'hidden');
    },
    showEmbed : function()
    {
    	var div = this._getDiv();
    	if( div )
    	{
    		this._fit();
			dojo.style(div, 'visibility', '');
    	}
    },
    onClickEdit : function(evt)
	{
		dijit.byId("inlineEmbedSelectorDialog").show(null, this.id, this.embed);
	},
	postCreate: function() 
	{
	    this.inherited(arguments);
	    var p = this.getData();
	    if( p && p['embed'] != null )
	    {
	    	this.setValue( p['embed'], false );
	    }
	    else
	    	this.setValue( this.help, false );
	    this.connect( this.contentCanvas, 'onclick', dojo.hitch(this, 'onClickEdit'));
	    this.resizeHandler.activeResize=true;
	    this.resizeHandler.animateSizing=false;
	},
	setValue:function(value, update)
	{
		if(value&&value.toLowerCase().indexOf("<embed") == -1)
		{
			this.contentCanvas.innerHTML = this.help;
			return;
		}
		else
		{
			this.embed = value;
			this._tryCount = 0;
			this.contentCanvas.innerHTML = '<div id=embed' + this.id + '>' + value + '</div>';
			this.inherited(arguments);
			this._setWidthHeight();
		}
	},
	_cancelClick : function()
	{
	},
	_tryCount : 0,
	_setWidthHeight:function()
	{
		try {
			if( this._tryCount < 10 )
			{
				var embed = dojo.query('embed', this.contentCanvas);
				if( embed.length == 1)
				{
					this._oEmbed = embed[0];
					this._oEmbed.width = '100%'
					this._oEmbed.height = '100%'
					this.showEmbed();
				}
				else if( embed.length > 1)
				{
					alert('You can only have one embed per widget, try fixing your code.'); 
					this.contentCanvas.innerHTML = '';
				}
				else
				{
					this._tryCount++;
					window.setTimeout(dojo.hitch(this, '_setWidthHeight'), 200);
				}
			}
			else
			{
				this.contentCanvas.innerHTML = '';
			}
		}catch(e){ this._errorMsg(); }
	},
	_errorMsg : function()
	{
		alert('Failed to create embed, try fixing your embed code.'); 
		this.contentCanvas.innerHTML = '';
	},
	_getDiv : function()
	{
		if( !this._div )
			this._div = dojo.byId('embed' + this.id);
		return this._div;
	},
	_fit : function()
	{
		var div = this._getDiv();
		if(div)
		{
			var mb = dojo.marginBox(this.contentCanvas);
			var h = ( mb.h - 16 ) < 0 ? 0 : ( mb.h - 16 );
			dojo.style(div, 'height', h + 'px' );
		}
	},
	fromJson:function()
	{ 
		this.embed = ( this._oEmbed ? dojo.byId('embed' + this.id).innerHTML : '' );
	    var base = this.inherited(arguments);
	    // override base height to use actual height
	    // this is a special case for embed..
	    // we use 'embed_height' to render out django template
	    if(this.embed && this._getDiv())
	    {	//
	    	var mb = dojo.marginBox(this._getDiv());
	    	base.style['embed_height'] = (mb.h + 'px')
	    }
	    var oJson = {
	    	type: 'Embed',
	    	embed : this.embed
        }
        return this.mergeFromJson(oJson, base);
	},
	toJsonString:function()
	{
	    return dojo.toJson( this.fromJson() );
	}
});