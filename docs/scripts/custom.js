
    
    var url = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

    d3.json(url, function (json) {
    var dataset = json;
    
    const length = dataset.length;    
    const width = 800;
    const height = 600;
    const xpadding = 100; 
    const ypadding = 50; 
    

    var doping;

    const tookDoping = function(d) {
      if (d.Doping === "") {
        return false;
      }
      
      return true;
    } 

    const convertToSeconds = function(index){
      return dataset[index].Time.slice(0,2)*60 + parseInt(dataset[index].Time.slice(3,5));
    }

    const bestTime = convertToSeconds(0); 

    const timeSpan = convertToSeconds(length-1) - bestTime;

    const individualDifference = function(index) {      
      return convertToSeconds(index) - bestTime;
    } 

    //DISPLAYING MINUTES:SECONDS ON X SCALE

    //https://bl.ocks.org/mbostock/3048166
    //https://stackoverflow.com/questions/11286872/how-do-i-make-a-custom-axis-formatter-for-hours-minutes-in-d3-js
    //https://stackoverflow.com/questions/24541296/d3-js-time-scale-nicely-spaced-ticks-at-minute-intervals-when-data-is-in-second
    //https://github.com/d3/d3-time-format/blob/master/README.md#timeFormat
      
    //format as dates by picking an arbitrary epoch and converting on-the-fly
    //this allows to leave the data itself as numbers (seconds)
    //below: const xAxis = d3.axisBottom(xScale).ticks(6).tickFormat(convertToMinutes);   
    //tickFormat passes current tick position in seconds

    const formatTime = d3.timeFormat("%H:%M");

    const convertToMinutes = function(seconds) {
         
          console.log("Current tick in seconds", seconds)
          var currentDate = new Date(2012, 0, 1, 0, seconds);
          //console.log("Current date", currentDate);
          //console.log("Current date.getSeconds()", currentDate.getSeconds());
          currentDate.setSeconds(currentDate.getSeconds() + seconds);
          //console.log("Current date after added seconds (tick position)", currentDate)
          //console.log("Formatted time", formatTime(currentDate));
          return formatTime(currentDate);
    }; 

    dataset.forEach(function(dataPoint, index) {
      //console.log(dataPoint);         
    });  
    

    //SCALES WITH DOMAINS AND RANGES

    const xScale = d3.scaleLinear()
                     .domain([timeSpan + 10, 0])                                           
                     .range([xpadding, width - xpadding]);  
    
    //console.log("Largest time difference with the winner", timeSpan, "ending x scale at 0");
    //console.log("xScale: domain start: 0", "domain end", timeSpan);                                      
    
    const yScale = d3.scaleLinear()
                     .domain([dataset[0].Place, dataset[length-1].Place + 1])                     
                     .range([ypadding, height - ypadding]);

    //console.log("yScale: domain start:", dataset[0].Place, "domain end:", dataset[length-1].Place);
    //console.log("yScale: range start:", ypadding, "range end:", height - ypadding);                  
    
    //CHART WITH CIRCLES

    const chart = d3.select(".content-container")
                  .append("svg")
                  .attr("width", width)
                  .attr("height", height)
                  .attr("class", "chart"); 

   
    var tooltip = d3.select(".content-container").append("p")
      .attr("class", "tooltip")
      .style("opacity", 0);

    chart.selectAll("circle")
      .data(dataset)
      .enter()
      .append("circle")  
      .attr("cx", (d) => xScale(individualDifference(dataset.indexOf(d))))  
      .attr("cy", (d) => yScale(d.Place))    
      .attr("r", 6)
      .attr("fill", (d) => {
          if (tookDoping(d)) {          
            return "orange";
          }
          else {
            return "green";
          }
      })        
      
      //ON HOVER FUNCTIONS

      .on("mouseover", function(d){   
         d3.select(this).style("stroke", "black");                    
         var circle = d3.select(this);
         var name = d.Name;
         var nationality = d.Nationality;
         var year = d.Year;
         var time = d.Time;
         var doping = "";
         if (tookDoping(d)) {
            doping = d.Doping;        
         }         
         //console.log(name, nationality, year, time, doping);        
         tooltip.transition()
          .duration(200)
          .style("opacity", 0.9);
         tooltip.html("<span class='name'>" + name + 
            ":</span><span class='nationality'> " + nationality + 
            "</span><br><span class='year'>Year: " + year + 
            ",</span><span class='time'> Time: " + time + 
            "</span><br><br><span class='doping'>" + doping + "</span>")
          .style("left", (d3.event.pageX + 5) + "px")
          .style("top", (d3.event.pageY)+ "px");
      })

      .on("mouseout", function(d){ 
         d3.select(this).style("stroke", "none");             
         var circle = d3.select(this);              
         tooltip.transition()
          .duration(500)
          .style("opacity", 0);
      })      

      chart.selectAll("text")
     .data(dataset)
     .enter()
     .append("text")
     .text((d) => d.Name)
     .attr("x", (d) => xScale(individualDifference(dataset.indexOf(d))) + 15)
     .attr("y", (d) => yScale(d.Place))
     .attr("fill", "black")
     .style("font-size", "10px")

    //AXES  

    const xAxis = d3.axisBottom(xScale).ticks(6).tickFormat(convertToMinutes);   

    chart.append("g")
      .attr("transform", "translate(0," + (height - ypadding) + ")")
      .call(xAxis)
      .append("text")      
      .attr("x", width/2)
      .attr("y", 35)        
      .style("fill", "#000")
      .style("font-size", "15px")
      .style("font-weight", "bold")     
      .text("Minutes Behind Fastest Time");  
    
    const yAxis = d3.axisLeft(yScale);
    
    chart.append("g")
      .attr("transform", "translate(" + xpadding + ", 0)")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", - xpadding)
      .attr("y", - 25)        
      .style("fill", "#000")
      .style("font-size", "15px")
      .style("font-weight", "bold")     
      .text("Ranking");   

    //TITLE AND SUBTITLES  

    chart.append("text")
      .attr("x", (width / 2 - 50))
      .attr("y", ypadding)
      .attr("text-anchor", "middle")
      .attr("font-size", "20px")      
      .attr("font-weight", "bold")
      .text("Doping in Professional Bicycle Racing");

    chart.append("text")
      .attr("x", (width / 2 - 50))
      .attr("y", ypadding + 25)
      .attr("text-anchor", "middle")
      .attr("font-size", "15px")
      .text("35 Fastest times up Alpe d'Huez");  

    chart.append("text")
      .attr("x", (width / 2 - 50))
      .attr("y", ypadding/2 + 75)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text("Normalized to 13.8km distance"); 

    //LEGEND

    //No allegations circle

    chart.append("circle")
      .attr("cx", (d) => xScale(80))
      .attr("cy", (d) => yScale(25))
      .attr("r", 6)
      .attr("fill", "green");
       
    //No allegations text
       
    chart.append("text")
      .attr("x", (d) => xScale(70))
      .attr("y", (d) => yScale(25)+4)
      .attr("text-anchor", "left")    
      .text("No doping allegations");
  
    //Yes allegations circle

    chart.append("circle")
      .attr("cx", (d) => xScale(80))
      .attr("cy", (d) => yScale(28))
      .attr("r", 6)
      .attr("fill", "orange");
     
    //Yes allegations text 

    chart.append("text")
      .attr("x", (d) => xScale(70))
      .attr("y", (d) => yScale(28)+4)
      .attr("text-anchor", "left")
      .attr("class", "legend")
      .text("Riders with doping allegations");

}); //end d3.json()
 
