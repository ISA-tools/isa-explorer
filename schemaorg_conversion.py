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
        isa_tab = isatab.load(fp, skip_load_tables=True)

        study = isa_tab.studies[0]
        dataset.update( {"name": study.title} )
        dataset.update( { "description": study.description} )

        ### creators
        creators = []
        for contact in study.contacts:
            person = {
                "@type": "Person",
                "name": contact.first_name + contact.mid_initials + contact.last_name,
                "affiliation": contact.affiliation
            }
            creators.append(person)

        dataset.update({ "creator": creators })

        dataset.update({ "citation": study.identifier} )

        ### data records
        #for c in study.comments:
        #    print("c ---> " , c.name , "    ", c.value)

        #for c in study.contacts[0].comments:
        #    print("c ---> ", c.name, "    ", c.value)


    return dataset


if __name__ == "__main__":
    data_path = os.path.abspath("./data")

    try:
        os.stat(os.path.join(data_path, "jsonld"))
    except:
        os.mkdir(os.path.join(data_path, "jsonld"))

    isa_dirs = os.listdir(data_path)
    for count, isa_dir in enumerate(isa_dirs):
        if (os.path.isdir(os.path.join(data_path, isa_dir)) and (isa_dir != "jsonld")):
            isa_dir_full_path = os.path.join(data_path, isa_dir)
            print("Converting "+isa_dir_full_path)
            dataset_json = convert(isa_dir_full_path)
            output_file = os.path.join( os.path.join(data_path, "jsonld/") + isa_dir + '.json')
            with open(output_file, 'w') as outfile:
                 json.dump(dataset_json, outfile)
        else:
            print(os.path.join(data_path, isa_dir), "not a dir")