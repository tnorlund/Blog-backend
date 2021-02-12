import random

def randomIP():
  '''Returns a random IP address.'''
  return '.'.join(
    [ str( random.randint(1, 999) ) for index in range(4) ]
  )
