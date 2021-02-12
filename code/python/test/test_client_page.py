import pytest
from dynamo.data import DynamoClient

@pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
def test_updatePage(
  table_name, year_visits, month_visits, week_visits, day_visits
):
  client = DynamoClient( table_name )
  result = client.updatePage(
    month_visits + year_visits + month_visits + week_visits + day_visits
  )
  assert 'page' in result.keys() and 'days' in result.keys() and \
    'weeks' in result.keys() and 'months' in result.keys() and \
    'years' in result.keys()

@pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
def test_getPageDetails(
  table_name, year_visits, month_visits, week_visits, day_visits, page
):
  client = DynamoClient( table_name )
  client.addVisits(
    month_visits + year_visits + month_visits + week_visits + day_visits
  )
  client.updatePage(
    month_visits + year_visits + month_visits + week_visits + day_visits
  )
  result = client.getPageDetails( page )
  assert 'page' in result.keys() and 'days' in result.keys() and \
    'weeks' in result.keys() and 'months' in result.keys() and \
    'years' in result.keys()

@pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
def test_parameter_getPageDetails( table_name ):
  client = DynamoClient( table_name )
  with pytest.raises( ValueError ) as e:
    assert client.getPageDetails( {} )
  assert str( e.value ) == 'Must pass a Page object'

@pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
def test_none_getPageDetails(
  table_name,  page
):
  result = DynamoClient( table_name ).getPageDetails( page )
  assert 'error' in result.keys()
  assert result['error'] == 'Page not in table'

@pytest.mark.usefixtures( 'dynamo_client' )
def test_table_getPageDetails(
  table_name,  page
):
  result = DynamoClient( table_name ).getPageDetails( page )
  assert 'error' in result.keys()
  assert result['error'] == 'Could not get page from table'
