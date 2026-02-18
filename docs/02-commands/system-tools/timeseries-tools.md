# timeseriesTools

> Command: `timeseriesTools`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Provides specialized tools for analyzing, aggregating, and forecasting time-series data in SAP HANA. It enables advanced temporal data analysis including anomaly detection and pattern discovery in time-stamped data.

## Syntax

```bash
hana-cli timeSeriesTools [action] [options]
```

## Aliases

- `tsTools`
- `timeseries`
- `timeseriestools`

## Parameters

### Positional Parameters

- **action** (string): Action to perform
  - Default: `list`
  - Alias: `-a, --Action`
  - Choices: `list`, `analyze`, `aggregate`, `forecast`, `detect`, `info`

### Optional Parameters

- **--table, -t** (string): Table name for analysis
  - Required for: `analyze`, `aggregate`, `forecast`, `detect` actions
  - Alias: `--Table`

- **--schema, -s** (string): Schema name
  - Default: `**CURRENT_SCHEMA**`
  - Alias: `--Schema`

- **--timeColumn, --tc** (string): Timestamp column name
  - Required for: `aggregate` action
  - Alias: `--TimeColumn`

- **--valueColumn, --vc** (string): Value column name (numeric)
  - Required for: `aggregate` action
  - Alias: `--ValueColumn`

- **--interval, -i** (string): Time interval for aggregation
  - Default: `HOUR`
  - Choices: `SECOND`, `MINUTE`, `HOUR`, `DAY`, `WEEK`, `MONTH`
  - Alias: `--Interval`

- **--limit, -l** (number): Maximum results to return
  - Default: `1000`
  - Alias: `--Limit`

For a complete list of parameters and options, use:

```bash
hana-cli timeseriesTools --help
```

## Actions

- **list** (default): Display all time-series enabled tables
- **analyze**: Analyze time-series data patterns and statistics
- **aggregate**: Aggregate time-series data by time intervals
- **forecast**: Generate forecasts for time-series data
- **detect**: Detect anomalies in time-series data
- **info**: Display time-series capabilities and features

## Time Interval Options

| Interval | Description | Format |
| -------- | ----------- | ------ |
| SECOND | Per-second granularity | HH:MI:SS |
| MINUTE | Per-minute granularity | HH:MI |
| HOUR | Hourly aggregation | HH:00 |
| DAY | Daily aggregation | YYYY-MM-DD |
| WEEK | Weekly aggregation | Week number |
| MONTH | Monthly aggregation | YYYY-MM |

## Output

### List Action

Returns time-series tables with:

- Schema name
- Table name
- Time column
- Retention period
- Compression status
- Creation and modification timestamps

### Analyze Action

Returns analysis statistics:

- Earliest and latest timestamps
- Total record count
- Days with data

### Aggregate Action

Returns aggregated data with time buckets including:

- Time bucket
- Record count per bucket
- Average, minimum, and maximum values
- Time-series trends

### Forecast Action

Returns forecast model information and confidence levels.

### Detect Action

Returns detected anomalies with:

- Timestamp of anomaly
- Deviation from baseline
- Severity level

### Info Action

Displays available time-series features and capabilities.

## Examples

### 1. List Time-Series Tables

```bash
hana-cli timeSeriesTools list
```

### 2. Analyze Time-Series Data

```bash
hana-cli tsTools analyze --table sensor_data
```

### 3. Aggregate Data by Hour

```bash
hana-cli timeSeriesTools aggregate \
  --table metrics \
  --timeColumn measurement_time \
  --valueColumn temperature \
  --interval HOUR
```

### 4. Aggregate by Day

```bash
hana-cli timeSeriesTools aggregate \
  -t sales \
  -tc order_date \
  -vc amount \
  -i DAY
```

### 5. Detect Anomalies

```bash
hana-cli timeSeriesTools detect --table sensor_readings
```

### 6. Get Forecast

```bash
hana-cli tsTools forecast -t stock_prices
```

### 7. Display Capabilities

```bash
hana-cli timeSeriesTools info
```

## Use Cases

- **Operational Monitoring**: Track metrics over time (CPU, memory, IO)
- **Sales Analytics**: Analyze revenue trends and patterns
- **Sensor Data**: Process IoT and sensor measurements
- **Stock Analysis**: Track price movements and volatility
- **Quality Assurance**: Monitor product quality metrics
- **Anomaly Detection**: Identify unusual patterns and outliers
- **Capacity Planning**: Forecast resource requirements

## Advanced Features

### Time-Series Functions

- **ROUND_TIMESTAMP()**: Round timestamps to intervals
- **Aggregation**: SUM, AVG, MIN, MAX, COUNT functions
- **Window Functions**: LAG, LEAD for trend analysis

### Performance Tips

1. **Indexes**: Create indexes on timestamp columns for faster queries
2. **Partitioning**: Partition large tables by date/time
3. **Compression**: Enable compression for storage optimization
4. **Retention**: Set retention policies for old data

### Data Requirements

- Timestamp column must be datetime or timestamp type
- Value column must be numeric or convertible to numeric
- Data should be sorted by timestamp for optimal performance
- Null values in metrics are ignored

## Notes

- Aggregation processes can be memory-intensive with large datasets
- Forecast accuracy depends on data volume and consistency
- Anomaly detection works best with regular, historical data
- Time-series analysis requires at least 30 days of data for reliable results
- Aggregate results are sorted in descending order by timestamp

## Related Commands

- `querySimple` - Execute custom time-series queries
- `dataProfile` - Profile data distributions
- `memoryAnalysis` - Analyze memory usage patterns

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
