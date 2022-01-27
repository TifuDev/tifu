from colorama import Fore
from os import _exit, environ
from faker import Faker
import requests as req
import matplotlib.pyplot as plt
import socket
import random
import time

fake = Faker()

def error(msg: str):
  print(Fore.RED + f'Error: {msg}!')


def info(msg: str):
  print(Fore.GREEN + f'INFO: {msg}')


def url(path: str):
  return f'http://{instance_uri}:{instance_port}/{path}'


def login(username: str, pwd: str):
  data = {
    "username": username,
    "password": pwd
  }

  # remove the double quote of the entire string
  res = req.post(url('login'), data).text.replace('"', '')

  info(f'Logged as {marionette_name} with token {Fore.CYAN + res + Fore.WHITE}')
  return res


def authenticated_request(token, path, data):
  headers = {
    "authorization": f'Bearer {token}'
  }

  res = req.get(url(path), headers = headers, data = data)
  if not res.ok:
    error(res.text)
    res.raise_for_status()
  return res.json()


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

  return authenticated_request(bearer, f'new/{path}/write', data)


def string_generator(str_len: int = 8):
  str = ''

  # Loop str_len times
  for _ in range(str_len):
    random_char = random.randint(97, 97 + 26 - 1) # Random number between the ASCCI
    str += (chr(random_char))                     # decimal number of 'a'(97) and 'z'(122)

  return str


try:
  marionette_name = environ['MARIONETTE_NAME']
  marionette_pwd = environ['MARIONETTE_PWD']
except KeyError as err:
  error(f'{err} not defined')
  _exit(1)
instance_uri = environ.get('INSTANCE_URI', 'localhost')
instance_port = int(environ.get('INSTANCE_PORT', '3000'))
generated_articles = int(environ.get('GENERATED_ARTICLES', '1000'))


# Check if Tifu is running
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
result = sock.connect_ex((instance_uri, instance_port))

if result != 0:
  error('Tifu is not running')

  sock.close()
  _exit(1)

# Sign in to marionette account

bearer = login(marionette_name, marionette_pwd)

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

  execution_time.append(time.time() - start_time)

script_execution_time = time.time() - script_start_time # Calculate the execution time of the script

info(f'Succesfully created {generated_articles} articles!')
info(f'Execution time: {script_execution_time} seconds')

plt.plot(range(1, len(execution_time) + 1), execution_time)
plt.xlabel('requests')
plt.ylabel('execution time')
plt.show()
