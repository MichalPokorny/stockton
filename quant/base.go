package quant

import (
	"math"
	"github.com/MichalPokorny/worthy/stock"
)

func GetDailyReturns(x []stock.TradingDay) []float64 {
	returns := make([]float64, len(x))
	for i, day := range x {
		returns[i] = day.AdjustedClose / x[0].AdjustedClose
	}
	return returns
}

func GetMeanFloat64(array []float64) float64 {
	var mean float64 = 0
	for _, x := range array {
		mean += x / float64(len(array))
	}
	return mean
}

func GetStandardDeviationFloat64(array []float64) float64 {
	mean := GetMeanFloat64(array)
	expectedSquare := 0.0
	for _, x := range array {
		expectedSquare += (x * x) / float64(len(array))
	}
	return math.Sqrt(expectedSquare - (mean * mean))
}
