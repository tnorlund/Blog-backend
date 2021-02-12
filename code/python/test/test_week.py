import pytest
from dynamo.entities import Week, itemToWeek # pylint: disable=wrong-import-position

def test_init():
  week = Week(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert week.slug == '/'
  assert week.title == 'Tyler Norlund'
  assert week.year == 2020
  assert week.week == 1
  assert week.numberVisitors == 10
  assert week.averageTime == 0.1
  assert week.percentChurn == 0.25
  assert week.fromPage == { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 }
  assert week.toPage == { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }

def test_init_date_exception():
  with pytest.raises( ValueError ) as e:
    assert Week(
      '/', 'Tyler Norlund', '2020/01', 10, 0.1, 0.25,
      { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
      { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
    )
  assert str( e.value ) == 'Must give week as "<year>-<week>"'

def test_init_year_exception():
  with pytest.raises( ValueError ) as e:
    assert Week(
      '/', 'Tyler Norlund', '202-01', 10, 0.1, 0.25,
      { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
      { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
    )
  assert str( e.value ) == 'Must give valid year'

def test_init_week_exception():
  with pytest.raises( ValueError ) as e:
    assert Week(
      '/', 'Tyler Norlund', '2020-53', 10, 0.1, 0.25,
      { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
      { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
    )
  assert str( e.value ) == 'Must give valid week'

def test_key():
  week = Week(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert week.key() == {
    'PK': { 'S': 'PAGE#/' },
    'SK': { 'S': '#WEEK#2020-01' }
  }

def test_pk():
  week = Week(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert week.pk() == { 'S': 'PAGE#/' }

def test_gsi1():
  week = Week(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert week.gsi1() == {
    'GSI1PK': { 'S': 'PAGE#/' },
    'GSI1SK': { 'S': '#WEEK#2020-01' }
  }

def test_gsi1pk():
  week = Week(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert week.gsi1pk() == { 'S': 'PAGE#/' }

def test_toItem():
  week = Week(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert week.toItem() == {
    'PK': { 'S': 'PAGE#/' },
    'SK': { 'S': '#WEEK#2020-01' },
    'GSI1PK': { 'S': 'PAGE#/' },
    'GSI1SK': { 'S': '#WEEK#2020-01' },
    'Type': { 'S': 'week' },
    'Title': { 'S': 'Tyler Norlund' },
    'Slug': { 'S': '/' },
    'NumberVisitors': { 'N': '10' },
    'AverageTime': { 'N': '0.1' },
    'PercentChurn': { 'N': '0.25' },
    'FromPage': {
      'M': {
        'www': { 'N': '0.5' },
        '/blog': { 'N': '0.25' },
        '/resume': { 'N': '0.25' }
      }
    },
    'ToPage': {
      'M': {
        'www': { 'N': '0.25' },
        '/blog': { 'N': '0.5' },
        '/resume': { 'N': '0.25' }
      }
    }
  }

def test_repr():
  week = Week(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert repr( week ) == 'Tyler Norlund - 2020/01'

def test_itemToWeek():
  week = Week(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  newWeek = itemToWeek( week.toItem() )
  assert week.slug == newWeek.slug
  assert week.title == newWeek.title
  assert week.year == newWeek.year
  assert week.week == newWeek.week
  assert week.numberVisitors == newWeek.numberVisitors
  assert week.averageTime == newWeek.averageTime
  assert week.percentChurn == newWeek.percentChurn
  assert week.fromPage == newWeek.fromPage
  assert week.toPage == newWeek.toPage

def test_itemToWeek_exception():
  with pytest.raises( Exception ) as e:
    assert itemToWeek( {} )
  assert str( e.value ) == "Could not parse week"
