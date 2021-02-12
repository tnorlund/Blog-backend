import datetime
import pytest

from dynamo.entities import Visit, itemToVisit, objectToItemAtr # pylint: disable=wrong-import-position

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

def test_default_init():
  visit = Visit(
    visitor_id, visit_date, user_number, page_title, page_slug,
    session_start, scroll_events
  )
  assert visit.id == visitor_id
  assert visit.date == datetime.datetime.strptime(
    visit_date, '%Y-%m-%dT%H:%M:%S.%fZ'
  )
  assert visit.user == 0
  assert visit.title == page_title
  assert visit.slug == page_slug
  assert visit.sessionStart == datetime.datetime.strptime(
    session_start, '%Y-%m-%dT%H:%M:%S.%fZ'
  )
  assert visit.prevTitle is None
  assert visit.prevSlug is None
  assert visit.nextTitle is None
  assert visit.nextSlug is None
  assert visit.timeOnPage is None

def test_prev_init():
  visit = Visit(
    visitor_id, visit_date, user_number, page_title, page_slug,
    session_start, scroll_events, time_on_page, prev_title, prev_slug
  )
  assert visit.id == visitor_id
  assert visit.date == datetime.datetime.strptime(
    visit_date, '%Y-%m-%dT%H:%M:%S.%fZ'
  )
  assert visit.user == 0
  assert visit.title == page_title
  assert visit.slug == page_slug
  assert visit.sessionStart == datetime.datetime.strptime(
    session_start, '%Y-%m-%dT%H:%M:%S.%fZ'
  )
  assert visit.prevTitle == prev_title
  assert visit.prevSlug == prev_slug
  assert visit.nextTitle is None
  assert visit.nextSlug is None
  assert visit.timeOnPage is time_on_page

def test_next_init():
  visit = Visit(
    visitor_id, visit_date, user_number, page_title, page_slug,
    session_start, scroll_events, time_on_page, nextTitle=next_title,
    nextSlug=next_slug
  )
  assert visit.id == visitor_id
  assert visit.date == datetime.datetime.strptime(
    visit_date, '%Y-%m-%dT%H:%M:%S.%fZ'
  )
  assert visit.user == 0
  assert visit.title == page_title
  assert visit.slug == page_slug
  assert visit.sessionStart == datetime.datetime.strptime(
    session_start, '%Y-%m-%dT%H:%M:%S.%fZ'
  )
  assert visit.prevTitle is None
  assert visit.prevSlug is None
  assert visit.nextTitle == next_title
  assert visit.nextSlug == next_slug
  assert visit.timeOnPage is time_on_page

def test_no_user_init():
  visit = Visit(
    visitor_id, visit_date, None, page_title, page_slug,
    session_start, scroll_events
  )
  assert visit.id == visitor_id
  assert visit.date == datetime.datetime.strptime(
    visit_date, '%Y-%m-%dT%H:%M:%S.%fZ'
  )
  assert visit.user == 0
  assert visit.title == page_title
  assert visit.slug == page_slug
  assert visit.sessionStart == datetime.datetime.strptime(
    session_start, '%Y-%m-%dT%H:%M:%S.%fZ'
  )
  assert visit.prevTitle is None
  assert visit.prevSlug is None
  assert visit.nextTitle is None
  assert visit.nextSlug is None
  assert visit.timeOnPage is None

def test_key():
  visit = Visit(
    visitor_id, visit_date, user_number, page_title, page_slug,
    session_start, scroll_events
  )
  assert visit.key() == {
    'PK': { 'S': f'VISITOR#{ visitor_id }' },
    'SK': { 'S': f'VISIT#{ visit_date }#{ page_slug }' }
  }

def test_pk():
  visit = Visit(
    visitor_id, visit_date, user_number, page_title, page_slug,
    session_start, scroll_events
  )
  assert visit.pk() == { 'S': f'VISITOR#{ visitor_id }' }

def test_gsi1():
  visit = Visit(
    visitor_id, visit_date, user_number, page_title, page_slug,
    session_start, scroll_events
  )
  assert visit.gsi1() == {
    'GSI1PK': { 'S': f'PAGE#{ page_slug }' },
    'GSI1SK': { 'S': f'VISIT#{ visit_date }' }
  }

def test_gsi1pk():
  visit = Visit(
    visitor_id, visit_date, user_number, page_title, page_slug,
    session_start, scroll_events
  )
  assert visit.gsi1pk() == { 'S': f'PAGE#{ page_slug }' }

def test_gsi2():
  visit = Visit(
    visitor_id, visit_date, user_number, page_title, page_slug,
    session_start, scroll_events
  )
  assert visit.gsi2() == {
    'GSI2PK': { 'S': f'SESSION#{ visitor_id }#{ session_start }'},
    'GSI2SK': { 'S': f'VISIT#{ visit_date }'}
  }

def test_gsi2pk():
  visit = Visit(
    visitor_id, visit_date, user_number, page_title, page_slug,
    session_start, scroll_events
  )
  assert visit.gsi2pk() == {
    'S': f'SESSION#{ visitor_id }#{ session_start }'
  }

def test_toItem():
  visit = Visit(
    visitor_id, visit_date, user_number, page_title, page_slug,
    session_start, scroll_events
  )
  assert visit.toItem() == {
    'PK': { 'S': f'VISITOR#{ visitor_id }' },
    'SK': { 'S': f'VISIT#{ visit_date }#{ page_slug }' },
    'GSI1PK': { 'S': f'PAGE#{ page_slug }' },
    'GSI1SK': { 'S': f'VISIT#{ visit_date }' },
    'GSI2PK': { 'S': f'SESSION#{ visitor_id }#{ session_start }' },
    'GSI2SK': { 'S': f'VISIT#{ visit_date }' },
    'Type': { 'S': 'visit' },
    'User': { 'N': '0' },
    'ScrollEvents':  objectToItemAtr( scroll_events ),
    'Title': { 'S': page_title },
    'Slug': { 'S': page_slug },
    'PreviousTitle': { 'NULL': True },
    'PreviousSlug': { 'NULL': True },
    'NextTitle': { 'NULL': True },
    'NextSlug': { 'NULL': True },
    'TimeOnPage': { 'NULL': True }
  }

def test_repr():
  visit = Visit(
    visitor_id, visit_date, user_number, page_title, page_slug,
    session_start, scroll_events
  )
  assert repr( visit ) == f'{ visitor_id } - { visit_date}'

def test_dict():
  visit = dict( Visit(
    visitor_id, visit_date, user_number, page_title, page_slug,
    session_start, scroll_events
  ) )
  assert visit['date'] ==  datetime.datetime.strptime(
    visit_date, '%Y-%m-%dT%H:%M:%S.%fZ'
  )
  assert visit['id'] == visitor_id
  assert visit['user'] == 0
  assert visit['title'] == page_title
  assert visit['slug'] == page_slug
  assert visit['prevTitle'] is None
  assert visit['prevSlug'] is None
  assert visit['nextTitle'] is None
  assert visit['nextSlug'] is None
  assert visit['timeOnPage'] is None

def test_itemToVisit():
  visit = Visit(
    visitor_id, visit_date, user_number, page_title, page_slug,
    session_start, scroll_events
  )
  item = visit.toItem()
  newVisit = itemToVisit( item )
  assert newVisit.id == visit.id
  assert newVisit.date == visit.date
  assert newVisit.user == visit.user
  assert newVisit.title == visit.title
  assert newVisit.slug == visit.slug
  assert newVisit.sessionStart == visit.sessionStart
  assert newVisit.prevTitle == visit.prevTitle
  assert newVisit.prevSlug == visit.prevTitle
  assert newVisit.nextTitle == visit.nextTitle
  assert newVisit.nextSlug == visit.nextSlug
  assert newVisit.timeOnPage == visit.timeOnPage

def test_itemToVisit_exception():
  with pytest.raises( Exception ) as e:
    assert itemToVisit( {} )
  assert str( e.value ) == "Could not parse visit"
