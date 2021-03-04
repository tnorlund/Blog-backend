import os
import sys
import io
import numpy as np
import pandas as pd
sys.path.append(
  os.path.dirname( os.path.dirname( os.path.abspath( __file__ ) ) )
)
from dynamo.entities import Visit, Browser, Session, formatEpoch # pylint: disable=wrong-import-position

def processDF( key, s3_client ):
  '''Reads a raw csv file S3 and parses the browsers, visits, and sessions.

  Parameters
  ----------
  key : str
    The key of the '.parquet' file in the S3 bucket.
  s3_client : S3Client
    The S3 client used to get the '.parquet' file from.

  Returns
  -------
  result : dict
    The browsers, visits, and sessions parsed from the file.
  '''
  request = s3_client.getObject( key )
  # Read the parquet file as a pandas DF
  df = pd.read_csv(
    io.BytesIO( request['Body'].read() ),
    sep = ',\t', engine = 'python',
    names = [
      'process', 'id', 'time', 'title', 'slug', 'userAgent', 'width',
      'height', 'x', 'y'
    ],
    usecols = [
      'id', 'time', 'title', 'slug', 'userAgent', 'width', 'height', 'x', 'y'
    ],
    index_col = 'time'
  )
  df = df.drop_duplicates().sort_index()
  index_change = df.ne(
    df.shift()
  ).apply( lambda x: x.index[x].tolist() ).title
  indexes = [
    ( index_change[index], index_change[index + 1] - 1 )
      if index != len( index_change ) - 1
    else (index_change[index], df.tail(1).index[0])
    for index in  range( len( index_change ) )
  ]
  visits = []
  for ( start, stop ) in indexes:
    temp = df.loc[ start: stop ]
    visits.append(
      Visit(
        temp.id.unique()[0],
        formatEpoch( temp.iloc[[0]].index[0] ),
        '0',
        temp.title.unique()[0],
        temp.slug.unique()[0],
        formatEpoch( temp.iloc[[0]].index[0] ),
        {
          formatEpoch( index ): { 'x': row.x, 'y': row.y }
          for index, row in temp.iterrows()
        },
        ( temp.iloc[[-1]].index[0] - temp.iloc[[0]].index[0] ) / 1000
      )
    )
  for visit in visits:
    visit.sessionStart=visits[0].date
  for index in range( 1, len( visits ) ):
    visits[index - 1].nextTitle = visits[index].title
    visits[index - 1].nextSlug = visits[index].slug
  for index in range( len( visits ) - 1 ):
    visits[index + 1].prevTitle = visits[index].title
    visits[index + 1].prevSlug = visits[index].slug
  session = Session(
    visits[0].sessionStart,
    df.id.unique()[0],
    np.mean( [ visit.timeOnPage for visit in visits ] ),
    np.sum( [ visit.timeOnPage for visit in visits ] )
  )
  browsers = [
    Browser(
      df.id.unique()[0],
      row.userAgent,
      row.width,
      row.height,
      formatEpoch(
        df.loc[
          ( df['height'] == row.height ) & ( df['width'] == row.width )
        ].head(1).index[0]
      )
    )
    for index, row in df.groupby(
      ['userAgent','height','width']
    ).size().reset_index().rename(
      columns={0:'count'}
    ).iterrows()
  ]
  return{ 'visits': visits, 'session': session, 'browsers': browsers }
