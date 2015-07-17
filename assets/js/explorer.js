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
});

ISATABExplorer.functions = {

    get_template: function (template_name) {
        var source = $(template_name).html();
        var template = Handlebars.compile(source);
        return template;
    },

    load_data: function (index_url, placement) {
        $.ajax({
                url: index_url,
                dataType: "json",
                cache: false,
                success: function (data) {

                    var popular_keywords = {};
                    var popular_assays = {};

                    var template = ISATABExplorer.functions.get_template("#submission_template");
                    $("#article-count").html(data.length);
                    for (var record_idx in data) {
                        ISATABExplorer.functions.prepare_for_index(data[record_idx]);

                        ISATABExplorer.index.add(
                            data[record_idx]
                        );

                        var tmp_data = data[record_idx];

                        if (data[record_idx].authors != '') {
                            tmp_data.authors = data[record_idx].authors.split(",")[0] + ' et al';
                        } else {
                            tmp_data.authors = '';

                        }

                        tmp_data.keywords = data[record_idx].keywords.split(";");

                        tmp_data.assay_type = [];
                        var match_found = false;
                        for (var mapping in ISATABExplorer.assay_mapping) {
                            if (tmp_data.assays.toLowerCase().indexOf(mapping) != -1 && tmp_data.assay_type.indexOf(ISATABExplorer.assay_mapping[mapping]) == -1) {
                                tmp_data.assay_type.push(ISATABExplorer.assay_mapping[mapping]);
                                match_found = true;
                            }
                        }

                        for (var keyword in tmp_data.keywords) {
                            tmp_data.keywords[keyword] = tmp_data.keywords[keyword].substring(tmp_data.keywords[keyword].lastIndexOf("/") + 1).toLowerCase();

                            if (!(tmp_data.keywords[keyword] in popular_keywords)) {
                                popular_keywords[tmp_data.keywords[keyword]] = 0;
                            }
                            popular_keywords[tmp_data.keywords[keyword]]++;
                        }

                        var split_assays = tmp_data.assays.split(";");
                        for (var assay in split_assays) {
                            var assay_name = split_assays[assay].toLowerCase().trim();

                            if (!(assay_name in popular_assays)) {
                                popular_assays[assay_name] = 0;
                            }
                            popular_assays[assay_name]++;
                        }


                        ISATABExplorer.data[data[record_idx].id] = tmp_data;

                        $(".grid").append(
                            template(tmp_data)
                        );
                    }

                    var template = ISATABExplorer.functions.get_template("#filter_list_template");
                    var top_keywords = ISATABExplorer.functions.get_top_values(popular_keywords);
                    $("#popular-keywords").html(template({"values":top_keywords}));

                    var template = ISATABExplorer.functions.get_template("#filter_list_template");
                    var top_assays = ISATABExplorer.functions.get_top_values(popular_assays);
                    $("#popular-assays").html(template({"values":top_assays}));


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
                                if (text.indexOf(item.toLowerCase().trim()) != -1 ) {
                                    ok_to_show = true || ok_to_show;
                                }
                            });

                            if (ok_to_show || ISATABExplorer.current_filters.size == 0) {
                                $(this).fadeIn(500);
                            } else {
                                $(this).fadeOut(500);
                            }
                        })

                    });
                    Transition.functions.init();
                }
            }
        );
    },

    get_top_values: function(popular_n) {
        // Create items array
        var items = Object.keys(popular_n).map(function (key) {
            return [key, popular_n[key]];
        });

        // Sort the array based on the second element
        items.sort(function (first, second) {
            return second[1] - first[1];
        });

        return items.slice(0, 5).map(function(d) {
            return {key:d[0], "value":d[1]};
        });
    },

    prepare_for_index: function (data) {
        data['_keywords'] = '';

        var tmp_keywords = data.keywords.split(";");
        for (var keyword in tmp_keywords) {
            data['_keywords'] += tmp_keywords[keyword].substring(tmp_keywords[keyword].lastIndexOf("/") + 1) + ' '
        }
    },

    search: function (value) {
        var search_term = $("#search").val();

        $(".filter-list li").each(function () {
            $(this).removeClass("active");
        });

        var template = ISATABExplorer.functions.get_template("#submission_template");

        if (search_term == '') {

            $(".grid").html('<header class="top-bar"><span id="article-count"></span> Studies Displayed</header>');

            var count = 0;
            for (var record_id in ISATABExplorer.data) {
                $(".grid").append(
                    template(ISATABExplorer.data[record_id])
                );
                count++;
            }

            $("#article-count").text(count);


        } else {
            var results = ISATABExplorer.index.search(search_term);
            $(".grid").html('<header class="top-bar"><span id="article-count"></span> Studies matching <span id="search-term">' + search_term + '</span></header>');
            $("#article-count").text(results.length);

            for (var result in results) {
                var item = ISATABExplorer.data[results[result].ref];

                var tmp_item = item;
                console.log(tmp_item);

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

        Transition.functions.init();

    }

};