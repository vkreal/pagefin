#!/user/bin/env python
import hashlib, logging, urllib, datetime, sys, base64, os, string
from google.appengine.ext import db
from google.appengine.api import images
from google.appengine.api import memcache
import wsgiref.handlers
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext.webapp.util import run_wsgi_app
from django.utils import simplejson
import models
from common import *
import cgi
import generalcounter

# auto retry for random timeout
from gae_retry import autoretry_datastore_timeouts
autoretry_datastore_timeouts()

# Add our custom Django template filters to the built in filters
template.register_template_library('templatetags.basetags')

class MainHandler(webapp.RequestHandler):
    def get(self):
        user = users.get_current_user()
        if user:
          appUser = models.get_or_create_appUser()
          self.response.out.write(respond_to_request(self.request, user, 'app_base.html'))
        else:
         self.response.out.write(respond_to_request(self.request, user, 'app_base.html'))

class CreateHandler(webapp.RequestHandler):
    def get(self):
        recaptcha_challenge = cgi.escape(self.request.get('recaptcha_challenge_field'))
        recaptcha_response = cgi.escape(self.request.get('recaptcha_response_field'))
        tags = cgi.escape(self.request.get('tags').lower()).split(',')
        tags = [tag.strip() for tag in tags]
        name = cgi.escape(self.request.get('name'))
        if recaptcha_challenge != '' and recaptcha_response != '' and name != '':
            recaptchaResponse = RecaptchaSubmit(recaptcha_challenge, recaptcha_response, 
                                                 '6LeqlggAAAAAAFcYAzZ1fn6zwNKHlZRuoKLnBrPu', os.environ['REMOTE_ADDR'])
            
            if recaptchaResponse.is_valid or DEBUG:
                appUser = models.get_or_create_appUser()
                self.create(appUser, name, tags)
            else:
                self.failed() 
        else:
            self.failed()
            
    def create(self, appUser, name, tags=None):
        generalcounter.increment(PAGE_CREATED_COUNTER)
        p = models.create_page(appUser, name, getNewPageTemplate(name), tags)
        #json = createPageJson(p)
        json = {}
        json['edit'] = 'http://' + os.environ['HTTP_HOST'] + '/a/edit/' + str( p.key() )
        self.response.out.write(simplejson.dumps(json))
        
    def failed(self):
        json = {}
        json['error'] = True
        json['message'] = 'Failed to create new page.'
        self.response.out.write(simplejson.dumps(json))
        
class EditHandler(webapp.RequestHandler):
    def get(self, page_key):
        p = models.Page.get(page_key)
        if p:
            #appUser = models.get_or_create_appUser()
            json = createPageJson(p, False)
            params = {}
            params['page'] = json
            self.response.out.write(respond_to_request(self.request, users.get_current_user(), 'app_edit.html', params))
        else:
            self.error(403)
            
class SaveHandler(webapp.RequestHandler):
    def post(self):
        page_key = cgi.escape(self.request.get('pk'))
        save_key = cgi.escape(self.request.get('spk'))
        sjson = self.request.get('__saveHidden')
        saved = False
        if sjson != '' and page_key and save_key:
            #json = simplejson.loads(sjson)
            if canSavePage(page_key, save_key):
                page = models.Page.get(page_key)
                if page:
                    if page.content.content != sjson:
                        page.content.content = sjson
                        memcache.delete(PAGE_MEMCACHE_HTML + str(page.key().id()))
                        #update updated property
                        db.put([page.content, page])
                    saved = True
                    self.response.out.write('save')
        if not saved:
            self.error(403)
            
class LoggerHandler(webapp.RequestHandler):
    def get(self):
        page_key = cgi.escape(self.request.get('pk'))
        save_key = cgi.escape(self.request.get('spk'))
        message = cgi.escape(self.request.get('message'))
        if message and canSavePage(page_key, save_key):
            logging.debug(message)
        self.response.out.write('save')
                                      
class JsonPageHandler(webapp.RequestHandler):
    def get(self, page_key):
        page_key = page_key.split('.')[0]
        p = models.Page.get(page_key)
        #appUser = models.get_or_create_appUser()
        if p:
            json = createPageJson(p)
            self.response.out.write('JSON_PAGE=' + simplejson.dumps(json))
                                    
class DebugHandler(webapp.RequestHandler):
    def get(self):
        if users.is_current_user_admin() or DEBUG:
            appUser = models.get_or_create_appUser()
            params = {}
            params['pages_set'] = models.get_all_pages_for_user(appUser)
            params['pages_none_user'] = models.get_pages_for_nonuser()
            params['PATH_INFO'] = os.environ['PATH_INFO']
            params['HTTP_HOST'] = os.environ['HTTP_HOST']
            params['pages_new_ordered'], next = models.get_pages_newest()
            self.response.out.write(respond_to_request(self.request, users.get_current_user(), 'debug_base.html', params))
        else:
            self.error(403)

class DeleteHandler(webapp.RequestHandler):
    def get(self):
        page_key = cgi.escape(self.request.get('pk'))
        save_key = cgi.escape(self.request.get('spk'))
        redirect = self.request.get('redirect')
        if page_key and save_key and canSavePage(page_key, save_key):
            appUser = models.get_or_create_appUser()
            models.del_page(page_key, appUser)
            if redirect:
                self.redirect(redirect) 
            else:
                json = {}
                json['success'] = True
                self.response.out.write(simplejson.dumps(json))
        else:
            self.error(403)


class GetUserPagesHandler(webapp.RequestHandler):
    def get(self):
        pageIndex = int(self.request.get('p', '0'))
        appUser = models.get_or_create_appUser()
        if appUser:
          pages, next = models.get_pages_for_user(appUser, pageIndex, 20)
          if next:
           nexturi = 'http://' + os.environ['HTTP_HOST'] + '/a/get/?p=%d' % (pageIndex + 1)
          else:
           nexturi = None
          if pageIndex > 1:
           prevuri = 'http://' + os.environ['HTTP_HOST'] + '/a/get/?p=%d' % (pageIndex - 1)
          elif pageIndex == 1:
           prevuri = 'http://' + os.environ['HTTP_HOST'] + '/a/get/'
          else:
           prevuri = None
          
          params = {}
          jsonPages=[] 
          for page in pages:
              json = {}
              json['edit'] = 'http://' + os.environ['HTTP_HOST'] + '/a/edit/' + str(page.key())
              json['name'] = page.name
              json['id'] = str(page.key().id())
              json['updated'] = page.updated 
              jsonPages.append(json)
          if nexturi:
              params['nextIndex'] = str((pageIndex + 1))
          if prevuri:
              params['prevIndex'] = str((pageIndex - 1))
          params['pages'] = jsonPages
          self.response.out.write(respond_to_request(self.request, users.get_current_user(), 'open_page.html', params))
        else:
         self.error(403)

class ImageSharingUploadImage(webapp.RequestHandler):
  """Handler for uploading images."""
  def post(self):
    """Process the image upload form.
    """
    page_key = cgi.escape(self.request.get('pk'))
    save_key = cgi.escape(self.request.get('spk'))
    if canSavePage(page_key, save_key) == False:
      self.error(400)
      self.response.out.write('Access Denied')
    else:
        page = db.get(page_key)
        # Get the actual data for the picture
        img_data = self.request.POST.get('the_file').file.read()
        json = {}
        params = {}
        try:
          img = images.Image(img_data)
          # Basically, we just want to make sure it's a PNG
          # since we don't have a good way to determine image type
          # through the API, but the API throws an exception
          # if you don't do any transforms, so go ahead and use im_feeling_lucky.
          #img.im_feeling_lucky()
          #png_data = img.execute_transforms(images.PNG)
    
          #img.resize(60, 100)
          #thumbnail_data = img.execute_transforms(images.PNG)
          params['json'] = json
          if page.image_upload_count > 10:
            json['error'] = 'Sorry, we only allow 10 uploads per page. try using \'Add Image URL\' tab.'
          else:
            pic = models.create_image(models.get_or_create_appUser(), page, img_data)
            page.image_upload_count = page.image_upload_count + 1
            page.put()
            json['url'] = 'http://' + os.environ['HTTP_HOST'] + '/a/i/' + str( pic.key().id() )
        except images.BadImageError:
          json['error'] = 'Sorry, we had a problem processing the image provided. Try again later.'
        except images.NotImageError:
          json['error'] = 'Sorry, we don\'t recognize that image format. We can process JPEG, GIF, PNG, BMP, TIFF, and ICO files.'
        except images.LargeImageError:
         json['error'] = 'Sorry, the image provided was too large for us to process. 1 MEG is the size limit, try using \'Add Image URL\' tab or resizing your image and upload again.'
        except RequestTooLargeError:
          json['error'] = 'Sorry, the image provided was too large for us to process. 1 MEG is the size limit, try using \'Add Image URL\' tab or resizing your image and upload again.'
        finally:
          self.response.out.write(respond_to_request(self.request, None, 'common/iframeJsonResponse.html', params))

class ServeImage(webapp.RequestHandler):
    def get(self, image_id):
        if image_id:
            image_id = long(image_id)
            imageModel = models.Picture.get_by_id(image_id)
            if imageModel:
                self.response.out.write(imageModel.image.img_data)
            else:
                self.error(403)
        else:
            self.error(403)                  
class TestDataHandler(webapp.RequestHandler):
    def get(self):
        if users.is_current_user_admin() or DEBUG:
            appUser = models.get_or_create_appUser()
            for i in range(50):
                models.create_page(appUser, 'Test Data:' + str(i), '{}', 'Car,Porsche,vorun,jaydn,kreal'.split(','))
            self.response.out.write('done')
        else:
            self.error(403)

class RenameHandler(webapp.RequestHandler):
    def get(self):
        page_key = cgi.escape(self.request.get('pk'))
        save_key = cgi.escape(self.request.get('spk'))
        name = cgi.escape(self.request.get('name'))
        if name != '' and page_key and save_key and canSavePage(page_key, save_key):
            page = models.Page.get(page_key)
            if page:
                page.name = name
                page.put()
            json = {}
            json['success'] = True
            self.response.out.write(simplejson.dumps(json))
        else:
            self.error(403)

class ShortenUrlHandler(webapp.RequestHandler):
    def get(self):
        url = cgi.escape(self.request.get('url'))
        s = shortenUrl(url)
        json = {}
        json['shorten'] = s
        self.response.out.write(simplejson.dumps(json))

class PreviewImageHandler(webapp.RequestHandler):
    def get(self):
        url = cgi.escape(self.request.get('url'))
        self.response.out.write(respond_to_request(self.request, None, 'common/previewImage.html', {'imageurl':url}))
            
application = webapp.WSGIApplication([
    #these paths are relative to app.yaml
    ('/a/', MainHandler),
    ('/a/i/([-\w]+)', ServeImage),
    ('/a/edit/([-\w]+)', EditHandler),
    ('/a/delete/.*', DeleteHandler),
    ('/a/create/.*', CreateHandler),
    ('/a/save/.*', SaveHandler),
    ('/a/get/.*', GetUserPagesHandler),
    ('/a/jsonpage/(.*)', JsonPageHandler),
    ('/a/upload/.*', ImageSharingUploadImage),
    ('/a/debug/.*', DebugHandler),
    ('/a/rename/.*', RenameHandler),
    ('/a/logger/.*', LoggerHandler),
    ('/a/shortenurl/.*', ShortenUrlHandler),
    ('/a/previewimage/.*', PreviewImageHandler),
    ], debug=DEBUG)    

def main():
    wsgiref.handlers.CGIHandler().run(application)
    
if __name__=='__main__':
     main()
     
