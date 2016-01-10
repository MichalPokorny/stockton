package main

import (
	"html/template"
	"net/http"
)

// TODO: serve from static
const homeTemplate = `
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>Stock quant analysis tools</title>

		<script src="https://code.jquery.com/jquery-2.2.0.min.js"></script>
		<script src="https://fgnass.github.io/spin.js/spin.min.js"></script>

		<script src="https://github.com/brehaut/color-js/raw/master/color.js"></script>

		<script src="https://raw.githubusercontent.com/xoxco/jQuery-Tags-Input/master/src/jquery.tagsinput.js"></script>
		<link rel="stylesheet" href="/static/3rdparty/jquery.tagsinput.css">
		<link rel="favourite icon" href="//rny.cz/images/favicon.png">

		<script src="/static/home.js"></script>
		<link rel="stylesheet" href="/static/home.css">
		<link href='http://fonts.googleapis.com/css?family=IM+Fell+English+SC|IM+Fell+English:400,400italic' rel='stylesheet' type='text/css'>
	</head>
	<body>
		<h2>Correlation calculator</h2>

		<p>
		Use this to calculate the <i>correlation</i> of securities.
		The correlation between two securities is defined
		as the <a href="https://en.wikipedia.org/wiki/Correlation_and_dependence">correlation</a>
		of their daily returns. This calculator calculates correlation
		between 2015-01-01 and 2015-12-31.
		</p>

		<p>
		If nothing seems to happen after you press the button, try
		waiting a bit longer. The backend might need to download the
		stock history from Yahoo, which takes a second or two per
		symbol. The histories are cached, so the query should be a lot
		faster the next time.
		</p>

		<p>
		Enter symbols, separated by a space:
		</p>
		<input id="symbols" value="">
		<button id="get_correlation">Show correlation matrix</button>
		<button id="draw_planets">Draw planets</button>

		<div id="correlations">
		</div>

		<footer>
		Written by <a href="//rny.cz">Michal Pokorný</a>.
		The data is grabbed from Yahoo Stock API's YQL interface.
		The source code of this tool is at
		<a href="https://github.com/MichalPokorny/stockton">https://github.com/MichalPokorny/stockton</a>.
		It was built with Go, jQuery,
		<a href="http://xoxco.com/projects/code/tagsinput/">jQuery-Tags-Input</a>,
		<a href="https://github.com/brehaut/color-js">Color.js</a>.
		</footer>
	</body>
</html>
`

func home(res http.ResponseWriter, req *http.Request) {
	t, err := template.New("home").Parse(homeTemplate)
	if err != nil {
		panic("error in template")
	}

	data := struct{}{}
	err = t.Execute(res, data)
	if err != nil {
		panic("error in rendering template")
	}
}
