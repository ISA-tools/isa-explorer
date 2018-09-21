from bs4 import BeautifulSoup
import requests


def get_abstract(url):
    page = requests.get(url)
    soup = BeautifulSoup(page.content, 'html.parser')
    table = soup.findAll('div',attrs={"id":"abstract-content"})
    for x in table:
        return x.find('p').text

#print(get_abstract("http://www.nature.com/articles/sdata2018108#abstract"))
#print(get_abstract("http://www.nature.com/articles/sdata20142#abstract"))


class EuropePMCClient:

    EUROPE_PMC_REST = "https://www.ebi.ac.uk/europepmc/webservices/rest"

    def __init__(self):
        pass

    def get_abstract(doi):
        request_url = EuropePMCClient.EUROPE_PMC_REST+"/search?query="+doi+"&format=dc"
        print(request_url)
        r = requests.get(request_url)

        soup = BeautifulSoup(r.text, 'lxml')
        abstract = soup.findAll('dcterms:abstract')
        return abstract[0].text


if __name__ == "__main__":
    EuropePMCClient.get_abstract("doi:10.1038/sdata.2014.1")
