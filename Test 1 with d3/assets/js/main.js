
$(document).ready(
    d3.select("#url_input-submit").on("click", function(e){

        d3.html(
            d3.select("#url_input-input").property('value') !== "" ? 
                d3.select("#url_input-input").property('value') : "https://developer.mozilla.org/en-US/docs/Web/API/document.getElementById", 
            function(error, html) {

                if (error) return console.warn(error);

                var element_count_array = parseHtml(html);
                createTable(element_count_array, ['Tag', 'Count']);
                populateTable(element_count_array, d3.select('tbody'));
                enableSorting(element_count_array, true);

                var graph_button = d3.select("#url_input-graph")
                    .property('disabled', false)
                    .on("click", function(e){
                        createBubbles(element_count_array);
                    });
            }
        );
    })
);

function parseHtml(raw_html){
    var elements = d3.select(raw_html).selectAll("*")[0],
        element_count = {};
    elements.forEach( function(e){
        element_count[e.tagName] = element_count.hasOwnProperty(e.tagName) ? element_count[e.tagName]+1 : 1;
    });

    element_count_array = [];
    for ( var a in element_count ){
        element_count_array.push( { tag:a.toLowerCase(), count:element_count[a] } );
    }
    return element_count_array;
}

function createTable(data, columns) {
    $("#url_results").empty();
    var table = d3.select("#url_results").append("table"),
        thead = table.append("thead"),
        tbody = table.append("tbody");

    // append the header row
    thead.append("tr")
        .selectAll("th")
        .data(columns)
            .enter()
            .append("th")
            .text(function(column) { return column; })
            .attr('id', function(column) { return column.toLowerCase(); } );

    return table;
}

function populateTable(data, tbody){
    // create a row for each object in the data
    $('tbody').empty();

    var rows = tbody.selectAll("tr")
        .data( data )
            .enter()
            .append("tr");

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
        .data( function(row) { return [row.tag, row.count]; } )
            .enter()
            .append("td")
            .text(function(d) { return d; });
    

    createBubbles(data);
    return rows;
}

function enableSorting( array_to_sort, bool ){
    if(bool){
        d3.selectAll("th").on('click', function (e){
            var tag_name = e.toLowerCase(),

                direction = $("#"+tag_name ).hasClass("descending") ? -1:1 ;
            sortTable(array_to_sort, tag_name, direction);
            $("th").removeClass();
            if (direction === 1){
                $("#"+tag_name ).addClass("descending");
            } else {                
                $("#"+tag_name ).addClass("ascending");
            }
        });
    } else {
        d3.selectAll("th").unbind('click');
    }
    return true;
}

function sortTable(array_to_sort, condition, direction){
    var sorted_array = array_to_sort.sort( function(a,b){
         if (a[condition] < b[condition])
          return -1;
         if (a[condition] > b[condition])
          return 1;
         return 0;
    }); 
    if (direction === -1){ sorted_array = sorted_array.reverse(); }
    return populateTable(sorted_array, d3.select('tbody') );
}

function createBubbles(element_count_array){
    var chart_size = $("body").height() - $('#url_input').height(),
        bubble_data = convertDataForBubble(element_count_array);

    var bubble = d3.layout.pack()
        .sort(null)
        .size([chart_size, chart_size])
        .padding(1.5);

    $("#bubble_chart").empty();
    var svg = d3.select("#bubble_chart").append("svg")
        .attr("width", chart_size)
        .attr("height", chart_size)
        .attr("id", "bubble_chart-svg");

    var node = svg.selectAll(".node")
        .data( bubble.nodes( bubble_data ) )
            .enter().append("g")
                .attr("class", "node")
                .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("title")
      .text(function(d) { return d.name + " : " + d.value; })
      .style('overflow', "hidden");

    node.append("circle")
      .attr("r", function(d) { return d.r; })
      .style("fill", function(d) { return chooseColor(); });

    node.append("text")
      .style("text-anchor", "middle")
      .style("font-family", "sans-serif")
      .style("font-size", function(d) { return Math.ceil(d.r/2)+"px"; })
      .text(function(d) { return d.name; });

    d3.select(self.frameElement).style("height", chart_size + "px");
    d3.select("#url_results")
        .style("height", $("body").height()-$('#url_input').height() );
}

function convertDataForBubble(element_count_array){
    var bubble_data = {
        name:"",
        children: []
    };
    for (var i in element_count_array){
        bubble_data.children.push( 
            {name: element_count_array[i].tag, size:1, value: element_count_array[i].count }
        );
    }
    return bubble_data;
}


function chooseColor(){
    var color_base = Math.floor(Math.random()*256),
        color_choices = [ 
            Math.floor(Math.random()*color_base), 
            color_base, 
            255
        ],
        colour = shuffleArray(color_choices);

    return "rgba("+colour.join(',')+", 0.4)"; 
}

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}