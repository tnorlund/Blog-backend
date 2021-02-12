import pytest
from dynamo.entities import Month, itemToMonth # pylint: disable=wrong-import-position

def test_init():
  month = Month(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert month.slug == '/'
  assert month.title == 'Tyler Norlund'
  assert month.year == 2020
  assert month.month == 1
  assert month.numberVisitors == 10
  assert month.averageTime == 0.1
  assert month.percentChurn == 0.25
  assert month.fromPage == { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 }
  assert month.toPage == { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }

def test_init_date_exception():
  with pytest.raises( ValueError ) as e:
    assert Month(
      '/', 'Tyler Norlund', '2020/01', 10, 0.1, 0.25,
      { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
      { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
    )
  assert str( e.value ) == 'Must give month as "<year>-<month>"'

def test_init_year_exception():
  with pytest.raises( ValueError ) as e:
    assert Month(
      '/', 'Tyler Norlund', '202-01', 10, 0.1, 0.25,
      { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
      { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
    )
  assert str( e.value ) == 'Must give valid year'

def test_init_month_exception():
  with pytest.raises( ValueError ) as e:
    assert Month(
      '/', 'Tyler Norlund', '2020-00', 10, 0.1, 0.25,
      { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
      { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
    )
  assert str( e.value ) == 'Must give valid month'

def test_key():
  month = Month(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert month.key() == {
    'PK': { 'S': 'PAGE#/' },
    'SK': { 'S': '#MONTH#2020-01' }
  }

def test_pk():
  month = Month(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert month.pk() == { 'S': 'PAGE#/' }

def test_gsi1():
  month = Month(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert month.gsi1() == {
    'GSI1PK': { 'S': 'PAGE#/' },
    'GSI1SK': { 'S': '#MONTH#2020-01' }
  }

def test_gsi1pk():
  month = Month(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert month.gsi1pk() == { 'S': 'PAGE#/' }

def test_toItem():
  month = Month(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert month.toItem() == {
    'PK': { 'S': 'PAGE#/' },
    'SK': { 'S': '#MONTH#2020-01' },
    'GSI1PK': { 'S': 'PAGE#/' },
    'GSI1SK': { 'S': '#MONTH#2020-01' },
    'Type': { 'S': 'month' },
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
  month = Month(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert repr( month ) == 'Tyler Norlund - 2020/01'

def test_itemToMonth():
  month = Month(
    '/', 'Tyler Norlund', '2020-01', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  newMonth = itemToMonth( month.toItem() )
  assert month.slug == newMonth.slug
  assert month.title == newMonth.title
  assert month.year == newMonth.year
  assert month.month == newMonth.month
  assert month.numberVisitors == newMonth.numberVisitors
  assert month.averageTime == newMonth.averageTime
  assert month.percentChurn == newMonth.percentChurn
  assert month.fromPage == newMonth.fromPage
  assert month.toPage == newMonth.toPage

def test_itemToMonth_exception():
  with pytest.raises( Exception ) as e:
    assert itemToMonth( {} )
  assert str( e.value ) == "Could not parse month"
