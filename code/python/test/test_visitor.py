import pytest
from dynamo.entities import Visitor, itemToVisitor # pylint: disable=wrong-import-position

visitor_id = '171a0329-f8b2-499c-867d-1942384ddd5f'

def test_default_init():
  visitor = Visitor( visitor_id )
  assert visitor.id == visitor_id
  assert visitor.numberSessions == 0

def test_numberSessions_init():
  visitor = Visitor( visitor_id, 1 )
  assert visitor.id == visitor_id
  assert visitor.numberSessions == 1

def test_key():
  visitor = Visitor( visitor_id, 1 )
  assert visitor.key() == {
    'PK': { 'S': f'VISITOR#{ visitor_id }' },
    'SK': { 'S': '#VISITOR' }
  }

def test_pk():
  visitor = Visitor( visitor_id, 1 )
  assert visitor.pk() == { 'S': f'VISITOR#{ visitor_id }' }

def test_toItem():
  visitor = Visitor( visitor_id, 1 )
  assert visitor.toItem() == {
    'PK': { 'S': f'VISITOR#{ visitor_id }' },
    'SK': { 'S': '#VISITOR' },
    'Type': { 'S': 'visitor' },
    'NumberSessions': { 'N': '1' }
  }

def test_repr():
  visitor = Visitor( visitor_id, 1 )
  assert repr( visitor ) == f'{ visitor_id } - 1'

def test_dict():
  visitor = Visitor( visitor_id, 1 )
  assert dict( visitor ) == {
    'id': visitor_id,
    'numberSessions': 1
  }

def test_itemToVisitor():
  visitor = Visitor( visitor_id, 1 )
  newVisitor = itemToVisitor( visitor.toItem() )
  assert newVisitor.id == visitor.id
  assert newVisitor.numberSessions == visitor.numberSessions

def test_itemToVisit_exception():
  with pytest.raises( Exception ) as e:
    assert itemToVisitor( {} )
  assert str( e.value ) == "Could not parse visitor"
