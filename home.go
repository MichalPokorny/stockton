package main

import (
	"html/template"
	"net/http"
)

const homeTemplate = `
<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>Stock quant analysis tools</title>

		<script src="https://code.jquery.com/jquery-2.2.0.min.js"></script>

		<script src="https://github.com/brehaut/color-js/raw/master/color.js"></script>

		<script src="https://raw.githubusercontent.com/xoxco/jQuery-Tags-Input/master/src/jquery.tagsinput.js"></script>
		<link rel="stylesheet" href="https://raw.githubusercontent.com/xoxco/jQuery-Tags-Input/master/src/jquery.tagsinput.css"></link>

		<script src="/static/home.js"></script>
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

		<input id="symbols" value="YHOO MSFT GOOG F">
		<button id="get_correlation">Get correlations</button>

		<div id="correlations">
		</div>

		<p>
		The data is grabbed from Yahoo Stock API's YQL interface.
		The source code of this tool is at
		<a href="https://github.com/MichalPokorny/stockton">https://github.com/MichalPokorny/stockton</a>.
		It was built with Go, jQuery,
		<a href="http://xoxco.com/projects/code/tagsinput/">jQuery-Tags-Input</a>.
		</p>
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