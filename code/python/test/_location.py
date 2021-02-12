from dynamo.entities import Location

# The unique visitor ID
visitor_id = '79cf921c-c01c-4f05-a875-86e560802930'

def location():
  '''Properly formatted location.'''
  return Location(
    visitor_id, '0.0.0.0', 'US', 'California', 'Stockton', 37.9577, -121.29078, '95201',
    '-08:00', ['c-73-66-102-206.hsd1.ca.comcast.net'],
    {
      'asn': 7922,
      'name': 'Comcast',
      'route': '73.0.0.0/8',
      'type': 'Cable/DSL/ISP',
      'domain': 'https://corporate.comcast.com/'
    },
    'Comcast Cable Communications, LLC', False, False, False,
    '2020-12-29T17:40:00.144Z'
  )

def locations():
  '''Properly formatted locations.'''
  return [
    Location(
      visitor_id, '0.0.0.0', 'US', 'California', 'Stockton', 37.9577, -121.29078, '95201',
      '-08:00', ['c-73-66-102-206.hsd1.ca.comcast.net'],
      {
        'asn': 7922,
        'name': 'Comcast',
        'route': '73.0.0.0/8',
        'type': 'Cable/DSL/ISP',
        'domain': 'https://corporate.comcast.com/'
      },
      'Comcast Cable Communications, LLC', False, False, False,
      '2020-12-29T17:40:00.144Z'
    ),
    Location(
      '171a0329-f8b2-499c-867d-1942384ddd5r', '0.0.0.1', 'US', 'California', 'San Francisco', 37.77493, -122.41942,
      '94102', '-08:00', ['c-73-222-141-27.hsd1.ca.comcast.net'],
      {
        'asn': 7922,
        'name': 'Comcast',
        'route': '73.0.0.0/8',
        'type': 'Cable/DSL/ISP',
        'domain': 'https://corporate.comcast.com/'
      },
      'Comcast Cable Communications, Inc.', False, False, False,
      '2020-12-29T17:40:00.144Z'
    ),
    Location(
      '171a0329-f8b2-499c-867d-1942384ddd5a', '0.0.0.2', 'US', 'Washington', 'Redmond', 47.67399, -122.12151, '98052',
      '-08:00', None,
      {
        'asn': 3598,
        'name': 'MICROSOFT-CORP-AS',
        'route': '131.107.0.0/16',
        'type': None,
        'domain': None
      },
      'Microsoft Corporation', False, False, False, '2020-12-29T17:40:00.144Z'
    ),
    Location(
      '171a0329-f8b2-499c-867d-1942384ddd5e', '0.0.0.3', 'US', 'California', 'North Cucamonga', 34.09334, -117.58172,
      None, '-08:00',
      [
        '075-140-017-078.biz.spectrum.com',
        '75-140-17-78.static.rvsd.ca.charter.com'
      ],
      {
        'asn': 20115,
        'name': 'Charter Communications',
        'route': '75.140.0.0/19',
        'type': 'Cable/DSL/ISP',
        'domain': 'https://www.spectrum.com'
      },
      'Charter Communications', False, False, False, '2020-12-29T07:23:37.952Z'
    )
  ]
