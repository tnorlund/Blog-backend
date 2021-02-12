# pylint: disable=redefined-outer-name, unused-argument
import pytest
import numpy as np
from dynamo.entities import Session, Visit, Visitor, Browser # pylint: disable=wrong-import-position
from dynamo.entities import Year, Month, Week, Day, Page # pylint: disable=wrong-import-position
from dynamo.data import DynamoClient # pylint: disable=wrong-import-position

# The unique visitor ID
visitor_id = '79cf921c-c01c-4f05-a875-86e560802930'
# The scroll events per page visit
scroll_events = {'2021-02-10T11:27:51.216Z': {'x': 0, 'y': 24},
 '2021-02-10T11:27:51.231Z': {'x': 0, 'y': 102},
 '2021-02-10T11:27:51.246Z': {'x': 0, 'y': 127},
 '2021-02-10T11:27:51.265Z': {'x': 0, 'y': 174},
 '2021-02-10T11:27:51.280Z': {'x': 0, 'y': 220},
 '2021-02-10T11:27:51.296Z': {'x': 0, 'y': 264},
 '2021-02-10T11:27:51.313Z': {'x': 0, 'y': 307},
 '2021-02-10T11:27:51.330Z': {'x': 0, 'y': 349},
 '2021-02-10T11:27:51.347Z': {'x': 0, 'y': 389},
 '2021-02-10T11:27:51.363Z': {'x': 0, 'y': 427},
 '2021-02-10T11:27:51.380Z': {'x': 0, 'y': 465},
 '2021-02-10T11:27:51.397Z': {'x': 0, 'y': 501},
 '2021-02-10T11:27:51.413Z': {'x': 0, 'y': 536},
 '2021-02-10T11:27:51.442Z': {'x': 0, 'y': 603},
 '2021-02-10T11:27:51.448Z': {'x': 0, 'y': 619},
 '2021-02-10T11:27:51.480Z': {'x': 0, 'y': 665},
 '2021-02-10T11:27:51.497Z': {'x': 0, 'y': 695},
 '2021-02-10T11:27:51.515Z': {'x': 0, 'y': 738},
 '2021-02-10T11:27:51.567Z': {'x': 0, 'y': 817},
 '2021-02-10T11:27:51.572Z': {'x': 0, 'y': 830},
 '2021-02-10T11:27:51.588Z': {'x': 0, 'y': 842},
 '2021-02-10T11:27:51.605Z': {'x': 0, 'y': 866},
 '2021-02-10T11:27:51.622Z': {'x': 0, 'y': 889},
 '2021-02-10T11:27:51.638Z': {'x': 0, 'y': 911},
 '2021-02-10T11:27:51.655Z': {'x': 0, 'y': 933},
 '2021-02-10T11:27:51.672Z': {'x': 0, 'y': 954},
 '2021-02-10T11:27:51.688Z': {'x': 0, 'y': 974},
 '2021-02-10T11:27:51.705Z': {'x': 0, 'y': 993},
 '2021-02-10T11:27:51.729Z': {'x': 0, 'y': 1012},
 '2021-02-10T11:27:51.765Z': {'x': 0, 'y': 1031},
 '2021-02-10T11:27:51.773Z': {'x': 0, 'y': 1053},
 '2021-02-10T11:27:51.789Z': {'x': 0, 'y': 1077},
 '2021-02-10T11:27:51.805Z': {'x': 0, 'y': 1122},
 '2021-02-10T11:27:51.822Z': {'x': 0, 'y': 1167},
 '2021-02-10T11:27:51.839Z': {'x': 0, 'y': 1211},
 '2021-02-10T11:27:51.855Z': {'x': 0, 'y': 1253},
 '2021-02-10T11:27:51.886Z': {'x': 0, 'y': 1333},
 '2021-02-10T11:27:51.905Z': {'x': 0, 'y': 1372},
 '2021-02-10T11:27:51.922Z': {'x': 0, 'y': 1409},
 '2021-02-10T11:27:51.939Z': {'x': 0, 'y': 1445},
 '2021-02-10T11:27:51.955Z': {'x': 0, 'y': 1479},
 '2021-02-10T11:27:51.972Z': {'x': 0, 'y': 1513},
 '2021-02-10T11:27:51.998Z': {'x': 0, 'y': 1577},
 '2021-02-10T11:27:52.022Z': {'x': 0, 'y': 1607},
 '2021-02-10T11:27:52.039Z': {'x': 0, 'y': 1636},
 '2021-02-10T11:27:52.055Z': {'x': 0, 'y': 1665},
 '2021-02-10T11:27:52.082Z': {'x': 0, 'y': 1719},
 '2021-02-10T11:27:52.281Z': {'x': 0, 'y': 1922},
 '2021-02-10T11:27:52.333Z': {'x': 0, 'y': 2027},
 '2021-02-10T11:27:52.418Z': {'x': 0, 'y': 2065},
 '2021-02-10T11:27:52.425Z': {'x': 0, 'y': 2078},
 '2021-02-10T11:27:52.447Z': {'x': 0, 'y': 2118},
 '2021-02-10T11:27:52.465Z': {'x': 0, 'y': 2186},
 '2021-02-10T11:27:52.481Z': {'x': 0, 'y': 2207},
 '2021-02-10T11:27:52.565Z': {'x': 0, 'y': 2419},
 '2021-02-10T11:27:52.590Z': {'x': 0, 'y': 2470},
 '2021-02-10T11:27:52.696Z': {'x': 0, 'y': 2652},
 '2021-02-10T11:27:52.718Z': {'x': 0, 'y': 2692},
 '2021-02-10T11:27:52.785Z': {'x': 0, 'y': 2789},
 '2021-02-10T11:27:52.859Z': {'x': 0, 'y': 2884},
 '2021-02-10T11:27:52.887Z': {'x': 0, 'y': 2912},
 '2021-02-10T11:27:52.892Z': {'x': 0, 'y': 2922},
 '2021-02-10T11:27:52.906Z': {'x': 0, 'y': 2931},
 '2021-02-10T11:27:52.924Z': {'x': 0, 'y': 2957},
 '2021-02-10T11:27:52.983Z': {'x': 0, 'y': 3014},
 '2021-02-10T11:27:53.017Z': {'x': 0, 'y': 3036},
 '2021-02-10T11:27:53.048Z': {'x': 0, 'y': 3064},
 '2021-02-10T11:27:53.064Z': {'x': 0, 'y': 3077},
 '2021-02-10T11:27:53.081Z': {'x': 0, 'y': 3090},
 '2021-02-10T11:27:53.158Z': {'x': 0, 'y': 3148},
 '2021-02-10T11:27:53.182Z': {'x': 0, 'y': 3164},
 '2021-02-10T11:27:53.216Z': {'x': 0, 'y': 3174},
 '2021-02-10T11:27:53.288Z': {'x': 0, 'y': 3233},
 '2021-02-10T11:27:53.291Z': {'x': 0, 'y': 3253},
 '2021-02-10T11:27:53.300Z': {'x': 0, 'y': 3276},
 '2021-02-10T11:27:53.327Z': {'x': 0, 'y': 3344},
 '2021-02-10T11:27:53.361Z': {'x': 0, 'y': 3429},
 '2021-02-10T11:27:53.368Z': {'x': 0, 'y': 3449},
 '2021-02-10T11:27:53.390Z': {'x': 0, 'y': 3489},
 '2021-02-10T11:27:53.432Z': {'x': 0, 'y': 3546},
 '2021-02-10T11:27:53.459Z': {'x': 0, 'y': 3652},
 '2021-02-10T11:27:53.489Z': {'x': 0, 'y': 3701},
 '2021-02-10T11:27:53.494Z': {'x': 0, 'y': 3717},
 '2021-02-10T11:27:53.506Z': {'x': 0, 'y': 3733},
 '2021-02-10T11:27:53.523Z': {'x': 0, 'y': 3763},
 '2021-02-10T11:27:53.581Z': {'x': 0, 'y': 3862},
 '2021-02-10T11:27:53.616Z': {'x': 0, 'y': 3926},
 '2021-02-10T11:27:53.643Z': {'x': 0, 'y': 3962},
 '2021-02-10T11:27:53.648Z': {'x': 0, 'y': 3974},
 '2021-02-10T11:27:53.665Z': {'x': 0, 'y': 3985},
 '2021-02-10T11:27:53.684Z': {'x': 0, 'y': 4018},
 '2021-02-10T11:27:53.739Z': {'x': 0, 'y': 4079},
 '2021-02-10T11:27:53.766Z': {'x': 0, 'y': 4117},
 '2021-02-10T11:27:53.790Z': {'x': 0, 'y': 4135},
 '2021-02-10T11:27:53.806Z': {'x': 0, 'y': 4152},
 '2021-02-10T11:27:53.823Z': {'x': 0, 'y': 4169},
 '2021-02-10T11:27:53.915Z': {'x': 0, 'y': 4258},
 '2021-02-10T11:27:53.924Z': {'x': 0, 'y': 4264},
 '2021-02-10T11:27:53.940Z': {'x': 0, 'y': 4271},
 '2021-02-10T11:27:53.999Z': {'x': 0, 'y': 4302},
 '2021-02-10T11:27:54.005Z': {'x': 0, 'y': 4320},
 '2021-02-10T11:27:54.040Z': {'x': 0, 'y': 4342},
 '2021-02-10T11:27:54.069Z': {'x': 0, 'y': 4362},
 '2021-02-10T11:27:54.140Z': {'x': 0, 'y': 4399},
 '2021-02-10T11:27:54.165Z': {'x': 0, 'y': 4402},
 '2021-02-10T11:27:54.181Z': {'x': 0, 'y': 4404},
 '2021-02-10T11:27:54.215Z': {'x': 0, 'y': 4405},
 '2021-02-10T11:27:54.300Z': {'x': 0, 'y': 4401}}
# The time when the page loads
visit_date = '2021-02-10T11:27:51.216Z'
# The visitor's user number
user_number = '0'
# The page's title
page_title = 'Resume'
# The page's slug
page_slug = '/resume'
# The time when the session began
session_start = '2021-02-10T11:27:43.262Z'
# The amount of time spent on the page
time_on_page = 3.084
# The title of the previous page visited
prev_title = 'Tyler Norlund'
# The slug of the previous page visited
prev_slug = '/'
# The title of the next page visited
next_title = 'Continuous Integration and Continuous Delivery'
# The slug of the next page visited
next_slug = '/blog/cicd'
# The number of seconds the average page was on
avg_time = 2.826
# The length of the session
total_time = 8.478

@pytest.fixture
def visitor():
  return Visitor( visitor_id )

@pytest.fixture
def visit():
  return Visit(
    visitor_id, visit_date, user_number, page_title, page_slug,
    session_start, scroll_events
  )

@pytest.fixture
def session():
  return Session( session_start, visitor_id, avg_time, total_time )

@pytest.fixture
def visits():
  return[
    Visit(
      visitor_id, session_start, '0', 'Tyler Norlund', '/',
      session_start, scroll_events, '1.647', nextTitle='Resume',
      nextSlug='/resume'
    ),
    Visit(
      visitor_id, '2021-02-10T11:27:51.216Z', '0', 'Resume', '/resume',
      session_start, scroll_events, '3.084', 
      prevTitle='Tyler Norlund', prevSlug='/',
      nextTitle='Continuous Integration and Continuous Delivery', 
      nextSlug='/blog/cicd'
    ),
    Visit(
      visitor_id, '2021-02-10T11:27:57.886Z', '0', 
      'Continuous Integration and Continuous Delivery', '/blog/cicd',
      session_start, scroll_events, 
      timeOnPage='3.747', 
      prevTitle='Continuous Integration and Continuous Delivery', 
      prevSlug='/blog/cicd'
    )
  ]

@pytest.fixture
def year_visits():
  return [
    Visit(
      visitor_id, '2020-01-01T00:00:00.000Z', '0', 'Tyler Norlund', '/',
      '2020-01-01T00:00:00.000Z', scroll_events, '60', None, None, 'Blog', '/blog'
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-01T00:00:01.000Z', '0', 'Tyler Norlund', '/',
      '2020-01-01T00:00:00.000Z', scroll_events, None, 'Tyler Norlund', '/', None, None
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-01T00:00:00.000Z', '0', 'Tyler Norlund', '/',
      '2020-01-01T00:00:00.000Z', scroll_events, '120', None, None, 'Resume', '/resume'
    )
]

@pytest.fixture
def month_visits():
  return [
    Visit(
      visitor_id, '2020-01-01T00:00:00.000Z', '0', 'Tyler Norlund', '/',
      '2020-01-01T00:00:00.000Z', scroll_events, '60', None, None, 'Blog', '/blog'
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-03T00:00:01.000Z', '0', 'Tyler Norlund', '/',
      '2020-01-01T00:00:00.000Z', scroll_events, None, 'Tyler Norlund', '/', None, None
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-25T00:00:00.000Z', '0', 'Tyler Norlund', '/',
      '2020-01-01T00:00:00.000Z', scroll_events, '120', None, None, 'Resume', '/resume'
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5s', '2020-01-30T00:00:00.000Z', '0', 'Tyler Norlund', '/',
      '2020-01-01T00:00:00.000Z', scroll_events, '120', None, None, 'Resume', '/resume'
    )
  ]

@pytest.fixture
def week_visits():
  return [
    Visit(
      visitor_id, '2020-01-03T00:00:00.000Z', '0', 'Tyler Norlund', '/',
      '2020-01-03T00:00:00.000Z', scroll_events, '60', None, None, 'Blog', '/blog'
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-03T00:00:01.000Z', '0', 'Tyler Norlund', '/',
      '2020-01-03T00:00:00.000Z', scroll_events, None, 'Tyler Norlund', '/', None, None
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-04T00:00:00.000Z', '0', 'Tyler Norlund', '/',
      '2020-01-03T00:00:00.000Z', scroll_events,  '120', None, None, 'Resume', '/resume'
    ),
  ]

@pytest.fixture
def day_visits():
  return [
    Visit(
      visitor_id, '2020-01-03T00:00:00.000Z',  '0', 'Tyler Norlund', '/',
      '2020-01-03T00:00:00.000Z', scroll_events,  '60', None, None, 'Blog', '/blog'
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-03T00:00:01.000Z',  '0', 'Tyler Norlund', '/',
      '2020-01-03T00:00:00.000Z', scroll_events,  None, 'Tyler Norlund', '/', None, None
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-03T00:00:00.000Z',  '0', 'Tyler Norlund', '/',
      '2020-01-03T00:00:00.000Z', scroll_events, '120', None, None, 'Resume', '/resume'
    ),
  ]

@pytest.fixture
def browser():
  return Browser(
    visitor_id,
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) ' + \
      'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 ' + \
      'Mobile/15E148 Safari/604.1',
    100, 200, '2020-01-01T00:00:00.000Z'
  )

@pytest.fixture
def browsers():
  return[
    Browser(
      visitor_id,
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) ' + \
        'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 ' + \
        'Mobile/15E148 Safari/604.1',
      100, 200, '2020-01-01T00:00:00.000Z',
      dateAdded = '2020-01-01T00:00:00.000Z'
    ),
    Browser(
      visitor_id,
      'Mozilla/5.0 (Linux; Android 11; Pixel 4 XL) AppleWebKit/537.36 ' + \
        '(KHTML, like Gecko) Chrome/86.0.4240.198 Mobile Safari/537.36',
      100, 200, '2020-01-01T00:01:00.000Z',
      dateAdded = '2020-01-01T00:00:00.000Z'
    )
  ]

@pytest.fixture
def year( year_visits ):
  toPages = [ visit.nextSlug for visit in year_visits ]
  fromPages = [ visit.prevSlug for visit in year_visits ]
  return Year(
    year_visits[0].slug,
    year_visits[0].title,
    year_visits[0].date.strftime( '%Y' ),
    len( { visit.id for visit in year_visits } ),
    np.mean( [
        visit.timeOnPage for visit in year_visits
        if visit.timeOnPage is not None
    ] ),
    toPages.count( None ) / len( toPages ),
    {
      (
        'www' if page is None else page
      ): fromPages.count( page ) / len( fromPages )
      for page in list( set( fromPages ) )
    },
    {
      (
        'www' if page is None else page
      ): toPages.count( page ) / len( toPages )
      for page in list( set( toPages ) )
    }
  )

@pytest.fixture
def month( month_visits ):
  toPages = [ visit.nextSlug for visit in month_visits ]
  fromPages = [ visit.prevSlug for visit in month_visits ]
  return Month(
    month_visits[0].slug,
    month_visits[0].title,
    month_visits[0].date.strftime( '%Y-%m' ),
    len( { visit.id for visit in month_visits } ),
    np.mean( [
        visit.timeOnPage for visit in month_visits
        if visit.timeOnPage is not None
    ] ),
    toPages.count( None ) / len( toPages ),
    {
      (
        'www' if page is None else page
      ): fromPages.count( page ) / len( fromPages )
      for page in list( set( fromPages ) )
    },
    {
      (
        'www' if page is None else page
      ): toPages.count( page ) / len( toPages )
      for page in list( set( toPages ) )
    }
  )

@pytest.fixture
def week( week_visits ):
  toPages = [ visit.nextSlug for visit in week_visits ]
  fromPages = [ visit.prevSlug for visit in week_visits ]
  return Week(
    week_visits[0].slug,
    week_visits[0].title,
    week_visits[0].date.strftime( '%Y-%U' ),
    len( { visit.id for visit in week_visits } ),
    np.mean( [
        visit.timeOnPage for visit in week_visits
        if visit.timeOnPage is not None
    ] ),
    toPages.count( None ) / len( toPages ),
    {
      (
        'www' if page is None else page
      ): fromPages.count( page ) / len( fromPages )
      for page in list( set( fromPages ) )
    },
    {
      (
        'www' if page is None else page
      ): toPages.count( page ) / len( toPages )
      for page in list( set( toPages ) )
    }
  )

@pytest.fixture
def day( day_visits ):
  toPages = [ visit.nextSlug for visit in day_visits ]
  fromPages = [ visit.prevSlug for visit in day_visits ]
  return Day(
    day_visits[0].slug,
    day_visits[0].title,
    day_visits[0].date.strftime( '%Y-%m-%d' ),
    len( { visit.id for visit in day_visits } ),
    np.mean( [
        visit.timeOnPage for visit in day_visits
        if visit.timeOnPage is not None
    ] ),
    toPages.count( None ) / len( toPages ),
    {
      (
        'www' if page is None else page
      ): fromPages.count( page ) / len( fromPages )
      for page in list( set( fromPages ) )
    },
    {
      (
        'www' if page is None else page
      ): toPages.count( page ) / len( toPages )
      for page in list( set( toPages ) )
    }
  )

@pytest.fixture
def page( year_visits ):
  toPages = [ visit.nextSlug for visit in year_visits ]
  fromPages = [ visit.prevSlug for visit in year_visits ]
  return Page(
    year_visits[0].slug,
    year_visits[0].title,
    len( { visit.id for visit in year_visits } ),
    np.mean( [
        visit.timeOnPage for visit in year_visits
        if visit.timeOnPage is not None
    ] ),
    toPages.count( None ) / len( toPages ),
    {
      (
        'www' if page is None else page
      ): fromPages.count( page ) / len( fromPages )
      for page in list( set( fromPages ) )
    },
    {
      (
        'www' if page is None else page
      ): toPages.count( page ) / len( toPages )
      for page in list( set( toPages ) )
    }
  )

@pytest.fixture
def table_init( dynamo_client, table_name ):
  dynamo_client.create_table(
    TableName=table_name,
    AttributeDefinitions=[
      { 'AttributeName': 'PK', 'AttributeType': 'S' },
      { 'AttributeName': 'SK', 'AttributeType': 'S' },
      { 'AttributeName': 'GSI1PK', 'AttributeType': 'S' },
      { 'AttributeName': 'GSI1SK', 'AttributeType': 'S' },
      { 'AttributeName': 'GSI2PK', 'AttributeType': 'S' },
      { 'AttributeName': 'GSI2SK', 'AttributeType': 'S' }
    ],
    KeySchema=[
      { 'AttributeName': 'PK', 'KeyType': 'HASH' },
      { 'AttributeName': 'SK', 'KeyType': 'RANGE' },
    ],
    GlobalSecondaryIndexes=[
      {
        'IndexName': 'GSI1',
        'KeySchema': [
          { 'AttributeName': 'GSI1PK', 'KeyType': 'HASH' },
          { 'AttributeName': 'GSI1SK', 'KeyType': 'RANGE' }
        ],
        'Projection': {
          'ProjectionType': 'ALL',
          'NonKeyAttributes': [ 'PK' ]
        },
        'ProvisionedThroughput': {
          'ReadCapacityUnits': 5,
          'WriteCapacityUnits': 5
        }
      },
      {
        'IndexName': 'GSI2',
        'KeySchema': [
          { 'AttributeName': 'GSI2PK', 'KeyType': 'HASH' },
          { 'AttributeName': 'GSI2SK', 'KeyType': 'RANGE' }
        ],
        'Projection': {
          'ProjectionType': 'ALL',
          'NonKeyAttributes': [ 'PK' ]
        },
        'ProvisionedThroughput': {
          'ReadCapacityUnits': 5,
          'WriteCapacityUnits': 5
        }
      },
    ]
  )
  yield

@pytest.fixture
def table_del( dynamo_client, table_name ):
  dynamo_client.delete_table( table_name )

def test_addVisit( dynamo_client, table_init, table_name, visit ):
  result = DynamoClient( table_name ).addVisit( visit )
  assert 'visit' in result.keys()
  assert result['visit'] == visit

def test_duplicate_addVisit( dynamo_client, table_init, table_name, visit ):
  client = DynamoClient( table_name )
  client.addVisit( visit )
  result = client.addVisit( visit )
  assert 'error' in result.keys()
  assert result['error'] == 'Visitor\'s page visit is already in table ' \
    + f'{ visit }'

def test_parameter_addVisit( dynamo_client, table_init, table_name ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addVisit( {} )
  assert str( e.value ) == 'Must pass a Visit object'

def test_removeVisit( dynamo_client, table_init, table_name, visit ):
  client = DynamoClient( table_name )
  client.addVisit( visit )
  result = client.removeVisit( visit )
  assert 'visit' in result.keys()
  assert result['visit'] == visit

def test_none_removeVisit(
  dynamo_client, table_init, table_name, visit
):
  result = DynamoClient( table_name ).removeVisit( visit )
  assert 'error' in result.keys()
  assert result['error'] == f'Visit not in table { visit }'

def test_parameter_removeVisit( dynamo_client, table_init, table_name ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).removeVisit( {} )
  assert str( e.value ) == 'Must pass a Visit object'

def test_addVisits( dynamo_client, table_init, table_name, visits ):
  result = DynamoClient( table_name ).addVisits( visits )
  assert 'visits' in result.keys()
  assert result['visits'] == visits

def test_parameter_addVisits( dynamo_client, table_init, table_name, visits ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addVisits( {} )
  assert str( e.value ) == 'Must pass a list'

def test_parameter_elements_addVisits(
  dynamo_client, table_init, table_name, visits
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addVisits( visits + [5] )
  assert str( e.value ) == 'Must pass Visit objects'

def test_addSession( dynamo_client, table_init, table_name, session ):
  result = DynamoClient( table_name ).addSession( session )
  assert 'session' in result.keys()
  assert result['session'] == session

def test_duplicate_addSession(
  dynamo_client, table_init, table_name, session
):
  client = DynamoClient( table_name )
  client.addSession( session )
  result = client.addSession( session )
  assert 'error' in result.keys()
  assert result['error'] == 'Visitor\'s session is already in table ' \
    + f'{ session }'

def test_parameter_addSession( dynamo_client, table_init, table_name ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addSession( {} )
  assert str( e.value ) == 'Must pass a Session object'

def test_removeSession( dynamo_client, table_init, table_name, session ):
  client = DynamoClient( table_name )
  client.addSession( session )
  result = client.removeSession( session )
  assert 'session' in result.keys()
  assert result['session'] == session

def test_none_removeSession(
  dynamo_client, table_init, table_name, session
):
  result = DynamoClient( table_name ).removeSession( session )
  assert 'error' in result.keys()
  assert result['error'] == f'Session not in table { session }'

def test_parameter_removeSession( dynamo_client, table_init, table_name ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).removeSession( {} )
  assert str( e.value ) == 'Must pass a Session object'

def test_addBrowser( dynamo_client, table_init, table_name, browser ):
  result = DynamoClient( table_name ).addBrowser( browser )
  assert 'browser' in result.keys()
  assert result['browser'] == browser

def test_duplicate_addBrowser(
  dynamo_client, table_init, table_name, browser
):
  client = DynamoClient( table_name )
  client.addBrowser( browser )
  result = client.addBrowser( browser )
  assert 'error' in result.keys()
  assert result['error'] == 'Visitor\'s browser is already in table ' \
    + f'{ browser }'

def test_parameter_addBrowser( dynamo_client, table_init, table_name ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addBrowser( {} )
  assert str( e.value ) == 'Must pass a Browser object'

def test_removeBrowser( dynamo_client, table_init, table_name, browser ):
  client = DynamoClient( table_name )
  client.addBrowser( browser )
  result = client.removeBrowser( browser )
  assert 'browser' in result.keys()
  assert result['browser'] == browser

def test_none_removeBrowser(
  dynamo_client, table_init, table_name, browser
):
  result = DynamoClient( table_name ).removeBrowser( browser )
  assert 'error' in result.keys()
  assert result['error'] == f'Browser not in table { browser }'

def test_parameter_removeBrowser( dynamo_client, table_init, table_name ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).removeBrowser( {} )
  assert str( e.value ) == 'Must pass a Browser object'

def test_addBrowsers( dynamo_client, table_init, table_name, browsers ):
  result = DynamoClient( table_name ).addBrowsers( browsers )
  assert 'browsers' in result.keys()
  assert result['browsers'] == browsers

def test_parameter_addBrowsers(
  dynamo_client, table_init, table_name,
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addBrowsers( {} )
  assert str( e.value ) == 'Must pass a list'

def test_parameter_elements_addBrowsers(
  dynamo_client, table_init, table_name, browsers
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addBrowsers( ( browsers ) + [5] )
  assert str( e.value ) == 'Must pass Browser objects'

def test_addNewSession(
  dynamo_client, table_init, table_name, visitor, browsers, visits
):
  client = DynamoClient( table_name )
  client.addVisitor( visitor )
  result = client.addNewSession(
    visitor, browsers, visits
  )
  assert 'visitor' in result.keys()
  assert result['visitor'] == visitor
  assert 'browsers' in result.keys()
  assert result['browsers'] == browsers
  assert 'visits' in result.keys()
  assert result['visits'] == visits
  assert 'session' in result.keys()
  assert result['session'].id == visitor.id
  assert result['session'].sessionStart == visits[0].date

def test_visitor_addNewSession(
  dynamo_client, table_init, table_name, visitor, browsers, visits
):
  client = DynamoClient( table_name )
  result = client.addNewSession(
    visitor, browsers, visits
  )
  assert 'error' in result.keys()
  assert result['error'] == 'Visitor not in table'

def test_none_getSessionDetails(
  dynamo_client, table_init, table_name, session
):
  client = DynamoClient( table_name )
  result = client.getSessionDetails( session )
  assert 'error' in result.keys()
  assert result['error'] == 'Session not in table'

def test_getSessionDetails(
  dynamo_client, table_init, table_name, visitor, browsers, visits, session
):
  client = DynamoClient( table_name )
  client.addVisitor( visitor )
  result = client.addNewSession(
    visitor, browsers, visits
  )
  print( 'first result', result )
  result = client.getSessionDetails( session )
  print( 'second result', result )
  assert 'visits' in result.keys()
  assert all( [
    dict( result['visits'][index] ) == dict(visits[index])
    for index in range( len( visits ) )
  ] )
  assert 'session' in result.keys()
  assert result['session'].id == visitor.id
  assert result['session'].sessionStart == visits[0].date

def test_table_getSessionDetails(
  dynamo_client, table_name, visitor, browsers, visits, session
):
  result = DynamoClient( table_name ).getSessionDetails( session )
  assert 'error' in result.keys()
  assert result['error'] == 'Could not get session from table'

def test_updateSession(
  dynamo_client, table_init, table_name, visitor, browsers, visits, session,
):
  client = DynamoClient( table_name )
  client.addNewSession( visitor, browsers, visits )
  client.addSession( session )
  result = client.updateSession( session, visits )
  assert 'visits' in result.keys()
  assert all( [
    dict( result['visits'][index] ) == dict(visits[index])
    for index in range( len( visits ) )
  ] )
  assert 'session' in result.keys()
  assert dict( result['session'] ) == dict( session )

def test_parameter_session_type_updateSession(
  dynamo_client, table_name, browsers, visits, session
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).updateSession( {}, visits )
  assert str( e.value ) == 'Must pass a Session object'

def test_parameter_visit_type_updateSession(
  dynamo_client, table_name, browsers, visits, session
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).updateSession( session, {} )
  assert str( e.value ) == 'Must pass a list of Visit objects'

def test_parameter_visits_updateSession(
  dynamo_client, table_name, browsers, visits, session
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).updateSession( session, visits + [5] )
  assert str( e.value ) == 'List of visits must be of Visit type'

def test_table_updateSession(
  dynamo_client, table_name, browsers, visits, session
):
  result = DynamoClient( table_name ).updateSession( session, visits )
  assert 'error' in result.keys()
  assert result['error'] == 'Could not update session in table'

def test_none_updateSession(
  dynamo_client, table_init, table_name, browsers, visits, session
):
  print( 'test_none_updateSession', visits )
  client = DynamoClient( table_name )
  client.addBrowsers( browsers )
  client.addVisits( visits )
  result = client.updateSession( session, visits )
  assert 'error' in result.keys()
  assert result['error'] == f'Session not in table { session }'

def test_addYear( dynamo_client, table_init, table_name, year_visits, year ):
  result = DynamoClient( table_name ).addYear( year_visits )
  assert 'year' in result.keys()
  assert dict( result['year'] ) == dict( year )

def test_table_addYear( dynamo_client, table_name, year_visits ):
  result = DynamoClient( table_name ).addYear( year_visits )
  assert 'error' in result.keys()
  assert result['error'] == 'Could not add new year to table'

def test_parameter_list_addYear( dynamo_client, table_init, table_name ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addYear( {} )
  assert str( e.value ) == 'Must pass a list'

def test_parameter_slug_addYear(
  dynamo_client, table_init, table_name, year_visits, visits
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addYear( year_visits + visits )
  assert str( e.value ) == 'List of visits must have the same slug'

def test_parameter_title_addYear(
  dynamo_client, table_init, table_name, year_visits
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addYear( year_visits + [
      Visit(
        visitor_id, '2020-12-23T20:32:26.000Z', '0', 'Blog', '/',
        '2020-12-23T20:32:26.000Z',  scroll_events
      )
    ] )
  assert str( e.value ) == 'List of visits must have the same title'

def test_parameter_year_addYear(
  dynamo_client, table_init, table_name, year_visits
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addYear( year_visits + [
      Visit(
        visitor_id, '2021-12-23T20:32:26.000Z', '0', 'Tyler Norlund', '/',
        '2020-12-23T20:32:26.000Z', scroll_events
      )
    ] )
  assert str( e.value ) == 'List of visits must be from the same year'

def test_addMonth( dynamo_client, table_init, table_name, month_visits, month ):
  result = DynamoClient( table_name ).addMonth( month_visits )
  assert 'month' in result.keys()
  assert dict( result['month'] ) == dict( month )

def test_table_addMonth( dynamo_client, table_name, month_visits ):
  result = DynamoClient( table_name ).addMonth( month_visits )
  assert 'error' in result.keys()
  assert result['error'] == 'Could not add new month to table'

def test_parameter_list_addMonth( dynamo_client, table_init, table_name ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addMonth( {} )
  assert str( e.value ) == 'Must pass a list'

def test_parameter_slug_addMonth(
  dynamo_client, table_init, table_name, month_visits, visits
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addMonth( month_visits + visits )
  assert str( e.value ) == 'List of visits must have the same slug'

def test_parameter_title_addMonth(
  dynamo_client, table_init, table_name, month_visits
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addMonth( month_visits + [
      Visit(
        visitor_id, '2020-12-23T20:32:26.000Z', '0', 'Resume', '/',
        '2020-12-23T20:32:26.000Z',  scroll_events
      )
    ] )
  assert str( e.value ) == 'List of visits must have the same title'

def test_parameter_year_addMonth(
  dynamo_client, table_init, table_name, month_visits
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addMonth( month_visits + [
      Visit(
        visitor_id, '2021-12-23T20:32:26.000Z', '0', 'Tyler Norlund', '/',
        '2020-12-23T20:32:26.000Z', scroll_events
      )
    ] )
  assert str( e.value ) == 'List of visits must be from the same year and month'

def test_addWeek( dynamo_client, table_init, table_name, week_visits, week ):
  result = DynamoClient( table_name ).addWeek( week_visits )
  assert 'week' in result.keys()
  assert dict( result['week'] ) == dict( week )

def test_table_addWeek( dynamo_client, table_name, week_visits ):
  result = DynamoClient( table_name ).addWeek( week_visits )
  assert 'error' in result.keys()
  assert result['error'] == 'Could not add new week to table'

def test_parameter_list_addWeek( dynamo_client, table_init, table_name ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addWeek( {} )
  assert str( e.value ) == 'Must pass a list'

def test_parameter_slug_addWeek(
  dynamo_client, table_init, table_name, week_visits, visits
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addWeek( week_visits + visits )
  assert str( e.value ) == 'List of visits must have the same slug'

def test_parameter_title_addWeek(
  dynamo_client, table_init, table_name, week_visits
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addWeek( week_visits + [
      Visit(
        visitor_id, '2020-12-23T20:32:26.000Z', '0', 'Resume', '/',
        '2020-12-23T20:32:26.000Z', scroll_events
      )
    ] )
  assert str( e.value ) == 'List of visits must have the same title'

def test_parameter_year_addWeek(
  dynamo_client, table_init, table_name, week_visits
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addWeek( week_visits + [
      Visit(
        visitor_id, '2021-12-23T20:32:26.000Z', '0', 'Tyler Norlund', '/',
        '2020-12-23T20:32:26.000Z', scroll_events
      )
    ] )
  assert str( e.value ) == 'List of visits must be from the same year and week'

def test_addDay( dynamo_client, table_init, table_name, day_visits, day ):
  result = DynamoClient( table_name ).addDay( day_visits )
  assert 'day' in result.keys()
  assert dict( result['day'] ) == dict( day )

def test_table_addDay( dynamo_client, table_name, day_visits ):
  result = DynamoClient( table_name ).addDay( day_visits )
  assert 'error' in result.keys()
  assert result['error'] == 'Could not add new day to table'

def test_parameter_list_addDay( dynamo_client, table_init, table_name ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addDay( {} )
  assert str( e.value ) == 'Must pass a list'

def test_parameter_slug_addDay(
  dynamo_client, table_init, table_name, day_visits, visits
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addDay( day_visits + visits )
  assert str( e.value ) == 'List of visits must have the same slug'

def test_parameter_title_addDay(
  dynamo_client, table_init, table_name, day_visits
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addDay( day_visits + [
      Visit(
        visitor_id, '2020-12-23T20:32:26.000Z',  '0', 'Resume', '/',
        '2020-12-23T20:32:26.000Z', scroll_events
      )
    ] )
  assert str( e.value ) == 'List of visits must have the same title'

def test_parameter_year_addDay(
  dynamo_client, table_init, table_name, day_visits
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addDay( day_visits + [
      Visit(
        visitor_id, '2021-12-23T20:32:26.000Z', '0', 'Tyler Norlund', '/',
        '2020-12-23T20:32:26.000Z', scroll_events
      )
    ] )
  assert str( e.value ) == 'List of visits must be from the same year, ' + \
    'month, and day'

def test_addPage( dynamo_client, table_init, table_name, year_visits, page ):
  result = DynamoClient( table_name ).addPage( year_visits )
  assert 'page' in result.keys()
  assert dict( result['page'] ) == dict( page )

def test_table_addPage( dynamo_client, table_name, year_visits ):
  result = DynamoClient( table_name ).addPage( year_visits )
  assert 'error' in result.keys()
  assert result['error'] == 'Could not add new page to table'

def test_parameter_list_addPage( dynamo_client, table_init, table_name ):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addPage( {} )
  assert str( e.value ) == 'Must pass a list'

def test_parameter_slug_addPage(
  dynamo_client, table_init, table_name, year_visits, visits
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addPage( year_visits + visits )
  assert str( e.value ) == 'List of visits must have the same slug'

def test_parameter_title_addPage(
  dynamo_client, table_init, table_name, year_visits
):
  with pytest.raises( ValueError ) as e:
    assert DynamoClient( table_name ).addPage( year_visits + [
      Visit(
        visitor_id, '2020-12-23T20:32:26.000Z', '0', 'Resume', '/',
        '2020-12-23T20:32:26.000Z', scroll_events
      )
    ] )
  assert str( e.value ) == 'List of visits must have the same title'
