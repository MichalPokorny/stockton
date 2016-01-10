package quant

import (
	"github.com/MichalPokorny/worthy/stock"
)

func GetCorrelation(a, b []stock.TradingDay) float64 {
	if len(a) != len(b) {
		panic("unmatching lengths")
	}

	aReturns := GetDailyReturns(a)
	bReturns := GetDailyReturns(b)

	aMeanReturn := GetMeanFloat64(aReturns)
	bMeanReturn := GetMeanFloat64(bReturns)

	covariance := 0.0
	for i := 0; i < len(a); i++ {
		covariance += (aReturns[i] - aMeanReturn) * (bReturns[i] - bMeanReturn)
	}
	covariance /= float64(len(a))

	aStd := GetStandardDeviationFloat64(aReturns)
	bStd := GetStandardDeviationFloat64(bReturns)

	return covariance / (aStd * bStd)
}
