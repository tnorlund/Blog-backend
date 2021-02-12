# import pytest
# from dynamo.data import DynamoClient
# from dynamo.entities import Visitor, itemToVisit, itemToBrowser, itemToSession
# from dynamo.processing import processPages
# from ._page import event
# from ._visitor import randomIP

# TODO
# REFACTOR

# @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
# def test_processPages( table_name ):
#   ip = randomIP()
#   this_event = event( ip, table_name )
#   visits = [
#     itemToVisit( record['dynamodb']['NewImage'] )
#     for record in this_event['Records']
#     if record['dynamodb']['NewImage']['Type']['S'] == 'visit'
#   ]
#   client = DynamoClient( table_name )
#   client.addVisitor( Visitor( ip ) )
#   client.addVisits( visits )
#   client.addBrowsers( [
#     itemToBrowser( record['dynamodb']['NewImage'] )
#     for record in this_event['Records']
#     if record['dynamodb']['NewImage']['Type']['S'] == 'browser'
#   ] )
#   for session in [
#     itemToSession( record['dynamodb']['NewImage'] )
#     for record in this_event['Records']
#     if record['dynamodb']['NewImage']['Type']['S'] == 'session'
#   ]:
#     client.addSession( session )
#   assert processPages( client, this_event ) == 'Successfully added ' + \
#     f'{ len( { visit.slug for visit in visits } ) } pages and updated 0 ' + \
#     f'from { len( visits ) } records.'

# @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
# def test_update_processPages( table_name ):
#   ip = randomIP()
#   this_event = event( ip, table_name )
#   visits = [
#     itemToVisit( record['dynamodb']['NewImage'] )
#     for record in this_event['Records']
#     if record['dynamodb']['NewImage']['Type']['S'] == 'visit'
#   ]
#   client = DynamoClient( table_name )
#   client.addVisitor( Visitor( ip ) )
#   client.addVisits( visits )
#   client.addBrowsers( [
#     itemToBrowser( record['dynamodb']['NewImage'] )
#     for record in this_event['Records']
#     if record['dynamodb']['NewImage']['Type']['S'] == 'browser'
#   ] )
#   for session in [
#     itemToSession( record['dynamodb']['NewImage'] )
#     for record in this_event['Records']
#     if record['dynamodb']['NewImage']['Type']['S'] == 'session'
#   ]:
#     client.addSession( session )
#   processPages( client, this_event )
#   assert processPages( client, this_event ) == 'Successfully added ' + \
#     f'0 pages and updated { len( { visit.slug for visit in visits } ) } ' + \
#     f'from { len( visits ) } records.'

# @pytest.mark.usefixtures( 'dynamo_client', 'table_init' )
# def test_visits_processPages( table_name ):
#   this_event = {
#     'Records': [
#       { 'dynamodb': { 'NewImage': { 'Type': { 'S': 'Something' } } } }
#     ]
#   }
#   client = DynamoClient( table_name )
#   assert processPages( client, this_event ) == 'No pages to process'
