// Main JS 
var all_tags = {};

var submit_button = $("#url_input-submit");
console.log( submit_button );
submit_button.click(function(e){
	console.log( $("#url_input-input").val()  );
	$.ajax({
		url: $("#url_input-input").val(),
		type:"get",
		success: function(raw_html){
			parseHtml(raw_html);
		}
	});
});

function parseHtml(raw_html){
	var jqHtml = $(raw_html);
	all_tags = { 'html':1, 'body': 1, 'head':1 };

	jqHtml.each(function(index){
		if( $(this).children().length > 0){
			addTagToList( $(this)[0] );
			parseHtml( $(this).children() );
		} else {
			if ($(this)[0].localName !== null){		
				addTagToList( $(this)[0] );
			}
		}
	});
	writeTable(all_tags);
}

function addTagToList( element ){
	all_tags[element.tagName.toLowerCase()] = all_tags.hasOwnProperty(element.tagName.toLowerCase()) ? all_tags[element.tagName.toLowerCase()] +1 : 1;
}

function writeTable( data_set, inverted ){
	if ( data_set.length > 0){
		var new_data ={};
		for (var i in data_set ){
			new_data[data_set[i][0]] = data_set[i][1];
		}
		data_set = new_data;
		console.log(new_data);
	}
	console.log(data_set);
	var table = $("<table/>", { id:"url_results-table"});
	var header = $("<th/>", { id:"url_results-header"});
	var tag_names = $("<td/>", { text:"Tag", id:"url_results-name_sort"});
	var tag_count = $("<td/>", { text:"Count", id:"url_results-count_sort" });
	header.append( tag_names, tag_count );
	table.append(header);

	for ( var j in data_set ){
		var row = $("<tr/>", { class:"url_results-row"});
		var tag_name = $("<td/>", { text:j, class:"url_results-name" });
		var tag_num = $("<td/>", { text:data_set[j], class:"url_results-count" });
		row.append( tag_name, tag_num );
		table.append(row);
	}
	$('#url_results').empty().append(table);
	if ( typeof(inverted) !== "undefined"){
		$("#url_results-"+inverted+"_sort").addClass('inverted');
	}

	$("#url_results-name_sort, #url_results-count_sort").click( function(e){ sortTable(e); } );
}

function sortTable(e){

	$('th td').removeClass('inverted');
	var sort_type = e.target.id.split('-')[1].split('_')[0];
	var tags_to_sort = [];
	for ( var elem in all_tags ){
		tags_to_sort.push( [ elem, all_tags[elem] ] );
	}
	if (sort_type === "name"){
		tags_to_sort.sort();
	} else if ( sort_type === "count"){
		console.log("count_sort");
		tags_to_sort.sort(function(a,b){ console.log(a); console.log(a[1]); return a[1] > b[1]; } );
	}
	tags_to_sort = $(e.target).hasClass('inverted') ? tags_to_sort.reverse() : tags_to_sort;
	$(tags_to_sort).each(function(){
		console.log(this);
	});
	if( $(e.target).hasClass('inverted') ){
		writeTable( tags_to_sort, sort_type);
	} else {
		writeTable( tags_to_sort );
	}

}