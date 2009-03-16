

SUNLIGHT_BASE_URL = "http://services.sunlightlabs.com/api/"
FUZZY_SEARCH = "legislators.search"
ZIP_SEARCH = "legislators.allForZip"
API_KEY = "06b192d4ec3fd9de2d7a21cdf1b67ec8" 
CACHE_TIME = 2629700
# Enter Your Own API Key Here 
# register at http://services.sunlightlabs.com/api/register/


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
		request_args = {'apikey' : API_KEY, 'zip': query }
		formatted_args = urllib.urlencode(request_args)
		
		fetch_page = urlfetch.fetch(url = SUNLIGHT_BASE_URL + ZIP_SEARCH 
										+ "?" + formatted_args,
							method = urlfetch.GET) 	 
		this_id = simplejson.loads(fetch_page.content)['response']['legislators'][0]['legislator']['bioguide_id']
		#except: return False # no results
	else:
		request_args = {'apikey' : API_KEY, 'name': urllib.unquote( query ) }
		formatted_args = urllib.urlencode(request_args)
		
		fetch_page = urlfetch.fetch(url = SUNLIGHT_BASE_URL + FUZZY_SEARCH 
										+ "?" + formatted_args,
							method = urlfetch.GET) 	 
		this_id = simplejson.loads(fetch_page.content)['response']['results'][0]['result']['legislator']['bioguide_id']
		#except: return False # no results
	

	image_file = open("data/" + this_id.upper() + ".jpg")
	image = image_file.read()
	memcache.set(query, image, CACHE_TIME)
	return image

    
