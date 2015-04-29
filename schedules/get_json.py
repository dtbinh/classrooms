import json
import time
import urllib
import sys
import os
import os.path

#************ CONSTANTS ************#
UWAPI_URL = "https://api.uwaterloo.ca/v2/"
API_key = "key=781251d838e1a6bf08d7ec4cd7066907"

def get_file(url, filename):
	print "\tDownloading " + filename
	testfile=urllib.URLopener()
	testfile.retrieve(url, filename)

with open("rooms_unique.csv") as f:
    content = f.readlines()
	
for i in range(len(content)):
	building = content[i].split(' ')[0]
	room = content[i].split(' ')[1].split('\n')[0]
	url = UWAPI_URL+"buildings/"+building+"/"+room+"/courses.json?"+API_key
	json_filename = building+"_"+room+".json"
	get_file(url, json_filename)
