import csv
import glob
import json
from bcbio.isatab.parser import InvestigationParser


class Indexer(object):
    def build_index(self, directory):
        import os

        index = []

        isa_dirs = os.listdir(directory)
        for count, isa_dir in enumerate(isa_dirs):
            print isa_dir
            isatab_metadata_directory = directory + "/" + isa_dir

            investigation_file = glob.glob(os.path.join(isatab_metadata_directory, "i_*.txt"))
            inv_parser = InvestigationParser()

            if len(investigation_file) > 0:

                with open(investigation_file[0], "rU") as in_handle:
                    isa_tab = inv_parser.parse(in_handle)

                    title = ''
                    authors_string = ','
                    affiliation_string = ','

                    if len(isa_tab.studies) > 1:
                        # pull out investigation information
                        title = isa_tab['metadata']["Investigation Title"]
                    elif len(isa_tab.studies) == 1:

                        study_record = isa_tab.studies[0]

                        title = study_record.metadata['Study Title']
                        sub_date = study_record.metadata['Study Submission Date']
                        keywords = study_record.metadata['Comment[Subject Keywords]']

                        authors_list = study_record.contacts

                        authors_string = authors_string.join(
                            a['Study Person First Name'] + ' ' + a['Study Person Last Name'] for a in authors_list)
                        affiliation_string = affiliation_string.join(a['Study Person Affiliation'] for a in authors_list if
                                                                     a['Study Person Affiliation'] not in affiliation_string)


                        assays = ';'.join(a['Study Assay Measurement Type'] for a in study_record.assays)

                    index.append({"id": count, 'title': title, 'date': sub_date, 'keywords': keywords, 'authors': authors_string,
                                  "affiliations": affiliation_string, "location": investigation_file[0], "assays": assays})

        print(index)

        file = open('isatab-index.json', 'wb+')
        file.write(json.dumps(index))
        file.close()



if __name__ == "__main__":
    import sys

    indexer = Indexer()
    indexer.build_index(sys.argv[1])

