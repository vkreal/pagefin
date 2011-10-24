from google.appengine.ext import db
import sys, datetime, logging, hashlib, string 
from google.appengine.api import memcache
from google.appengine.ext import search
from google.appengine.api import users
from common import *
PAGE_SIZE = 10
#class PageFolder(db.Model):
#    created = db.DateTimeProperty(auto_now_add=True)
#    name = db.StringProperty(required=False)

class AppUser(db.Expando):
    user = db.UserProperty()
    # facebook properties
    current_page_key = db.StringProperty(required=False)
    #ask_for_auto_stream  = db.BooleanProperty(default=False)
    # end facebook properties
    # email store user email address
    showWelcome = db.BooleanProperty(default=True)
    first_name = db.StringProperty(required=False)
    last_name = db.StringProperty(required=False)
    name = db.StringProperty(required=False)
    created = db.DateTimeProperty(auto_now_add=True)
    updated = db.DateTimeProperty(auto_now=True)
    #root_folder = db.ReferenceProperty(PageFolder, required=True)
    def __unicode__(self):
        return '%s %s' % (self.first_name, self.last_name)
        
class PageContent(db.Model):
    content = db.TextProperty(default='{}')

class Page(search.SearchableModel):
    #search.SearchableModel
    @classmethod
    def SearchableProperties(cls):
        return [['name'], ['tags']]
    ip = db.StringProperty()
    owner = db.ReferenceProperty(AppUser, required=False, collection_name='page_set')
    name = db.StringProperty(required=True)
    created = db.DateTimeProperty(auto_now_add=True)
    updated = db.DateTimeProperty(auto_now=True)
    published = db.BooleanProperty(default=False)
    published_fb_stream = db.BooleanProperty(default=False)
    safeMode = db.BooleanProperty(default=False)
    showGrid = db.BooleanProperty(default=True)
    count = db.IntegerProperty(default=0)
    #description = db.StringProperty()
    content = db.ReferenceProperty(PageContent, required=True)
    tags = db.StringListProperty()
    # track image upload per page
    image_upload_count = db.IntegerProperty(default=0)
    # track comments upload per page
    # comments_count = db.IntegerProperty(default=0)

class PictureContent(db.Model):
  img_data = db.BlobProperty()
  
class Picture(db.Expando):
  ip = db.StringProperty()
  owner = db.ReferenceProperty(AppUser, required=False, collection_name='picture_set')
  created = db.DateTimeProperty(auto_now_add=True)
  title = db.StringProperty()
  caption = db.StringProperty(multiline=True)
  # reference to the page that uploaded this image
  page = db.ReferenceProperty(Page, required=False, collection_name='page_pictures')
  image = db.ReferenceProperty(PictureContent, required=True)
  thumbnail_data = db.BlobProperty()

class Comment(db.Model):
    ip = db.StringProperty()
    created = db.DateTimeProperty(auto_now_add=True)
    page = db.ReferenceProperty(Page, required=True, collection_name='comment_set')
    comment = db.StringProperty(required=True, multiline=True)
    
def del_page(page_key, appUser):
  p = Page.get(page_key)
  if p is not None:
      #def txn():
      updated = []
      # delete all image ref to page
      for pic in p.page_pictures:
          updated.append(pic.image)
          updated.append(pic)    
      for comment in p.comment_set:
          updated.append(comment)           
      updated.append(p.content)
      updated.append(p)
      db.delete(updated)
      #db.run_in_transaction(txn)
      return True
  return False

def delete_comment(comment_key, appUser):
     q = Comment.get(comment_key)
     # allow admin and page owner to delete comments made by users.
     if q is not None and (users.is_current_user_admin() or q.page.owner == appUser):
         c.delete()
     
def create_comment(page, comment):
    comment = Comment(page=page, comment=comment, ip=cgi.os.environ['REMOTE_ADDR'])
    comment.put()
    
def create_image(appUser, page, data, thumbnail_data = None):
    picContent = PictureContent(img_data = data)
    picContent.put()
    pic = Picture(ip=cgi.os.environ['REMOTE_ADDR'],
                  owner=appUser, 
                  page = page, 
                  image = picContent,
                  thumbnail_data = thumbnail_data)
    pic.put()
    return pic
    
def create_page(appUser, name, content, tags=None):
    pageContent = PageContent(content=content)
    pageContent.put()
    page = Page(ip=cgi.os.environ['REMOTE_ADDR'],
                owner = appUser,
                name = name,
                tags = tags,
                content = pageContent)
    page.put()
    return page

def save_page_content(page_id, page):
    page.put()
    memcache.delete(str(page_id))

def get_page(page_id):
    return Page.get_by_id(page_id)

def get_all_pages_for_user(appUser):
    if appUser:
        return appUser.page_set
    return None

def get_pages_for_nonuser():
    return db.Query(Page).filter('owner =', None)

def get_pages_newest(offset=None):
  """
  Returns 20 pages per page in created order.
  
  Args 
    offset:  The id to use to start the page at. This is the value of 'extra'
               returned from a previous call to this function.
    
  Returns
    (pages, extra)
  """
  extra = None
  if offset is None:
    pages = Page.gql('ORDER BY created DESC').fetch(PAGE_SIZE + 1)
  else:
    pages = Page.gql("""WHERE created <= :1 
             ORDER BY created DESC""", offset).fetch(PAGE_SIZE + 1)
    
  if len(pages) > PAGE_SIZE:
    extra = pages[-1].created
    pages = pages[:PAGE_SIZE]
  return pages, extra

def get_pages_for_user(appUser, page=0, size = 20):
  assert page >= 0
  assert page < size
  pages = []
  extra = None
  if appUser:
      pages = Page.all().filter('owner =', appUser).fetch(size+1, page*size)
      if len(pages) > size:
        if page < size-1:
          extra = pages[-1]
        pages = pages[:size]
  return pages, extra
  
def get_search_pages(query, page=0):
  assert page >= 0
  assert page < SEARCH_PAGE_SIZE
  pages = []
  extra = None
  if query:
      pages = Page.all().filter('tags =', query).fetch(SEARCH_PAGE_SIZE+1, page*SEARCH_PAGE_SIZE)
      if len(pages) > SEARCH_PAGE_SIZE:
        if page < SEARCH_PAGE_SIZE-1:
          extra = pages[-1]
        pages = pages[:SEARCH_PAGE_SIZE]
  return pages, extra

def get_or_create_appUser():
  """
  Find a matching AppUser or create a new one with the
  email as the key_name.
  
  Returns a AppUser for the given user.
  """
  user = users.get_current_user()
  if user:
      appUser = AppUser.get_by_key_name(user.email())
      if appUser is None:
        appUser = AppUser(key_name=user.email(), user=user)
        appUser.put()
      return appUser
  return None