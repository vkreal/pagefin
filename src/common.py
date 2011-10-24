#!/user/bin/env python
import sys, os, functools, datetime, cgi, hashlib, types
from google.appengine.api import users
from google.appengine.ext.webapp import template
import urllib2, urllib
from google.appengine.api import urlfetch
from django.utils import simplejson
from django.utils.functional import Promise
try:
  # When deployed
  from google.appengine.runtime import DeadlineExceededError
  from google.appengine.runtime import OverQuotaError
  from google.appengine.runtime import RequestTooLargeError
  from google.appengine.runtime import CapabilityDisabledError
 
except ImportError:
  # In the development server
  from google.appengine.runtime.apiproxy_errors import DeadlineExceededError
  from google.appengine.runtime.apiproxy_errors import OverQuotaError
  from google.appengine.runtime.apiproxy_errors import RequestTooLargeError
  from google.appengine.runtime.apiproxy_errors import CapabilityDisabledError

ALLOW_PHOTOS_UPLOAD = True
USE_FACEBOOK_PHOTOS = True
DEBUG = os.environ['SERVER_SOFTWARE'].startswith('Dev')
APP_SAVE_SECRET_KEY = '{20BA8F5C-4413-4d83-AAC6-30CE0821A5E4}'
PAGE_KEY = 'pk'
SAVE_PUBLIC_KEY = 'spk'
APP_VERSION = '1.031312165'
APP_STATIC = 'static-' + APP_VERSION
RECAPTCHA_VERIFY_SERVER="api-verify.recaptcha.net"
APP_NAME = 'Pagefin'
AP_PAGE_CREATOR = 'Page Creator'
APP_META_DESCRIPTION = APP_NAME + '&reg; is a web page and web site sharing service that allows you to easily create, link and share your web pages and web sites on MySpace&reg;, eBay&reg;, blogs, message boards and postcards. No account required, create your pages today!'
APP_META_KEYWORDS = 'page creator, blog creator, postcards, web pages, web sites, images, photos, videos, myspace, ebay, web pages hosting, web sites hosting'
#APP_FOOTER = APP_NAME + '&reg; is a free web page sharing service</strong> that lets you easily create, link, and share your web pages and web sites on <a href="http://facebook.com">Facebook&reg;</a>, <a href="http://myspace.com">MySpace&reg;</a>, <a href="http://ebay.com">eBay&reg;</a>, <a href="http://orkut.com">Orkut</a> Scrapbooks, blogs, postcards, and message boards. NO LOGIN REQUIRED!'
APP_ENTRY_TITLE = APP_NAME + ' - Free Page Creating, Hosting, Page Sharing &amp; Site Hosting'
RECAPTCHA_PUBLIC_KEY = '6LeqlggAAAAAAD6PLuAYU9EyveQXs8JoAI4RR-Wz'
RECAPTCHA_PRIVATE_KEY = '6LeqlggAAAAAAFcYAzZ1fn6zwNKHlZRuoKLnBrPu'
DOJO_VERSION = 'dojo-src'
PAGE_CREATED_COUNTER = 'page_created_counter'
SEARCH_PAGE_SIZE = 20
PAGE_MEMCACHE_HTML = 'page-html'
BETA_VERSION = 'Beta'
"""
LOCALE_STRINGS_US_EN = {'main_sub_title' : 'Thinking of creating a website?', 
                  'main_sub_title2': APP_NAME + ' is a free and easy way to create and share webpages. NO LOGIN REQUIRED!',
                  'main_create_ul':'Create',
                  'main_create_li':'rich web pages easily',
                  'main_point_and_click_ul':'Point and click',
                  'main_point_and_click_li':'drag and drop'}
"""
def respond_to_request(request, user, templatefile, params=None, theme='soria'):
  if params is None:
    params = {}
  params['TICKS'] = datetime.datetime.now().time()
  params['AP_PAGE_CREATOR'] = AP_PAGE_CREATOR;
  params['debug'] = DEBUG
  params['APP_NAME'] = APP_NAME
  params['APP_META_DESCRIPTION'] = APP_META_DESCRIPTION
  params['APP_META_KEYWORDS'] = APP_META_KEYWORDS
  #params['APP_FOOTER'] = APP_FOOTER
  params['HTTP_HOST'] = os.environ['HTTP_HOST']
  params['APP_ROOT'] = 'http://' + os.environ['HTTP_HOST']
  params['PAGE_KEY'] = PAGE_KEY
  params['SAVE_PUBLIC_KEY'] = SAVE_PUBLIC_KEY
  params['DOJO_VERSION'] = DOJO_VERSION
  params['APP_VERSION'] = APP_VERSION
  params['BETA_VERSION'] = BETA_VERSION
  params['THEME'] = theme
  #params['RPC'] = os.environ['PATH_INFO'] + 'rpc'
  if user:
    params['ALLOW_PHOTOS_UPLOAD'] = ALLOW_PHOTOS_UPLOAD
    params['user'] = user
    params['logout'] = cgi.escape(users.create_logout_url("/"))
  else:
    #params['login'] = users.create_login_url(request.path)
    params['login'] = cgi.escape(users.create_login_url(request.path))
    
  np = request.get('n') == '1'
  if np:
    params['np'] = np
  if not templatefile.endswith('.html'):
    templatefile += '.html'
  directory = os.path.dirname(__file__)
  path = os.path.join(directory, os.path.join('templates', templatefile))
  return template.render(path, params, DEBUG)

#Shortens a URL using is.gd - if any errors occur it will return the original url.
def shortenUrl(url):    
    try:
        result = urlfetch.fetch("http://is.gd/api.php?longurl=" + url)
        if result.status_code == 200:
            return result.content
        else:
            return url
    except:
        return url
def creat_page_public_key(page_key):
    return hashlib.md5(page_key + APP_SAVE_SECRET_KEY).hexdigest()

def createPageJson(page, content=True):
    page_key = str( page.key() )
    page_id = page.key().id()
    url = 'http://' + os.environ['HTTP_HOST'] + '/p/' + str( page_id ) + '.htm'
    json = {}
    #json['error'] = False
    json[SAVE_PUBLIC_KEY] = creat_page_public_key(page_key)
    json[PAGE_KEY] = page_key
#    json['id'] = page_id
    json['shorten'] = shortenUrl(url)
    json['name'] = page.name
    if content == True:
        json['content'] = page.content.content
        if page.tags != None:
            json['tags'] = simplejson.dumps(page.tags)
    #json['safeMode'] = page.safeMode
    #json['showGrid'] = page.showGrid
    #json['image_upload_count'] = str(page.image_upload_count)
    #json['created'] = page.created.__str__()
    json['url'] = url
    json['edit'] = 'http://' + os.environ['HTTP_HOST'] + '/a/edit/' + page_key
    return json  

def canSavePage(page_key, sk):
    return sk == hashlib.md5(page_key + APP_SAVE_SECRET_KEY).hexdigest()
  
def no_cache(method):
    """Set the response headers to disallow caching."""
    @functools.wraps(method)
    def wrap(self, *args, **kwds):
        self.response.headers['Cache-Control'] = 'no-store'
        self.response.headers['Pragma'] = 'no-cache'
        return method(self, *args, **kwds)
    return wrap

class RecaptchaResponse(object):
    def __init__(self, is_valid, error_code=None):
        self.is_valid = is_valid
        self.error_code = error_code

def RecaptchaSubmit (recaptcha_challenge_field,
            recaptcha_response_field,
            private_key,
            remoteip):
    """
    Submits a reCAPTCHA request for verification. Returns RecaptchaResponse
    for the request

    recaptcha_challenge_field -- The value of recaptcha_challenge_field from the form
    recaptcha_response_field -- The value of recaptcha_response_field from the form
    private_key -- your reCAPTCHA private key
    remoteip -- the user's ip address
    """

    if not (recaptcha_response_field and recaptcha_challenge_field and
            len (recaptcha_response_field) and len (recaptcha_challenge_field)):
        return RecaptchaResponse (is_valid = False, error_code = 'incorrect-captcha-sol')
    

    def encode_if_necessary(s):
        if isinstance(s, unicode):
            return s.encode('utf-8')
        return s

    params = urllib.urlencode ({
            'privatekey': encode_if_necessary(private_key),
            'remoteip' :  encode_if_necessary(remoteip),
            'challenge':  encode_if_necessary(recaptcha_challenge_field),
            'response' :  encode_if_necessary(recaptcha_response_field),
            })

    request = urllib2.Request (
        url = "http://%s/verify" % RECAPTCHA_VERIFY_SERVER,
        data = params,
        headers = {
            "Content-type": "application/x-www-form-urlencoded",
            "User-agent": "reCAPTCHA Python"
            }
        )
    
    httpresp = urllib2.urlopen (request)

    return_values = httpresp.read ().splitlines ();
    httpresp.close();

    return_code = return_values [0]

    if (return_code == "true"):
        return RecaptchaResponse (is_valid=True)
    else:
        return RecaptchaResponse (is_valid=False, error_code = return_values [1])

def getNewPageTemplate(title=None):
    if title == None:
        title = 'Page Title (click me to edit.)'
    return '{"controls":[{"type":"TextBox","text":"<P><B><FONT size=4 face=Arial>'+title+'</FONT></B></P>","style":{"zIndex":0,"left":"52px","top":"25px","width":"300px","height":"116px"}}]}'

def smart_str(s, encoding='utf-8', strings_only=False, errors='strict'): 
      """ 
     Returns a bytestring version of 's', encoded as specified in 'encoding'. 
   
      If strings_only is True, don't convert (some) non-string-like objects. 
      """ 
      if strings_only and isinstance(s, (types.NoneType, int)): 
          return s 
      if isinstance(s, Promise): 
         return unicode(s).encode(encoding, errors) 
      elif not isinstance(s, basestring): 
          try: 
              return str(s) 
          except UnicodeEncodeError: 
              return unicode(s).encode(encoding, errors) 
      elif isinstance(s, unicode): 
          return s.encode(encoding, errors) 
      elif s and encoding != 'utf-8': 
          return s.decode('utf-8', errors).encode(encoding, errors) 
      else: 
          return s      