const margin = {top: 30, right: 250, bottom: 10, left: 50},
  width = 860 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select('main').select('#plot')
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        `translate(${margin.left},${margin.top})`);
  
  svg.append("circle").attr("cx",600).attr("cy",130).attr("r", 6).style("fill", "#440154")
  svg.append("circle").attr("cx",600).attr("cy",160).attr("r", 6).style("fill", "#21908d")
  svg.append("circle").attr("cx",600).attr("cy",190).attr("r", 6).style("fill", "#fde725")
  svg.append("circle").attr("cx",600).attr("cy",220).attr("r", 6).style("fill", "orange")
  
  svg.append("text").attr("x", 620).attr("y", 130).text("insufficient weight").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 620).attr("y", 160).text("normal weight").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 620).attr("y", 190).text("overweight").style("font-size", "15px").attr("alignment-baseline","middle")
  svg.append("text").attr("x", 620).attr("y", 220).text("obesity").style("font-size", "15px").attr("alignment-baseline","middle")

  // Parse the Data
// var data = FileAttachment("transformed_data.csv").csv({typed: true})
d3.csv("../scripts/transformed_data.csv").then( function(data) {
    const color = d3.scaleOrdinal()
      .domain(["insufficient weight","normal weight", "overweight", 'obesity' ])
      .range([ "#440154", "#21908d", "#fde725",'orange'])
  
    // Here I set the list of dimension manually to control the order of axis:
    // dimensions = ["Petal_Length", "Petal_Width", "Sepal_Length", "Sepal_Width"]
    dimensions = ['Age','CAEC','Height','Gender','Weight']
    // For each dimension, I build a linear scale. I store all in a y object
    const y = {}

    for (i in dimensions) {
      d = dimensions[i]
      y[d] = d3.scaleLinear()
        .domain( [Math.min(...data.map(row => row[d])), Math.max(...data.map(row => row[d]))] ) // --> Same axis range for each group
        // --> different axis range for each group --> .domain( [d3.extent(data, function(d) { return +d[name]; })] )
        .range([height, 0])
    }
  
    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
      .range([0, width])
      .domain(dimensions);
  
    // doHighlight the specie that is hovered
    const doHighlight = function(event, d){
      selected_specie = d.NObeyesdad
      // first every group turns grey
      d3.selectAll(".line")
        .transition().duration(200)
        .style("stroke", "lightgrey")
        .style("opacity", "0.2")
      // Second the hovered specie takes its color
      d3.selectAll("." + selected_specie)
        .transition().duration(200)
        .style("stroke", color(selected_specie))
        .style("opacity", "0.2")
    }
  
    // Unhighlight
    const doNotHighlight = function(event, d){
      d3.selectAll(".line")
        .transition().duration(200).delay(400)
        .style("stroke", function(d){return( color(d.NObeyesdad))} )
        .style("opacity", "0.2")
    }
  
    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    }
  
    // Draw the lines
    let foreground = svg
      .selectAll("myPath")
      .data(data)
      .join("path")
        .attr("class", function (d) { return "line " + d.NObeyesdad } ) // 2 class for each line: 'line' and the group name
        .attr("d",  path)
        .style("fill", "none" )
        .style("stroke", function(d){ return( color(d.NObeyesdad))} )
        .style("opacity", 0.2)
        .on("mouseover", doHighlight)
        .on("mouseleave", doNotHighlight )
  
    // Draw the axis:
    svg.selectAll("myAxis")
      // For each dimension of the dataset I add a 'g' element:
      .data(dimensions).enter()
      .append("g")
      .attr("class", "axis")
      // I translate this element to its right position on the x axis
      .attr("transform", function(d) { return `translate(${x(d)})`})
      // And I build the axis with the call function
      .each(function(d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
      // Add axis title
      .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function(d) { return d; })
        .style("fill", "black")

  let output = function(){const pre = document.createElement("pre"); return pre; }
  var out = d3.select(output)  
    out.text(d3.tsvFormat(data.slice(0,24)));
  const g = svg.selectAll(".dimension")
        .data(dimensions)
      .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; });

  // brush selection
  g.append("g")
    .attr("class", "brush")
    .each(function(d) { 
        d3.select(this).call(y[d].brush = d3.brushY()
          .extent([[-10,0], [10,height]])
          .on("brush", brush)           
          .on("end", brush)
          )
      })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);

  function brush() {  
      var actives = [];
      svg.selectAll(".brush")
        .filter(function(d) {
              y[d].brushSelectionValue = d3.brushSelection(this);
              return d3.brushSelection(this);
        })
        .each(function(d) {
            // Get extents of brush along each active selection axis (the Y axes)
              actives.push({
                  dimension: d,
                  extent: d3.brushSelection(this).map(y[d].invert)
              });
        });
      
      var selected = [];
      // Update foreground to only display selected values
      foreground
      .style("display", function(d) {
          let isActive = actives.every(function(active) {
              if (d === null) return 0
              let result = active.extent[1] <= d[active.dimension] && d[active.dimension] <= active.extent[0];
              return result;
          });
          
          // When no selectors are active, all data should be visible.
          isActive = (actives.length===0)?true:isActive;
        
          // Only render rows that are active across all selectors
          if(isActive) selected.push(d);
          return (isActive) ? null : "none";
      });
      // Render data as asimple grid
      (actives.length>0)?out.text(d3.tsvFormat(selected)):out.text(d3.tsvFormat(sample_data));
  }
})