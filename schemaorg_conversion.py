from isatools import isatab
import os
import glob
import json

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
    assert os.path.exists(isatab_ref), "Did not find investigation file: %s" % isatab_ref

    with open(os.path.join(isatab_ref)) as fp:
        isa_tab = isatab.load(fp)

        study = isa_tab.studies[0]
        dataset.update( {"name": study.title} )
        dataset.update( { "description": study.description} )

        creators = []
        for contact in study.contacts:
            person = {
                "@type": "Person",
                "name": contact.first_name + contact.mid_initials + contact.last_name,
                "affiliation": contact.affiliation
            }
            creators.append(person)

        dataset.update({ "creator": creators })

    return dataset


if __name__ == "__main__":
    dataset_json = convert("./data/sdata20141")
    with open('dataset.json', 'w') as outfile:
        json.dump(dataset_json, outfile)