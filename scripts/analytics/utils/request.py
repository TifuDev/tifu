from .logging import info, error
import requests as req
from colorama import Fore
from os import _exit
import socket


def is_running(instance_uri, instance_port):
  sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

  result = sock.connect_ex((instance_uri, instance_port))
  sock.close()

  if result != 0:
    error('Instance is not running')
    _exit(1)


class Request:
  def __init__(self, instance_uri, instance_port, **kwargs):
    is_running(instance_uri, instance_port) #Check if instance is running

    self.instance_uri = instance_uri
    self.instance_port = instance_port

    self.username = kwargs.get('username', None)
    self.pwd = kwargs.get('pwd', None)

  # Format path to a URL
  def url(self, path):
    return f'http://{self.instance_uri}:{self.instance_port}/{path}'


  def login(self):
    # Throw an error if username or pwd have not been passed to kwargs
    if self.username == None or self.pwd == None:
      error('No username or password!')
      raise Exception('There is no username or password!')

    data = {
      "username": self.username,
      "password": self.pwd
    }

    # remove the double quote of the entire string
    res = req.post(self.url('login'), data).text.replace('"', '')

    info(f'Logged as {self.username} with token {Fore.CYAN + res + Fore.WHITE}')
    self.token = res


  def authenticated_request(self, path, data):
    headers = {
      "authorization": f'Bearer {self.token}'
    }

    res = req.get(self.url(path), headers = headers, data = data)
    if not res.ok:
      if res.status_code == 403:
        self.login()
        return self.authenticated_request(path, data)
      error(res.text)
      res.raise_for_status()
    return res.json()


  def get(self, path):
    res = req.get(self.url(path))

    return res.json()
