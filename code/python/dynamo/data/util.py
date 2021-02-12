def chunkList( this_list, size ):
  '''Splits a list into a list of lists.

  Parameters
  ----------
  this_list : list
    The list to be split into different lists.
  size : int
    The size of the sublists

  Returns
  -------
    An iterable that iterates over the sublists.
  '''
  for i in range( 0, len( this_list ), size ):
    yield this_list[i:i + size]

def pagesToDict( pages ):
  '''Converts a list of pages to a dict of ratios.

  Parameters
  ----------
  pages : list[ str ]
    The list of page visits from other pages or to other pages.

  Returns
  -------
  result : dict
    The ratios of the page visits where the keys are the page slugs and the
    values are the ratios relative to the list of page visits.
  '''
  return {
    (
      'www' if page is None else page
    ): pages.count( page ) / len( pages )
    for page in list( set( pages ) )
  }
