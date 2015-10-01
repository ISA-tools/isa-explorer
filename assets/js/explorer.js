/**
 * Created by eamonnmaguire on 05/07/15.
 */

ISATABExplorer = {};

ISATABExplorer.data = {};
ISATABExplorer.facet_fields = ['split_assays', 'keywords', 'split_organisms', 'split_environments', 'split_locations', 'split_factors', 'split_repository', 'split_technologies', 'split_designs'];
ISATABExplorer.current_filters = new Set([]);

ISATABExplorer.assay_mapping = {
    "transcriptomics": "transcriptomics",
    "transcription": "transcriptomics",
    "function genomics": "transcriptomics",
    "proteomics": "proteomics",
    "protein": "proteomics",
    "meteorol": "meteorology",
    "climate": "meteorology",
    "mri": "brain",
    "fmri": "brain",
    "sensory": "brain",
    "behavio": "brain",
    "magnetic": "nmr",
    "chemistry": "chemistry",
    "fish": "fish",
    "viral": "virus",
    "virus": "virus",
    "transport": "transport",
    "snp": "snp",
    "genom": "genomics",
    "dna": "genomics",
    "rna": "rna",
    "metabol": "metabolomics",
    "methylation": "methylation"
};

ISATABExplorer.index = lunr(function () {
    this.ref('id')
    this.field('title', {boost: 10})
    this.field('authors')
    this.field('_keywords')
    this.field('affiliations')
    this.field('date')
    this.field('assays')
    this.field('repository')
    this.field('technologies')
    this.field('Characteristic[organism]')
    this.field('Characteristic[environment type]')
    this.field('Characteristic[geographical location]')
    this.field('factors')
});

ISATABExplorer.functions = {

    get_template: function (template_name) {
        var source = $(template_name).html();
        var template = Handlebars.compile(source);
        return template;
    },

    render_top_lists: function (popular_keywords, popular_assays, popular_factors, popular_organisms,
                                popular_environments, popular_locations, popular_repositories, popular_technologies, popular_designs) {


        var template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-repositories").html(template({"values": ISATABExplorer.functions.get_top_values(popular_repositories, 5)}));

        var template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-designs").html(template({"values": ISATABExplorer.functions.get_top_values(popular_designs, 5)}));

        template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-keywords").html(template({"values": ISATABExplorer.functions.get_top_values(popular_keywords, 5)}));

        template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-assays").html(template({"values": ISATABExplorer.functions.get_top_values(popular_assays, 5)}));

        template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-technologies").html(template({"values": ISATABExplorer.functions.get_top_values(popular_technologies, 5)}));

        template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-factors").html(template({"values": ISATABExplorer.functions.get_top_values(popular_factors, 5)}));

        template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-organisms").html(template({"values": ISATABExplorer.functions.get_top_values(popular_organisms, 5)}));

        template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-environments").html(template({"values": ISATABExplorer.functions.get_top_values(popular_environments, 5)}));

        template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-locations").html(template({"values": ISATABExplorer.functions.get_top_values(popular_locations, 5)}));
    },


    attach_listeners_to_filters: function () {
        $(".filter-list li").on("click", function () {

            $(this).toggleClass("active");

            if ($(this).hasClass("active")) {
                ISATABExplorer.current_filters.add($(this).find(".value").text())
            } else {
                ISATABExplorer.current_filters.delete($(this).find(".value").text())
            }

            $(".submission_item").each(function () {
                var text = $(this).text().toLowerCase().trim();
                var ok_to_show = false;
                ISATABExplorer.current_filters.forEach(function (item) {
                    if (text.indexOf(item.toLowerCase().trim()) != -1) {
                        ok_to_show = true || ok_to_show;
                    }
                });


                if (ok_to_show || ISATABExplorer.current_filters.size == 0) {
                    $(this).fadeIn(200);

                } else {
                    $(this).fadeOut(200);
                }
            });

            setTimeout(function() {
                $("#article-count").html($(".submission_item").filter(function() { return $(this).css("display") != "none" }).length)
            }, 300);



        });
    },

    load_data: function (index_url, placement) {
        $.ajax({
                url: index_url,
                dataType: "json",
                cache: false,
                success: function (data) {

                    var template = ISATABExplorer.functions.get_template("#submission_template");
                    $("#article-count").html(data.length);

                    var facets = {};
                    for (var record_idx in data) {

                        ISATABExplorer.index.add(data[record_idx]);

                        var tmp_data = data[record_idx];
                        if (data[record_idx].authors != '') {
                            tmp_data.authors = data[record_idx].authors.split(",")[0] + ' et al';
                        } else {
                            tmp_data.authors = '';
                        }

                        tmp_data.keywords = data[record_idx].keywords.split(";");
                        for (var keyword in tmp_data.keywords) {
                            tmp_data.keywords[keyword] = tmp_data.keywords[keyword].substring(tmp_data.keywords[keyword].lastIndexOf("/") + 1).toLowerCase();
                        }

                        tmp_data.split_assays = tmp_data.assays.split(";");

                        tmp_data.split_factors = tmp_data.factors.split(";");

                        tmp_data.split_repository = tmp_data['repository'].split(";");

                        tmp_data.split_technologies = tmp_data['technologies'].split(";");

                        tmp_data.split_designs = tmp_data['designs'].split(";");

                        if ('factors' in tmp_data) {
                            tmp_data.split_factors = tmp_data['factors'].split(";");
                        } else {
                            tmp_data.split_factors = '';
                        }

                        if ('Characteristics[organism]' in tmp_data) {
                            tmp_data.organism = tmp_data['Characteristics[organism]'];
                            tmp_data.split_organisms = tmp_data['Characteristics[organism]'].split(";");
                        } else {
                            tmp_data.split_organisms = tmp_data.organism = '';
                        }

                        if ('Characteristics[geographical location]' in tmp_data) {
                            tmp_data.locations = tmp_data['Characteristics[geographical location]'];
                            tmp_data.split_locations = tmp_data['Characteristics[geographical location]'].split(";");
                        } else {
                            tmp_data.split_locations = tmp_data.locations = '';
                        }

                        if ('Characteristics[environment type]' in tmp_data) {
                            tmp_data.environments = tmp_data['Characteristics[environment type]'];
                            tmp_data.split_environments = tmp_data['Characteristics[environment type]'].split(";");
                        } else {
                            tmp_data.split_environments = tmp_data.environments = '';
                        }


                        ISATABExplorer.data[data[record_idx].id] = tmp_data;
                        ISATABExplorer.functions.process_facet(ISATABExplorer.data, data[record_idx].id, ISATABExplorer.facet_fields, facets);
                        $(".grid").append(
                            template(tmp_data)
                        );
                    }

                    var popular_assays = facets.split_assays;
                    var popular_keywords = facets.keywords;
                    var popular_organisms = facets.split_organisms;
                    var popular_environments = facets.split_environments;
                    var popular_locations = facets.split_locations;
                    var popular_factors = facets.split_factors;
                    var data_repositories = facets.split_repository;
                    var popular_technologies = facets.split_technologies;
                    var popular_designs = facets.split_designs;

                    ISATABExplorer.functions.render_top_lists(popular_keywords, popular_assays, popular_factors,
                        popular_organisms, popular_environments, popular_locations, data_repositories, popular_technologies, popular_designs);
                    ISATABExplorer.functions.attach_listeners_to_filters();

                    Transition.functions.init();
                }
            }
        );
    },

    get_top_values: function (popular_n, number_of_results) {
        // Create items array
        if (popular_n) {
            var items = Object.keys(popular_n).map(function (key) {
                if (key != '') return [key, popular_n[key]];
            });

            // Sort the array based on the second element
            items.sort(function (first, second) {
                return second[1] - first[1];
            });
            // so that you don't index something that doesn't exist...
            return items.map(function (d) {
                if (d) {
                    return {key: d[0], "value": d[1]};
                }
            });
        } else {
            return [];
        }
    },

    search: function (value) {
        var search_term = $("#search").val();


        $(".filter-list li").each(function () {
            $(this).removeClass("active");
        });

        var popular_keywords = {}, popular_assays = {}, popular_organisms = {}, popular_factors = {}, popular_environments = {}, popular_locations = {},
            data_repositories = {}, popular_technologies = {}, popular_designs = {};

        var template = ISATABExplorer.functions.get_template("#submission_template");
        if (search_term == undefined || search_term == '') {
            $("#reset-button").addClass("hidden");

            $(".grid").html('<header class="top-bar"><span id="article-count"></span> Studies Displayed</header>');

            var count = 0;
            facets = {};
            for (var record_id in ISATABExplorer.data) {
                ISATABExplorer.functions.process_facet(ISATABExplorer.data, record_id, ISATABExplorer.facet_fields, facets);
                console.log(ISATABExplorer.data[record_id]);
                $(".grid").append(
                    template(ISATABExplorer.data[record_id])
                );
                count++;
            }

            popular_assays = facets.split_assays;
            popular_keywords = facets.keywords;
            popular_organisms = facets.split_organisms;
            popular_environments = facets.split_environments;
            popular_locations = facets.split_locations;
            popular_factors = facets.split_factors;
            data_repositories = facets.split_repository;
            popular_technologies = facets.split_technologies;
            popular_designs = facets.split_designs;

            $("#article-count").text(count);


        } else {
            $("#reset-button").removeClass("hidden");

            var results_facets = ISATABExplorer.functions.search_index(ISATABExplorer.index, search_term, ISATABExplorer.data,
                ISATABExplorer.facet_fields);

            $(".grid").html('<header class="top-bar"><span id="article-count"></span> Studies matching <span id="search-term">' + search_term + '</span></header>');

            $("#article-count").text(results_facets.results.length);

            for (var result in results_facets.results) {
                var item = ISATABExplorer.data[results_facets.results[result].ref];
                $(".grid").append(
                    template(item)
                );
            }

            popular_assays = results_facets.facets.split_assays;
            popular_keywords = results_facets.facets.keywords;
            popular_organisms = results_facets.facets.split_organisms;
            popular_environments = results_facets.facets.split_environments;
            popular_locations = results_facets.facets.split_locations;
            popular_factors = results_facets.facets.split_factors;
            data_repositories = results_facets.facets.split_repository;
            popular_technologies = results_facets.facets.split_technologies;
            popular_designs = results_facets.facets.split_designs;

            if (!value) {
                var regex = new RegExp(search_term, "igm");
                $(".submission_item").each(function () {
                    var current_html = $(this).html();

                    var replaced = current_html.replace(regex, '<span class="highlight">' + search_term + '</span>');
                    $(this).html(replaced);
                })
            }
        }

        ISATABExplorer.functions.render_top_lists(popular_keywords, popular_assays, popular_factors,
            popular_organisms, popular_environments, popular_locations, data_repositories, popular_technologies, popular_designs);
        ISATABExplorer.functions.attach_listeners_to_filters();
        Transition.functions.init();

    },

    process_facet: function (data, index, fields, facets) {
        var doc = data[index];

        var added = [];
        for (var field_idx in fields) {
            var field_name = fields[field_idx];

            if (!(field_name in facets)) {
                facets[field_name] = {}
            }

            var field_values = doc[field_name];
            for (var field_val_idx in field_values) {
                var field_value = field_values[field_val_idx];

                if (facets[field_name][field_value] === undefined) {
                    facets[field_name][field_value] = 0
                }

                if (added.indexOf(field_value) == -1) {
                    facets[field_name][field_value] += 1;
                    added.push(field_value);
                }
            }
        }
    },

    search_index: function (index, query, data, fields) {
        var results = index.search(query);

        var facets = {};
        $.each(results, function (index, searchResult) {
            ISATABExplorer.functions.process_facet(data, searchResult.ref, fields, facets);
        });

        return {"results": results, "facets": facets};
    }

};

Handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});
