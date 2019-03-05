__author__ = 'agbeltran'

class OntologyUsageInfo():
    """
        Builds a report about the usage of ontologies
        <ontology term> <data descriptor doi> <publication date>
    """

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

    def ontology_term_usage_report(self, field):
        """
        Generates a report on ontology usage, given the field for which the annotation was done.
        :param self: this method is called on an object of the class
        :param field: a string that can be design_type, measurement_type or technology_type
        """
        return;


if __name__ == "__main__":
        import sys
        reporter = OntologyUsageInfo()
        #reporter.ontology_term_usage_report(sys.argv[1])
        reporter.ontology_term_usage_report("")
