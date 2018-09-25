__author__ = 'agbeltran'

import os
from isatools.io.isatab_parser import InvestigationParser
import glob
import pandas as pd

class MetadataExtractor():

    tab_delimiter = "\t"
    new_line = "\n"


    def extract_study_keywords(self, directory):
        """
        Extract Study/Keywords pairs
        """
        study_keywords = {}

        inv_parser = InvestigationParser()

        isa_dirs = os.listdir(directory)
        for count, isa_dir in enumerate(isa_dirs):
            print("isa_dir ", isa_dir)

            isatab_metadata_directory = directory + "/" + isa_dir

            investigation_file = glob.glob(os.path.join(isatab_metadata_directory, "i_*.txt"))

            if len(investigation_file) > 0:
                with open(investigation_file[0], "rU") as in_handle:
                    try:
                        isa_tab = inv_parser.parse(in_handle)
                    except UnicodeDecodeError:
                        print("UnicodeDecodeError in file ", investigation_file, " - skipped")
                        continue

                    if len(isa_tab.studies) > 1:
                        # pull out investigation information
                        title = isa_tab['metadata']["Investigation Title"]

                    elif len(isa_tab.studies) == 1:
                        study_record = isa_tab.studies[0]
                        keywords = study_record.metadata['Comment[Subject Keywords]']
                        study_keywords.update({isa_dir: keywords})

        return study_keywords

    def extract_dois(self, directory, order_peryear_pernumber):
        """
            Extract the list of DOIs
        """
        isa_dirs = os.listdir(directory)

        dois = [] # a list of doi urls
        dois_dict = dict() # a dictionary with the dois

        for count, isa_dir in enumerate(isa_dirs):
            #print(isa_dir)
            isatab_metadata_directory = directory + "/" + isa_dir


            investigation_file = glob.glob(os.path.join(isatab_metadata_directory, "i_*.txt"))
            inv_parser = InvestigationParser()

            if len(investigation_file) > 0:
                with open(investigation_file[0], "rU") as in_handle:
                    try:
                        isa_tab = inv_parser.parse(in_handle)
                    except UnicodeDecodeError:
                        print("UnicodeDecodeError in file ", investigation_file, " - skipped")
                        continue

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

        output_string = ""
        if (order_peryear_pernumber):
            for doi_year in sorted(dois_dict.keys()):
                for doi_last_number in sorted( dois_dict.get(doi_year).keys() ):
                    output_string = output_string + (dois_dict.get(doi_year).get(doi_last_number) + self.new_line)
        else:
            dois.sort()
            for item in dois:
                output_string = output_string + item + self.new_line

        return {"dois_dict": dois_dict, "dois_string": output_string}

    def save_table_to_file(self, table, columns_list, output_filename):
        df = pd.DataFrame(list(table.items()), columns=columns_list)
        df.to_csv(output_filename, header=False, index=False)

    def save_string(self, output_filename, result_string):
        output_file = open(output_filename, 'w')
        output_file.write(result_string)
        output_file.close()


if __name__ == "__main__":
        import sys
        extractor = MetadataExtractor()
        #dois = extractor.extract_dois(sys.argv[1])
        #extractor.extract_dois("data", True)

        # data_path = os.path.join(os.path.dirname(__file__), "../data")
        # dois_result = extractor.extract_dois(data_path, "False")
        # print("dois --->",dois_result["dois_dict"])
        # extractor.save_string("scidata_dois.tsv", dois_result["dois_string"])
        #
        # data_path = os.path.join(os.path.dirname(__file__), "../data")
        # dois_result = extractor.extract_dois(data_path, "True")
        # print("dois --->", dois_result["dois_dict"])
        # extractor.save_string("scidata_ordered_dois.tsv", dois_result["dois_string"])

        #extractor.extract_study_keywords(sys.argv[1])
        data_path = os.path.join(os.path.dirname(__file__), "../data")
        study_keywords = extractor.extract_study_keywords(data_path)
        extractor.save_table_to_file(study_keywords, ['Study ID', 'Keywords'], 'study_keywords.csv')

