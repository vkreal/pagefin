dojo.provide("core.NotifyBar");
dojo.require("dojox.widget.UpgradeBar");
dojo.declare("core.NotifyBar", 
		[dojox.widget.UpgradeBar], 
{
	_nadgeCount : 0,
	notify: function(msg)
	{
		this._nadgeCount = dojo.cookie(this.id) ? parseInt( dojo.cookie(this.id) ) : 0;
		if( this._nadgeCount < 2 )
		{
			this.inherited(arguments);
			window.setTimeout(dojo.hitch(this, 'hide'), 2500);
		}
	},
	hide:function()
	{
		try
		{
			this._nadgeCount++;
			dojo.cookie(this.id, this._nadgeCount, { expires:3650 });
			this.inherited(arguments);
		}
		catch(e){}
	}
});