from colorama import Fore


def error(msg: str):
  print(Fore.RED + f'Error: {msg}!')


def info(msg: str):
  print(Fore.GREEN + f'INFO: {msg}')

