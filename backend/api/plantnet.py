import requests
import json
from pprint import pprint

API_KEY = "2b10vXrGN568jhAAwPhxmpHCe"   # Your API key here
PROJECT = "all"; # You can choose a more specific flora, see: /docs/newfloras
api_endpoint = f"https://my-api.plantnet.org/v2/identify/{PROJECT}?api-key={API_KEY}"

image_path_1 = "menta.jpeg"
image_data_1 = open(image_path_1, 'rb')

data = { 'organs': ['leaf'] }

files = [
    ('images', (image_path_1, image_data_1)),
]

req = requests.Request('POST', url=api_endpoint, files=files, data=data)
prepared = req.prepare()

s = requests.Session()
response = s.send(prepared)
json_result = json.loads(response.text)

pprint(response.status_code)
pprint(json_result)