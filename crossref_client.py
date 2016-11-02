__author__ = 'agbeltran'

import requests
from urllib.parse import urljoin

class CrossRefCient:

    CROSS_REF_API_BASE_URL = "http://api.crossref.org"
    TIMEOUT = 5

    def getURLPiecesWorksByScientificData(self):
        ScientificDataISSN = "2052-4463"
        r = requests.get(urljoin(self.CROSS_REF_API_BASE_URL, "/journals/"+ScientificDataISSN+"/works?rows=1000"), timeout=self.TIMEOUT)
        json_result = r.json()
        total_results = json_result["message"]["total-results"]
        items = json_result["message"]["items"]
        print("total_results ", total_results)
        url_pieces = []
        for item in items:
            sdata_identifer = item["alternative-id"][0]
            accepted_year = sdata_identifer[5:9]
            published_year = item["deposited"]["date-parts"]
            print("sdata_identifer  ", sdata_identifer)
            print("accepted_year ", accepted_year)
            print("published_year ", published_year)


if __name__ == "__main__":
    client = CrossRefCient()
    client.getURLPiecesWorksByScientificData()

    #url_pieces = (published_year,accepted_year,current_id)
    #url = 'http://www.nature.com/article-assets/npg/sdata/{0}/sdata{1}{2}/isa-tab/sdata{1}{2}-isa1.zip'.format(*url_pieces)


#example
#dd: www.nature.com/articles/sdata201575 --> accepted year
# deposited 2016  --> published year
#  http://www.nature.com/article-assets/npg/sdata/2016/sdata201575/isa-tab/sdata201575-isa1.zip