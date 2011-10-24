#!/user/bin/env python
import hashlib, logging, urllib, datetime, sys, base64, os, string
from google.appengine.ext import db
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

class SearchHandler(webapp.RequestHandler):
    def get(self):
        pageIndex = int(self.request.get('p', '0'))
        query = cgi.escape(self.request.get('q').strip())
        pages = []
        params = {}
        if query:
          query = query.lower()
          # ListProperty magically does want we want: search for the occurrence
          # of the term in any of the tags.
          pages, next = models.get_search_pages(query, pageIndex)
          if next:
           nexturi = 'http://' + os.environ['HTTP_HOST'] + '/search/?q=' + query + '&p=%d' % (pageIndex + 1)
          else:
           nexturi = None
          if pageIndex > 1:
           prevuri = 'http://' + os.environ['HTTP_HOST'] + '/search/?q=' + query + '&p=%d' % (pageIndex - 1)
          elif pageIndex == 1:
           prevuri = 'http://' + os.environ['HTTP_HOST'] + '/search/?q=' + query
          else:
           prevuri = None
          params['pages'] = pages
          params['nexturi'] = nexturi
          params['prevuri'] = prevuri
          #params['page_count'] = len(pages)
        self.response.out.write(respond_to_request(self.request, users.get_current_user(), 'search.html', params))
          
application = webapp.WSGIApplication([
    #these paths are relative to app.yaml
    ('/search/*', SearchHandler)
    ], debug=DEBUG)    

def main():
    wsgiref.handlers.CGIHandler().run(application)
    
if __name__=='__main__':
     main()
     
