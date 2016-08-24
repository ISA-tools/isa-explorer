__author__ = 'agbeltran'

import os
from isatab_parser import InvestigationParser
import glob

class RepositoryListBuilder(object):

    tab_delimiter = "\t"
    new_line = "\n"

    def build_list(self, directory):
        list = ""
        isa_dirs = os.listdir(directory)
        for count, isa_dir in enumerate(isa_dirs):
            print isa_dir
            isatab_metadata_directory = directory + "/" + isa_dir

            investigation_file = glob.glob(os.path.join(isatab_metadata_directory, "i_*.txt"))
            inv_parser = InvestigationParser()

            if len(investigation_file) > 0:
                with open(investigation_file[0], "rU") as in_handle:
                    isa_tab = inv_parser.parse(in_handle)

                    if len(isa_tab.studies) > 1:
                        # pull out investigation information
                        title = isa_tab['metadata']["Investigation Title"]

                    elif len(isa_tab.studies) == 1:

                        study_record = isa_tab.studies[0]

                        study_identifier = study_record.metadata['Study Identifier']
                        doi_url = "http://dx.doi.org/"+study_identifier

                        repositories_string = study_record.metadata['Comment[Data Repository]']
                        print repositories_string

                        repository_count = len(repositories_string.split(";"))
                        print repository_count

                        repositories = repositories_string.split(";")

                        data_record_uri_string = study_record.metadata['Comment[Data Record URI]']
                        data_record_uris = data_record_uri_string.split(";")

                        for i in range(1, repository_count):
                            list_element = repositories[i]+self.tab_delimiter+doi_url+self.tab_delimiter+data_record_uris[i]+self.new_line
                            list = list + list_element


        file = open('repository_list.tsv', 'wb+')
        file.write(list)
        file.close()







if __name__ == "__main__":
        import sys
        indexer = RepositoryListBuilder()
        indexer.build_list(sys.argv[1])

