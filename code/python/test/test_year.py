import pytest
from dynamo.entities import Year, itemToYear # pylint: disable=wrong-import-position

def test_init():
  year = Year(
    '/', 'Tyler Norlund', '2020', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert year.slug == '/'
  assert year.title == 'Tyler Norlund'
  assert year.year == 2020
  assert year.numberVisitors == 10
  assert year.averageTime == 0.1
  assert year.percentChurn == 0.25
  assert year.fromPage == { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 }
  assert year.toPage == { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }

def test_init_year_exception():
  with pytest.raises( ValueError ) as e:
    assert Year(
      '/', 'Tyler Norlund', '202', 10, 0.1, 0.25,
      { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
      { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
    )
  assert str( e.value ) == 'Must give valid year'

def test_key():
  year = Year(
    '/', 'Tyler Norlund', '2020', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert year.key() == {
    'PK': { 'S': 'PAGE#/' },
    'SK': { 'S': '#YEAR#2020' }
  }

def test_pk():
  year = Year(
    '/', 'Tyler Norlund', '2020', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert year.pk() == { 'S': 'PAGE#/' }

def test_gsi1():
  year = Year(
    '/', 'Tyler Norlund', '2020', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert year.gsi1() == {
    'GSI1PK': { 'S': 'PAGE#/' },
    'GSI1SK': { 'S': '#YEAR#2020' }
  }

def test_gsi1pk():
  year = Year(
    '/', 'Tyler Norlund', '2020', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert year.gsi1pk() == { 'S': 'PAGE#/' }

def test_toItem():
  year = Year(
    '/', 'Tyler Norlund', '2020', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert year.toItem() == {
    'PK': { 'S': 'PAGE#/' },
    'SK': { 'S': '#YEAR#2020' },
    'GSI1PK': { 'S': 'PAGE#/' },
    'GSI1SK': { 'S': '#YEAR#2020' },
    'Type': { 'S': 'year' },
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
  year = Year(
    '/', 'Tyler Norlund', '2020', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert repr( year ) == 'Tyler Norlund - 2020'

def test_itemToYear():
  year = Year(
    '/', 'Tyler Norlund', '2020', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  newYear = itemToYear( year.toItem() )
  assert year.slug == newYear.slug
  assert year.title == newYear.title
  assert year.year == newYear.year
  assert year.numberVisitors == newYear.numberVisitors
  assert year.averageTime == newYear.averageTime
  assert year.percentChurn == newYear.percentChurn
  assert year.fromPage == newYear.fromPage
  assert year.toPage == newYear.toPage

def test_itemToYear_exception():
  with pytest.raises( Exception ) as e:
    assert itemToYear( {} )
  assert str( e.value ) == "Could not parse year"
