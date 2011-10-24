dojo.provide("core.fb.PhotoSelector");
dojo.require("core.dialog._Dialog");
dojo.declare("core.fb.PhotoSelector", 
    [core.dialog.PhotoSelector], 
{
	_albums : null,
	_photos : {},
	_selectedPhoto : null,
	_loadAlbum:function(albums)
	{
		this.hideStandBy();
		if( albums )
		{
			var albumSelection = dojo.byId('__fbAlbumSelection');
			this._albums = albums;
			var album = null;
			for(var k in albums)
			{
				album = albums[k];
				dojo.create("option", {value:album.aid, innerHTML:album.name}, albumSelection);
			}
			this.connect(albumSelection, 'onchange', '_onSelctionChange');
			var photoPane = dijit.byId('__photosContentPane').containerNode;
			this.connect(photoPane, 'onclick', '_onPhotoClick');
			dojo.style(photoPane, 'overflow', 'auto');
		}
	},
	_onSelctionChange : function(evt)
	{
		this._selectedPhoto = null;
		var aid = evt.target.value;
		this.setPhotosContentPane('');
		if( this._photos[aid] )
		{
			this._loadPhotos(aid, this._photos[aid]);
		}
		else
		{
			if(aid == -9999)
			{
				this.hideStandBy();
				return;
			}
			this.showStandBy();
			facebookAPI.photos_get(null, aid, null, dojo.hitch(this, '_loadPhotos', aid));
		}
	},
	_onPhotoClick : function(evt)
	{
		var target = evt.target;
		if(target && target.tagName &&  target.tagName.toLowerCase() == 'img')
		{
			 dojo.query( "img", dijit.byId('__photosContentPane').containerNode ).forEach(
				function(img) {
					dojo.style(img, 'border', '3px solid #fff');
				});
			 this._selectedPhoto = target;
			 dojo.style(target, 'border', '3px solid blue');
		}
	},
	okClick : function()
	{
		var tabContainer = dijit.byId('__image-dialog-tabs');
    	if( tabContainer.selectedChildWidget && tabContainer.selectedChildWidget.id == '__facebook-photos-tab' )
    	{
    		if(this._selectedPhoto){
    			this._done(this._selectedPhoto.getAttribute('src_big'));
    		}
    		else{
    			alert('Please select a photo.');
    		}
    	}
    	else {
    		this.inherited(arguments);
    	}
	},
	_loadPhotos2 : function(aid, photos)
	{
		this.hideStandBy();
		if( photos )
		{
			if( !this._photos[aid] )
				this._photos[aid] = photos;
			var sb = [];
			for(var i in photos)
			{
				var photo = photos[i];
				var caption = photo["caption"];
				var url = photo["src_small"];
				var photoID = photo["link"]; //photo["pid"] + "-" + photos[0].link.split("pid")[1].split("=")[1].split("&")[0];
				sb.push(dojo.string.substitute("<img title='${0}' style='height:55px; width:60px; border:3px solid #fff;' src='${1}' id='${2}' src_big='${3}'>",
				[caption, url, photoID, photo["src_big"]]));
			}
			this.setPhotosContentPane(sb.join(''));
		}
		else
		{
			this.setPhotosContentPane('');
		}
	},
	_loadPhotos : function(aid, photos)
	{
		if( photos )
		{
			this._loadPhotos2(aid, photos);
		}
		else
		{
			// hack for safari, it doesnt handle ' in json
			var thiz = this;
			var ajax = core.PageContentPane.getAjaxServices();
			ajax.getPhotos(aid, function(response, ioArgs){
				if(response && response.status == 403)
				{
					if(top)
					{
						top.location.href = APP_URL;
					}
				}
				thiz._loadPhotos2(aid, response);
			});
		}
	},
	setPhotosContentPane:function(content)
	{
		dijit.byId('__photosContentPane').attr('content', content);
	},
	show : function(page, openerId, value)
    {
		/*
		if( !this._albums )
		{
			try
			{
				this._albums = FACEBOOK_ALBUMS ? dojo.fromJson(FACEBOOK_ALBUMS) : null;
				if(this._albums)
					this._loadAlbum(this._albums);
			}
			catch(e){this._albums=null;}
		}
		*/
		if(!this._albums)
		{
			this.showStandBy();
			var ajax = core.PageContentPane.getAjaxServices();
			ajax.getAlums(FACEBOOK_USER_ID + '', dojo.hitch(this, '_loadAlbum'));
			//facebookAPI.photos_getAlbums(FACEBOOK_USER_ID + '', null, dojo.hitch(this, '_loadAlbum'));
		}
		this.inherited(arguments);
    }
});