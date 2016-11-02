__author__ = 'agbeltran'

import requests
from urllib.parse import urljoin

class CrossRefCient:

    CROSS_REF_API_BASE_URL = "http://api.crossref.org"
    TIMEOUT = 5

    def getWorksBy(self, issn):
        r = requests.get(urljoin(self.CROSS_REF_API_BASE_URL, "/journals/"+issn+"/works?rows=1000"), timeout=self.TIMEOUT)
        print(r.text)


    def getWorks(self):
        r = requests.get(urljoin(self.CROSS_REF_API_BASE_URL,"/works"), timeout=self.TIMEOUT)
        print(r.text)

    def getFunders(self):
        r = requests.get(urljoin(self.CROSS_REF_API_BASE_URL, "/funders"), timeout=self.TIMEOUT)
        print(r.text)


if __name__ == "__main__":
    client = CrossRefCient()
    ScientificDataISSN = "2052-4463"

    #client.getWorks()
    #client.getFunders()
    client.getWorksByJournal(ScientificDataISSN)
