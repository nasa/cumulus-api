import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)) + '/../../api-client-py')

from cumulus_api import CumulusApi

CUMULUS_BASEURL = os.environ["CUMULUS_BASEURL"]
EARTHDATA_USERNAME = os.environ["EARTHDATA_USERNAME"]
EARTHDATA_PASSWORD = os.environ["EARTHDATA_PASSWORD"]

api = CumulusApi(CUMULUS_BASEURL)

token = api.login(EARTHDATA_USERNAME, EARTHDATA_PASSWORD)
print token
