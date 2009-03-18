import logging
import wsgiref.handlers
import datetime, time
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
import datetime

# My Settings (You Can Change These)
PERSONAL_URL = "http://www.jamtoday.org"
CODE_URL = "http://github.com/jamslevy/govpix/tree"
# File caching controls
FILE_CACHE_CONTROL = 'private, max-age=86400'
FILE_CACHE_TIME = datetime.timedelta(days=20)

"""

If no argument is specified, intro.html template is rendered.

Otherwise, get_image() method attempts to find a match for the query. 

If successful, JPG is opened and returned. Responses are all cached for improved performance on subsequent calls. 

TODO: Should it return a 500 error (or other HTTP status) instead of nothing? 

"""
class MainHandler(webapp.RequestHandler):

   def get(self):
   	if len(self.request.path.split('/')[1]) < 1: return self.intro()
   	else: 
   	   from methods import get_image
   	   self.response.headers['Content-Type'] = "image/jpg"
   	   self.set_expire_header()
   	   this_image = get_image(self.request.path.split('/')[1])
   	   self.response.out.write(this_image) 


   def intro(self):
   	template_values = {'PERSONAL_URL': PERSONAL_URL, 'CODE_URL': CODE_URL}
	self.response.out.write(template.render('templates/intro.html', template_values))


   def set_expire_header(self):
      expires = datetime.datetime.now() + FILE_CACHE_TIME 
      self.response.headers['Cache-Control'] = FILE_CACHE_CONTROL
      self.response.headers['Expires'] = str( expires.strftime('%a, %d %b %Y %H:%M:%S GMT') )
      
      
	
def main():
  application = webapp.WSGIApplication([ ('/.*', MainHandler)],
                                       debug=True)
  wsgiref.handlers.CGIHandler().run(application)


if __name__ == '__main__':
  main()



    
