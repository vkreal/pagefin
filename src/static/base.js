function search_onfocus(target)
{
	if( target.value == 'search...' )
	{
		target.value = '';
		target.style.color = '';
	}		
}
function search_onfocusout(target)
{
	if( target.value == '' )
	{
		target.value = 'search...';
		target.style.color = '#777777';
	}		
}						