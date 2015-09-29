import pandas as pd
import glob
import json
#from bcbio.isatab.parser import InvestigationParser
from isatab_parser import InvestigationParser
import os

class Indexer(object):
    def build_index(self, directory):


        index = []

        isa_dirs = os.listdir(directory)
        for count, isa_dir in enumerate(isa_dirs):
            print isa_dir
            isatab_metadata_directory = directory + "/" + isa_dir

            investigation_file = glob.glob(os.path.join(isatab_metadata_directory, "i_*.txt"))
            inv_parser = InvestigationParser()
            files = []

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

                        files.append(study_record.metadata['Study File Name'])

                        keywords = study_record.metadata['Comment[Subject Keywords]']
                        repository = study_record.metadata['Comment[Data Repository]']
                        record_uri = study_record.metadata['Comment[Data Record URI]']

                        authors_list = study_record.contacts

                        authors_string = authors_string.join(
                            a['Study Person First Name'] + ' ' + a['Study Person Last Name'] for a in authors_list)
                        affiliation_string = affiliation_string.join(a['Study Person Affiliation'] for a in authors_list if
                                                                     a['Study Person Affiliation'] not in affiliation_string)


                        assays = ';'.join(a['Study Assay Measurement Type'] for a in study_record.assays)
                        for a in study_record.assays:
                            files.append(a['Study Assay File Name'])
                            assays += ';' + a['Study Assay Measurement Type']

                        technologies = ';'.join(a['Study Assay Technology Type'] for a in study_record.assays)
                        for a in study_record.assays:
                            files.append(a['Study Assay File Name'])
                            technologies += ';' + a['Study Assay Technology Type']

                        designs = ';'.join(a['Study Design Type'] for a in study_record.design_descriptors)

                        values = self.extract_metadata_from_files(isatab_metadata_directory, files, ["organism", 'environment type', 'geographical location'])

                        index_record = {"id": count, 'title': title, 'date': sub_date, 'keywords': keywords, 'authors': authors_string,
                                  "affiliations": affiliation_string, "location": investigation_file[0], 'repository': repository,
                                  'record_uri': record_uri, "assays": assays, "technologies": technologies, "designs": designs}

                        for key in values:
                            index_record[key] = ';'.join(str(a) for a in values[key])

                        index.append(index_record)

        file = open('isatab-index.json', 'wb+')
        file.write(json.dumps(index))
        file.close()


    def extract_metadata_from_files(self, directory, files, metadata):
        """
        Provided a file and a list of columns to interrogate, this function
        :param file:
        :param metadata:
        :return:
        """
        values = {}
        factors = []
        for file in files:
            file_contents = pd.read_csv(os.path.join(directory, file), delimiter='\t')
            columns_of_interest = []
            for col in file_contents.columns:
                for metadata_col in metadata:
                    if metadata_col in col.lower():
                        columns_of_interest.append(col)

                    if 'factor value' in col.lower():
                        factor_type = col[col.find('[')+1: len(col)-1]
                        factors.append(factor_type)

            data = file_contents[columns_of_interest]

            for column in data:
                if column not in values:
                    values[column] = set()

                values[column] = values[column].union(set(data[column]))

        values['factors'] = set(factors)
        return values



if __name__ == "__main__":
    import sys

    indexer = Indexer()
    indexer.build_index(sys.argv[1])

