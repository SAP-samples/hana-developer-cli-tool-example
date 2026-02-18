# kafkaConnect

> Command: `kafkaConnect`  
> Category: **Connection & Auth**  
> Status: Production Ready

## Description

Manages Kafka connector configurations for integrating real-time streaming data from Apache Kafka into SAP HANA. It allows you to create, configure, monitor, and test Kafka connectors seamlessly.

## Syntax

```bash
hana-cli kafkaConnect [action] [options]
```

## Aliases

- `kafka`
- `kafkaAdapter`
- `kafkasub`

## Parameters

### Positional Parameters

- **action** (string): Action to perform
  - Default: `list`
  - Alias: `-a, --Action`
  - Choices: `list`, `create`, `delete`, `status`, `test`, `info`

### Optional Parameters

- **--name, -n** (string): Kafka Connector Name
  - Alias: `--Name`
  - Required for: `create`, `delete`, `test`, `info` actions

- **--brokers, -b** (string): Kafka Brokers (comma-separated)
  - Format: `broker1:port,broker2:port`
  - Required for: `create` action
  - Alias: `--Brokers`

- **--topic, -t** (string): Kafka Topic Name
  - Required for: `create` action
  - Alias: `--Topic`

- **--config, -c** (string): Path to configuration file
  - Alias: `--Config`

For a complete list of parameters and options, use:

```bash
hana-cli kafkaConnect --help
```

## Actions

- **list** (default): Display all Kafka connectors
- **create**: Create a new Kafka connector
- **delete**: Remove a Kafka connector
- **status**: Check connector status and health
- **test**: Test a Kafka connector connection
- **info**: Get detailed connector information

## Output

### List Action

Returns all connectors with:

- Connector ID
- Connector name
- Status
- Brokers
- Topic
- Creation and modification timestamps

### Status Action

Returns:

- Connector name
- Current status
- Last error (if any)
- Message count
- Error count
- Last activity timestamp

### Test Action

Returns test results and connection validation status.

### Info Action

Returns comprehensive connector details:

- Configuration parameters
- Schema and table mappings
- Column mappings
- Comments and descriptions

## Configuration

### Broker Format

```bash
hostname:port,hostname:port
Example: kafka-broker1.example.com:9092,kafka-broker2.example.com:9092
```

### Topic Naming

Use standard Kafka topic naming conventions (alphanumeric, dots, hyphens, underscores).

## Examples

### 1. List All Kafka Connectors

```bash
hana-cli kafkaConnect list
```

### 2. Create a New Kafka Connector

```bash
hana-cli kafkaConnect create \
  --name my_connector \
  --brokers kafka1:9092,kafka2:9092 \
  --topic orders
```

### 3. Check Connector Status

```bash
hana-cli kafka status --name my_connector
```

### 4. Test Connector Connection

```bash
hana-cli kafkaConnect test -n my_connector
```

### 5. Get Detailed Connector Information

```bash
hana-cli kafkaConnect info --name my_connector
```

### 6. Delete a Connector

```bash
hana-cli kafka delete --name old_connector
```

## Use Cases

- **Real-time Data Integration**: Stream Kafka messages into HANA tables
- **Event Processing**: Capture and analyze streaming events
- **Data Pipeline**: Build ETL pipelines with Kafka sources
- **IoT Data**: Ingest sensor and IoT data streams

## Troubleshooting

### Connection Failed

- Verify broker addresses are correct and accessible
- Ensure network connectivity to Kafka brokers
- Check authentication credentials

### Missing Messages

- Verify topic name exists in Kafka cluster
- Check message retention policies
- Confirm consumer group configuration

### High Latency

- Monitor Kafka broker performance
- Check HANA database capacity
- Review batch size and timeout settings

## Notes

- Kafka brokers must be accessible from HANA System
- Topic must exist in Kafka cluster before connector creation
- Large message volumes may require performance tuning
- Connector status updates periodically (typically every 30 seconds)

## Related Commands

- `import` - Bulk data import from files
- `export` - Export data to various formats
- `containers` - Manage HDI containers for data storage

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: Connection & Auth](..)
- [All Commands A-Z](../all-commands.md)
