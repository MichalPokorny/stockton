$(function() {
	$('#symbols').tagsInput({
		// TODO: autocomplete symbols
		delimiter: [',', ';', ' '],
	});

	$('#get_correlation').click(function() {
		var stocks = $('#symbols').val().split([',', ';', ' ']);
		stocks = stocks.map(function(tag) { return tag.toUpperCase(); });

		var query = stocks.map(function(stock) { return "symbol=" + stock; }).join("&");
		$.ajax('/correlations?' + query).done(function(correlations) {
			correlations = JSON.parse(correlations);

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

			$('#correlations').append(table);
		});
	});
});
