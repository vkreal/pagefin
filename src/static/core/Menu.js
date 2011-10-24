dojo.provide("core.Menu");
dojo.require("dijit.Menu");
// widget definition
dojo.declare(
	"core.Menu", // name
	dijit.Menu, // derive from
	{
		bindDomNode: function(/*String|DomNode*/ node)
		{
		},
		show:function(evt)
		{	
			this._openMyself(evt)
		}
	}
);
dojo.declare(
	"core.MenuLabel",
	[dijit._Widget, dijit._Templated, dijit._Contained],
{
	label: '',
	templateString: '<tr class="dijitReset dijitMenuItem dijitMenuItemSectionHeader">'
			+'<td colspan="100" align="center" style="font-weight:bold;" class="dijitReset dijitMenuItemLabel" dojoAttachPoint="labelNode"></td>'
			+'</tr>',

	postCreate: function(){
		dojo.setSelectable(this.domNode, false);
		if(this.label){
			this.labelNode.innerHTML=this.label;
		}
	}
});