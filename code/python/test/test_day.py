import pytest
from dynamo.entities import Day, itemToDay # pylint: disable=wrong-import-position


def test_init():
  day = Day(
    '/', 'Tyler Norlund', '2020-01-02', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert day.slug == '/'
  assert day.title == 'Tyler Norlund'
  assert day.year == 2020
  assert day.month == 1
  assert day.day == 2
  assert day.numberVisitors == 10
  assert day.averageTime == 0.1
  assert day.percentChurn == 0.25
  assert day.fromPage == { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 }
  assert day.toPage == { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }

def test_init_date_exception():
  with pytest.raises( ValueError ) as e:
    assert Day(
      '/', 'Tyler Norlund', '2020/01/02', 10, 0.1, 0.25,
      { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
      { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
    )
  assert str( e.value ) == 'Must give day as "<year>-<month>-<day>"'

def test_init_year_exception():
  with pytest.raises( ValueError ) as e:
    assert Day(
      '/', 'Tyler Norlund', '202-01-02', 10, 0.1, 0.25,
      { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
      { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
    )
  assert str( e.value ) == 'Must give valid year'

def test_init_month_exception():
  with pytest.raises( ValueError ) as e:
    assert Day(
      '/', 'Tyler Norlund', '2020-00-02', 10, 0.1, 0.25,
      { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
      { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
    )
  assert str( e.value ) == 'Must give valid month'

def test_init_day_exception():
  with pytest.raises( ValueError ) as e:
    assert Day(
      '/', 'Tyler Norlund', '2020-01-00', 10, 0.1, 0.25,
      { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
      { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
    )
  assert str( e.value ) == 'Must give valid day of the month'

def test_key():
  day = Day(
    '/', 'Tyler Norlund', '2020-01-02', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert day.key() == {
    'PK': { 'S': 'PAGE#/' },
    'SK': { 'S': '#DAY#2020-01-02' }
  }

def test_pk():
  day = Day(
    '/', 'Tyler Norlund', '2020-01-02', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert day.pk() == { 'S': 'PAGE#/' }

def test_gsi1():
  day = Day(
    '/', 'Tyler Norlund', '2020-01-02', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert day.gsi1() == {
    'GSI1PK': { 'S': 'PAGE#/' },
    'GSI1SK': { 'S': '#DAY#2020-01-02' }
  }

def test_gsi1pk():
  day = Day(
    '/', 'Tyler Norlund', '2020-01-02', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert day.gsi1pk() == { 'S': 'PAGE#/' }

def test_toItem():
  day = Day(
    '/', 'Tyler Norlund', '2020-01-02', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert day.toItem() == {
    'PK': { 'S': 'PAGE#/' },
    'SK': { 'S': '#DAY#2020-01-02' },
    'GSI1PK': { 'S': 'PAGE#/' },
    'GSI1SK': { 'S': '#DAY#2020-01-02' },
    'Type': { 'S': 'day' },
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
  day = Day(
    '/', 'Tyler Norlund', '2020-01-02', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert repr( day ) == 'Tyler Norlund - 2020/01/02'

def test_itemToDay():
  day = Day(
    '/', 'Tyler Norlund', '2020-01-02', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  newDay = itemToDay( day.toItem() )
  assert day.slug == newDay.slug
  assert day.title == newDay.title
  assert day.year == newDay.year
  assert day.month == newDay.month
  assert day.day == newDay.day
  assert day.numberVisitors == newDay.numberVisitors
  assert day.averageTime == newDay.averageTime
  assert day.percentChurn == newDay.percentChurn
  assert day.fromPage == newDay.fromPage
  assert day.toPage == newDay.toPage

def test_itemToDay_exception():
  with pytest.raises( Exception ) as e:
    assert itemToDay( {} )
  assert str( e.value ) == "Could not parse day"
