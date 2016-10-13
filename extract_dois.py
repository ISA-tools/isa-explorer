__author__ = 'agbeltran'

import os
from isatools.io.isatab_parser import InvestigationParser
import glob

class DOIExtractor():

    tab_delimiter = "\t"
    new_line = "\n"

    '''
    Extract the list of DOIs
    '''
    def extract(self, directory, order):
        isa_dirs = os.listdir(directory)

        dois_string = ""

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
                        doi_url = "doi:" + study_identifier

                        dois_string = dois_string + doi_url + self.new_line


        output_file = open('scidata_dois.tsv', 'w')
        output_file.write(dois_string)
        output_file.close()


if __name__ == "__main__":
        import sys
        extractor = DOIExtractor()
        #extractor.extract(sys.argv[1])
        extractor.extract("data", True)

