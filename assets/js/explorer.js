/**
 * Created by eamonnmaguire on 05/07/15.
 */

ISATABExplorer = {};

ISATABExplorer.data = {};

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
                                popular_environments, popular_locations, popular_repositories) {


        var template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-repositories").html(template({"values": ISATABExplorer.functions.get_top_values(popular_repositories, 5)}));

        template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-keywords").html(template({"values": ISATABExplorer.functions.get_top_values(popular_keywords, 5)}));

        template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-assays").html(template({"values": ISATABExplorer.functions.get_top_values(popular_assays, 5)}));

        template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-factors").html(template({"values": ISATABExplorer.functions.get_top_values(popular_factors, 5)}));

        template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-organisms").html(template({"values": ISATABExplorer.functions.get_top_values(popular_organisms, 5)}));

        template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-environments").html(template({"values": ISATABExplorer.functions.get_top_values(popular_environments, 5)}));

        template = ISATABExplorer.functions.get_template("#filter_list_template");
        $("#popular-locations").html(template({"values": ISATABExplorer.functions.get_top_values(popular_locations, 5)}));
    },

    populate_popular_list: function (values, list) {
        for (var value in values) {
            var name = values[value].toLowerCase().trim();

            if (!(name in list) && name != '') {
                list[name] = 0;
            }
            list[name]++;
        }
        return list;
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
                    $(this).fadeIn(300);
                } else {
                    $(this).fadeOut(300);
                }
            })

        });
    }, load_data: function (index_url, placement) {
        $.ajax({
                url: index_url,
                dataType: "json",
                cache: false,
                success: function (data) {
                    var popular_keywords = {}, popular_assays = {}, popular_organisms = {}, popular_factors = {}, popular_environments = {}, popular_locations = {},
                        data_repositories = {}, popular_designs={};

                    var template = ISATABExplorer.functions.get_template("#submission_template");
                    $("#article-count").html(data.length);
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

                        var split_assays = tmp_data.assays.split(";");
                        tmp_data.split_assays = split_assays;
                        tmp_data.split_factors = split_assays;

                        tmp_data.split_repository = tmp_data['repository'].split(";");

                        if ('design' in tmp_data) {
                            tmp_data.split_design = tmp_data['design'].split(";");
                        } else {
                            tmp_data.split_design = '';
                        }

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


                        ISATABExplorer.functions.populate_popular_list(tmp_data.split_assays, popular_assays);
                        ISATABExplorer.functions.populate_popular_list(tmp_data.keywords, popular_keywords);
                        ISATABExplorer.functions.populate_popular_list(tmp_data.split_organisms, popular_organisms);
                        ISATABExplorer.functions.populate_popular_list(tmp_data.split_environments, popular_environments);
                        ISATABExplorer.functions.populate_popular_list(tmp_data.split_locations, popular_locations);
                        ISATABExplorer.functions.populate_popular_list(tmp_data.split_factors, popular_factors);
                        ISATABExplorer.functions.populate_popular_list(tmp_data.split_repository, data_repositories);
                        ISATABExplorer.functions.populate_popular_list(tmp_data.split_design, popular_designs);

                        ISATABExplorer.data[data[record_idx].id] = tmp_data;
                        $(".grid").append(
                            template(tmp_data)
                        );
                    }

                    ISATABExplorer.functions.render_top_lists(popular_keywords, popular_assays, popular_factors,
                        popular_organisms, popular_environments, popular_locations, data_repositories);
                    ISATABExplorer.functions.attach_listeners_to_filters();

                    Transition.functions.init();
                }
            }
        );
    },

    get_top_values: function (popular_n, number_of_results) {
        // Create items array
        var items = Object.keys(popular_n).map(function (key) {
            return [key, popular_n[key]];
        });

        // Sort the array based on the second element
        items.sort(function (first, second) {
            return second[1] - first[1];
        });
        // so that you don't index something that doesn't exist...
        return items.slice(0, number_of_results).map(function (d) {
            return {key: d[0], "value": d[1]};
        });
    },

    search: function (value) {
        var search_term = $("#search").val();

        $(".filter-list li").each(function () {
            $(this).removeClass("active");
        });

        var popular_keywords = {};
        var popular_assays = {};
        var template = ISATABExplorer.functions.get_template("#submission_template");
        if (search_term == '') {
            $("#reset-button").addClass("hidden");
            $(".grid").html('<header class="top-bar"><span id="article-count"></span> Studies Displayed</header>');

            var count = 0;
            for (var record_id in ISATABExplorer.data) {
                ISATABExplorer.functions.populate_popular_list(ISATABExplorer.data[record_id].split_assays, popular_assays);
                ISATABExplorer.functions.populate_popular_list(ISATABExplorer.data[record_id].keywords, popular_keywords);
                $(".grid").append(
                    template(ISATABExplorer.data[record_id])
                );
                count++;
            }
            $("#article-count").text(count);

        } else {
            $("#reset-button").removeClass("hidden");
            var results = ISATABExplorer.index.search(search_term);
            $(".grid").html('<header class="top-bar"><span id="article-count"></span> Studies matching <span id="search-term">' + search_term + '</span></header>');
            $("#article-count").text(results.length);

            for (var result in results) {
                var item = ISATABExplorer.data[results[result].ref];

                var tmp_item = item;

                ISATABExplorer.functions.populate_popular_list(item.split_assays, popular_assays);
                ISATABExplorer.functions.populate_popular_list(item.keywords, popular_keywords);

                $(".grid").append(
                    template(tmp_item)
                );
            }

            if (!value) {
                var regex = new RegExp(search_term, "igm");
                $(".submission_item").each(function () {
                    var current_html = $(this).html();

                    var replaced = current_html.replace(regex, '<span class="highlight">' + search_term + '</span>');
                    $(this).html(replaced);
                })
            }
        }

        ISATABExplorer.functions.render_top_lists(popular_keywords, popular_assays);
        ISATABExplorer.functions.attach_listeners_to_filters();
        Transition.functions.init();

    }

};