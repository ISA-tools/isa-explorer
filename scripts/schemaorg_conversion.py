#from isatools import isatab
from isatools.io.isatab_parser import InvestigationParser
import os
import glob
import json
import re
from bs4 import BeautifulSoup
import requests


class EuropePMCClient:

    EUROPE_PMC_REST = "https://www.ebi.ac.uk/europepmc/webservices/rest"

    def __init__(self):
        pass

    @staticmethod
    def get_abstract(doi):
        request_url = EuropePMCClient.EUROPE_PMC_REST+"/search?query="+doi+"&format=dc"
        print(request_url)
        r = requests.get(request_url)

        soup = BeautifulSoup(r.text, 'lxml')
        abstract = soup.findAll('dcterms:abstract')
        if len(abstract) > 0:
            return abstract[0].text
        else:
            return ''


def convert(isatab_ref):

    dataset = {
        "@context": "http://schema.org",
	    "@type": "Dataset"
    }

    ### metadata
    metadata_urls_file_path = os.path.join(data_path, "metadata_urls.tsv")
    with open(metadata_urls_file_path) as f:
        metadata_urls_df =  dict(x.rstrip().split(None, 1) for x in f)
    #print(metadata_urls_df)

    if os.path.isdir(isatab_ref):
        fnames = glob.glob(os.path.join(isatab_ref, "i_*.txt")) + \
                 glob.glob(os.path.join(isatab_ref, "*.idf.txt"))
        assert len(fnames) == 1
        isatab_ref = fnames[0]
        #print("isatab_ref ->", isatab_ref)
    assert os.path.exists(isatab_ref), "Did not find investigation file: %s" % isatab_ref

    with open(os.path.join(isatab_ref)) as fp:
        try:
            #isa_tab = isatab.load(fp, skip_load_tables=True)
            inv_parser = InvestigationParser()

            with open(isatab_ref, "rU") as in_handle:
                isa_tab = inv_parser.parse(in_handle)
                if (not isa_tab.studies):
                    raise TypeError
                study = isa_tab.studies[0]
                identifier = study.metadata["Study Identifier"]
                sdataID = identifier[ (identifier.rindex('/')+1)::].replace(".","")
                doi = study.metadata["Study Identifier"]
                doi_url = "http://doi.org/"+doi

                ### identifier
                dataset.update({"identifier": doi_url})

                data_catalog_filename = os.path.join( os.path.join(os.path.dirname(__file__), "../assets/jsonld"), "ISAexplorer.json")
                data_catalog = json.load(open(data_catalog_filename))

                dataset.update({"includedInDataCatalog": data_catalog})

                ### name
                dataset.update( {"name": study.metadata["Study Title"]} )

                ### description
                abstract = EuropePMCClient.get_abstract("doi:" + doi)
                dataset.update({"description": abstract})

                ### url
                dataset.update({ "url": "http://scientificdata.isa-explorer.org/"+sdataID})

                ### keywords
                keywords = study.metadata["Comment[Subject Keywords]"].replace(";", ",")
                if re.search('[a-zA-Z]', keywords):
                    dataset.update({"keywords": keywords})

                ### parts of the dataset
                isatab = {
                    "@type": "Dataset",
                    "url": metadata_urls_df[sdataID],
                    "license": study.metadata["Comment[Experimental Metadata Licence]"],
                    "description": "ISA-Tab Experimental Metadata for dataset described in Scientific Data Data Descriptor article "+doi
                }
                distributions = []
                distributions.append(isatab)

                ### subDatasets
                data_repositories = study.metadata["Comment[Data Repository]"].split(";")
                data_accessions = study.metadata["Comment[Data Record Accession]"].split(";")

                index = 0
                for data_repo in data_repositories:
                    data_catalog = {
                        "@type": "DataCatalog",
                        "name": data_repo
                    }

                    sub_dataset = {
                        "@type": "Dataset",
                        "url": data_accessions[index]
                    }
                    sub_dataset.update({ "includedInDataCatalog": data_catalog})
                    distributions.append(sub_dataset)
                    index = index +1

                ## hasPart
                dataset.update({ "hasPart": distributions })

                ### creators
                creators = []
                for contact in study.contacts:
                    person = {
                            "@type": "Person",
                            "name": contact["Study Person First Name"] + contact["Study Person Mid Initials"] + contact[
                                "Study Person Last Name"],
                            "affiliation": contact["Study Person Affiliation"],
                            "identifier": contact["Comment[Study Person ORCID]"]
                        }
                    creators.append(person)

                dataset.update({"creator": creators})

                # for factor in study.factors:
                #     factor_name = factor["Study Factor Name"].split("\t")
                #     dataset.update({"variableMeasured": factor_name})

                ### measurementTechnique & variableMeasured
                for assay in study.assays:
                    technologies = assay["Study Assay Technology Type"].split("\t")
                    for technology in technologies:
                        dataset.update( {"measurementTechnique" : technology } )
                    measurements = assay["Study Assay Measurement Type"].split("\t")
                    for measurement in measurements:
                        dataset.update({"variableMeasured": measurement})

                ### dates
                dataset.update({"dateCreated": study.metadata["Study Submission Date"]})
                dataset.update({"datePublished": study.metadata["Study Public Release Date"]})

                ### adding the data descriptor  as CreativeWork
                citation = {
                    "@type" : "ScholarlyArticle",
                    "identifier": doi,
                    "license": study.metadata["Comment[Manuscript Licence]"],
                    "headline": study.metadata["Study Title"],
                    "datePublished": study.metadata["Study Public Release Date"]
                }
                dataset.update({"citation": citation })

                ##other citations
                for publication in study.publications:
                    scholarlyArt = {
                        "@type": "ScholarlyArticle",
                        "identifier": publication["Study PubMed ID"],
                        "identifier": publication["Study Publication DOI"],
                        "name": publication["Study Publication Title"],
                        "author": publication["Study Publication Author List"]
                    }
                    dataset.update({"citation": scholarlyArt})

                #for c in study.contacts[0].comments:
                #    print("c ---> ", c.name, "    ", c.value)

        except TypeError:
            print("Caught an exception!")
            dataset = None
        except UnicodeDecodeError:
            print("Could not parse the dataset - skipping it " + isatab_ref)
            dataset = None
    return dataset


if __name__ == "__main__":
    dir_path = os.path.dirname(os.path.realpath(__file__))
    data_path = os.path.abspath(os.path.join(dir_path, "../data"))

    print("data_path-> ", data_path)

    try:
        os.stat(os.path.join(data_path, "jsonld"))
    except:
        print("Creating jsonld directory")
        os.mkdir(os.path.join(data_path, "jsonld"))

    isa_dirs = os.listdir(data_path)
    for count, isa_dir in enumerate(isa_dirs):
        if (os.path.isdir(os.path.join(data_path, isa_dir)) and (isa_dir != "jsonld")):
            isa_dir_full_path = os.path.join(data_path, isa_dir)
            print("Converting "+isa_dir_full_path)

            dataset_json = convert(isa_dir_full_path)
            if dataset_json == None:
                continue
            output_file = os.path.join( os.path.join(data_path, "jsonld/") + isa_dir + '.json')
            with open(output_file, 'w') as outfile:
                 json.dump(dataset_json, outfile)
        else:
            print(os.path.join(data_path, isa_dir), "not a dir")