import datetime
import pytest
from dynamo.entities import Session, itemToSession # pylint: disable=wrong-import-position

# The unique visitor ID
visitor_id = '171a0329-f8b2-499c-867d-1942384ddd5f'
# The time when the session began
session_start = '2021-02-10T11:27:43.262Z'
# The number of seconds the average page was on
avg_time = 2.826
# The length of the session
total_time = 8.478

def test_default_init():
  session = Session( session_start, visitor_id, avg_time, total_time )
  assert session.sessionStart == datetime.datetime.strptime(
    session_start, '%Y-%m-%dT%H:%M:%S.%fZ'
  )
  assert session.id == visitor_id
  assert session.avgTime == avg_time
  assert session.totalTime == total_time

def test_datetime_init():
  session = Session(
    datetime.datetime.strptime(
      session_start, '%Y-%m-%dT%H:%M:%S.%fZ'
    ), 
    visitor_id, avg_time, total_time
  )
  assert session.sessionStart == datetime.datetime.strptime(
    session_start, '%Y-%m-%dT%H:%M:%S.%fZ'
  )
  assert session.id == visitor_id
  assert session.avgTime == avg_time
  assert session.totalTime == total_time

def test_key():
  session = Session(
    session_start, visitor_id, avg_time, total_time
  )
  assert session.key() == {
    'PK': { 'S': f'VISITOR#{ visitor_id }' },
    'SK': { 'S': f'SESSION#{ session_start }' }
  }

def test_pk():
  session = Session(
    session_start, visitor_id, avg_time, total_time
  )
  assert session.pk() == { 'S': f'VISITOR#{ visitor_id }' }

def test_gsi2():
  session = Session(
    session_start, visitor_id, avg_time, total_time
  )
  assert session.gsi2() == {
    'GSI2PK': { 'S': f'SESSION#{ visitor_id }#{ session_start }' },
    'GSI2SK': { 'S': '#SESSION' }
  }

def test_gsi2pk():
  session = Session(
    session_start, visitor_id, avg_time, total_time
  )
  assert session.gsi2pk() == {
    'S': f'SESSION#{ visitor_id }#{ session_start }'
  }

def test_toItem():
  session = Session(
    session_start, visitor_id, avg_time, total_time
  )
  assert session.toItem() == {
    'PK': { 'S': f'VISITOR#{ visitor_id }' },
    'SK': { 'S': f'SESSION#{ session_start }' },
    'GSI2PK': { 'S': f'SESSION#{ visitor_id }#{ session_start }' },
    'GSI2SK': { 'S': '#SESSION' },
    'Type': { 'S': 'session' },
    'AverageTime': { 'N': str( avg_time ) },
    'TotalTime': { 'N': str( total_time ) }
  }

def test_repr():
  session = Session(
    session_start, visitor_id, avg_time, total_time
  )
  assert repr( session ) == f'{ visitor_id } - { total_time }'

def test_itemToSession():
  session = Session(
    session_start, visitor_id, avg_time, total_time
  )
  newSession = itemToSession( session.toItem() )
  assert newSession.sessionStart == session.sessionStart
  assert newSession.id == session.id
  assert newSession.avgTime == session.avgTime
  assert newSession.totalTime == session.totalTime

def test_itemToSession_exception():
  with pytest.raises( Exception ) as e:
    assert itemToSession( {} )
  assert str( e.value ) == "Could not parse session"
