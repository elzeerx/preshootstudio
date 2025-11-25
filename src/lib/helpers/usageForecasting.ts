/**
 * Machine Learning-based usage forecasting utilities
 * Uses linear regression for time-series prediction
 */

interface DataPoint {
  x: number;
  y: number;
}

interface ForecastResult {
  predicted: number;
  confidence: {
    lower: number;
    upper: number;
  };
}

/**
 * Calculate linear regression coefficients
 */
function linearRegression(data: DataPoint[]): { slope: number; intercept: number } {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0 };

  const sumX = data.reduce((sum, point) => sum + point.x, 0);
  const sumY = data.reduce((sum, point) => sum + point.y, 0);
  const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

/**
 * Calculate standard error for confidence intervals
 */
function calculateStandardError(data: DataPoint[], slope: number, intercept: number): number {
  const n = data.length;
  if (n <= 2) return 0;

  const residuals = data.map(point => {
    const predicted = slope * point.x + intercept;
    return Math.pow(point.y - predicted, 2);
  });

  const sumSquaredResiduals = residuals.reduce((sum, r) => sum + r, 0);
  return Math.sqrt(sumSquaredResiduals / (n - 2));
}

/**
 * Forecast future token usage using linear regression
 * @param dailyUsage Array of daily token usage values
 * @param daysToForecast Number of days to forecast ahead
 * @returns Forecast results with confidence intervals
 */
export function forecastTokenUsage(
  dailyUsage: number[],
  daysToForecast: number = 30
): ForecastResult[] {
  // Prepare data points (day index, usage)
  const data: DataPoint[] = dailyUsage.map((usage, index) => ({
    x: index + 1,
    y: usage,
  }));

  // Calculate regression
  const { slope, intercept } = linearRegression(data);
  const standardError = calculateStandardError(data, slope, intercept);

  // Generate forecasts
  const forecasts: ForecastResult[] = [];
  const startDay = dailyUsage.length + 1;
  
  // 95% confidence interval (approximately 2 standard errors)
  const confidenceMultiplier = 1.96;

  for (let i = 0; i < daysToForecast; i++) {
    const day = startDay + i;
    const predicted = slope * day + intercept;
    
    // Confidence interval increases with distance from observed data
    const distanceFactor = Math.sqrt(1 + 1 / dailyUsage.length + Math.pow(day - dailyUsage.length / 2, 2));
    const margin = confidenceMultiplier * standardError * distanceFactor;

    forecasts.push({
      predicted: Math.max(0, predicted), // Can't have negative usage
      confidence: {
        lower: Math.max(0, predicted - margin),
        upper: predicted + margin,
      },
    });
  }

  return forecasts;
}

/**
 * Apply exponential smoothing for short-term forecasting
 * @param data Historical usage data
 * @param alpha Smoothing factor (0-1), higher = more weight on recent data
 */
export function exponentialSmoothing(data: number[], alpha: number = 0.3): number {
  if (data.length === 0) return 0;
  if (data.length === 1) return data[0];

  let smoothed = data[0];
  for (let i = 1; i < data.length; i++) {
    smoothed = alpha * data[i] + (1 - alpha) * smoothed;
  }

  return smoothed;
}

/**
 * Calculate forecast accuracy metrics
 */
export function calculateAccuracyMetrics(actual: number[], predicted: number[]): {
  mape: number; // Mean Absolute Percentage Error
  rmse: number; // Root Mean Square Error
} {
  const n = Math.min(actual.length, predicted.length);
  if (n === 0) return { mape: 0, rmse: 0 };

  let sumSquaredError = 0;
  let sumPercentageError = 0;

  for (let i = 0; i < n; i++) {
    const error = actual[i] - predicted[i];
    sumSquaredError += error * error;
    
    if (actual[i] !== 0) {
      sumPercentageError += Math.abs(error / actual[i]);
    }
  }

  const rmse = Math.sqrt(sumSquaredError / n);
  const mape = (sumPercentageError / n) * 100;

  return { mape, rmse };
}

/**
 * Detect trend direction
 */
export function detectTrend(data: number[]): 'increasing' | 'decreasing' | 'stable' {
  if (data.length < 2) return 'stable';

  const dataPoints: DataPoint[] = data.map((y, x) => ({ x, y }));
  const { slope } = linearRegression(dataPoints);

  const threshold = Math.abs(slope) / (data.reduce((a, b) => a + b, 0) / data.length) * 100;

  if (threshold < 5) return 'stable';
  return slope > 0 ? 'increasing' : 'decreasing';
}
