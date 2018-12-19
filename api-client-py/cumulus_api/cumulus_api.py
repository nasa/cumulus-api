# stdlib
import json
import base64
from urlparse import urlparse

# requests
import requests

class CumulusApi(object):
    """An API client for Cumulus
    Example usage:
       >>> import os
       >>> from cumulus_api import CumulusApi
       >>>
       >>> BASEURL = os.environ["CUMULUS_BASEURL"]
       >>> USERNAME = os.environ["EARTHDATA_USERNAME"]
       >>> PASSWORD = os.environ["EARTHDATA_PASSWORD"]
       >>>
       >>> api = CumulusAPI(BASEURL)
       >>> api.login(USERNAME, PASSWORD)
    """

    def __init__(self, base_url, access_token=None):
        # TODO: validate base_url
        self.base_url = base_url
        self.access_token = access_token

    def login(self, username, password):
        # send a request to cumulus to get the Earthdata authorization url
        authorize_response = requests.get(self.base_url + '/token', allow_redirects=False)
        authorize_url = authorize_response.headers['location']

        # send username & password to Earthdata to request a code to use to get an access token
        credentials = base64.b64encode('{}:{}'.format(username, password))
        payload = { 'credentials': credentials }
        parsed_url = urlparse(self.base_url)
        headers = {'origin': parsed_url.scheme + '://' + parsed_url.hostname }
        grant_code_response = requests.post(authorize_url, data=payload, headers=headers, allow_redirects=False)
        grant_code_url = grant_code_response.headers['Location']

        # get the access token for use in future requests
        token_response = requests.get(grant_code_url)
        self.access_token = token_response.json()['message']['token']
        return self.access_token
