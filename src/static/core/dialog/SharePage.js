dojo.provide("core.dialog.SharePage");
dojo.require("core.dialog._Base");
dojo.declare("core.dialog.SharePage", 
    [core.dialog._Base], 
{
	templateString: dojo.cache("core", "dialog/templates/SharePage.htm"),
    setPage : function(page)
    {
    	if(page)
    	{
    		this.page_name.value = page['name'];
			this.page_edit.value = page['edit'];
			this.page_url.value = page['url'];
			this.page_shorten.value = page['shorten'];
			this.page_html.value = '<a target=_top href='+page['url']+'>'+page['name']+'</a>';
			this.page_code.value = '[URL="'+page['url']+'"]'+page['name']+'[/URL]';
			//this.delete_page.value = APP_ROOT + '/a/delete/?'+PAGE_KEY+'='+page[PAGE_KEY]+'&'+SAVE_PUBLIC_KEY+'='+page[SAVE_PUBLIC_KEY]+'&redirect=' + APP_ROOT;
    	}
    }, 
    show : function(page, openerId)
    {
    	this.inherited(arguments);
    	this.setPage(page);
    }
});