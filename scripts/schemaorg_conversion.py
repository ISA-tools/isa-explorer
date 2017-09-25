#from isatools import isatab
from isatools.io.isatab_parser import InvestigationParser
import os
import glob
import json
import re

def convert(isatab_ref):

    dataset = {
        "@context": "http://schema.org",
	    "@type": "Dataset"
    }

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
                study = isa_tab.studies[0]
                identifier = study.metadata["Study Identifier"]
                sdataID = identifier[ (identifier.rindex('/')+1)::].replace(".","")

                ### identifier
                dataset.update({"identifier": "http://doi.org/"+study.metadata["Study Identifier"]})

                ### name
                dataset.update( {"name": study.metadata["Study Title"]} )

                ### description
                dataset.update( {"description": study.metadata["Study Description"]} )

                ### url
                dataset.update({ "url": "http://scientificdata.isa-explorer.org/"+sdataID})

                ### keywords
                keywords = study.metadata["Comment[Subject Keywords]"].replace(";", ",")
                if re.search('[a-zA-Z]', keywords):
                    dataset.update({"keywords": keywords})

                ### includedInDataCatalog
                for data_repo in study.metadata["Comment[Data Repository]"].split(";"):
                    data_catalog = {
                        "@type": "DataCatalog",
                        "name": data_repo
                    }
                    dataset.update({ "includedInDataCatalog": data_catalog})

                ### creators
                creators = []
                for contact in study.contacts:
                    person = {
                            "@type": "Person",
                            "name": contact["Study Person First Name"] + contact["Study Person Mid Initials"] + contact[
                                "Study Person Last Name"],
                            "affiliation": contact["Study Person Affiliation"]
                        }
                    creators.append(person)

                dataset.update({"creator": creators})

                ### measurementTechnique and variableMeasured
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

                dataset.update({"citation": "http://doi.org/" + study.metadata["Study Identifier"]})

                #for c in study.contacts[0].comments:
                #    print("c ---> ", c.name, "    ", c.value)

        except TypeError:
            print("Caught an exception!")
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