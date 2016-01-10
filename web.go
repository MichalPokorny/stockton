package main

import (
	"fmt"
	"net/http"
	"os"
	"path"

	"encoding/json"

	"github.com/MichalPokorny/stockton/quant"
	"github.com/MichalPokorny/worthy/yahoo_stock_api"
)

func main() {
	tmpdir := os.Getenv("OPENSHIFT_TMP_DIR")
	if tmpdir == "" {
		tmpdir = "./tmp"
	}
	if err := os.MkdirAll(tmpdir, 0755); err != nil {
		panic(err)
	}
	yahoo_stock_api.SetHistoryCachePath(tmpdir)

	http.HandleFunc("/", home)

	// Serve /static.
	homedir := os.Getenv("OPENSHIFT_REPO_DIR")
	if homedir == "" {
		var err error
		homedir, err = os.Getwd()
		if err != nil {
			panic(err)
		}
	}
	static := path.Join(homedir, "static")
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir(static))))

	http.HandleFunc("/correlations", correlations)

	port := os.Getenv("OPENSHIFT_GO_PORT")
	if port == "" {
		port = "8080"
	}
	bind := fmt.Sprintf("%s:%s", os.Getenv("OPENSHIFT_GO_IP"), port)
	fmt.Printf("listening on %s...", bind)
	err := http.ListenAndServe(bind, nil)
	if err != nil {
		panic(err)
	}
}

func correlations(res http.ResponseWriter, req *http.Request) {
	symbols, ok := req.URL.Query()["symbol"]
	if !ok {
		http.Error(res, "Query symbols missing", 400)
		return
	}

	correlations := make(map[string]float64)
	if len(symbols) < 2 {
		http.Error(res, "Too few symbols, need >=2", 400)
		return
	}
	for i, a := range symbols {
		for j, b := range symbols {
			if j <= i {
				continue
			}
			aDaily := yahoo_stock_api.GetHistoricalPrices(a, "2015-01-01", "2015-12-31")
			bDaily := yahoo_stock_api.GetHistoricalPrices(b, "2015-01-01", "2015-12-31")

			key := fmt.Sprintf("%s_%s", a, b)
			correlations[key] = quant.GetCorrelation(aDaily, bDaily)
		}
	}

	bytes, err := json.Marshal(correlations)
	if err != nil {
		http.Error(res, "Internal Server Error", 500)
		return
	}

	res.Write(bytes)
}

