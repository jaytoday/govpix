"""

API Methods

As of March 17 2009, the two implemented API methods are a fuzzy
legislator name search and zip by zip code.

Please register an API key and replace the API_KEY with your new key value. 
Register at http://services.sunlightlabs.com/api/register/

You can get more info about the API methods at 
http://wiki.sunlightlabs.com/Sunlight_API_Documentation


"""

SUNLIGHT_BASE_URL = "http://services.sunlightlabs.com/api/"
FUZZY_SEARCH = "legislators.search"
ZIP_SEARCH = "legislators.allForZip"
API_KEY = "06b192d4ec3fd9de2d7a21cdf1b67ec8" # Enter Your Own API Key Here 
CACHE_TIME = 2629700
 # Responses cached for almost 4 weeks
 # The cache can be reset through the GAE dashboard




def get_image(query):
	from google.appengine.api import memcache
	cached_response = memcache.get(query)
	if cached_response is not None: return cached_response
	import urllib
	from google.appengine.api import urlfetch
	import simplejson
	zipcode = False
	try: 
	    int(query)
	    zipcode = True
	except ValueError: pass # not a zip code	
	if zipcode: 
	# Zip Code Search
		request_args = {'apikey' : API_KEY, 'zip': query }
		formatted_args = urllib.urlencode(request_args)
		
		fetch_page = urlfetch.fetch(url = SUNLIGHT_BASE_URL + ZIP_SEARCH 
										+ "?" + formatted_args,
							method = urlfetch.GET) 	 
		this_id = simplejson.loads(fetch_page.content)['response']['legislators'][0]['legislator']['bioguide_id']
	else:
	# Fuzzy Name Search
		request_args = {'apikey' : API_KEY, 'name': urllib.unquote( query ) }
		formatted_args = urllib.urlencode(request_args)
		
		fetch_page = urlfetch.fetch(url = SUNLIGHT_BASE_URL + FUZZY_SEARCH 
										+ "?" + formatted_args,
							method = urlfetch.GET) 	 
		this_id = simplejson.loads(fetch_page.content)['response']['results'][0]['result']['legislator']['bioguide_id']
		
	image_file = open("data/" + this_id.upper() + ".jpg")
	image = image_file.read()
	memcache.set(query, image, CACHE_TIME)
	return image

    
