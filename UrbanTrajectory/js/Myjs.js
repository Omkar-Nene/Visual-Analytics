//Init Map
//*******************************************************************************************************************************************************
var lat = 41.141376;
var lng = -8.613999;
var zoom = 14;
var allTrips = [];

// add an OpenStreetMap tile layer
var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ';


var grayscale = L.tileLayer(mbUrl, {
        id: 'mapbox.light',
        attribution: mbAttr
    }),
    streets = L.tileLayer(mbUrl, {
        id: 'mapbox.streets',
        attribution: mbAttr
    });


var map = L.map('map', {
    center: [lat, lng], // Porto
    zoom: zoom,
    layers: [streets],
    zoomControl: true,
    fullscreenControl: true,
    fullscreenControlOptions: { // optional
        title: "Show me the fullscreen !",
        titleCancel: "Exit fullscreen mode",
        position: 'bottomright'
    }
});

var baseLayers = {
    "Grayscale": grayscale, // Grayscale tile layer
    "Streets": streets, // Streets tile layer
};

layerControl = L.control.layers(baseLayers, null, {
    position: 'bottomleft'
}).addTo(map);

// Initialise the FeatureGroup to store editable layers
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var featureGroup = L.featureGroup();

var drawControl = new L.Control.Draw({
    position: 'topright',
	collapsed: false,
    draw: {
        // Available Shapes in Draw box. To disable anyone of them just convert true to false
        polyline: false,
        polygon: false,
        circle: false,
        rectangle: true,
        marker: false,
    }

});
map.addControl(drawControl); // To add anything to map, add it to "drawControl"
//*******************************************************************************************************************************************************
//*****************************************************************************************************************************************
// Index Road Network by Using R-Tree
//*****************************************************************************************************************************************
var rt = cw(function(data,cb){
	var self = this;
	var request,_resp;
	importScripts("js/rtree.js");
	if(!self.rt){
		self.rt=RTree();
		request = new XMLHttpRequest();
		request.open("GET", data);
		request.onreadystatechange = function() {
			if (request.readyState === 4 && request.status === 200) {
				_resp=JSON.parse(request.responseText);
				self.rt.geoJSON(_resp);
				cb(true);
			}
		};
		request.send();
	}else{
		return self.rt.bbox(data);
	}
});

rt.data(cw.makeUrl("js/trips.json"));
//*****************************************************************************************************************************************	
//*****************************************************************************************************************************************
// Drawing Shapes (polyline, polygon, circle, rectangle, marker) Event:
// Select from draw box and start drawing on map.
//*****************************************************************************************************************************************	

map.on('draw:created', function (e) {
	
	var type = e.layerType,
		layer = e.layer;
	
	if (type === 'rectangle') {
		console.log(layer.getLatLngs()); //Rectangle Corners points
		var bounds=layer.getBounds();
		rt.data([[bounds.getSouthWest().lng,bounds.getSouthWest().lat],[bounds.getNorthEast().lng,bounds.getNorthEast().lat]]).
		then(function(d){var result = d.map(function(a) {return a.properties;});

		currTrips = result;
		var allTrips = result;
		//console.log(result);		// Trip Info: avspeed, distance, duration, endtime, maxspeed, minspeed, starttime, streetnames, taxiid, tripid
		DrawRS(result);
		});
	}
	
	drawnItems.addLayer(layer);			//Add your Selection to Map  
});

var currTrips;

//*****************************************************************************************************************************************
// DrawRS Function:
// Input is a list of road segments ID and their color. Then the visualization can show the corresponding road segments with the color
// Test:      var input_data = [{road:53, color:"#f00"}, {road:248, color:"#0f0"}, {road:1281, color:"#00f"}];
//            DrawRS(input_data);
//*****************************************************************************************************************************************
function DrawRS(trips) {
	for (var j=0; j<trips.length; j++) {  // Check Number of Segments and go through all segments
		var TPT = new Array();			  
		TPT = TArr[trips[j].tripid].split(',');  		 // Find each segment in TArr Dictionary. 
		var polyline = new L.Polyline([]).addTo(drawnItems);
        polyline.setStyle({
            color: 'red',                      // polyline color
			weight: 1,                         // polyline weight
			opacity: 0.5,                      // polyline opacity
			smoothFactor: 1.0
        });

		for(var y = 0; y < TPT.length-1; y=y+2){    // Parse latlng for each segment
			polyline.addLatLng([parseFloat(TPT[y+1]), parseFloat(TPT[y])]);
		}
	}

	if (currTrips.length != 0) {

		document.getElementById("title").innerHTML = "Urban Trajectory Visualizaitions";
		scatterMatrixViz();
		sankeyChartViz();
		wordCloudViz(currTrips);

		} else {

		document.getElementById("title").innerHTML = "Please Try Again! Data not loaded.";
	}
}

function scatterMatrixViz(){	
	google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback(scatterMatrixVizCallBack);
}

function scatterMatrixVizCallBack(){

	document.getElementById('scatterMatrix').innerHTML= "<h2>Scatter-Matrix</h2>" +
													"<p>Scatter matrix of avspeed, distance, and duration and max speed</p>" + 
													"<div id=\"scatterMatrix1\" style=\"width:25%; float:left\"></div>"+
													"<div id=\"scatterMatrix2\" style=\"width:25%; float:left\"></div>" + 
													"<div id=\"scatterMatrix3\" style=\"width:25%; float:left\"></div>" + 
													"<div id=\"scatterMatrix4\" style=\"width:25%; float:left\"></div>" + 
													"<div id=\"scatterMatrix5\" style=\"width:25%; float:left\"></div>" + 
													"<div id=\"scatterMatrix6\" style=\"width:25%; float:left\"></div>" + 
													"<div id=\"scatterMatrix7\" style=\"width:25%; float:left\"></div>" + 
													"<div id=\"scatterMatrix8\" style=\"width:25%; float:left\"></div>" + 
													"<div id=\"scatterMatrix9\" style=\"width:25%; float:left\"></div>" +
													"<div id=\"scatterMatrix10\" style=\"width:25%; float:left\"></div>" +
													"<div id=\"scatterMatrix11\" style=\"width:25%; float:left\"></div>" +
													"<div id=\"scatterMatrix12\" style=\"width:25%; float:left\"></div>" +4
													"<div id=\"scatterMatrix13\" style=\"width:25%; float:left\"></div>" +
													"<div id=\"scatterMatrix14\" style=\"width:25%; float:left\"></div>" +
													"<div id=\"scatterMatrix15\" style=\"width:25%; float:left\"></div>" +
													"<div id=\"scatterMatrix16\" style=\"width:25%; float:left\"></div>" +
													"<p style=\"color:white; margin-bottom: 15px;\">Do not remove this text</p>";
													
	document.getElementById("scatterMatrix").style.border = "thick groove";
	document.getElementById("scatterMatrix").style.borderRadius = "10px";

	let avgspeed = currTrips.map(t=>t.avspeed);
	let distance = currTrips.map(t => t.distance);
	let duration = currTrips.map(t => t.duration);
	let maximumSpeed = currTrips.map(t => t.maxspeed);

	
	plotScatterMatrix('Avg Speed', avgspeed, 'Distance', distance, 1);
	plotScatterMatrix('Avg Speed', avgspeed, 'Duration', duration, 2);
	plotScatterMatrix('Avg Speed', avgspeed, 'Avg Speed', avgspeed, 3);
	plotScatterMatrix('Avg Speed', avgspeed, 'Max Speed', maximumSpeed, 4);
	
	plotScatterMatrix('Distance', distance, 'Distance', distance, 5);
	plotScatterMatrix('Distance', distance, 'Duration', duration, 6);
	plotScatterMatrix('Distance', distance, 'Avg Speed', avgspeed, 7);
	plotScatterMatrix('Distance', distance, 'Max speed', maximumSpeed, 8);
	
	plotScatterMatrix('Duration', duration, 'Distance', distance, 9);
	plotScatterMatrix('Duration', duration, 'Duration', duration, 10);
	plotScatterMatrix('Duration', duration, 'Avg Speed', avgspeed, 11);
	plotScatterMatrix('Duration', duration, 'Max Speed', maximumSpeed, 12);
	
	plotScatterMatrix('Max Speed', maximumSpeed, 'Distance', distance, 13);
	plotScatterMatrix('Max Speed', maximumSpeed, 'Duration', duration, 14);
	plotScatterMatrix('Max Speed', maximumSpeed, 'Avg Speed', avgspeed, 15);
	plotScatterMatrix('Max Speed', maximumSpeed, 'Max Speed', maximumSpeed, 16);
	
}



function plotScatterMatrix(x_axis, parameter1, y_axis, parameter2, chartNumber) {

	parameter1_copy = parameter1.slice();
	parameter2_copy = parameter2.slice();


	let axes_label = [[x_axis, y_axis]];

	for (let i = 0; i < parameter2_copy.length; i++) {
		axes_label.push([parameter1_copy[i], parameter2_copy[i]]);
	}

	var data = google.visualization.arrayToDataTable(axes_label);

	var options = {
		title: x_axis + ' vs. ' + y_axis,
		hAxis: {title: x_axis, minValue: 0, maxValue: parameter1_copy.sort((a, b) => b - a)[0]},
		vAxis: {title: y_axis, minValue: 0, maxValue: parameter2_copy.sort((a, b) => b - a)[0]},
		legend: 'none',
		animation: {duration:6000, easing: 'linear',startup: true},
		selectionMode: 'multiple',
		tooltip: {trigger: 'focus'},
		aggregationTarget: 'category',
		chartArea:{backgroundColor:'#d4d4d4'},
		colors:['red','green','blue','yellow'],
		dataOpacity:0.3,
		explorer:{},
		pointShape:'diamond',
		pointSize: 3,
		crosshair: { trigger: 'both' },
		  trendlines: {
    0: {
      type: 'linear',
      color: 'green',
      lineWidth: 3,
      opacity: 0.3,
      showR2: true,
      visibleInLegend: true
    }
  }
	};

	var chart = new google.visualization.ScatterChart(document.getElementById('scatterMatrix'+chartNumber));
	chart.draw(data, options);
}


function sankeyChartViz() {
	google.charts.load('current', {'packages':['sankey']});
    google.charts.setOnLoadCallback(sankeyChartVizCallBack);

}

function sankeyChartVizCallBack() {

	document.getElementById("sankeyChart").innerHTML = "<h2>Sankey Chart</h2>" +
													"<p>Top 10 pickup and drops for selected area in the map.</p>" +
													"<div id=\"sankeyChart\" style=\"padding:15px;\"></div>";
													
	
	document.getElementById("sankeyChart").style.border = "thick groove";
	document.getElementById("sankeyChart").style.borderRadius = "10px";

	var data = new google.visualization.DataTable();
	data.addColumn('string', 'From');
	data.addColumn('string', 'To');
	data.addColumn('number', 'Weight');
	
	data.addRows(findPickDropFrequencies().slice(0,10));

	var options = {
		width: 630,
		height: 300,
		sankey: {
			iterations:64,
			node: {
				label: {
				fontName: 'Arial',
				fontSize: 12,
				color: '#000',
				bold: true,
				italic: false
				},
				interactivity: true
			},
			link: {
				colorMode: 'gradient',
				colors: [
					'#a9cee3',        
					'#1858b4',        
					'#b2ff8a',       
					'#30a02c'
					]
				}
			}
	};

	
	var chart = new google.visualization.Sankey(document.getElementById('sankeyChart'));
	chart.draw(data, options);
}

function findPickDropFrequencies() {

	if (currTrips == null) {
		console.log("Select streets to run this function");
		return;
	}
	
	return currTrips.reduce((results, trip) => {
		let pickUpPoint = trip.streetnames[0]; 
		if (results.map(r => r[1]).includes(pickUpPoint)) { 
			return results;
		}
		let dropOffPoint = trip.streetnames[trip.streetnames.length-1];
		if (pickUpPoint === dropOffPoint){
			return results;
		}
		let pair_matched = false; 
		results.forEach(r => { 
			if (r[0] === pickUpPoint && r[1] === dropOffPoint) {
				r[2] += 1;
				pair_matched = true;
				return;
			}
		})
		if (!pair_matched) {
			results.push([pickUpPoint, dropOffPoint, 1]);
		}
		return results;
	}, []).sort((a, b) => b[2] - a[2]);
}



function wordCloudViz(trips){
	
	
document.getElementById("wordCloud").innerHTML = "<h2>WordCloud</h2>" +
													"<p>Showing Most Frequent Visited streets in selected area</p>" +
													"<div id=\"wordCloud2\" style=\"padding:15px;\"></div>";
													
	
document.getElementById("wordCloud").style.border = "thick groove";
document.getElementById("wordCloud").style.borderRadius = "10px";

const rs = {}
trips.forEach(trip =>{
  trip.streetnames.forEach(st => {
    !(st in rs)? rs[st] = {name:st,value:1}:rs[st].value+=1
  })
} )
	
console.log(rs);
console.log(Object.entries(rs));

const sizeScale = d3.scaleLinear().domain(d3.extent(Object.values(rs), x => x.value)).range([10,100])
var layout = d3.layout.cloud()
		.size([200, 200])
		.words(Object.values(rs))
		.rotate(function() { return Math.random() * 37; })
		.font("Impact")
		.fontSize(function(d) { return sizeScale(d.value); })
		.text(d => d.name)
		.on("end", output => word(output));
	 
	 layout.start();
	 
function word(words) {
  d3.select("#wordCloud").append('svg')
	.attr("width", '100%')
    .attr("height", '50%')		
    .attr('viewBox',`0 0 ${layout.size()[0]} ${layout.size()[1]}`)		
	.append("g")		
    .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
	.selectAll("text")
    .data(words)
	.enter().append("text")
    .style("font-size", function(d) { return sizeScale(d.value) + "px"; })
    .style("fill", function(d) { return d3.schemePaired[Math.floor((d.value)/10)]; })
    .style("font-family", "Impact")
    .attr("text-anchor", "middle")
    .attr("transform", function(d) {
    return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
    })
    .text(function(d) { return d.name; });
}
}



