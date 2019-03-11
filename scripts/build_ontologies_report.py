__author__ = 'agbeltran'

import os
import glob
import json
from isatools.io.isatab_parser import InvestigationParser


class OntologyUsageInfo():
    """
        Builds a report about the usage of ontologies
        <ontology source> <ontology term> <ontology label> <data descriptor doi> <publication date>
    """

    ontology_info = {}

    design_type_field = "design_type"
    design_type_label = "Study Design Type"
    design_type_term = "Study Design Type Term Accession Number"
    design_type_ontology = "Study Design Type Term Source REF"

    measurement_type_field = "measurement_type"
    measurement_type_label = "Study Assay Measurement Type"
    measurement_type_term = "Study Assay Measurement Type Term Accession Number"
    measurement_type_ontology = "Study Assay Measurement Type Term Source REF"

    technology_type_field = "technology_type"
    technology_type_label = "Study Assay Technology Type"
    technology_type_term = "Study Assay Technology Type Term Accession Number"
    technology_type_ontology = "Study Assay Technology Type Term Source"

    field_switcher = {
        design_type_field: {
            "label": design_type_label,
            "term": design_type_term,
            "ontology": design_type_ontology
        },
        measurement_type_field:  {
            "label": measurement_type_label,
            "term": measurement_type_term,
            "ontology": measurement_type_ontology
        },
        technology_type_field: {
            "label": technology_type_label,
            "term": technology_type_term,
            "ontology": technology_type_ontology
        }
    }

    def add_info(self, ontology, ontology_label, ontology_URI, study_doi):
        term_doi_dict = self.ontology_info.get(ontology)

        if (term_doi_dict == None):
            term_doi_dict = {}
            self.ontology_info.update({ontology: term_doi_dict})

        doi_list = term_doi_dict.get(ontology_URI)
        if (doi_list == None):
            doi_list = []

        doi_list.append(study_doi)
        term_doi_dict.update({ontology_URI : doi_list})


    def ontology_term_usage_report(self, data_directory, field):
        """
        Generates a report on ontology usage, given the field for which the annotation was done.
        :param self: this method is called on an object of the class
        :param data_directory: the path to the folder containing the data
        :param field: a string that can be design_type, measurement_type or technology_type
        """

        label_field = self.field_switcher.get(field, "Not found").get("label", "Not Found")
        term_field = self.field_switcher.get(field, "Not found").get("term", "Not Found")
        ontology_field = self.field_switcher.get(field, "Not found").get("ontology", "Not Found")

        isa_dirs = os.listdir(data_directory)
        for count, isa_dir in enumerate(isa_dirs):
            print(isa_dir)
            isatab_metadata_directory = data_directory + "/" + isa_dir

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
                        doi_url = "http://dx.doi.org/" + study_identifier

                        ontology_label = ""
                        ontology_URI = ""
                        ontology = ""

                        if (field == self.design_type_field):

                            i = 0
                            while i < len(study_record.design_descriptors):
                                ontology_label = study_record.design_descriptors[i][label_field]
                                ontology_URI = study_record.design_descriptors[i][term_field]
                                ontology = study_record.design_descriptors[i][ontology_field]
                                i = i+1
                                # print("ontology_label ", ontology_label)
                                # print("ontology_URI ", ontology_URI)
                                # print("ontology ", ontology)

                                self.add_info(ontology, ontology_label, ontology_URI, doi_url)

                        elif (field == self.measurement_type_field or field == self.technology_type_field ):
                            i = 0
                            while i < len(study_record.assays):
                                ontology_label = study_record.assays[i][label_field]
                                ontology_URI = study_record.assays[i][term_field]
                                ontology = study_record.assays[i][ontology_field]
                                i = i + 1
                                # print("ontology_label ", ontology_label)
                                # print("ontology_URI ", ontology_URI)
                                # print("ontology ", ontology)

                                self.add_info(ontology, ontology_label, ontology_URI, doi_url)

        with open('ontology_info.json', 'w') as outfile:
            json.dump(self.ontology_info, outfile)
        return;


if __name__ == "__main__":
        import sys
        reporter = OntologyUsageInfo()
        #reporter.ontology_term_usage_report(sys.argv[1])
        reporter.ontology_term_usage_report("../data", "design_type")
