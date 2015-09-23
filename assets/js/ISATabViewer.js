/**
 * Created by eamonnmaguire on 19/06/2014.
 */

var ISATabViewer = {};

ISATabViewer.investigation = {
    "ONTOLOGY SOURCE REFERENCE": {},
    "INVESTIGATION": {},
    "INVESTIGATION CONTACTS": {},
    "INVESTIGATION PUBLICATIONS": {},
    "STUDY": []
};

ISATabViewer.options = {
    splitter: "\t"  // for TSV or "," for CSV
};

ISATabViewer.spreadsheets = {
    "files": {}
};

hashCode = function (s) {
    return s.split("").reduce(function (a, b) {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a
    }, 0);
}

ISATabViewer.rendering = {


    render_sample_statistics: function () {
        var source = $("#sample-distribution-template").html();
        var template = Handlebars.compile(source);
        var html = template({"sample_stats": ISATabViewer.sample_stats});
        $("#sample-distribution").html(html);

        for (var stat_idx in ISATabViewer.sample_stats) {
            ISATabViewer.rendering.add_chart("#plot-" + stat_idx, '#distribution-list-' + stat_idx, ISATabViewer.sample_stats[stat_idx]);
        }
    },

    /*
     * Renders ISATab given an investigation url which is retrieved and processed and options to configure the display
     *
     */

    process_file: function (file_name, file_contents, placement) {
        var lines = file_contents.split("\n");

        var current_section = "";
        var current_study;

        for (var line in lines) {
            var __ret = ISATabViewer.rendering.process_investigation_file_line(lines[line], current_study, current_section);
            if (__ret != undefined) {
                current_study = __ret.current_study;
                current_section = __ret.current_section;
            }
        }

        if (current_study != undefined)
            ISATabViewer.investigation["STUDY"].push(current_study);


        for (var study_index in ISATabViewer.investigation.STUDY) {

            var study_information = ISATabViewer.investigation.STUDY[study_index];
            var study_file = ISATabViewer.rendering.replace_str("\"", "", study_information.STUDY["Study File Name"][0]);
            var base_directory = file_name.substr(0, file_name.lastIndexOf("/") + 1);

            var assays = ISATabViewer.rendering.generate_records(study_information, "STUDY ASSAYS");

            $.ajax({
                url: base_directory + study_file,
                success: function (study_file_contents) {
                    var processed_characteristics = ISATabViewer.rendering.process_assay_file(study_file, study_file_contents);

                    ISATabViewer.spreadsheets.files[study_file]["stats"] = processed_characteristics;
                    ISATabViewer.rendering.render_study_list(placement);

                    if ($('#sample-distribution').length) {
                        ISATabViewer.sample_stats =  ISATabViewer.rendering.process_study_sample_statistics(processed_characteristics);

                        ISATabViewer.rendering.render_sample_statistics();
                    }
                }
            });

            for (var assay in assays) {
                $.ajax({
                    url: base_directory + assays[assay]["Study Assay File Name"],
                    success: function (file_contents) {
                        var original_file_name = ISATabViewer.rendering.replace_str(base_directory, "", this.url);
                        ISATabViewer.rendering.process_assay_file(original_file_name, file_contents);
                    }
                });
            }
        }
    },


    process_assay_file: function (file_name, file_contents) {
        ISATabViewer.spreadsheets.files[file_name] = {"headers": [], "rows": []};

        var lines = file_contents.split("\n");
        var count = 0;

        var position_to_characteristic = {};
        var characteristics = {};

        for (var line in lines) {

            var line_contents = lines[line].trim();
            var parts = line_contents.split(ISATabViewer.options.splitter);
            var processed_parts = [];

            parts.forEach(function (part, index) {
                var column_value = ISATabViewer.rendering.replace_str("\"", "", part);
                processed_parts.push(column_value);

                // we store information about the characteristics of the samples (sample files begin with 's_')
                // to give an overview in the study info page

                if (count == 0 && column_value.indexOf("Characteristics") >= 0) {

                    characteristics[column_value] = {};
                    position_to_characteristic[index] = column_value;
                } else {
                    if (index in position_to_characteristic) {
                        var characteristic_name = position_to_characteristic[index];

                        if (!(column_value in characteristics[characteristic_name])) {
                            characteristics[characteristic_name][column_value] = 0;
                        }
                        characteristics[characteristic_name][column_value]++;
                    }
                }

            });
            if (count == 0) {
                // we have the headers
                ISATabViewer.spreadsheets.files[file_name]["headers"] = processed_parts;
            } else {
                ISATabViewer.spreadsheets.files[file_name]["rows"].push(processed_parts);
            }
            count++;
        }

        return characteristics;
    },


    process_investigation_file_line: function (line_contents, current_study, current_section) {
        if (line_contents.lastIndexOf("#", 0) === 0)
            return;
        if (line_contents in ISATabViewer.investigation || (current_study != undefined && line_contents in current_study)) {
            current_section = line_contents;
            if (current_section == 'STUDY') {
                if (current_study != undefined) ISATabViewer.investigation["STUDY"].push(current_study);
                current_study = ISATabViewer.rendering.create_study_template();
            }
        } else {
            var parts = line_contents.split(ISATabViewer.options.splitter);

            if (parts.length > 0) {


                if (current_study != undefined) {
                    current_study[current_section][parts[0]] = $.grep(parts, function (v, i) {
                        return v != "" && i != 0;
                    });
                } else {
                    ISATabViewer.investigation[current_section][parts[0]] = $.grep(parts, function (v, i) {
                        return v != "" && i != 0;
                    });
                }
            }
        }
        return {current_study: current_study, current_section: current_section, parts: parts};
    },

    render_study_list: function () {
        // Render study list
        var studies = [];

        for (var study_index in ISATabViewer.investigation.STUDY) {
            var study_id = ISATabViewer.rendering.replace_str("\"", "", ISATabViewer.investigation.STUDY[study_index].STUDY["Study Identifier"][0]);
            studies.push({"hash": hashCode(study_id), "id": study_id})
        }

        console.log(studies[0]);
        $("#isa-breadcrumb-items").html('<li class="active">' + studies[0].id + '</li>');

        var source = $("#study-list-template").html();
        var template = Handlebars.compile(source);
        var html = template({"studies": studies});
        $("#study-list").html(html);

        ISATabViewer.rendering.render_study(studies[0].id, studies[0].hash);

    },

    set_active_list_item: function (study_id_hash) {

        $("#study-list").find("li").each(function () {
            $(this).removeClass("active");
        });

        $("#list-" + study_id_hash).addClass("active");
    },


    process_study_sample_statistics: function (stats) {
        var study_sample_stats = [];
        for (var characteristic_name in stats) {
            var record = {"name": characteristic_name, "distribution": []};

            for (var distribution_item in stats[characteristic_name]) {
                record["distribution"].push({
                    "name": distribution_item,
                    "value": stats[characteristic_name][distribution_item]
                })
            }
            study_sample_stats.push(record);
        }
        return study_sample_stats
    },


    render_study: function (study_id, study_id_hash) {

        this.set_active_list_item(study_id_hash);

        $("#isa-breadcrumb-items").html('<li onclick="Transition.functions.hideContent();" class="active"><i class="fa fa-chevron-left"></i> Back to Studies </li><li >' + study_id + '</li>');
        var study = {};
        for (var study_index in ISATabViewer.investigation.STUDY) {

            var study_information = ISATabViewer.investigation.STUDY[study_index];
            console.log(study_information.STUDY);
            if (study_information.STUDY["Study Identifier"][0].indexOf(study_id) != -1) {
                study.study_id = ISATabViewer.rendering.replace_str("\"", "", study_information.STUDY["Study Identifier"][0]);
                study.study_title = ISATabViewer.rendering.replace_str("\"", "", study_information.STUDY["Study Title"][0]);
                study.study_description = ISATabViewer.rendering.replace_str("\"", "", study_information.STUDY["Study Description"][0]);
                study.study_file = ISATabViewer.rendering.replace_str("\"", "", study_information.STUDY["Study File Name"][0]);
                study.public_release_date = ISATabViewer.rendering.replace_str("\"", "", study_information.STUDY["Study Public Release Date"][0]);
                study.metadata_license = ISATabViewer.rendering.replace_str("\"", "", study_information.STUDY["Comment[Experimental Metadata Licence]"][0]);
                study.manuscript_license = ISATabViewer.rendering.replace_str("\"", "", study_information.STUDY["Comment[Manuscript Licence]"][0]);

                study.publications = ISATabViewer.rendering.generate_records(study_information, "STUDY PUBLICATIONS");
                study.protocols = ISATabViewer.rendering.generate_records(study_information, "STUDY PROTOCOLS");
                study.contacts = ISATabViewer.rendering.generate_records(study_information, "STUDY CONTACTS");
                study.factors = ISATabViewer.rendering.generate_records(study_information, "STUDY FACTORS");
                study.assays = ISATabViewer.rendering.generate_records(study_information, "STUDY ASSAYS");

                ISATabViewer.rendering.postprocess_assay_records(study.assays);

                if (study.study_file in ISATabViewer.spreadsheets.files) {
                    // we have already loaded the study sample file, so can load the distributions
                    study.sample_stats = ISATabViewer.spreadsheets.files[study.study_file]["stats"];
                    study.sample_stats = this.process_study_sample_statistics(study.sample_stats);
                }
            }
        }

        var source = $("#study-template").html();
        var template = Handlebars.compile(source);
        var html = template(study);

        $("#study-info").html(html);

        ISATabViewer.rendering.render_sample_statistics();

        var source = $("#meta_info_template").html();
        var template = Handlebars.compile(source);
        var html = template({"doi": study.study_id, "date": study.public_release_date, "manuscript_license":study.manuscript_license, "metadata_license": study.metadata_license,
            "study_id": study.study_id, "study_file": study.study_file, "sample_count": ISATabViewer.spreadsheets.files[study.study_file].rows.length, "assays": study.assays});
        $("#meta_info").html(html);

    },

    render_assay: function (study_id, file_name) {

        $("#isa-breadcrumb-items").html('<li onclick="Transition.functions.hideContent();" class="active"><i class="fa fa-chevron-left"></i> Back to Studies</li><li onclick="ISATabViewer.rendering.render_study(\'' + study_id + '\')" class="active"><span class="fa fa-align-justify"></span> Study Details </li><li><span class="fa fa-table"></span> ' + file_name + '</li>');

        var spreadsheet = ISATabViewer.spreadsheets.files[file_name];

        $("#study-info").html('');

        var container = document.getElementById('study-info');
        var hot = new Handsontable(container, {
            data: spreadsheet.rows,
            colHeaders: spreadsheet.headers,
            fillHandle: false,
            contextMenu: false,
            manualColumnMove: false,
            manualColumnResize: true,
            manualRowResize: true,
            manualRowMove: false,
            columnSorting: true,
            sortIndicator: true,
            fixedColumnsLeft: 1
        });

        hot.updateSettings({
            cells: function (row, col, prop) {
                var cellProperties = {};
                cellProperties.readOnly = true;
                cellProperties.editor = false;

                return cellProperties;
            }
        });

        hot.render();
    },

    /*
     This function adds in information about which images to use for example to show a particular type of assay.
     */
    postprocess_assay_records: function (records) {
        for (var assay_index in records) {
            var assay = records[assay_index];

            var measurement_type = assay["Study Assay Measurement Type"];

            assay.icon = measurement_type.indexOf("metabolite") >= 0 ? "assay-icon-metabolomics"
                : measurement_type.indexOf("prote") >= 0 ? "assay-icon-proteomics"
                : measurement_type.indexOf("transcript") >= 0 ? "assay-icon-transcriptomics"
                : measurement_type.indexOf("chemistry") >= 0 ? "assay-icon-chemistry"
                : measurement_type.indexOf("genom") >= 0 ? "assay-icon-genomics"
                : "";

        }
    },

    generate_records: function (study_information, field_name) {
        var result = [];
        for (var field in study_information[field_name]) {

            var records = study_information[field_name][field];
            for (var i = 0; i < records.length; i++) {
                if (result[i] == undefined) {
                    result[i] = {}
                }
                result[i][field] = ISATabViewer.rendering.replace_str("\"", "", records[i]);
            }
        }

        return result;
    },

    replace_str: function (find, replace, str) {
        return str.replace(new RegExp(find, 'g'), replace);
    },

    render_isatab_from_file: function (investigation_file, placement, callback) {

        $.ajax({
            url: investigation_file,
            success: function (file) {
                ISATabViewer.investigation.STUDY = [];
                ISATabViewer.rendering.process_file(investigation_file, file, placement);
//                $("#download-button").html('<a href="https://gist.github.com/' + gist_id +'/download" class="btn btn-green" style="width: 120px">Download this study.</span>');
                if (callback && typeof(callback) === "function") {
                    callback();
                }
            }
        });
    },

    create_study_template: function () {
        return {
            "STUDY": {},
            "STUDY CONTACTS": {},
            "STUDY PUBLICATIONS": {},
            "STUDY FACTORS": {},
            "STUDY DESIGN DESCRIPTORS": {},
            "STUDY ASSAYS": {},
            "STUDY PROTOCOLS": {}
        };
    },

    add_chart: function (placement,legend_placement, data) {

        var distribution = [];
        for (var idx in data.distribution) {
            distribution.push({"id": "data-"+idx, "label": data.distribution[idx].name, "value": data.distribution[idx].value})
        }

        PieChart.render(placement, distribution, placement, legend_placement);

    }
};