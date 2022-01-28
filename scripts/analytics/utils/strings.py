import random


def string_generator(str_len: int = 8):
  str = ''

  # Loop str_len times
  for _ in range(str_len):
    random_char = random.randint(97, 97 + 26 - 1) # Random number between the ASCCI
    str += (chr(random_char))                     # decimal number of 'a'(97) and 'z'(122)

  return str
