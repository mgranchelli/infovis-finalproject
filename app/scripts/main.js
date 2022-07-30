var data = null,
    data_line = [],
    books = ['Books', 'I - Blood of Elves', 'II - Times of Contempt', 'III - Baptism of Fire', 'IV - The Tower of the Swallow', 'V - The Lady of the Lake', 'I - Blood of Elves - All'],
    selected_book = null,
    overview_selected = true,
    max_y = 0,
    start_path_y = null,
    characters_color = null,
    margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 1200 - margin.left - margin.right,
    height = 1200 - margin.top - margin.bottom,
    max_range_y = height;


// Scale for x-axis
var xScale = d3.scaleLinear().range([100, width - 20]).interpolate(d3.interpolateRound);

// Scale for y-axis
var yScale = d3.scaleLinear().interpolate(d3.interpolateRound);

// Scale for rect
var rectScale = d3.scaleLinear().interpolate(d3.interpolateRound);

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
        }),
        d3.max(data, function (d) {
            return d.number;
        })]);
}

function updateRectScaleRange() {
    rectScale.range([
        d3.min(data, function (d) {
            return d.number * 20;
        }),
        d3.max(data, function (d) {
            return d.number * 20;
        })]);
}

function updateYScaleRange() {
    yScale.range([max_range_y, 0]);
}

var color = d3.scaleSequential()
    .domain([0, 41])
    .interpolator(d3.interpolateRainbow);

// Create svg
var svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('id', uuidv4())
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


// Highlight the character that is hovered
const highlight = function (event, d) {
    if (d3.active(this)) return;
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
        .attr("y", 30 + max_y)
        .attr("x", width / 2)
        .attr('text-anchor', 'middle')
        .attr('font-weight', 'bold')
        .attr("class", "selected_character")
        .style("font-size", "30px")
        .text(selected_character);
}

// Unhighlight
const doNotHighlight = function (event, d) {
    if (d3.active(this)) return;
    d3.selectAll(".line")
        .transition().duration(500).delay(100)
        .style("stroke", function (d) {
            return d[1].color;
        })
        .style("opacity", "1")

    d3.selectAll(".selected_character")
        .transition().duration(500).delay(100).remove()

}

function add_last_points() {
    // Add two last points
    y = start_path_y
    y_start_points = []
    for (const d in data_line) {
        y_start_points.push(y)
        y = y + 20
    }
    
    y_end_points = {}
    for (const d in data_line) {
        y_end_points[data_line[d][0].character] = (data_line[d][data_line[d].length - 1].y)
    }
    const sortable = Object.fromEntries(
        Object.entries(y_end_points).sort(([,a],[,b]) => a-b)
    );

    i = 0
    for (const y in sortable) {
        sortable[y] = y_start_points[i]
        i += 1
    }

    for (const d in data_line) {
        data_line[d].push({ 'x': data_line[d][data_line[d].length - 1].x + xScale(100), 'y': sortable[data_line[d][0].character] + 10 })
        data_line[d].push({ 'x': data_line[d][data_line[d].length - 2].x + xScale(100), 'y': sortable[data_line[d][0].character] })
    }
}

function draw_lines() {

    add_last_points()

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
                            start_path_y = start_path_y + 10
                        }
                        check_y = true
                        return start_path_y
                    }
                    else {
                        return (d.y)
                    };
                })

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
        .on('click', highlight)
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
    updateRectScaleRange();

    // Chapters text
    svg.append("text")
        .attr("y", 50 + d3.min(data, function (d) { return d.y; }))
        .attr("x", width / 2)
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr("class", "name_chapters")
        .style("font-size", "20px")
        .text(function (d) {
            if (overview_selected) {
                return ""
            } else {
                return "Chapters"
            }
        });

    // Selected book text
    svg.append("text")
        .attr("y", 10 + d3.min(data, function (d) { return d.y; }))
        .attr("x", width / 2)
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .attr("class", "selected_book")
        .style("font-size", "30px")
        .text(function (d) {
            if (overview_selected) {
                return "Books"
            } else {
                return "Book: " + books[selected_book]
            }
        });

    // Draw rect
    var draw_rect = function (selection) {
        selection
            .attr("x", function (d) {
                return xScale(d.x)
            })
            .attr('y', function (d) {
                return yScale(d.y) - (rectScale(d.number) / 2) // Align center
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
                if (overview_selected) {
                    return books[d.book]
                }
                else {
                    return d.chapter
                }

            })
            .attr('x', function (d) {
                return xScale(d.x) + 25
            })
            .attr('y', 90 + d3.min(data, function (d) { return d.y; }))
            .attr("class", "chapters")
    };

    var rect = svg.selectAll("rect")
        .data(data, function (d, i) { return d.id; });

    // enter rect transition
    rect.enter().append("rect")
        .attr('y', 0)
        .attr("x", function (d) {
            return xScale(d.x)
        })
        .attr('width', 0)
        .attr('height', 0)
        .attr('stroke', 'black')
        .attr('fill', '#69a3b2')
        .style("cursor", function (d) {
            if (overview_selected) {
                return "pointer"
            }
            else {
                return "default"
            }
        })
        .on('click', function (d, i) {
            if (overview_selected) {
                overview_selected = false
                remove_line_and_text()
                switch (i.book) {
                    case 1: load_data('book-I'); break;
                    case 2: load_data('book-II'); break;
                    case 3: load_data('book-III'); break;
                    case 4: load_data('book-IV'); break;
                    case 5: load_data('book-V'); break;
                }
            }
        })
        .transition().duration(1000).call(draw_rect);
    
    // enter text transition
    rect.enter().append("text")
        .attr('x', 0)
        .attr('y', 90 + d3.min(data, function (d) { return d.y; }))
        .attr('font-weight', 'bold')
        .style("text-anchor", "middle")
        .transition().duration(1000).call(draw_text);

    rect.transition().duration(1000)
        .ease(d3.easeLinear)
        .call(draw_rect)
        .call(draw_text);

    // exit transition
    rect.exit()
        .transition().duration(1000)
        .attr('y', function (d) {
            return height

        })
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

function inizialize_path_line(chapters, x, height, max_height, length, pos) {
    i = 0
    count_y_1 = 0
    count_y_0 = 0
    
    if ((height / 2) % 2 == 1) {
        y_1 = yScale(chapters.y) - (height / 2 * 10) + 5
    }
    else {
        y_1 = yScale(chapters.y) - (height / 2 * 10)
    }
    
    for (const d in chapters) {

        if (d != 'chapter' & d != 'number' & d != 'id' & d != 'x' & d != 'y' & d != 'book') {
            if (data_line[i] == null) {
                data_line[i] = []
                data_line[i].push({ 'character': d })
                data_line[i].push({ 'color': characters_color[d] })
            }
            if (chapters[d] == 1) {
                if (count_y_1 > 0) {
                    // Traslate new line
                    y_1 = y_1 + 10
                }
                if (y_1 > max_y) {
                    max_y = y_1
                }
                // console.log('y_1: ', y_1)
                data_line[i].push({ 'x': x, 'y': y_1 })
                count_y_1 += 1
            }
            else if (chapters[d] == 0) {
                // line 0 on or under rect
                if (i > (Object.keys(chapters).length - 5) / 2 - 1) {
                    y_0 = yScale(chapters.y) + rectScale(max_height) / 2 + 30
                }
                else {
                    if (overview_selected) {
                        y_0 = yScale(chapters.y) - rectScale(max_height) + 50
                    }
                    else {
                        y_0 = yScale(chapters.y) - rectScale(max_height) / 2 - 30
                    }

                }

                if (count_y_0 > 0) {
                    y_0 = y_0 + count_y_0 * 10
                }
                if (y_0 > max_y) {
                    max_y = y_0
                }
                data_line[i].push({ 'x': x, 'y': y_0 })
                count_y_0 += 1
            }
            i += 1
        }
    }
}

// Character line color
function inizialize_color(data) {
    characters_color = {}
    i = 0
    for (const d in data) {
        if (d != 'chapter' & d != 'number' & d != 'id' & d != 'x' & d != 'y' & d != 'book') {
            characters_color[d] = color(i)
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

function load_data(input) {
    switch (input.replace("book-", "")) {
        case "books-overview": selected_book = 0; break;
        case "I": selected_book = 1; break;
        case "II": selected_book = 2; break;
        case "III": selected_book = 3; break;
        case "IV": selected_book = 4; break;
        case "V": selected_book = 5; break;
        case "I-all": selected_book = 6; break;
        default: selected_book = 1;
    }

    // GET JSON file
    data_line = []
    d3.json('app/assets/' + input + '.json').then(
        function (chapters) {

            console.log('Input: ', chapters)
            
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
            updateRectScaleRange()

            console.log('Data: ', data)
            if (characters_color == null) {
                inizialize_color(data[0])
            }
            if (overview_selected) {
                max_range_y = height - 250
            }
            else {
                max_range_y = height - 500
            }
            updateYScaleRange()
            if ((data[0].number / 2) % 2 == 1) {
                start_path_y = yScale(data[0].y) - (data[0].number / 2 * 20) + 5
            }
            else {
                start_path_y = yScale(data[0].y) - (data[0].number / 2 * 20)
            }

            max_height = d3.max(data, function (d) { return d.number; })
            d3.map(data, function (d) { return inizialize_path_line(d, d.x, d.number, max_height); })

            draw();
            draw_lines();

            console.log('Data_line: ', data_line)



        }
    );
}

load_data('books-overview')


// Remove line and text with transition
function remove_line_and_text() {
    max_y = 0
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
        .remove();
}

// Buttons to select books
let btn_overview = document.getElementById("btn_overview");
btn_overview.addEventListener('click', event => {
    overview_transition = true
    overview_selected = true
    if (selected_book != 0) {
        remove_line_and_text()
        load_data('books-overview')
    }
});

let btn_book_1 = document.getElementById("btn_book_1");
btn_book_1.addEventListener('click', event => {
    overview_selected = false
    if (selected_book != 1) {
        remove_line_and_text()
        load_data('book-I')
    }
});


let btn_book_2 = document.getElementById("btn_book_2");
btn_book_2.addEventListener('click', event => {
    overview_selected = false
    if (selected_book != 2) {
        remove_line_and_text()
        load_data('book-II')
    }
});

let btn_book_3 = document.getElementById("btn_book_3");
btn_book_3.addEventListener('click', event => {
    overview_selected = false
    if (selected_book != 3) {
        remove_line_and_text()
        load_data('book-III')
    }
});

let btn_book_4 = document.getElementById("btn_book_4");
btn_book_4.addEventListener('click', event => {
    overview_selected = false
    if (selected_book != 4) {
        remove_line_and_text()
        load_data('book-IV')
    }
});

let btn_book_5 = document.getElementById("btn_book_5");
btn_book_5.addEventListener('click', event => {
    overview_selected = false
    if (selected_book != 5) {
        remove_line_and_text()
        load_data('book-V')
    }
});


