# pylint: disable=wrong-import-position
import os
os.environ['REGION_NAME'] = 'us-west-2'

from .test_visit import *
from .test_visitor import *
from .test_session import *
from .test_location import *
