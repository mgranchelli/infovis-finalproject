var data = null,
    data_line = [],
    books = ['I - Blood of Elves', 'II - Times of Contempt', 'III - Baptism of Fire', 'IV - The Tower of the Swallow', 'V - The Lady of the Lake'],
    selected_book = null,
    lines = null,
    margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 1200 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;


// Scale for x-axis
var xScale = d3.scaleLinear().range([100, width - 20]).interpolate(d3.interpolateRound);

// Scale for y-axis
var yScale = d3.scaleLinear().range([height, 0]).interpolate(d3.interpolateRound);

// Scale for rect
var rectScale = d3.scaleLinear().range([150, 300]).interpolate(d3.interpolateRound);

// Update xScale.domain() 
function updateXScaleDomain() {
    xScale.domain([d3.min(data, function (d) { return d.x; }), 100 + d3.max(data, function (d) { return d.x; })]);
}


// Update yScale.domain()
function updateYScaleDomain() {
    yScale.domain([d3.min(data, function (d) { return d.y; }), d3.max(data, function (d) { return d.y; })]);
}

// Update rectScale.domain()
function updateRectScaleDomain() {
    rectScale.domain([
        d3.min(data, function (d) {
            return d.number;
        }) / 2,
        d3.max(data, function (d) {
            return d.number;
        })]);
}

// Create svg
var svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('id', uuidv4())
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


// Highlight the character that is hovered
const highlight = function (event, d) {
    selected_character = d[0].character
    // first every group turns grey
    d3.selectAll(".line")
        .transition().duration(200)
        .style("stroke", "lightgrey")
        .style("opacity", "0.2")
    // Second the hovered character takes its color
    d3.selectAll("." + selected_character)
        .transition().duration(200)
        .style("stroke", function (d) {
            return d[1].color;
        })
        .style("opacity", "1");

    svg.append("text")
        .attr("y", 600)
        .attr("x", width / 2)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr("class", "selected_character")
        .style("font-size", "30px")
        .text(selected_character);
}

// Unhighlight
const doNotHighlight = function (event, d) {
    d3.selectAll(".line")
        .transition().duration(200).delay(100)
        .style("stroke", function (d) {
            return d[1].color;
        })
        .style("opacity", "1")

    d3.selectAll(".selected_character")
        .transition().duration(200).delay(100).remove()
}

function draw_lines() {

    // Add two last points
    last_y = 210
    for (const d in data_line) {
        data_line[d].push({ 'x': data_line[d][data_line[d].length - 1].x + 100, 'y': last_y })
        last_y = last_y - 10
        data_line[d].push({ 'x': data_line[d][data_line[d].length - 2].x + 100, 'y': last_y })
        last_y = last_y + 30

    }
    

    y = 200
    check_y = false
    // Draw line
    var draw_line = function (selection) {
        selection
            .attr("d", d3.line()
                .x(function (d) {
                    //console.log(d.color)
                    if (d.character != null | d.color != null) {
                        return 0
                    }
                    else {
                        return xScale(d.x) + 25
                    };
                })
                .y(function (d) {
                    //console.log('d: ', d)
                    if (d.character != null | d.color != null) {
                        if (check_y) {
                            y = y + 10
                        }
                        check_y = true
                        return y
                    }
                    else {
                        return (d.y)
                    };
                })
                .curve(d3.curveLinear)
            );
    };

    var lines = svg.selectAll("paths")
        .data(data_line, function (d, i) { return i; });

    start_y = 200
    lines.enter().append("path")
        .attr("class", function (d) {
            return 'line ' + d[0].character;
        })
        .attr("d", d3.line()
            .x(0)
            .y(start_y)
        )
        .style("fill", "none")
        .style("stroke", function (d) {
            return d[1].color;
        })
        .style("stroke-width", "3")
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight)
        .transition().duration(1000).delay(100).call(draw_line);

    lines.transition().duration(1000)
        .ease(d3.easeLinear)
        .call(draw_line);

    lines.exit()
        .transition().duration(1000)
        .remove();


}

// Draw
function draw() {
    // Update domain
    updateXScaleDomain();
    updateYScaleDomain();
    updateRectScaleDomain();
    
    // Chapters text
    svg.append("text")
        .attr("y", 50 + d3.min(data, function (d) { return d.y; }))
        .attr("x", width / 2)
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr("class", "name_chapters")
        .style("font-size", "20px")
        .text("Chapters");

    // Selected book text
    svg.append("text")
        .attr("y", 10 + d3.min(data, function (d) { return d.y; }))
        .attr("x", width / 2)
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr("class", "selected_book")
        .style("font-size", "30px")
        .text("Book: " + books[selected_book - 1])

    // Draw rect
    var draw_rect = function (selection) {
        selection
            .attr("x", function (d) {
                return xScale(d.x)
            })
            .attr('y', function (d) {
                return yScale(d.y) - rectScale(d.number) //align bottom
            })
            .attr('width', 50)
            .attr('height', function (d) {
                return rectScale(d.number)
            });
    };

    // Draw chapters text
    var draw_text = function (selection) {
        selection
            .text(function (d) {
                return d.chapter
            })
            .attr('x', function (d) {
                return xScale(d.x) + 25
            })
            .attr('y', function (d) {
                return yScale(d.y) - 350
            })
            .attr("class", "chapters")
    };

    var rect = svg.selectAll("rect")
        .data(data, function (d, i) { return d.id; });

    rect.enter().append("rect")
        .attr('y', 0)
        .attr("x", function (d) {
            return xScale(d.x)
        })
        .attr('width', 0)
        .attr('height', 0)
        .attr('stroke', 'black')
        .attr('fill', '#69a3b2')
        .transition().duration(1000).call(draw_rect);

    rect.enter().append("text")
        .attr('x', 0)
        .attr("y", function (d) {
            return yScale(d.y) - 350
        })
        .attr('font-weight', 'bold')
        .transition().duration(1000).call(draw_text);

    rect.transition().duration(1000)
        .ease(d3.easeLinear)
        .call(draw_rect)
        .call(draw_text);

    rect.exit()
        .transition().duration(1000)
        .attr('y', height)
        .attr("x", function (d) {
            return xScale(d.x)
        })
        .attr('width', 0)
        .attr('height', 0)
        .remove();
}

/**
 * Create uuidv4
 * @returns {string}
 * */
function uuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

// Create random color 
const randColor = () => {
    return `rgb(${[1, 2, 3].map(x => Math.random() * 256 | 0)})`
}


function inizialize_path_line(chapters, x, height) {
    i = 0
    count_y_1 = 0
    count_y_0 = 0
    for (const d in chapters) {
        if (d != 'chapter' & d != 'number' & d != 'id' & d != 'x' & d != 'y') {
            if (data_line[i] == null) {
                data_line[i] = []
                data_line[i].push({ 'character': d })
                data_line[i].push({ 'color': randColor() })
            }
            if (chapters[d] == 1) {
                y_1 = yScale(chapters.y) - rectScale(height/2)
                if (count_y_1 > 0) {
                    // Traslate new line
                    y_1 = y_1 + count_y_1 * 10
                }
                data_line[i].push({ 'x': x, 'y': y_1 })
                count_y_1 += 1
            }
            else if (chapters[d] == 0) {
                y_0 = yScale(chapters.y) + 20
                if (count_y_0 > 0) {
                    y_0 = y_0 + count_y_0 * 10
                }
                data_line[i].push({ 'x': x, 'y': y_0 })
                count_y_0 += 1
            }
            i += 1
        }
    }
}

// Number characters
function get_number_characters(data) {
    zeros = 1
    for (const d in data) {
        if (data[d] == 0) {
            zeros += 1
        }
    }
    return zeros
}

function draw_graph(input) {
    switch (input.replace("book-", "")) {
        case "I": selected_book = 1; break;
        case "II": selected_book = 2; break;
        case "III": selected_book = 3; break;
        case "IV": selected_book = 4; break;
        case "V": selected_book = 5; break;
        default: selected_book = 1;
    }

    // GET JSON file
    data_line = []
    d3.json('app/assets/' + input + '.json').then(
        function (chapters) {
            // chapters.sort(function(x, y){
            //     return d3.ascending(x, y);
            //  })
            //console.log('l: ', l)
            console.log('chapters: ', chapters)
            // Add id and coordinates x and y for each four-leaves
            x_value = 0
            data = d3.map(chapters, function (d) {
                x_value += 100
                //console.log('i', x_value)
                return {
                    ...d,
                    number: Object.keys(d).length - get_number_characters(d),
                    id: uuidv4(),
                    x: x_value,
                    y: 10
                };
            });

            updateYScaleDomain()
            updateRectScaleDomain()
            
            d3.map(data, function (d) { return inizialize_path_line(d, d.x, d.number); })
            
            draw();
            draw_lines();




        }
    );
}

draw_graph('book-I')


// Remove line and text with transition
function remove_line_and_text() {
    svg.selectAll('path').transition().duration(1000)
        .attr("d", d3.line()
            .x(width + 100)
            .y(200)
        )
        .remove();

    d3.selectAll(".chapters")
        .transition().duration(1000)
        .attr('y', height)
        .attr("x", function (d) {
            return xScale(d.x)
        })
        .remove();

    d3.selectAll(".selected_book")
        .transition().duration(1000)
        .attr("y", 10 + d3.min(data, function (d) { return d.y; }))
        .attr("x", width + 200)
        .remove();

    d3.selectAll(".name_chapters")
        // .transition().duration(1000)
        // .attr('y', 40 + d3.min(data, function (d) { return d.y; }))
        // .attr("x", width + 100)
        .remove();
}

// Buttons to select books
let btn_book_1 = document.getElementById("btn_book_1");
btn_book_1.addEventListener('click', event => {
    remove_line_and_text()
    draw_graph('book-I')
});


let btn_book_2 = document.getElementById("btn_book_2");
btn_book_2.addEventListener('click', event => {
    remove_line_and_text()
    draw_graph('book-II')
});

let btn_book_3 = document.getElementById("btn_book_3");
btn_book_3.addEventListener('click', event => {
    remove_line_and_text()
    draw_graph('book-III')
});

let btn_book_4 = document.getElementById("btn_book_4");
btn_book_4.addEventListener('click', event => {
    remove_line_and_text()
    draw_graph('book-IV')
});

let btn_book_5 = document.getElementById("btn_book_5");
btn_book_5.addEventListener('click', event => {
    remove_line_and_text()
    draw_graph('book-V')
});


