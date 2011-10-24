dojo.provide("core.Container");
dojo.require("dijit._Templated");
dojo.require("dijit._Widget");
dojo.require("dojo.parser"); 
dojo.require("dojox.layout.ResizeHandle"); 
dojo.require("dojo.dnd.Moveable"); 
dojo.declare("core.Container", 
    [dijit._Widget, dijit._Templated], 
{
	templateString: dojo.cache("core", "templates/Container.htm"),
    widgetsInTemplate:true,
    isDesigner : true,
    isSelected : false,
    toolbarOffsetTop : -25,
    /* EVENTS */
    dataIndex : -1,
    _zIndexOffset : -999999,
    getData : function()
    {
	 	var p = dijit.byId('pageContentPane').getRawPage();
	    if( p && p.content && 
	    		p.content.controls && 
	    		p.content.controls[this.dataIndex])
	    {
	    	return p.content.controls[this.dataIndex];
	    }
    },
    setValue : function(value, update)
    {
		if( update != false)
			dojo.publish("/designer/control/update", [ this ] );
	},
    onClickMoveZBack:function(evt) 
    { 
        if( Number.NEGATIVE_INFINITY < this.domNode.style.zIndex )
        {
            dojo.publish("/designer/control/update", [ this, "z-back" ] );
            var next = this.findLowZIndex();
            dojo.style(this.domNode, "zIndex",  next - 1);
        }
    },
	onClickMoveZFront:function(evt) 
	{
	    if( Number.POSITIVE_INFINITY > this.domNode.style.zIndex )
	    {
	        dojo.publish("/designer/control/update", [ this, "z-front" ] );
	        var next = this.findHighZIndex();
	        dojo.style(this.domNode, "zIndex", next + 1);
	    }
	},
	findLowZIndex:function()
	{
	    var x = this._zIndexOffset;
	    for( var i = 0; i < core.Container.instances.length; i++)
	    {
	    	if(core.Container.instances[i].domNode.style.zIndex != '')
	    	{
		    	var cIndex = parseInt(core.Container.instances[i].domNode.style.zIndex);
		        if( x > cIndex || x == this._zIndexOffset)
		        {
		            x = cIndex;
		        }
	    	}
	    }
	    if( x == this._zIndexOffset)
	        x = 0;
	    return x;
	},
	findHighZIndex:function()
	{
	    var x = this._zIndexOffset;
	    for( var i = 0; i < core.Container.instances.length; i++)
	    {
	    	if(core.Container.instances[i].domNode.style.zIndex != '')
	    	{
		    	var cIndex = parseInt(core.Container.instances[i].domNode.style.zIndex);
		        if( x < cIndex || x == this._zIndexOffset )
		        {
		            x = cIndex;
		        }
	    	}
	    }
	    if( x == this._zIndexOffset)
	        x = 0;
	    return x;
	},
	onClickMove:function(evt) { /* NOOP */ },
	onClickEdit:function(evt) { /* NOOP */},
	onClickDelete:function(evt) { /* NOOP */ },
	onResize : function(evt) {this._removeUserHintOnResizeAndMove();},
	beginSizing : function(evt) { this._setUserHintOnResizeAndMove(); },
	onMoving : function(mover, leftTop){},
	onMoveStart : function(mover)
	{
		this._setUserHintOnResizeAndMove();
	},
	onMoveStop : function(/* dojo.dnd.Mover */ mover)
	{
	    if(( this.domNode.offsetTop + this.toolbarOffsetTop ) < 0)
	    {
	        dojo.style( this.domNode, "top", Math.abs(this.toolbarOffsetTop) + "px");
	    }
	    if( this.domNode.offsetLeft < 0 )
	    {
	    	dojo.style( this.domNode, "left", "0px");
	    }
	    this._removeUserHintOnResizeAndMove();
	},
	_removeUserHintOnResizeAndMove:function()
	{
		core.Container.showEmbed();
	    dojo.publish("/designer/control/update", [ this, "move-resize" ] );
	    dojo.style(this.contentCanvas, "opacity", 100);
	    dojo.style(this.contentCanvas, "filter", "Alpha(Opacity=100)");
	    if( this.contentCanvas.getAttribute("backgroundColor") != null )
	        dojo.style(this.contentCanvas, "backgroundColor", this.contentCanvas.getAttribute("backgroundColor"));
	},
	_setUserHintOnResizeAndMove:function()
	{
		core.Container.hideEmbed();
	    this.contentCanvas.setAttribute("backgroundColor", this.contentCanvas.style.backgroundColor);
	    dojo.style(this.contentCanvas, "opacity", 20);
	    dojo.style(this.contentCanvas, "filter", "Alpha(Opacity=20)");
	    dojo.style(this.contentCanvas, "backgroundColor", "yellow");
	},
	mergeFromJson:function(oJson, baseJson)
	{
        if( baseJson )
        {
            for(var key in baseJson)
            {
                oJson[key] = baseJson[key];
            }
        }
        return oJson;
	},
	fromJson:function()
	{
		var mb = dojo.marginBox(this.domNode);
	    return {
            style:
            {
	    		zIndex : this.domNode.style.zIndex,
                left : this.domNode.style.left,
                top : (mb.t + 'px'),
                width : (mb.w + 'px'),
                height : (mb.h + 'px')
            }
        }  
	},
	
	toJsonString:function() { /* OVERRIDE IN DERIVE CLASS */ return null; },
	onDelete : function(evt)
	{	
        
	    var user = confirm("Are you sure you want to delete this control?");
	    if( user )
	    {
	       dojo.publish("/designer/control/update", [ this, "delete" ] );
	       this.destroy();
	    }
	},
	getCacheIndex : function()
	{
	    var instances = core.Container.instances;
        for(var i = 0; i < instances.length; i++)
        {
            var o = instances[i];
            if( o == this)
            {
               return i;
            }
        }
        return undefined;
	},
    destroy : function()
	{
	    var index = this.getCacheIndex();
	    if( index != undefined )
	    {
	        core.Container.instances.splice(index, 1);
	    }
	    this.inherited(arguments);
	},
	setContent:function(shtml)
	{
	    dojo.publish("/designer/control/update", [ this ] );
	    this.contentCanvas.innerHTML = shtml;
	},
	postCreate: function() 
	{
		this.inherited(arguments);
	    core.Container.instances.push(this);
	    this.isSelected = true;
        this.toolBar.style.display = "";
        this.mover = new dojo.dnd.Moveable(this.domNode,{ handle: this.moveHandler });
        this.connect(this.resizeHandler, "onResize", "onResize");
        this.connect(this.resizeHandler, "_beginSizing", "beginSizing");
        dojo.style(	this.contentCanvas, "border", "gray 1px dashed" );
        this.connect(this.mover, "onMoveStart", "onMoveStart");
        this.connect(this.mover, "onMoving", "onMoving");
        this.connect(this.mover, "onMoveStop", "onMoveStop");
        this.connect(this.deleteHandler, "onclick", "onDelete");
	    dojo.style(this.domNode, "position", "absolute");
	}
});
dojo.mixin(core.Container, 
{
	//toobarZIndex : 3000,
    instances : [],
    hideEmbed : function()
    {
		dojo.forEach(core.Container.instances, function(w) {
			if( w && w.declaredClass == 'core.controls.Embed' )
			{
				w.hideEmbed();
			}
		});
    },
    showEmbed : function()
    {
    	dojo.forEach(core.Container.instances, function(w) {
    		if( w && w.declaredClass == 'core.controls.Embed' )
			{
				w.showEmbed();
			}
    	});
    }
});