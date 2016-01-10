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

var getStocks = function() {
	var stocks = $('#symbols').val().split([',', ';', ' ']);
	stocks = stocks.map(function(tag) { return tag.toUpperCase(); });
	return stocks;
};

var displayCorrelations = function(correlations) {
	var stocks = getStocks();
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
			var correlation = correlations[b + "_" + a] || correlations[a + "_" + b];

			var Color = net.brehaut.Color;
			var green = Color("#00FF00");
			var gray = Color("#AAAAAA");
			var red = Color("#FF0000");

			var cellColor;
			if (correlation > 0) {
				cellColor = gray.blend(green, correlation);
			} else {
				cellColor = gray.blend(red, -correlation);
			}

			var cell = $('<td>' + correlation.toFixed(3) + '</td>');
			$(cell).css({backgroundColor: cellColor});
			row.append(cell);
		}
		table.append(row);
	}

	$('#correlations').html('');
	$('#correlations').append(table);
};

$('#get_correlation').click(function() {
	var stocks = getStocks();
	var query = stocks.map(function(stock) { return "symbol=" + stock; }).join("&");
	$.ajax('/correlations?' + query).done(function(correlations) {
		correlations = JSON.parse(correlations);
		displayCorrelations(correlations);
	}).error(function() {
		alert("Sorry, cannot calculate correlations :(\n\n" +
			"Maybe try deleting a symbol or something?");
	});
});

});
