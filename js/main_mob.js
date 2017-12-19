//The array that is active in the visualization
var graph  = {
  "nodes":[	],
	
  "links":[ ]
}
//The function that's responsible for the search-field  
$(function(){
  $('#autocomplete').autocomplete({
    autoSelectFirst: true,
    lookup: nodes_data,
    onSelect: function (suggestion) {       
       newElements(suggestion.id);
       d3.select(".text").style("margin-top",'510px');
    },
    showNoSuggestionNotice: true,
    noSuggestionNotice: 'Inga matchingar hittades'
    
  });
});
  
//Event listeners for the search field  
    //document.getElementById("clear").addEventListener("click", clear_all);
    
  /*  document.getElementById("random").addEventListener("click", function(){
        id = nodes_data[Math.floor((Math.random() * nodes_data.length) + 1)].id; 
        newElements(id);
    });
    */
    
//SVG container for the graph
var holder = document.getElementsByTagName("svg")[0];
var frame =  d3.select(".graph").select("#frame");
var svg = frame.select("svg"),
    width = parseInt(window.getComputedStyle(holder, null)["width"]);
    height = parseInt(window.getComputedStyle(holder, null)["height"]);    
    

    
//Zoom variable    
var zoom = d3.zoom()
    .scaleExtent([1, 1])
    //.translateExtent([[-100, -100], [width + 90, height + 100]])
    .on("zoom", zoomed);
    
//Grouping of elements
g = svg.append("g");   
   
//Zoom function            
function zoomed() {
  g.attr("transform", d3.event.transform);
}
    
//Force simulation    
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-400).theta(0.1))
    .force("center", d3.forceCenter(width / 2, height / 2));


//Variables for link and node elements
var link = g.selectAll(".link"),
    node = g.selectAll(".node");

//Variable for tooltip
var div = d3.select(".graph").append("div")	
    .attr("class", "tooltip")			
    .style("opacity", 0);

//Variable for containing neighbors indexing
var linkedByIndex = {};


restart();

//d3.json("graph.json", function(error, graph) {
 // if (error) throw error;


//Function that updates all links and nodes and restarts force simulation, needs to be called after every change
function restart(){
    //updateSize();
  //Update all links
  link = link.data(graph.links);
  link.exit().remove();
  link=link.enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { 
            var scale = d3.scaleLinear()
                            .domain([0.05, 0.3])
                            .range([12, 1])
                            .clamp(true);         
          return scale(d.weight); 
      })
      .merge(link);
  
  //Updates all nodes
  node = node.data(graph.nodes);
  node.exit().remove();
  node =node.enter().append("circle")
      .attr("class", "node")
      .attr("r", 10)      
      .attr("id",function(d) { return d.id; })
      .style("fill", function(d) { return d.col; })
      .on("mouseover", function(d){ 
      tooltip.call(this,d);      
      mouseover.call(this,d);
      })
      .on("mouseout", mouseout)
      .on("click",function(d){ 
        tooltip.call(this,d);
        if(tap.call(this,d) == true){
            addNodes.call(this,d);
            highlighted.call(this,d);
            mouseout.call(this,d);            
            restart();
        }
        })
      //.call(d3.drag()
      //    .on("start", dragstarted)
      //    .on("drag", dragged)
      //    .on("end", dragended))
        .merge(node);


    //Starts simulation
    simulation.nodes(graph.nodes);
    simulation.force("link").links(graph.links);
    simulation.alpha(0.9).restart();
    
    //Updates neighboring nodes index
    graph.links.forEach(function(d) { 
        linkedByIndex[d.source.index + "," + d.target.index] = 1;
    });
    
    //Function for positioning all nodes in front of links
    d3.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };

   
    //Moving all nodes and active links to the front
    d3.selectAll(".link-active").moveToFront();
    d3.selectAll(".node").moveToFront();
    
    width = parseInt(window.getComputedStyle(holder, null)["width"]);
    //svg.call(zoom);   
}


  //Simulation tick
  simulation
      .nodes(graph.nodes)
      .on("tick", ticked);
  simulation.force("link").distance(150)
      .links(graph.links);


        function ticked() {
          link.attr("x1", function(d) { return d.source.x; })
              .attr("y1", function(d) { return d.source.y; })
              .attr("x2", function(d) { return d.target.x; })
              .attr("y2", function(d) { return d.target.y; });

          node.attr("cx", function(d) { return d.x; })
              .attr("cy", function(d) { return d.y; });
        }

//Drag-handlers
function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
                

//Function for checking if two nodes are connected    
function isConnected(a, b) {
    return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index];
}

//Two variables for logging and statistics
var suggestion = [];
var center = [];

//Function for handling content of tooltip
function tooltip(d){
    suggestion = d;
    var Sötma = Math.round(d.Sötma),
        Fyllighet = Math.round(d.Fyllighet),
        Syrlighet = Math.round(d.Syrlighet),
        url="http://www.systembolaget.se/"+d.id.substring(1);
        var transform = g.attr("transform")
    
    if(g.attr("transform") != null){
        var separators = [' ', '\\\(', '\\\)', '/', ','];
            transform = transform.split(new RegExp(separators.join('|'), 'g'));
        var translate = {x: Number(transform[1]),y:Number(transform[2]),scale:Number(transform[5])};
    }else{
        var translate = {x: 0, y:0, scale:1};
    }
    //console.log(d.x+" "+d.y);
    //.log(translate);
    
    function button(nr){return "<button onclick=\"feedback("+nr+");\" id=\"feedback\" type=\"button\">"+nr+"</button>";
   
    }
    
    if(g.select("#"+d.id).classed("node-center") == true){
    fb = "";
    }else{    
    fb = "<p>Hur väl stämmer förslaget? <br/>" +button(1)+button(2)+button(3)+button(4)+button(5)+"</p>";
    };
    
    var left;
    var top = ((d.y-105+(translate.y) + "px"));
    
    if(width < 500){
           
            
            console.log("a");
            div.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                div	.html("<center>" + d.value + "</center>" +"<table><td>"+ d.Prisinklmoms + "kr" + "<br/>" + d.Varugrupp + "<br/>" + d.Typ + "<br/>" + "Alkoholhalt " + d.Alkoholhalt +"%" + "<br/>" +"</td><td>" + "Sötma " + Sötma + "%" + "<br/>" + "Fyllighet " + Fyllighet + "%" + "<br/>" + "Syrlighet " + Syrlighet + "%" + "<br/>" + "<a href="+url+">"+"Läs mer på Systembolaget.se</a></td></table>")
                    .style("left", 0+"px")		
                    .style("top", 0+"px")
                    .style("width", width-6+"px")
                    .style("height",100+"px");

    
    }else{
                
    if(width-d.x < 200){
        left = (d.x - 218+(translate.x) + "px");    
    }else{
        left = (d.x + 18+(translate.x) + "px");
    };
    
    div.transition()		
                    .duration(200)		
                    .style("opacity", .9);		
                div	.html("<center>" + d.value + "</center>" + d.Prisinklmoms + "kr" + "<br/>" + d.Varugrupp + "<br/>" + d.Typ + "<br/>" + "Alkoholhalt " + d.Alkoholhalt +"%" + "<br/>" + "Sötma " + Sötma + "%" + "<br/>" + "Fyllighet " + Fyllighet + "%" + "<br/>" + "Syrlighet " + Syrlighet + "%" + "<br/>" + "<a href="+url+">"+"Läs mer på Systembolaget.se</a>"+fb)
                    .style("left", left)		
                    .style("top", top);	
                  
                    //.style("left", (d.x + "px"))		
                    //.style("top", (d.y + "px"));	

   
    //console.log((d.x+(translate.x))+" "+(d.y+(translate.y)));
}
}

//Highlighting the active nodes and links
function highlighted(d){
    node.classed("node-active", false);
    node.classed("node-center", false);  
        
    link.classed("link-active", false);
    
    node.classed("node-active", function(o) {
                                thisOpacity = isConnected(d, o) ? true : false;
                                this.setAttribute('fill-opacity', thisOpacity);
                                return thisOpacity;
                            });

                            link.classed("link-active", function(o) {
                                return o.source === d || o.target === d ? true : false;
                            });
                        
    g.select("#"+d.id).classed("node-center", true);                        
                         
    }
    
var timeout;

//Mouse handlers 
function mouseover(d){
                        
                        clearTimeout(timeout);
                        d3.select(this).classed("node-active-mouse", true);
                        
                }
		
function mouseout(d){
                        d3.select(this).classed("node-active-mouse", false);
                        node.classed("marked", false);
                      /*  
                        div.transition()		
                            .duration(500)		
                            .style("opacity", 0);	
                        */ 
                    if(width > 500){               
                   timeout = setTimeout(function(){
                                div.transition()		
                                .duration(500)		
                                .style("opacity", 0);
                                },7000);
                    }
                    }
          
function tap(d){
var classed = d3.select(this).attr("class");
    if(classed.match("marked") == null){
    node.classed("marked", false);
    d3.select(this).classed("marked",true);
    return false;
}else{
    node.classed("marked", false);
    return true;
}

}


//Adding new nodes to the graph
function addNodes(d){
    log(d);
    var node_id = d.id;    
    
    var target_nodes = links_data.filter(function(d){
        return d.source == node_id;
    }); //Filtrerar ut alla noder i datan som den valda noden länkar till
    var new_links = []; //Ta bort och skicka direkt till graph.links
    var new_nodes = []; //Respektive graph.nodes
    //Tar bort de noderna som redan finns
    //for(var i =0;i < target_nodes.length;i++){
    target_nodes.forEach(function(d){ //Kollar igenom alla länkade noder om de finns i graph.nodes redan
        if(graph.nodes.find(function(p){return(p.id == d.target)}) == null){ //Om de inte finns så sparas den länken
            graph.links.push(d); //skicka direkt till graph.links
            //och den target noden läggs till
            var new_node = nodes_data.find(function(z){
                return z.id == d.target;
                });
            graph.nodes.push(new_node);
            new_nodes.push(new_node);
        }
    });

updateLinks(new_nodes);
restart();
}

//Updating links for nodes
function updateLinks(nodes){
    
    nodes.forEach(function(d){ //För varje nod
        var link_list = links_data.filter(function(e){ //Plockar ut en länklista där noden står som source
            return e.source == d.id;
        });
        link_list.forEach(function(f){ //För varje länk i länklistan
            if(graph.nodes.find(function(h){ //Kolla om targeten finns i befintliga noder
                return h.id == f.target;        
            }) != null){ //Om den finns i befintliga noder, lägg till länken i listan
                
                graph.links.push(f);
            }
        });     
    });


} 

//Function for adding new elements by id to graph
function newElements(id){
    
    new_node = nodes_data.find(function(d){return(d.id == id);}) //Om de inte finns så sparas den länken
   
    if(graph.nodes.find(function(d){return(d.id == id);}) == null){ //Om noden inte redan finns
     clear_all();      
   
        if(new_node != null){
            graph.nodes.push(new_node);
            addNodes(new_node);         
            centernodes(new_node);
            highlighted(new_node);
            if(width <500){
                tooltip(new_node);
            }
            restart();
        }
    }else{
        highlighted(new_node);
    }
}

//Centering the active node
function centernodes(d){
    center = d;
    graph.nodes.forEach(function(d){d.fx=d.fy=null;}) //Släpper alla, tog ju inte lång tid nej...
    
    //graph.nodes.forEach(function(d,i){x[i]=(d.name);});
    var move = d, //Den aktuella noden
   		pos = [move.x,move.y], //Positionen för den aktuella noden
        duration = 500,        // duration of the movement
        finalPos = { x: width/2, y: height/2 },
        interpolateX = d3.interpolateNumber(move.x, finalPos.x),
        interpolateY = d3.interpolateNumber(move.y, finalPos.y);
    
    var t = d3.timer(function(elapsed) {
        
        move.fx = interpolateX(elapsed / duration); 
        move.fy = interpolateY(elapsed / duration); 
       
        if(elapsed > duration){ t.stop();}
        
    });

}

//Clear graph of all nodes and links
function clear_all(){
div.style("opacity", 0);
                                

graph  = {
  "nodes":[	],
	
  "links":[ ]
}
restart();
}

//Logging for statistics and improvement
function log(d){
$.post("stats.php",
    {
        id: d.id,
        namn: d.value
    });
}

 function feedback(response){
        $.post("feedback.php",
    {
        id_c: center.id,
        namn_c: center.value,
        id_s: suggestion.id,
        namn_s: suggestion.value,
        response: response
    });
    
    d3.select(".tooltip").select("p").html("<br/>Tack!");        
}

function move(x,y) {
  svg.transition()
      //.duration(750)
      //.call(zoom.transform, pos);
      .call(zoom.translateBy,x,y);
}

document.getElementById("top").onclick = function(d){move(0,100);};

document.getElementById("top").onmouseover = function(d){d.target.style.opacity = 1;};

document.getElementById("top").onmouseout = function(d){d.target.style.opacity = 0.4;};

document.getElementById("left").onclick = function(){move(100,0);};

document.getElementById("left").onmouseover = function(d){d.target.style.opacity = 1;};

document.getElementById("left").onmouseout = function(d){d.target.style.opacity = 0.4;};

document.getElementById("right").onclick = function(){move(-100,0);};

document.getElementById("right").onmouseover = function(d){d.target.style.opacity = 1;};

document.getElementById("right").onmouseout = function(d){d.target.style.opacity = 0.4;};

document.getElementById("down").onclick = function(){move(0,-100);};

document.getElementById("down").onmouseover = function(d){d.target.style.opacity = 1;};

document.getElementById("down").onmouseout = function(d){d.target.style.opacity = 0.4;};
//x.match(/-\d+|\d/g) plockar ut alla siffror, även negativa...

$('form').submit(function(e){
    e.preventDefault();
});