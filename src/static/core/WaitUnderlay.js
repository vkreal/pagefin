dojo.provide("core.WaitUnderlay");
dojo.require("dijit.Dialog");
dojo.declare(
	"core.WaitUnderlay",
	[dijit.DialogUnderlay],
	{
		templateString: "<div class='dijitDialogUnderlayWrapper' id='${id}_wrapper'><span dojoAttachPoint='userHint' style='float:right;'></span><div class='dijitDialogUnderlay ${class}' id='${id}' dojoAttachPoint='node'></div></div>",
	    show: function(hint)
	    {
	        if( hint )
	        {
	            this.userHint.innerHTML = hint;
	            dojo.style( this.userHint, "backgroundColor", "yellow");
	            dojo.style( this.userHint, "color", "red");
	            dojo.style( this.userHint, "fontWeight", "bold");
	        }
	        this.inherited(arguments);
	    },
	    hide: function()
	    {
	        this.userHint.innerHTML = "";
	        dojo.style( this.userHint, "backgroundColor", "");
	        dojo.style( this.userHint, "color", "");
	        dojo.style( this.userHint, "fontWeight", "");
	        this.inherited(arguments);
	    }
	}
);