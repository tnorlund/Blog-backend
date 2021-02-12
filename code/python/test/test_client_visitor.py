import pytest
from dynamo.data import DynamoClient
from ._location import location

class Test_addVisitor():
  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_addVisitor( self, table_name, visitor ):
    client = DynamoClient( table_name )
    result = client.addVisitor( visitor )
    assert 'visitor' in result.keys()
    assert result['visitor'] == visitor

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_duplicate_addVisitor( self, table_name, visitor ):
    client = DynamoClient( table_name )
    result = client.addVisitor( visitor )
    result = client.addVisitor( visitor )
    assert 'error' in result.keys()
    assert result['error'] == f'Visitor already in table { visitor }'

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_parameter_addVisitor( self, table_name ):
    client = DynamoClient( table_name )
    with pytest.raises( ValueError ) as e:
      assert client.addVisitor( {} )
    assert str( e.value ) == 'Must pass a Visitor object'

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_table_addVisitor( self, visitor ):
    client = DynamoClient( 'no name' )
    result = client.addVisitor( visitor )
    assert 'error' in result.keys()
    assert result['error'] == 'Could not add new visitor to table'

class Test_updateVisitor():
  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_updateVisitor( self, table_name, visitor ):
    client = DynamoClient( table_name )
    client.addVisitor( visitor )
    result = client.updateVisitor( visitor )
    assert 'visitor' in result.keys()
    assert result['visitor'] == visitor

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_parameter_updateVisitor( self, table_name ):
    client = DynamoClient( table_name )
    with pytest.raises( ValueError ) as e:
      assert client.updateVisitor( {} )
    assert str( e.value ) == 'Must pass a Visitor object'

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_none_updateVisitor( self, table_name, visitor ):
    client = DynamoClient( table_name )
    result = client.updateVisitor( visitor )
    assert 'error' in result.keys()
    assert result['error'] == f'Visitor not in table { visitor }'


  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_table_updateVisitor( self, visitor ):
    client = DynamoClient( 'no name' )
    result = client.updateVisitor( visitor )
    assert 'error' in result.keys()
    assert result['error'] == 'Could not update visitor in table'

class Test_removeVisitor():
  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_removeVisitor( self, table_name, visitor ):
    client = DynamoClient( table_name )
    client.addVisitor( visitor )
    result = client.removeVisitor( visitor )
    assert 'visitor' in result.keys()
    assert result['visitor'] == visitor

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_none_removeVisitor( self, table_name, visitor ):
    client = DynamoClient( table_name )
    result = client.removeVisitor( visitor )
    assert 'error' in result.keys()
    assert result['error'] == f'Visitor not in table { visitor }'

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_parameter_removeVisitor( self, table_name ):
    with pytest.raises( ValueError ) as e:
      assert DynamoClient( table_name ).removeVisitor( {} )
    assert str( e.value ) == 'Must pass a Visitor object'

class Test_incrementVisitorSessions():
  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_incrementVisitorSessions( self, table_name, visitor ):
    client = DynamoClient( table_name )
    client.addVisitor( visitor )
    result = client.incrementVisitorSessions( visitor )
    visitor.numberSessions += 1
    assert 'visitor' in result.keys()
    assert result['visitor'] == visitor

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_none_incrementVisitorSessions( self, table_name, visitor ):
    result = DynamoClient( table_name ).incrementVisitorSessions( visitor )
    visitor.numberSessions += 1
    assert 'error' in result.keys()
    assert result['error'] == 'Visitor not in table'

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_parameter_incrementVisitorSessions( self, table_name ):
    with pytest.raises( ValueError ) as e:
      assert  DynamoClient( table_name ).incrementVisitorSessions( {} )
    assert str( e.value ) == 'Must pass a Visitor object'

class Test_decrementVisitorSessions():
  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_incrementVisitorSessions( self, table_name, visitor ):
    client = DynamoClient( table_name )
    client.addVisitor( visitor )
    result = client.decrementVisitorSessions( visitor )
    visitor.numberSessions -= 1
    assert 'visitor' in result.keys()
    assert result['visitor'] == visitor

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_none_decrementVisitorSessions( self, table_name, visitor ):
    result = DynamoClient( table_name ).decrementVisitorSessions( visitor )
    visitor.numberSessions += 1
    assert 'error' in result.keys()
    assert result['error'] == 'Visitor not in table'

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_parameter_decrementVisitorSessions( self, table_name ):
    with pytest.raises( ValueError ) as e:
      assert  DynamoClient( table_name ).decrementVisitorSessions( {} )
    assert str( e.value ) == 'Must pass a Visitor object'

class Test_addNewVisitor():
  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_addNewVisitor(
    self, table_name, visitor, browsers, visits, session
  ):
    client = DynamoClient( table_name )
    result = client.addNewVisitor(
      visitor, location(), browsers, visits
    )
    assert 'visitor' in result.keys()
    assert result['visitor'] == visitor
    assert 'browsers' in result.keys()
    assert result['browsers'] == browsers
    assert 'location' in result.keys()
    assert dict( result['location'] ) == dict( location() )
    assert 'visits' in result.keys()
    assert result['visits'] == visits
    assert 'session' in result.keys()
    assert dict( result['session'] ) == dict( session )

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_duplicate_visitor_addNewVisitor(
    self, table_name, visitor, browsers, visits
  ):
    client = DynamoClient( table_name )
    result = client.addVisitor( visitor )
    result = client.addNewVisitor(
      visitor, location(), browsers, visits
    )
    assert 'error' in result.keys()
    assert result['error'] == f'Visitor already in table { visitor }'

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_duplicate_location_addNewVisitor(
    self, table_name, visitor, browsers, visits
  ):
    client = DynamoClient( table_name )
    result = client.addLocation( location() )
    result = client.addNewVisitor(
      visitor, location(), browsers, visits
    )
    assert 'error' in result.keys()
    assert result['error'] == 'Visitor\'s location is already in table ' + \
      f'{ location() }'

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_duplicate_session_addNewVisitor(
    self, table_name, visitor, browsers, visits, session
  ):
    client = DynamoClient( table_name )
    result = client.addSession( session )
    result = client.addNewVisitor(
      visitor, location(), browsers, visits
    )
    assert 'error' in result.keys()
    assert result['error'] == 'Visitor\'s session is already in table ' + \
      f'{ session }'

class Test_getVisitorDetails():
  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_getVisitorDetails(
    self, table_name, visitor, browsers, visits
  ):
    print( 'location', location() )
    client = DynamoClient( table_name )
    result = client.addNewVisitor(
      visitor, location(), browsers, visits
    )
    print( 'result 1', result )
    result = client.getVisitorDetails( visitor )
    print( 'result 2', result )
    assert 'visitor' in result.keys()
    assert dict( result['visitor'] ) == dict( visitor )
    assert 'browsers' in result.keys()
    assert all( [
      dict( result['browsers'][index] ) == dict( browsers[index] )
      for index in range( len( browsers ) )
    ] )
    assert 'location' in result.keys()
    assert dict( result['location'] ) == dict( location() )
    assert 'visits' in result.keys()
    assert all( [
      dict( result['visits'][index] ) == dict(visits[index])
      for index in range( len( visits ) )
    ] )
    assert 'sessions' in result.keys()

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_parameter_getVisitorDetails( self, table_name ):
    with pytest.raises( ValueError ) as e:
      assert DynamoClient( table_name ).getVisitorDetails( {} )
    assert str( e.value ) == 'Must pass a Visitor object'

  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_none_getVisitorDetails( self, table_name, visitor ):
    result = DynamoClient( table_name ).getVisitorDetails( visitor )
    assert 'error' in result.keys()
    assert result['error'] == 'Visitor not in table'

  @pytest.mark.usefixtures( 'dynamo_client' )
  def test_table_getVisitorDetails( self, table_name, visitor ):
    result = DynamoClient( table_name ).getVisitorDetails( visitor )
    assert 'error' in result.keys()
    assert result['error'] == 'Could not get visitor from table'

class Test_listVisitors():
  @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
  def test_listVisitors( self, table_name, visitor ):
    client = DynamoClient( table_name )
    client.addVisitor( visitor )
    result = client.listVisitors()
    assert isinstance( result, list )
    assert len( result ) == 1

  @pytest.mark.usefixtures( 'dynamo_client' )
  def test_table_listVisitors( self, table_name ):
    result = DynamoClient( table_name ).listVisitors()
    assert 'error' in result.keys()
    assert result['error'] == 'Could not get visitors from table'
