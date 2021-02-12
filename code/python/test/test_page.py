import pytest
from dynamo.entities import Page, itemToPage # pylint: disable=wrong-import-position

def test_init():
  page = Page(
    '/', 'Tyler Norlund', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert page.slug == '/'
  assert page.title == 'Tyler Norlund'
  assert page.numberVisitors == 10
  assert page.averageTime == 0.1
  assert page.percentChurn == 0.25
  assert page.fromPage == { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 }
  assert page.toPage == { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }

def test_key():
  page = Page(
    '/', 'Tyler Norlund', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert page.key() == {
    'PK': { 'S': 'PAGE#/' },
    'SK': { 'S': '#PAGE' }
  }

def test_pk():
  page = Page(
    '/', 'Tyler Norlund', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert page.pk() == { 'S': 'PAGE#/' }

def test_gsi1():
  page = Page(
    '/', 'Tyler Norlund', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert page.gsi1() == {
    'GSI1PK': { 'S': 'PAGE#/' },
    'GSI1SK': { 'S': '#PAGE' }
  }

def test_gsi1pk():
  page = Page(
    '/', 'Tyler Norlund', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert page.gsi1pk() == { 'S': 'PAGE#/' }

def test_toItem():
  page = Page(
    '/', 'Tyler Norlund', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert page.toItem() == {
    'PK': { 'S': 'PAGE#/' },
    'SK': { 'S': '#PAGE' },
    'GSI1PK': { 'S': 'PAGE#/' },
    'GSI1SK': { 'S': '#PAGE' },
    'Type': { 'S': 'page' },
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
  page = Page(
    '/', 'Tyler Norlund', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  assert repr( page ) == 'Tyler Norlund - 0.25'

def test_itemToPage():
  page = Page(
    '/', 'Tyler Norlund', 10, 0.1, 0.25,
    { 'www': 0.5, '/blog': 0.25, '/resume': 0.25 },
    { 'www': 0.25, '/blog': 0.5, '/resume': 0.25 }
  )
  newPage = itemToPage( page.toItem() )
  assert page.slug == newPage.slug
  assert page.title == newPage.title
  assert page.numberVisitors == newPage.numberVisitors
  assert page.averageTime == newPage.averageTime
  assert page.percentChurn == newPage.percentChurn
  assert page.fromPage == newPage.fromPage
  assert page.toPage == newPage.toPage

def test_itemToPage_exception():
  with pytest.raises( Exception ) as e:
    assert itemToPage( {} )
  assert str( e.value ) == "Could not parse page"
