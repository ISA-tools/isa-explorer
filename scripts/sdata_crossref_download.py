__author__ = 'agbeltran'

import requests
from urllib.parse import urljoin
import zipfile
import logger
import os

HTTP_NOT_FOUND = 404
HTTP_OK = 200

class CrossRefCient:
    #Documentation at: https://github.com/CrossRef/rest-api-doc/blob/master/rest_api.md

    CROSS_REF_API_BASE_URL = "http://api.crossref.org"
    TIMEOUT = 200

    def getURLPiecesWorksByScientificData(self):
        #print("Timeout is: " + str(self.TIMEOUT))
        try:
            ScientificDataISSN = "2052-4463"
            r = requests.get(urljoin(self.CROSS_REF_API_BASE_URL, "/journals/"+ScientificDataISSN+"/works?rows=1000"), timeout=self.TIMEOUT)
            #print(r)
            json_result = r.json()
            #print("Results following: " + str(json_result))
            total_results = json_result["message"]["total-results"]
            items = json_result["message"]["items"]
            #print("total_results ", total_results)
            #print("----->", len(items))
            url_pieces = []
            for item in items:
                sdata_identifer = item["alternative-id"][0]
                #print(sdata_identifer)
                article_number = sdata_identifer[9:]
                accepted_year = sdata_identifer[5:9]
                published_year = item["created"]["date-parts"][0][0]
                url_pieces.append( ( published_year, accepted_year, article_number, sdata_identifer) )
            return url_pieces
        except requests.Timeout as err:
            if hasattr(err, 'message'):
                logger.error({"timeout message": err.message})
            else:
                logger.error("timeout event happened")
        except requests.RequestException as err:
            logger.error({"exception message": err.message})


def download(url, file_name):
    # get request
    response = requests.get(url)
    if response.status_code == HTTP_NOT_FOUND:
        return response.status_code
    # open in binary mode
    with open(file_name, "wb") as file:
        # write to file
        file.write(response.content)
    file.close()
    return response.status_code

if __name__ == "__main__":
    dir_path = os.path.dirname(os.path.realpath(__file__))
    data_path = os.path.abspath(os.path.join(dir_path,"../data"))
    #print("data_path-->", data_path)

    ### saving "id '\t' url"
    metadata_urls_file_path  = os.path.join(data_path, "metadata_urls.tsv")
    metadata_urls_file = open(metadata_urls_file_path, 'w')

    client = CrossRefCient()
    url_pieces_array = client.getURLPiecesWorksByScientificData()
    not_found = []
    for url_pieces in url_pieces_array:
        url = 'http://www.nature.com/article-assets/npg/sdata/{0}/sdata{1}{2}/isa-tab/sdata{1}{2}-isa1.zip'.format(*url_pieces)
        #print("url->", url)

        metadata_urls_file.write("sdata{1}{2}".format(*url_pieces)+"\t"+url+"\n")

        file_name = os.path.join(data_path,'{}-isa1.zip'.format(url_pieces[3]))
        #print("file_name->",file_name)
        status_code = download(url, file_name)
        #print("status_code ->", status_code)
        if status_code == HTTP_OK:
            print("downloading...", url_pieces[3])
            zip_ref = zipfile.ZipFile(file_name, 'r')
            zip_ref.extractall(os.path.join(data_path,url_pieces[3]))
            zip_ref.close()
        else:
            not_found.append(url_pieces[3])
    metadata_urls_file.close()
    print("List of articles with no ISA-Tab: ", not_found)


# case where accepted_year differs from published_year
# http://www.nature.com/articles/sdata201575
# http://www.nature.com/article-assets/npg/sdata/2016/sdata201575/isa-tab/sdata201575-isa1.zip
# sdata201575 --> accepted year
# deposited 2016  --> published year

# TO RESOLVE:
# trying to download:
#     http://www.nature.com/article-assets/npg/sdata/2015/sdata201442/isa-tab/sdata201442-isa1.zip
# but the file is:
# http://www.nature.com/article-assets/npg/sdata/2014/sdata201442/isa-tab/sdata201442-isa1.zip
