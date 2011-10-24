import hashlib, logging, urllib, datetime, sys, base64, os, string, cgi
from google.appengine.ext import webapp
from google.appengine.api import memcache
from google.appengine.api import urlfetch
from google.appengine.ext.webapp.util import run_wsgi_app
from google.appengine.ext import db
from google.appengine.api import images
from google.appengine.api import memcache
from google.appengine.ext.webapp import template
from django.utils import simplejson
import facebook
from facebook import FacebookError

import models
from common import *
import generalcounter

# auto retry for random timeout
from gae_retry import autoretry_datastore_timeouts
autoretry_datastore_timeouts()

template.register_template_library('templatetags.basetags')

PAGE_MAKER_AP_ID = 270898012212
PAGE_CREATOR_AP_ID = 2349789223
PAGEFIN_AP_ID = 214714737191

def _getFBKeys(request):
    try:
        fb_ap_id = int(cgi.escape(request.get('fb_sig_app_id')))
        if fb_ap_id == PAGE_CREATOR_AP_ID:
            return {'PROFILE_ID':'2349789223', 'FbApiKey':'16e5fe467c95b1026d9246c9d8180526', 'FbSecret':'accd7f9ac2625bcae04e0c543c0fb749', 'FbAppName':'pagecreator', 'Theme':'tundra', 'APP_DISPLAY_NAME':'Photo Collage'}
        if fb_ap_id == PAGEFIN_AP_ID:
            return {'PROFILE_ID':'214714737191', 'FbApiKey':'e9da2b98c913b4b3a3e94f0e0e33d355', 'FbSecret':'49f617d4ff5e54e7ac4f4cdec996a4cd', 'FbAppName':'pagefin', 'Theme':'soria', 'APP_DISPLAY_NAME':'Page Creator'}
        if fb_ap_id == PAGE_MAKER_AP_ID:
            return {'PROFILE_ID':'270898012212', 'FbApiKey':'5d36429e63d84724c0544a8ef856b909', 'FbSecret':'f6b48a37c51928dd591ca954d2da75e9', 'FbAppName':'pagemaker', 'Theme':'soria', 'APP_DISPLAY_NAME':'Page Maker'}
        else:
            return {'PROFILE_ID':'398554770857', 'FbApiKey':'546ef6238dc1a5ae9a13e00d8502fc16', 'FbSecret':'3786678f0a060bceade2ea91eff718d9', 'FbAppName':'testpagefin','Theme':'soria', 'APP_DISPLAY_NAME':'Pagefin TEST APP'}
    except:
        logging.debug('except in _getFBKeys')
        # return PAGE_MAKER_AP_ID
        return {'PROFILE_ID':'270898012212', 'FbApiKey':'5d36429e63d84724c0544a8ef856b909', 'FbSecret':'f6b48a37c51928dd591ca954d2da75e9', 'FbAppName':'pagemaker', 'Theme':'soria', 'APP_DISPLAY_NAME':'Page Maker'}
    
# debug keys
#_FbApiKey = 'e9da2b98c913b4b3a3e94f0e0e33d355'
#_FbSecret = '49f617d4ff5e54e7ac4f4cdec996a4cd'
#_FbAppName = 'pagefin'

# production keys
#if os.environ['HTTP_HOST'].startswith('www.pagefin') or os.environ['HTTP_HOST'].startswith('pagefin'):
#    _FbApiKey = '16e5fe467c95b1026d9246c9d8180526'
#    _FbSecret = 'accd7f9ac2625bcae04e0c543c0fb749'
#    _FbAppName = 'pagecreator'
    
def getNewPageTemplateFB():
    return '{"backgroundImage":"","backgroundColor":"","controls":[{"type":"TextBox","text":"<P align=center><FONT size=4 face=Arial><B>Welcome to your first page</B> </FONT><BR><FONT size=4 face=Arial><FONT size=3>(click on the pencil above this box to edit this text)</FONT></FONT><BR><FONT face=Arial>Click help button on the main toolbar for more help topics, or just play around</FONT><BR><FONT size=4 face=Arial></FONT></P>","style":{"zIndex":0,"left":"118px","top":"37px","width":"480px","height":"107px"}},{"type":"Image","src":"http://www.pagefin.com/static/images/welcome_in_page.jpg","style":{"zIndex":0,"left":"157px","top":"290px","width":"314px","height":"233px"}},{"type":"TextBox","text":"<P>Click on the pencil below to change the photo</P>","style":{"zIndex":0,"left":"129px","top":"198px","width":"409px","height":"59px"}}]}'
 
def fb_get_or_create_appUser(uid, fb=None):
  """
  Find a matching AppUser or create a new one with the
  email as the key_name.
  
  Returns a AppUser for the given user.
  """
  #uid = 100000413331908
  if uid:
      logging.debug('get facebook user: %s' % str(uid))
      appUser = models.AppUser.get_by_key_name(str(uid))
      if appUser is None:
        logging.debug('create facebook user: %s' % uid)
        appUser = None
        userInfo = fb.users.getInfo([int(uid)])
        if userInfo and userInfo[0] and userInfo[0]['name']:
            name = smart_str(userInfo[0]['name'])
            logging.debug('creator facebook user: %s' % name)
            appUser = models.AppUser(key_name=str(uid), user=None)
            logging.debug('done creator facebook user: %s' % name)
        else:
            appUser = models.AppUser(key_name=str(uid), user=None)
        page = models.create_page(appUser, 'Welcome', getNewPageTemplateFB(), [])
        appUser.current_page_key = str( page.key() )
        if appUser:
            appUser.put()
      else:
          logging.debug('found facebook user: %s' % str(uid))
      return appUser
  return None

def fb_respond_to_request(request, templatefile, params=None):
  apKeys = _getFBKeys(request)
  if params is None:
    params = {}
  params['TICKS'] = datetime.datetime.now().time()
  params['debug'] = os.environ['SERVER_SOFTWARE'].startswith('Dev')
  params['HTTP_HOST'] = os.environ['HTTP_HOST']
  params['APP_ROOT'] = 'http://' + os.environ['HTTP_HOST']
  params['DOJO_VERSION'] = DOJO_VERSION
  params['APP_VERSION'] = APP_VERSION
  params['PAGE_KEY'] = PAGE_KEY
  params['SAVE_PUBLIC_KEY'] = SAVE_PUBLIC_KEY
  params['AP_PAGE_CREATOR'] = apKeys['APP_DISPLAY_NAME']
  params['FbApiKey'] = apKeys['FbApiKey']
  params['USE_FACEBOOK_PHOTOS'] = USE_FACEBOOK_PHOTOS
  params['ALLOW_PHOTOS_UPLOAD'] = ALLOW_PHOTOS_UPLOAD
  params['THEME'] = apKeys['Theme']
  params['APP_URL'] = 'http://apps.facebook.com/' + apKeys['FbAppName']
  params['PROFILE_ID'] = apKeys['PROFILE_ID']
  return __render(templatefile, params)

def __render(templatefile, params):
  if not templatefile.endswith('.html'):
    templatefile += '.html'
  directory = os.path.dirname(__file__)
  path = os.path.join(directory, os.path.join('templates', templatefile))
  return template.render(path, params, DEBUG) 

def facebook_user_login(request):
    apKeys = _getFBKeys(request)
    fb = facebook.Facebook(apKeys['FbApiKey'], apKeys['FbSecret'])
    if fb.added == True:
        return True
    else:
        return False
def set_user_last_page(pk, appUser):
    appUser.current_page_key = str( pk )
    appUser.put()
    
class MainPage(webapp.RequestHandler):
   def get(self):
    try:
       self.serve()
    except CapabilityDisabledError:
        logging.error('Datastore not available')
        self.oOps()
    except:
        self.oOps()
   def oOps(self):
       apKeys = _getFBKeys(self.request)
       url = 'http://apps.facebook.com/' + apKeys['FbAppName']
       params = {}
       params['APP_URL'] = url
       self.response.out.write(fb_respond_to_request(self.request, 'fb_oops.html', params))
       
   def serve(self):
    ## instantiate the Facebook API wrapper with your FB App's keys
    apKeys = _getFBKeys(self.request)
    fb = facebook.Facebook(apKeys['FbApiKey'], apKeys['FbSecret'])
    logging.debug('Beginning main entry point')
    ## check that the user is logged into FB and has added the app
    ## otherwise redirect to where the user can login and install
    hasSession = False
    try:
        logging.debug('get fb session')
        hasSession = fb.check_session(self.request)
    except urlfetch.DownloadError:
        logging.debug('try again, first get fb session attempt failed')
        hasSession = fb.check_session(self.request)
        
    if hasSession and fb.added:
        pass
    else:
        if fb.added:
            url = 'http://apps.facebook.com/' + apKeys['FbAppName']
            self.response.out.write('<script language="javascript">top.location.href="' + url + '"</script>')
            return
        else:
            url = fb.get_add_url()
            self.response.out.write('<script language="javascript">top.location.href="' + url + '"</script>')
            return
    uid = str(fb.uid)
    logging.debug('Beginning discovery for Facebook userId: %s' % uid)
    user = fb_get_or_create_appUser(fb.uid, fb)
    page = None
    if user and user.current_page_key:
        page = db.get(user.current_page_key)
    just_installed = False
    params = {}
    if page is not None:
        json = createPageJson(page, False)
        params['page'] = json
    params['FACEBOOK_USER_ID'] = uid
    params['FACEBOOK_USER_KEY'] = hashlib.md5(uid + APP_SAVE_SECRET_KEY).hexdigest()
    #params['ASK_AUTO_STREAM'] = str( user.ask_for_auto_stream ).lower()
    if self.request.get('installed') == '1':
        just_installed = True
    if user.showWelcome == True or just_installed == True:
        params['just_installed'] = True
    try:
        logging.debug('Get isFan for userId: %s' % uid)
        isFan = fb.pages.isFan(apKeys['PROFILE_ID'], [fb.uid])
        if isFan == False:
            params['IsNotFan'] = True
    except:   
        logging.debug('Failed get isFan for userId: %s' % uid)
    #params['IsNotFan'] = True
    self.response.out.write(fb_respond_to_request(self.request, 'fb_app_base.html', params))

class GetFBAlbumsHandler(webapp.RequestHandler):
    def get(self):
        apKeys = _getFBKeys(self.request)
        fb = facebook.Facebook(apKeys['FbApiKey'], apKeys['FbSecret'])
        uid = cgi.escape(self.request.get('uid'))
        session_key = cgi.escape(self.request.get('fb_sig_session_key'))
        jsonAlbums = []
        if uid and session_key:
            fb.session_key = session_key
            albums = fb.photos.getAlbums([int(uid)])
            for album in albums:
                jsonAlbum = {}
                jsonAlbum['name'] = album["name"].replace('\'','')
                jsonAlbum['aid'] = album["aid"]
                jsonAlbums.append(jsonAlbum)
        self.response.out.write(simplejson.dumps(jsonAlbums))
            
class GetFBPhotosHandler(webapp.RequestHandler):
    def get(self):
        apKeys = _getFBKeys(self.request)
        fb = facebook.Facebook(apKeys['FbApiKey'], apKeys['FbSecret'])
        uid = cgi.escape(self.request.get('uid'))
        session_key = cgi.escape(self.request.get('fb_sig_session_key'))
        aid = cgi.escape(self.request.get('aid'))
        jsonArray = []
        if uid and session_key:
            fb.session_key = session_key
            try:
                jsonArray = self.fetch(fb, aid)
            except urlfetch.DownloadError:
                jsonArray = self.fetch(fb, aid)
            except FacebookError:
                self.error(403)
        self.response.out.write(simplejson.dumps(jsonArray))
    def fetch(self, fb, aid):
        jsonArray = []
        photos = fb.photos.get(aid=aid)
        for photo in photos:
            json = {}
            json['caption'] = photo['caption'].replace('\'','')
            json['src_small'] = photo['src_small']
            json['link'] = photo['link']
            json['src_big'] = photo['src_big']
            jsonArray.append(json)
        return jsonArray

class ToggleWelcomeMessage(webapp.RequestHandler):
     def get(self):
        uid = cgi.escape(self.request.get('uid'))
        v = bool(cgi.escape(self.request.get('v')))
        # FACEBOOK_USER_KEY
        fuk = cgi.escape(self.request.get('fuk'))
        yes = canSavePage(uid, fuk)
        if yes == True:
           appUser = models.AppUser.get_by_key_name(str(uid))
           appUser.showWelcome = not(v);
           appUser.put()
           self.response.out.write('ok')
        else:
            self.failed()
class CreateHandler(webapp.RequestHandler):
    def get(self):
        tags = cgi.escape(self.request.get('tags').lower()).split(',')
        tags = [tag.strip() for tag in tags]
        name = cgi.escape(self.request.get('name'))
        uid = cgi.escape(self.request.get('uid'))
        # FACEBOOK_USER_KEY
        fuk = cgi.escape(self.request.get('fuk'))
        yes = canSavePage(uid, fuk)
        apKeys = _getFBKeys(self.request)
        fb = facebook.Facebook(apKeys['FbApiKey'], apKeys['FbSecret'])
        session_key = cgi.escape(self.request.get('fb_sig_session_key'))
        if name != '' and uid != '' and yes == True and fb:
            fb.session_key = session_key
            logging.debug('creating page: %s' % name)
            #TODO need to check session here
            if uid or DEBUG:
                appUser = fb_get_or_create_appUser(uid, fb)
                self.create(appUser, name, tags)
            else:
                self.failed() 
        else:
            self.failed()
            
    def create(self, appUser, name, tags=None):
        generalcounter.increment(PAGE_CREATED_COUNTER)
        page = models.create_page(appUser, name, getNewPageTemplate(name), tags)
        page_id = page.key().id()
        logging.debug('created pageId: %s' % str(page_id))
        #create test data
        #for i in range(1, 50):
        #    name = name + str(i)
        #    models.create_page(appUser, name, getNewPageTemplate(name), tags)
        page_key = str( page.key() )
        set_user_last_page(page_key, appUser)
        logging.debug('set set_user_last_page: %s' % page_key)
        json = createPageJson(page)
        logging.debug('create page json')
        self.response.out.write(simplejson.dumps(json))
        
    def failed(self):
        json = {}
        json['error'] = True
        json['message'] = 'Failed to create new page.'
        self.response.out.write(simplejson.dumps(json))

class GetPageHandler(webapp.RequestHandler):
    def get(self):
        pk = cgi.escape(self.request.get(PAGE_KEY))
        spk = cgi.escape(self.request.get(SAVE_PUBLIC_KEY))
        uid = cgi.escape(self.request.get('uid'))
        if pk and spk and canSavePage(pk, spk) == True:
            page = models.Page.get(pk)
            appUser = models.AppUser.get_by_key_name(str(uid))
            if page and appUser:
                set_user_last_page(str( pk ), appUser)
                self.response.out.write(simplejson.dumps(createPageJson(page)))
            else:
                self.error(403)  
        else:
            self.error(403) 
        
class GetUserPagesHandler(webapp.RequestHandler):
    def get(self):
        pageIndex = int(self.request.get('p', '0'))
        uid = cgi.escape(self.request.get('uid'))
        appUser = models.AppUser.get_by_key_name(str(uid))
        apKeys = _getFBKeys(self.request)
        fb = facebook.Facebook(apKeys['FbApiKey'], apKeys['FbSecret'])
        if appUser and fb:
          pages, next = models.get_pages_for_user(appUser, pageIndex, 16)
          if next:
           nexturi = True
          else:
           nexturi = False
          if pageIndex > 1:
           prevuri = True
          elif pageIndex == 1:
           prevuri = True
          else:
           prevuri = False
          
          params = {}
          params['pages'] = pages;
          if nexturi:
              params['nextIndex'] = str((pageIndex + 1))
          if prevuri:
              params['prevIndex'] = str((pageIndex - 1))
          params['pageIndex'] = pageIndex
          self.response.out.write(fb_respond_to_request(self.request, 'fb_open_page.html', params))
        else:
         self.error(403)      

class FBTabHandler(webapp.RequestHandler):
    def get(self):
        self.response.out.write('coming soon...')
        
class GetGetAllpageCount(webapp.RequestHandler):
    def get(self):
        #if users.is_current_user_admin() or os.environ['SERVER_SOFTWARE'].startswith('Dev'):
        self.response.out.write('count: ' + str(generalcounter.get_count(PAGE_CREATED_COUNTER)))
        
application = webapp.WSGIApplication(
                                     [('/fb/', MainPage), 
                                      ('/fb/create/.*', CreateHandler),
                                      ('/fb/get/.*', GetUserPagesHandler),
                                      ('/fb/getpage/.*', GetPageHandler),
                                      ('/fb/getphotos/.*', GetFBPhotosHandler),
                                      ('/fb/getalbums/.*', GetFBAlbumsHandler),
                                      ('/fb/pagecount/.*', GetGetAllpageCount),
                                      ('/fb/togglewelcomemessage/.*', ToggleWelcomeMessage),
                                      ('/fb/tab.*', FBTabHandler)
                                      ],
                                     debug=True)
def main():
  run_wsgi_app(application)

if __name__ == "__main__":
  main()