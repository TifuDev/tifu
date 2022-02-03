from utils.logging import info
from utils.request import Request
from os import environ
import json


def string_size(str):
  return len(str.encode('utf-8'))


instance_uri = environ.get('INSTANCE_URI', 'localhost')
instance_port = int(environ.get('INSTANCE_PORT', '3000'))
req = Request(instance_uri, instance_port)

print('Getting catalog...')

catalog = req.get('catalog')
catalog_size = int(string_size(json.dumps(catalog)) / 1024)  # Get size in bytes and convert to kB

info(f'Catalog received.\nCatalog size: {catalog_size} kB')

for article_index in range(0, 10):
  print(catalog[article_index]['path'])

