var data = null,
    data_line = [],
    lines = null,
    margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 900 - margin.left - margin.right,
    height = 900 - margin.top - margin.bottom;


// Scale for x-axis
var xScale = d3.scaleLinear().range([100, width - 150]).interpolate(d3.interpolateRound);

// Scale for y-axis
var yScale = d3.scaleLinear().range([height, 0]).interpolate(d3.interpolateRound);

// Scale for rect
var rectScale = d3.scaleLinear().range([150, 300]).interpolate(d3.interpolateRound);

// Update xScale.domain() 
function updateXScaleDomain() {
    xScale.domain([d3.min(data, function (d) { return d.x; }), d3.max(data, function (d) { return d.x; })]);
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

// Create svg
var svg = d3.select('body').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('id', uuidv4())
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// const colo = function () {
//     colori = []
//     for (const i in data_line.length) {
//         colori.push(randColor)
//     }
//     //console.log(colori)
//     return colori;
// }

var color = d3.scaleOrdinal()
    .domain(data_line, function (d) {
        //console.log(d[0].color)
        return d[0].character
    })
    // .range(function () {
    //     colori = []
    //     for (let i = 0; i < data_line.length; i++) {
    //         colori.push(randColor())
    //     }
    //     return colori
    // }
    //     //["#440154ff", "#21908dff", "#fde725ff", "#440151ff", "#11908dff", "#fde825ff", "#450154ff", "#41908dff", "#fee725ff", "#441154ff", "#51908dff", "#fre725ff"]
    // )

//[ "#440154ff", "#21908dff", "#fde725ff", "#440151ff", "#11908dff", "#fde825ff", "#450154ff", "#41908dff", "#fee725ff", "#441154ff", "#51908dff", "#fre725ff"])

// Highlight the specie that is hovered
const highlight = function (event, d) {
    // console.log('color: ', d[1].color)
    // console.log('c: ', d[0].character)
    // console.log('data: ', data_line.length)
    selected_character = d[0].character
    //console.log('domain: ', color.range)
    // first every group turns grey
    d3.selectAll(".lines")
        .transition().duration(200)
        .style("stroke", "lightgrey")
        .style("opacity", "0.2")
    // Second the hovered specie takes its color
    d3.selectAll("." + selected_character)
        .transition().duration(200)
        .style("stroke", color(selected_character))
        .style("opacity", "1");

    svg.append("text")
        .attr("y", 30)//magic number here
        .attr("x", (width / 2))
        .attr('text-anchor', 'middle')
        .attr("class", "myLabel")//easy to style with CSS
        .text(selected_character);


}

// Unhighlight
const doNotHighlight = function (event, d) {
    d3.selectAll(".lines")
        .transition().duration(200).delay(500)
        .style("stroke", function (d) { return (color(d[0].character)) })
        .style("opacity", "1")

    d3.selectAll(".myLabel")
        .transition().duration(200).delay(500)
        .attr("visibility", "hidden")
}

function draw_line() {

    y = 200
    pass_y = 0
    var line = d3.line()

        .x(function (d) {

            //console.log(d.color)
            if (d.character != null | d.color != null) {
                return 0
            }
            else {
                return xScale(d.x) + 20
            };
        })
        .y(function (d) {
            //console.log('d: ', d)
            if (d.character != null | d.color != null) {
                if (pass_y > 0) {
                    y = y + 10
                }
                pass_y += 1
                return y
            }
            else {
                return (d.y)
            };
        })
        .curve(d3.curveMonotoneX);

    svg.selectAll(".my_path")
        .data(data_line)
        .enter().append("path")
        .attr("class", function (d) {
            return 'lines ' + d[0].character;
        })
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", function (d) {
            return color(d[0].character);
        })
        .style("stroke-width", "2")
        .on("mouseover", highlight)
        .on("mouseleave", doNotHighlight);

}

// function randColor(){
//     var rint = Math.floor( 0x100000000 * Math.random());
//     switch( 'hex' ){
//       case 'hex':
//         return '#' + ('00000'   + rint.toString(16)).slice(-6).toUpperCase();
//       case 'hexa':
//         return '#' + ('0000000' + rint.toString(16)).slice(-8).toUpperCase();
//       case 'rgb':
//         return 'rgb('  + (rint & 255) + ',' + (rint >> 8 & 255) + ',' + (rint >> 16 & 255) + ')';
//       case 'rgba':
//         return 'rgba(' + (rint & 255) + ',' + (rint >> 8 & 255) + ',' + (rint >> 16 & 255) + ',' + (rint >> 24 & 255)/255 + ')';
//       default:
//         return rint;
//     }
//   }
const randColor = () => {
    return `rgb(${[1,2,3].map(x=>Math.random()*256|0)})`
    //return `hsla(${Math.random() * 360}, 100%, 50%, 1)`
    
    //"#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0').toUpperCase();
}
// Draw
function draw() {
    // Update domain
    updateXScaleDomain();
    updateYScaleDomain();
    updateRectScaleDomain();


    //console.log(data)
    let elem = svg.selectAll('.rectagles').data(data, function (d) {
        return d.id;
    })

    elem.enter()
        .append('rect')
        .attr('x', function (d) {
            // for (const point in data_line) {
            //     console.log('p: ', point)
            //     console.log('point: ', data_line[point][d.chapter+1])
            // }
            return xScale(d.x)
        })
        .attr('y', function (d) {
            // console.log(yScale(d.y) - rectScale(d.number))
            return yScale(d.y) - rectScale(d.number) //align bottom
        })
        .attr('width', 40)
        .attr('height', function (d) {
            return rectScale(d.number)
        })
        .attr('stroke', 'black')
        .attr('fill', '#69a3b2');

    elem.enter()
        .append("text")
        .text(function (d) {
            return 'chap: ' + d.chapter
        })
        .attr('x', function (d) {
            return xScale(d.x)
        })
        .attr('y', function (d) {
            return yScale(d.y) - 350
        });

    // // rectagles transition
    // d3.selectAll('.rectagles')
    //     .transition()
    //     .duration(500)
    //     .attr('transform', function (d) {
    //         return 'translate(' + xScale(d.x) + ',' + yScale(d.y) + ')'
    //     })
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

function get_number_characters(data) {
    zeros = 1
    for (const d in data) {
        if (data[d] == 0) {
            zeros += 1
        }
    }
    return zeros
}

function inizialize_path_line(data, x, height) {
    // console.log('data: ', data)
    // console.log('x: ', x)
    // console.log('height: ', height)
    i = 0
    pass_y_0 = 0
    pass_y_1 = 0
    for (const d in data) {
        if (d != 'chapter' & d != 'number' & d != 'id' & d != 'x' & d != 'y') {
            if (data_line[i] == null) {
                data_line[i] = []
                data_line[i].push({ 'character': d })
                data_line[i].push({ 'color': randColor() })
            }
            if (data[d] == 1) {
                // console.log('rect: ', rectScale(height))
                // console.log('y_scale: ',  yScale(10))
                // console.log('y: ', rectScale(height) - yScale(10))
                y1 = yScale(data.y) - rectScale(height/2)
                if (pass_y_0 > 0) {
                    y1 = y1 + pass_y_0 * 10
                }
                data_line[i].push({ 'x': x, 'y': y1 })
                pass_y_0 += 1
            }
            else if (data[d] == 0) {
                y2 = yScale(data.y) + 20
                if (pass_y_1 > 0) {
                    y2 = y2 + pass_y_1 * 10
                }
                data_line[i].push({ 'x': x, 'y': y2 })
                pass_y_1 += 1
            }
            i += 1
        }
    }
    return data_line

    //console.log('data_line: ', data_line)
}

function set_color() {
    colori = []
    for (let i = 0; i < data_line.length; i++) {
        colori.push(randColor())
    }
    color.range(colori)

}

// GET JSON file
d3.json('data.json').then(
    function (chapters) {
        l = []
        for (const c in chapters) {
            sort_characters = []
            for (const i in chapters[c]) {
                //console.log(chapters[c][i])
                //console.log('cap: ', i)
                sort_characters.push([i, chapters[c][i]])
            }
            l.push(sort_characters)
        }
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
        l = d3.map(data, function (d) {
            return inizialize_path_line(d, d.x, d.number);
        })

        // console.log('l: ', l)
        // console.log('data: ', data)
        // console.log('data_line: ', data_line)
        lines = d3.map([data_line], function (d) {
            return {
                ...d
            };
        });
        console.log('data_line -> lines: ', lines)
        // console.log('data: ', data)
        set_color();
        draw();
        draw_line();

    }
);