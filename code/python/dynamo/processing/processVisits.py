import os
import sys
import numpy as np
import pandas as pd
sys.path.append(
  os.path.dirname( os.path.dirname( os.path.abspath( __file__ ) ) )
)
from dynamo.entities import Visit # pylint: disable=wrong-import-position

def processVisits( visits ):
  '''Formats a list of visits to have the proper attributes.

  Parameters
  ----------
  visits : list[ Visit ]
    The list of visits to be modified to fit the session's attributes.

  Returns
  -------
  visits : list[ Visit ]
    The list of visits that have the corrected attributes.
  '''
  v_df = pd.DataFrame( {
    'id': [ visit.date for visit in visits ],
    'title': [ visit.title for visit in visits ],
    'slug': [ visit.slug for visit in visits ],
    'ip': [ visit.ip for visit in visits ],
    'user': [ visit.user for visit in visits ],
  } )
  v_df = v_df.drop_duplicates().sort_values( by='id' ).reset_index()
  # Format the datetimes to be dates and then calculate the amount of time
  # between each request.
  v_df['seconds'] = v_df['id'].diff(+1).dt.total_seconds()[1:].append(
    pd.Series( [ None ] )
  ).reset_index()[0]
  # Shift the slugs and title up and down in order to associate the
  # previous and next slugs and titles per each visit.
  v_df['prevSlug'] = v_df['slug'].shift( 1 )
  v_df['prevTitle'] = v_df['title'].shift( 1 )
  v_df['nextSlug'] = v_df['slug'].shift( -1 )
  v_df['nextTitle'] = v_df['title'].shift( -1 )
  # Replace the NaN's with the None type for the entities
  v_df = v_df.replace( { np.nan: None } )
  return [
    Visit(
      row['id'], row['ip'], row['user'], row['title'], row['slug'],
      v_df.iloc[0]['id'], row['seconds'], row['prevTitle'],
      row['prevSlug'], row['nextTitle'], row['nextSlug']
    ) for index, row in v_df.iterrows()
  ]
