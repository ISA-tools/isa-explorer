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
    def extract(self, directory, order_peryear_pernumber):
        isa_dirs = os.listdir(directory)

        dois = []
        dois_dict = dict()

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

                        if (order_peryear_pernumber):
                            dot = '.'
                            dots_positions = [ pos for pos, char in enumerate(doi_url) if char == dot ]
                            index_dot_before_year =  dots_positions[ len(dots_positions) -2 ] + 1
                            index_dot_after_year = dots_positions[ len(dots_positions) -1 ]
                            year = int( doi_url [ index_dot_before_year : index_dot_after_year])
                            last_number = int (doi_url [ (index_dot_after_year +1 ):])
                            year_dict = dois_dict.get(year)
                            if (year_dict == None):
                                year_dict = dict()
                            year_dict.update({ last_number :  doi_url })
                            dois_dict.update({ year : year_dict})
                        else:
                            dois.append(doi_url)

        if (order_peryear_pernumber):
            output_file = open('scidata_dois_ordered.tsv', 'w')
            for doi_year in sorted(dois_dict.keys()):
                for doi_last_number in sorted( dois_dict.get(doi_year).keys() ):
                    output_file.write(dois_dict.get(doi_year).get(doi_last_number) + self.new_line)
            output_file.close()
        else:
            dois.sort()
            output_file = open('scidata_dois.tsv', 'w')
            for item in dois:
                output_file.write(item + self.new_line)
            output_file.close()


if __name__ == "__main__":
        import sys
        extractor = DOIExtractor()
        #extractor.extract(sys.argv[1])
        extractor.extract("data", True)

