$(function() {

$('#symbols').tagsInput({
	// TODO: autocomplete symbols
	delimiter: [',', ';', ' '],
});

var spinner;

var startSpinner = function() {
	var opts = {
		lines: 13 // The number of lines to draw
			, length: 28 // The length of each line
			, width: 14 // The line thickness
			, radius: 42 // The radius of the inner circle
			, scale: 1 // Scales overall size of the spinner
			, corners: 1 // Corner roundness (0..1)
			, color: '#000' // #rgb or #rrggbb or array of colors
			, opacity: 0.25 // Opacity of the lines
			, rotate: 0 // The rotation offset
			, direction: 1 // 1: clockwise, -1: counterclockwise
			, speed: 1 // Rounds per second
			, trail: 60 // Afterglow percentage
			, fps: 20 // Frames per second when using setTimeout() as a fallback for CSS
			, zIndex: 2e9 // The z-index (defaults to 2000000000)
			, className: 'spinner' // The CSS class to assign to the spinner
			, top: '50%' // Top position relative to parent
			, left: '50%' // Left position relative to parent
			, shadow: false // Whether to render a shadow
			, hwaccel: false // Whether to use hardware acceleration
			, position: 'absolute' // Element positioning
	};
	var target = document.getElementById('correlations');
	spinner = new Spinner(opts).spin(target);
};

var stopSpinner = function() {
	spinner.stop();
};

$(document).ajaxStart(startSpinner).ajaxStop(stopSpinner);

var regetStocks = function() {
	stocks = $('#symbols').val().split([',', ';', ' ']);
	stocks = stocks.map(function(tag) { return tag.toUpperCase(); });
};

var stocks;
var correlations;
var planets;

var getCorrelation = function(a, b) {
	return correlations[b + "_" + a] || correlations[a + "_" + b];
}

var getCorrelationColor = function(correlation) {
	var Color = net.brehaut.Color;
	var green = Color("#00FF00");
	var gray = Color("#AAAAAA");
	var red = Color("#FF0000");
	if (correlation > 0) {
		return gray.blend(green, correlation);
	} else {
		return gray.blend(red, -correlation);
	}
}

var displayCorrelations = function() {
	var table = $('<table></table>');
	var header = $('<tr><td></td>');
	for (var i = 0; i < stocks.length; i++) {
		var a = stocks[i];
		header.append($('<th>' + a + '</th>'));
	}
	table.append(header);
	for (var i = 0; i < stocks.length; i++) {
		var a = stocks[i];
		var row = $('<tr><th>' + a + '</th></tr>');
		for (var j = 0; j < stocks.length; j++) {
			var b = stocks[j];
			if (a == b) {
				var cell = $('<td></td>');
				row.append(cell);
				continue;
			}
			var correlation = getCorrelation(a, b);
			var cellColor = getCorrelationColor(correlation);

			var cell = $('<td>' + correlation.toFixed(3) + '</td>');
			$(cell).css({backgroundColor: cellColor});
			row.append(cell);
		}
		table.append(row);
	}

	$('#correlations').append(table);
};

var startSimulation = function() {
	$('#correlations').html('');
	$('#correlations').append('<canvas id="corcanvas" width="600" height="600"></canvas>');

	planets = [];
	for (var i = 0; i < stocks.length; i++) {
		var x = Math.random() * width, y = Math.random() * height;
		planets.push(new Planet(stocks[i], x, y));
	}

	redraw();
	stopSimulation();
	setInterval(redraw, 50);
};

var stopSimulation = function() {
	if (redrawInterval) {
		clearInterval(redrawInterval);
	}
};

var redrawInterval;
var width = 600;
var height = 600;

var gravitationalConstant = 1;
var border = Math.max(width, height) * 0.05;
var borderForce = 20.0;

var tooClose = 50;
var repulsionConstant = 10;

var redraw = function() {
	var canvas = document.getElementById('corcanvas');
	if (!canvas.getContext) {
		return;
	}

	var context = canvas.getContext('2d');
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.font = '14px Palatino';

	var maximumForceSize = 0;
	for (var i = 0; i < stocks.length; i++) {
		var planetA = planets[i];
		for (var j = i + 1; j < stocks.length; j++) {
			var planetB = planets[j];
			var force = getForceBetweenPlanets(planetA, planetB);
			var forceSize = Math.sqrt(force[0] * force[0], force[1] * force[1]);
			if (maximumForceSize < forceSize) {
				maximumForceSize = forceSize;
			}
		}
	}

	for (var i = 0; i < stocks.length; i++) {
		var planetA = planets[i];
		for (var j = i + 1; j < stocks.length; j++) {
			var planetB = planets[j];
			var correlation = getCorrelation(planetA.symbol, planetB.symbol);
			context.beginPath();
			context.moveTo(planetA.x, planetA.y);

			var force = getForceBetweenPlanets(planetA, planetB);
			var forceSize = Math.sqrt(force[0] * force[0], force[1] * force[1]);

			var color = getCorrelationColor(correlation);
			var alpha = forceSize / maximumForceSize;
			context.globalAlpha = alpha;
			context.strokeStyle = color.toString();
			context.lineTo(planetB.x, planetB.y);
			context.stroke();
			context.globalAlpha = 1.0;
		}
	}

	for (var i = 0; i < stocks.length; i++) {
		var planet = planets[i];

		var circle = new Path2D();
		circle.moveTo(planet.x, planet.y);
		circle.arc(planet.x, planet.y, 2, 0, 2 * Math.PI, true);

		context.fillStyle = "#666";
		context.fill(circle);

		context.fillStyle = "#000";
		context.fillText(planets[i].symbol, planet.x + 3, planet.y + 3);
	}

	stepSimulation();
};

var getForceBetweenPlanets = function(planetA, planetB) {
	// positive correlation => attract
	var correlation = getCorrelation(planetA.symbol, planetB.symbol);

	var dx = (planetB.x - planetA.x);
	var dy = (planetB.y - planetA.y);
	var distance = Math.sqrt(dx * dx + dy * dy);


	var attraction = gravitationalConstant * correlation / (distance * distance);
	if (distance < tooClose) {
		// Apply springs when too close.
		attraction -= 1.0 / distance;
		//var closeness = ((tooClose - distance) / tooClose);
		//attraction -= repulsionConstant * closeness;
	}

	return [attraction * dx, attraction * dy];
}

var getBorderRepulsionForce = function(planet) {
	var fx = 0, fy = 0;
	if (planet.x < border) {
		var borderDistance = border - planet.x;
		fx = borderForce * borderDistance;
	}
	if (planet.x > (width - border)) {
		var borderDistance = (border - (width - planet.x));
		fx = -borderForce * borderDistance;
	}
	if (planet.y < border) {
		var borderDistance = border - planet.y;
		fy = borderForce * borderDistance;
	}
	if (planet.y > (width - border)) {
		var borderDistance = (border - (height - planet.y));
		fy = -borderForce * borderDistance;
	}
	return [fx, fy];
};

var stepSimulation = function() {
	for (var i = 0; i < stocks.length; i++) {
		var planetA = planets[i];
		planetA.forceX = 0;
		planetA.forceY = 0;
		for (var j = 0; j < stocks.length; j++) {
			if (i == j) {
				continue;
			}
			var planetB = planets[j];
			var force = getForceBetweenPlanets(planetA, planetB);
			planetA.forceX += force[0];
			planetA.forceY += force[1];
		}

		// Shift away from edges.
		var borderRepulsion = getBorderRepulsionForce(planetA);
		planetA.forceX += borderRepulsion[0];
		planetA.forceY += borderRepulsion[1];
	}

	for (var i = 0; i < stocks.length; i++) {
		var planet = planets[i];

		planet.velocityX *= 0.9;
		planet.velocityY *= 0.9;

		planet.velocityX += planet.forceX;
		planet.velocityY += planet.forceY;

		if (isInBounds(planet.x + planet.velocityX, planet.y + planet.velocityY)) {
			planet.x += planet.velocityX;
			planet.y += planet.velocityY;
		}
	}
};

var isInBounds = function(x, y) {
	return x >= 0 && y >= 0 && x < width && y < height;
};

/** constructor */
var Planet = function(symbol, x, y) {
	this.symbol = symbol;
	this.x = x;
	this.y = y;
	this.forceX = 0;
	this.forceY = 0;
	this.velocityX = 0;
	this.velocityY = 0;
};

$('#get_correlation').click(function() {
	stopSimulation();
	regetStocks();
	var query = stocks.map(function(stock) { return "symbol=" + stock; }).join("&");
	$.ajax('/correlations?' + query).done(function(data) {
		correlations = JSON.parse(data);
		displayCorrelations();
	}).error(function() {
		alert("Sorry, cannot calculate correlations :(\n\n" +
			"Maybe try deleting a symbol or something?");
	});
});

$('#draw_planets').click(function() {
	stopSimulation();
	regetStocks();
	var query = stocks.map(function(stock) { return "symbol=" + stock; }).join("&");
	$.ajax('/correlations?' + query).done(function(data) {
		correlations = JSON.parse(data);
		startSimulation();
	}).error(function() {
		alert("Sorry, cannot calculate correlations :(\n\n" +
			"Maybe try deleting a symbol or something?");
	});
});

});
