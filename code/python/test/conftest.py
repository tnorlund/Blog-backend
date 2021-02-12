# pylint: disable=redefined-outer-name, unused-argument
import os
import boto3
import pytest

from moto import mock_dynamodb2, mock_s3
from dynamo.entities import Visitor, Browser, Visit, Session, Page

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
def aws_credentials():
  '''Mocked AWS Credentials for moto.'''
  os.environ["AWS_ACCESS_KEY_ID"] = "testing"
  os.environ["AWS_SECRET_ACCESS_KEY"] = "testing"
  os.environ["AWS_SECURITY_TOKEN"] = "testing"
  os.environ["AWS_SESSION_TOKEN"] = "testing"
  os.environ['REGION_NAME'] = 'us-west-2'

@pytest.fixture
def dynamo_client( aws_credentials ):
  '''The mocked DynamoDB client'''
  with mock_dynamodb2():
    conn = boto3.client( "dynamodb", region_name="us-east-1" )
    yield conn

@pytest.fixture
def s3_client( aws_credentials ):
  with mock_s3():
    conn = boto3.client( 's3', region_name = 'us-east-1' )
    yield conn

@pytest.fixture
def table_name():
  '''The name of the mocked DynamoDB table.'''
  return "BlogDB-test"

@pytest.fixture
def table_init( dynamo_client, table_name ):
  '''Mocked the creation of a DynamoDB table.'''
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
  '''Mocks the deletion of the DynamoDB table.'''
  dynamo_client.delete_table( table_name )

@pytest.fixture
def bucket_name():
  '''The name of the mocked S3 bucket.'''
  return 'test-bucket'

@pytest.fixture
def s3_init( s3_client, bucket_name ):
  '''Mocked the creation of a S3 bucket.'''
  s3_client.create_bucket( Bucket = bucket_name )
  yield

@pytest.fixture
def ip():
  '''A properly formatted IP address.'''
  return '0.0.0.0'

@pytest.fixture
def visitor():
  return Visitor( visitor_id )

@pytest.fixture
def visit():
  return Visit(
    visitor_id , '2020-12-23T20:32:26.000Z',  '0', 'Tyler Norlund', '/',
    '2020-12-23T20:32:26.000Z', scroll_events
  )

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
def year_visits():
  return [
    Visit(
      visitor_id, '2020-01-01T00:00:00.000Z', '0', 'Tyler Norlund', '/',
      '2020-01-01T00:00:00.000Z', scroll_events, '60', None, None,
      'Blog', '/blog'
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-01T00:00:01.000Z', '0',
      'Tyler Norlund', '/',
      '2020-01-01T00:00:00.000Z', scroll_events, None,
      'Tyler Norlund', '/', None, None
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-01T00:00:00.000Z', '0',
      'Tyler Norlund', '/',
      '2020-01-01T00:00:00.000Z', scroll_events, '120', None, None,
      'Resume', '/resume'
    )
]

@pytest.fixture
def month_visits():
  return [
    Visit(
      visitor_id, '2020-01-01T00:00:00.000Z', '0', 'Tyler Norlund', '/',
      '2020-01-01T00:00:00.000Z', scroll_events, '60', None, None,
      'Blog', '/blog'
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-03T00:00:01.000Z', '0',
      'Tyler Norlund', '/',
      '2020-01-01T00:00:00.000Z', scroll_events, None, 'Tyler Norlund', '/',
      None, None
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-25T00:00:00.000Z', '0',
      'Tyler Norlund', '/',
      '2020-01-01T00:00:00.000Z', scroll_events, '120', None, None,
      'Resume', '/resume'
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5s', '2020-01-30T00:00:00.000Z', '0',
      'Tyler Norlund', '/',
      '2020-01-01T00:00:00.000Z', scroll_events, '120', None, None,
      'Resume', '/resume'
    )
  ]

@pytest.fixture
def week_visits():
  return [
    Visit(
      visitor_id, '2020-01-03T00:00:00.000Z', '0', 'Tyler Norlund', '/',
      '2020-01-03T00:00:00.000Z', scroll_events, '60', None, None,
      'Blog', '/blog'
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-03T00:00:01.000Z', '0',
      'Tyler Norlund', '/',
      '2020-01-03T00:00:00.000Z', scroll_events, None, 'Tyler Norlund', '/',
      None, None
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-04T00:00:00.000Z', '0',
      'Tyler Norlund', '/',
      '2020-01-03T00:00:00.000Z', scroll_events, '120', None, None,
      'Resume', '/resume'
    ),
  ]

@pytest.fixture
def day_visits():
  return [
    Visit(
      visitor_id, '2020-01-03T00:00:00.000Z',  '0', 'Tyler Norlund', '/',
      '2020-01-03T00:00:00.000Z', scroll_events, '60', None, None,
      'Blog', '/blog'
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-03T00:00:01.000Z',  '0',
      'Tyler Norlund', '/',
      '2020-01-03T00:00:00.000Z', scroll_events, None, 'Tyler Norlund', '/',
      None, None
    ),
    Visit(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '2020-01-03T00:00:00.000Z',  '0',
      'Tyler Norlund', '/',
      '2020-01-03T00:00:00.000Z', scroll_events, '120', None, None,
      'Resume', '/resume'
    ),
  ]

@pytest.fixture
def page():
  return Page(
    '/',
    'Tyler Norlund',
    2,
    90,
    0.3333333333333333,
    { '/': 0.3333333333333333, 'www': 0.6666666666666666 },
    {
      '/blog': 0.3333333333333333,
      '/resume': 0.3333333333333333,
      'www': 0.3333333333333333
    }
  )

@pytest.fixture
def session():
  '''A proper Session object.'''
  return Session( session_start, visitor_id, avg_time, total_time )

@pytest.fixture
def year_session():
  '''A proper Session object.'''
  return Session( '2020-01-01T00:00:00.000Z', visitor_id, 60.0, 60.0 )

@pytest.fixture
def samsung_G950U_app():
  '''The user agent of a Samsung phone'''
  return 'Mozilla/5.0 (Linux; Android 9; SM-G950U) AppleWebKit/537.36 ' + \
    '(KHTML, like Gecko) Chrome/87.0.4280.101 Mobile Safari/537.36'

@pytest.fixture
def samsung_G981U1_app():
  return 'Mozilla/5.0 (Linux; Android 10; SAMSUNG SM-G981U1) ' + \
    'AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/13.0 ' + \
    'Chrome/83.0.4103.106 Mobile Safari/537.36'

@pytest.fixture
def pixel_app():
  '''The user agent of a Pixel 4 XL.'''
  return 'Mozilla/5.0 (Linux; Android 11; Pixel 4 XL) AppleWebKit/537.36 ' + \
    '(KHTML, like Gecko) Chrome/86.0.4240.198 Mobile Safari/537.36'

@pytest.fixture
def mac_chrome_app():
  '''The user agent of a Mac using Chrome.'''
  return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) ' + \
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'

@pytest.fixture
def mac_safari_app():
  '''The user agent of a Mac using Safari.'''
  return 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) ' + \
    'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Safari/605.1.15'

@pytest.fixture
def windows_chrome_app():
  '''The user agent of a Windows PC using Chrome.'''
  return 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' + \
    '(KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36'

@pytest.fixture
def iphone_safari_app():
  '''The user agent of an iPhone using Safari.'''
  return 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_3 like Mac OS X) ' + \
    'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.2 Mobile/15E148 ' + \
    'Safari/604.1'

@pytest.fixture
def iphone_linkedin_app():
  '''The user agent of an iPhone using the browser in the LinkedIn app.'''
  return 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) ' + \
    'AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [LinkedInApp]'
