from utils.logging import error, info
from utils.strings import string_generator
from utils.request import Request
from os import _exit, environ
from faker import Faker
import matplotlib.pyplot as plt
import time

fake = Faker()


def write(path, title, content, desc, thumbnailURL, accessMode, isBasedOn, inLanguage, keywords):
  data = {
    'title': title,
    'content': content,
    'desc': desc,
    'thumbnailUrl': thumbnailURL,
    'accessMode': accessMode,
    'isBasedOn': isBasedOn,
    'inLanguage': inLanguage,
    'keywords': keywords
  }

  return request.authenticated_request(f'new/{path}/write', data)


try:
  marionette_name = environ['MARIONETTE_NAME']
  marionette_pwd = environ['MARIONETTE_PWD']
except KeyError as err:
  error(f'{err} not defined')
  _exit(1)
instance_uri = environ.get('INSTANCE_URI', 'localhost')
instance_port = int(environ.get('INSTANCE_PORT', '3000'))
generated_articles = int(environ.get('GENERATED_ARTICLES', '1000'))

request = Request(
  instance_uri,
  instance_port,
  username = marionette_name,
  pwd = marionette_pwd
)

# Sign in to marionette account

request.login()

print(f'Generating {generated_articles} articles...')

execution_time = [] # Save every execution time
script_start_time = time.time() # Execution time of the entire script

# Generate 'generated_articles' articles
for _ in range(generated_articles):
  str = string_generator()
  desc = fake.sentence(nb_words=15)
  content = f'{desc}\n{fake.paragraph()}'
  thumbnail = 'https://cdn.pixabay.com/photo/2018/08/26/14/43/city-3632442_960_720.jpg' # Random Pixabay image result to
                                                                                        # search for 'thumbnail'

  start_time = time.time()                                                              # Start recording execution time

  write(
    path = str,
    title = str,                                                                        # for some reason, when passing a array
    desc = desc,                                                                        # with less than one element, requests
    content = content,                                                                  # parses it to '' if no elements and 'element'
    thumbnailURL = thumbnail,                                                           # if one element
    accessMode = 'textual',
    isBasedOn = ['https://docs.python.org/', 'localhost'],
    inLanguage = 'lo',                                                                  # 'lo' stands for lorem
    keywords = ['test', 'create_article_test']
  )

  execution_time.append((time.time() - start_time) * 1000)

script_execution_time = time.time() - script_start_time           # Calculate the execution time of the script
                                                                  # in miliseconds
info(f'Succesfully created {generated_articles} articles!')
info(f'Execution time: {script_execution_time:.2f} seconds')

plt.plot(range(1, len(execution_time) + 1), execution_time)
plt.xlabel('requests')
plt.ylabel('execution time(ms)')
plt.show()
