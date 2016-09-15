__author__ = 'agbeltran'

import os
from isatools.io.isatab_parser import InvestigationParser
import glob

class RepositoryDataDescInfo():

    tab_delimiter = "\t"
    new_line = "\n"

    '''
    Builds a report with a list of
    <repository> <data descriptor doi> <data uri>
    '''
    def repo_data_report(self, directory, order):
        repository_data = dict()
        repository_data_string = ""
        isa_dirs = os.listdir(directory)
        for count, isa_dir in enumerate(isa_dirs):
            print(isa_dir)
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
                        #print repositories_string

                        repository_count = len(repositories_string.split(";"))
                        #print repository_count

                        repositories = repositories_string.split(";")

                        data_record_uri_string = study_record.metadata['Comment[Data Record URI]']
                        data_record_uris = data_record_uri_string.split(";")

                        for i in range(repository_count):
                            if order:
                                datadesc_datauris = repository_data.get(repositories[i])
                                if not datadesc_datauris:
                                    datadesc_datauris = dict()
                                datauris_list = datadesc_datauris.get(doi_url)
                                if not datauris_list:
                                    datauris_list = []
                                datauris_list.append(data_record_uris[i])
                                datadesc_datauris.update({doi_url: datauris_list})
                                repository_data.update({repositories[i]: datadesc_datauris})
                            else:
                                list_element = repositories[i]+self.tab_delimiter+doi_url+self.tab_delimiter+data_record_uris[i]+self.new_line
                                repository_data_string = repository_data_string + list_element


        if order:
            repository_data_string = ""
            for repo_key in sorted(repository_data.keys()):
                datadesc_datauris = repository_data.get(repo_key)
                for datadesc_key in sorted(datadesc_datauris.keys()):
                    datauris_list = datadesc_datauris[datadesc_key]
                    for datauris_key in range(len(datauris_list)):
                        repository_data_string = repository_data_string + repo_key + self.tab_delimiter + datadesc_key + self.tab_delimiter + datauris_list[datauris_key]+ self.new_line


            file = open('repository_report.tsv', 'w')
        else:
            file = open('unordered_repository_report.tsv', 'w')

        file.write(repository_data_string)
        file.close()




if __name__ == "__main__":
        import sys
        indexer = RepositoryDataDescInfo()
        indexer.repo_data_report(sys.argv[1], True)
        #indexer.repo_data_report("data", True)

