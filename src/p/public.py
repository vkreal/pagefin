#!/user/bin/env python
import hashlib, logging, urllib, datetime, sys, base64, os
from google.appengine.ext import db
from google.appengine.api import memcache
import wsgiref.handlers
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
from google.appengine.api import users
from google.appengine.ext.webapp.util import run_wsgi_app
from django.utils import simplejson
from models import *
from common import *

# auto retry for random timeout
from gae_retry import autoretry_datastore_timeouts
autoretry_datastore_timeouts()

def _respond(request, templatefile, params=None):
  if params is None:
    params = {}
  if not templatefile.endswith('.html'):
    templatefile += '.html'
  directory = os.path.dirname(__file__)
  path = os.path.join(directory, os.path.join('../templates', templatefile))
  return template.render(path, params, os.environ['SERVER_SOFTWARE'].startswith('Dev'))

class PageHandler(webapp.RequestHandler):
    def get(self, page_id):
        # long
        page = None
        page_id = page_id.split('.')[0]
        cache_key = PAGE_MEMCACHE_HTML + page_id
        html = memcache.get( cache_key )
        if html is not None:
            logging.debug('Serving from memory cache: %s' % str(page_id))
            self.response.out.write(html)   
        else:
            try:
                logging.debug('Serving page: %s' % str(page_id))
                page_id = long(page_id)
                page = Page.get_by_id(page_id)
                if page:
                    json = simplejson.loads(page.content.content)
                    html = _respond(self.request, 'publish_base.html', {'form':json, 'name':page.name})
                    logging.debug('Setting serving page into memory cache: %s' % str(page_id))
                    # cache for one week
                    memcache.set(cache_key, html, 604800)
                    self.response.out.write(html)        
                else:
                    logging.error('Page not found when serving page: %s' % str(page_id))
                    self.response.out.write(_respond(self.request, 'page_oops.html')) 
            except:
                logging.error('Error serving page: %s' % str(page_id))
                self.response.out.write(_respond(self.request, 'page_oops.html'))
                

application = webapp.WSGIApplication([
    #these paths are relative to app.yaml
    ('/p/(.*)', PageHandler)], debug=True)    

def main():
    wsgiref.handlers.CGIHandler().run(application)
    
if __name__=='__main__':
     main()