import os
import sys
sys.path.append(
  os.path.dirname( os.path.dirname( os.path.abspath( __file__ ) ) )
)
from dynamo.entities import itemToVisit # pylint: disable=wrong-import-position

def processPages( dynamo_client, event ):
  '''Creates the page and day/week/month/year from a DynamoDB event.

  Parameters
  ----------
  dynamo_client : DynamoClient
    The DynamoDB client used to access the table.
  event : dict
    The DynamoDB PUT event.

  Returns
  -------
  result : str
    The result of the number of pages processed.
  '''
  # Parse the visits from the event.
  visits = [
    itemToVisit( record['dynamodb']['NewImage'] )
    for record in event['Records']
    if record['dynamodb']['NewImage']['Type']['S'] == 'visit'
  ]
  if len( visits ) == 0:
    return 'No pages to process'
  # Store the number of new and updated pages
  new_pages = 0
  update_pages = 0
  # The unique slugs are iterated over because there may be multiple visits to
  # the same slug.
  for visit in [
    [ visit for visit in visits if visit.slug == slug ][0]
      for slug in { visit.slug for visit in visits }
  ]:
    # Query the page and its details
    page_details = dynamo_client.getPageDetails( visit )
    # Raise an exception when an error occurs.
    if 'error' in page_details.keys():
      raise Exception( page_details['error']  )
    # Update the page with new results
    update_result = dynamo_client.updatePage( page_details['visits'] )
    if 'error' in update_result.keys():
      raise Exception( update_result['error'] )
    # Add the page to the table when there isn't one
    if 'page' not in page_details.keys():
      new_pages += 1
    # Update the page when there is one
    else:
      update_pages += 1
  # Return what was done during execution
  return f'Successfully added { new_pages } pages and updated ' + \
    f'{ update_pages } from { len( visits ) } records.'
