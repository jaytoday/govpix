import logging
import wsgiref.handlers
import datetime, time
from google.appengine.ext import webapp
from google.appengine.ext.webapp import template
import datetime

# File caching controls
FILE_CACHE_CONTROL = 'private, max-age=86400'
FILE_CACHE_TIME = datetime.timedelta(days=20)

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
   	template_values = {}
	self.response.out.write(template.render('intro.html', template_values))


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



    
