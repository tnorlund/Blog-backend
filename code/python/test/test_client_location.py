import pytest
from dynamo.data import DynamoClient
from ._location import location, locations

@pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
def test_addLocation( table_name ):
  result = DynamoClient( table_name ).addLocation( location() )
  assert 'location' in result.keys()
  assert dict( result['location'] ) == dict( location() )

@pytest.mark.usefixtures( 'dynamo_client' )
def test_table_addLocation( table_name ):
  result = DynamoClient( table_name ).addLocation( location() )
  assert 'error' in result.keys()
  assert result['error'] == 'Could not add new location to table'

@pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
def test_duplicate_addLocation( table_name ):
  client = DynamoClient( table_name )
  client.addLocation( location() )
  result = client.addLocation( location() )
  assert 'error' in result.keys()
  assert result['error'] == 'Visitor\'s location is already in table ' \
    + f'{ location() }'

@pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
def test_parameter_addLocation( table_name ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addLocation( {} )
  assert str( e.value ) == 'Must pass a Location object'

@pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
def test_addLocations( table_name ):
  result = DynamoClient( table_name ).addLocations( locations() )
  assert 'locations' in result.keys()
  assert len( result['locations'] ) == len( locations() )

def test_table_addLocations( table_name ):
  result = DynamoClient( table_name ).addLocations( locations() )
  assert 'error' in result.keys()
  assert result['error'] == 'Could not add locations to table'

@pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
def test_batch_addLocations( table_name ):
  result = DynamoClient( table_name ).addLocations( locations() * 10 )
  assert 'locations' in result.keys()
  assert len( result['locations'] ) == len( locations() * 10 )

@pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
def test_list_addLocations( table_name ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addLocations( None )
  assert str( e.value ) == 'Must pass a list'

@pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
def test_element_addLocations( table_name ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addLocations( [ None ] )
  assert str( e.value ) == 'Must pass Location objects'

@pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
def test_removeLocation( table_name ):
  client = DynamoClient( table_name )
  client.addLocation( location() )
  result = client.removeLocation( location() )
  assert 'location' in result.keys()
  assert dict( result['location'] ) == dict( location() )

@pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
def test_none_removeLocation( table_name ):
  result = DynamoClient( table_name ).removeLocation( location() )
  assert 'error' in result.keys()
  assert result['error'] == f'Location not in table { location() }'

@pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
def test_parameter_removeLocation( table_name ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).removeLocation( {} )
  assert str( e.value ) == 'Must pass a Location object'

@pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
def test_listLocations( table_name ):
  client = DynamoClient( table_name )
  for loc in locations():
    client.addLocation( loc )
  result = client.listLocations()
  assert len( result ) == len( locations() )

def test_table_listLocations( table_name ):
  result = DynamoClient( table_name ).listLocations( )
  assert 'error' in result.keys()
  assert result['error'] == 'Could not get visits from table'
