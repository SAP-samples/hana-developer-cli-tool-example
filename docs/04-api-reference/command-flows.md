# Command Execution Flow

Visual diagrams showing how HANA CLI commands are processed and executed.

## Overall Command Flow

```mermaid
graph TD
    A["User Input<br/>(CLI / Web UI / API / MCP)"] -->|Parse| B["Command Router<br/>(yargs / Express)"]
    B -->|Validate| C["Parameter Validation<br/>(schemas, types)"]
    C -->|Load| D["Command Module<br/>(app/command.js)"]
    D -->|Execute| E["Database Operation<br/>(SQL / Query)"]
    E -->|Format| F["Result Formatter<br/>(JSON/CSV/HTML)"]
    F -->|Return| G["Output<br/>(stdout / HTTP / WebSocket)"]
    
    style A fill:#0070C0,color:#fff
    style B fill:#FF6B6B,color:#fff
    style C fill:#51CF66,color:#fff
    style D fill:#FFD93D,color:#000
    style E fill:#95E1D3,color:#000
    style F fill:#F38181,color:#000
    style G fill:#0070C0,color:#fff
```

## Command Parser & Router

```mermaid
graph TD
    A["CLI Input"] -->|Tokenize| B["yargs Parser"]
    B -->|Identify| C["Command Name"]
    C -->|Match| D{Found in<br/>app/?}
    D -->|No| E["Show Help<br/>or Error"]
    D -->|Yes| F["Load Command<br/>Module"]
    E -->|Exit| Z["Return Exit Code"]
    F -->|Extract| G["Command Definition"]
    G -->|Validate| H["Arguments & Flags"]
    H -->|Build| I["argv Object"]
    I -->|Execute| J["Handler Function"]
    J -->|Complete| Z
    
    style A fill:#0070C0,color:#fff
    style B fill:#51CF66,color:#fff
    style F fill:#FFD93D,color:#000
    style J fill:#95E1D3,color:#000
    style Z fill:#FF6B6B,color:#fff
```

## Database Connection Flow

```mermaid
graph TD
    A["Command Execution"] -->|Needs Connection| B["Load Connection Config"]
    B -->|Check| C["1. Project .cdsrc-private.json?"]
    C -->|No| D["2. default-env.json?"]
    C -->|Yes| E["Use Project Config"]
    D -->|No| F["3. .env file?"]
    D -->|Yes| E
    F -->|No| G["4. ~/.hana-cli/default.json?"]
    F -->|Yes| E
    G -->|No| H["5. VCAP_SERVICES?"]
    G -->|Yes| E
    H -->|No| I["6. CLI Parameters?"]
    H -->|Yes| E
    I -->|No| J["Connection Failed"]
    I -->|Yes| E
    E -->|Connect| K["Open Pool Connection"]
    K -->|Query| L["Execute on HANA"]
    L -->|Response| M["Return Results"]
    J -->|Error| N["Show Error Message"]
    M -->|Success| Z["Complete"]
    N -->|Fail| Z
    
    style A fill:#0070C0,color:#fff
    style E fill:#51CF66,color:#fff
    style K fill:#FFD93D,color:#000
    style L fill:#95E1D3,color:#000
    style Z fill:#0070C0,color:#fff
    style J fill:#FF6B6B,color:#fff
```

## Data Import Process

```mermaid
graph TD
    A["import Command"] -->|Read| B["File Parser"]
    B -->|Detect| C["Format Detection<br/>(CSV / Excel / JSON)"]
    C -->|Parse| D["Load File Data"]
    D -->|Match| E["Column Matching"]
    E -->|Options| F{"Match Mode?"}
    F -->|name| G["Match by Name"]
    F -->|order| H["Match by Order"]
    F -->|auto| I["Auto Detect"]
    G & H & I -->|Validate| J["Type Conversion<br/>(String → SQL Types)"]
    J -->|Batch| K["Split into Batches<br/>(default: 1000 rows)"]
    K -->|Insert| L["Execute Batch Insert<br/>into HANA"]
    L -->|Loop| M{More Batches?}
    M -->|Yes| K
    M -->|No| N["Commit Transaction"]
    N -->|Summary| O["Report Results<br/>(Rows Imported)"]
    
    style A fill:#0070C0,color:#fff
    style E fill:#FF6B6B,color:#fff
    style J fill:#FFD93D,color:#000
    style L fill:#95E1D3,color:#000
    style O fill:#51CF66,color:#fff
```

## Data Export Process

```mermaid
graph TD
    A["export Command"] -->|Parse| B["Build Query"]
    B -->|Add| C["WHERE Clause<br/>(optional filter)"]
    C -->|Limit| D["Add LIMIT<br/>(default: 200)"]
    D -->|Order| E["Add ORDER BY<br/>(optional)"]
    E -->|Execute| F["Query HANA Database"]
    F -->|Fetch| G["Stream Results"]
    G -->|Format| H{"Output Format?"}
    H -->|json| I["Convert to JSON"]
    H -->|csv| J["Convert to CSV"]
    H -->|excel| K["Create Excel File"]
    H -->|table| L["Format as Table"]
    H -->|markdown| M["Format as Markdown"]
    I & J & K & L & M -->|Save/Return| N["Output Results<br/>(stdout / file)"]
    
    style A fill:#0070C0,color:#fff
    style F fill:#95E1D3,color:#000
    style H fill:#FF6B6B,color:#fff
    style N fill:#51CF66,color:#fff
```

## Schema Comparison Process

```mermaid
graph TD
    A["compareSchema Command"] -->|Connect| B["Source Schema"]
    A -->|Connect| C["Target Schema"]
    B -->|Inspect| D["Get Tables"]
    C -->|Inspect| E["Get Tables"]
    D & E -->|Compare| F["Diff Detection"]
    F -->|Analyze| G["Find Differences"]
    G -->|Categorize| H{"Type?"}
    H -->|Missing| I["Tables in Source<br/>but not Target"]
    H -->|New| J["Tables in Target<br/>but not Source"]
    H -->|Different| K["Tables with<br/>Schema Changes"]
    I & J & K -->|Generate| L["Migration Script"]
    L -->|Format| M{"Output Format?"}
    M -->|sql| N["Output SQL"]
    M -->|html| O["Output HTML Report"]
    M -->|json| P["Output JSON"]
    N & O & P -->|Display| Q["Show Results"]
    
    style A fill:#0070C0,color:#fff
    style B fill:#51CF66,color:#fff
    style C fill:#51CF66,color:#fff
    style F fill:#FFD93D,color:#000
    style L fill:#95E1D3,color:#000
    style Q fill:#0070C0,color:#fff
```

## MCP Server Message Flow

```mermaid
graph TD
    A["AI Agent<br/>(Claude)"] -->|JSON-RPC| B["MCP Server"]
    B -->|Tool Call| C["Extract Tool<br/>Parameters"]
    C -->|Get Context| D{"Has projectContext?"}
    D -->|No| E["Use Install Path"]
    D -->|Yes| F["Extract Project Path"]
    F -->|Set| G["Environment Variables"]
    E & G -->|Change Dir| H["Set CWD to Project"]
    H -->|Spawn| I["CLI Process"]
    I -->|Execute| J["Command Handler"]
    J -->|Query| K["Database"]
    K -->|Results| L["Format Output<br/>(Markdown)"]
    L -->|Return| M["JSON-RPC Response"]
    M -->|Display| N["AI Shows Results<br/>to User"]
    
    style A fill:#0070C0,color:#fff
    style B fill:#FF6B6B,color:#fff
    style C fill:#FFD93D,color:#000
    style J fill:#95E1D3,color:#000
    style N fill:#51CF66,color:#fff
```

## Web UI Command Execution

```mermaid
graph TD
    A["User Action<br/>in Web UI"] -->|Click| B["Fiori App"]
    B -->|Collect| C["User Input"]
    C -->|Send| D["WebSocket Message<br/>{command, args}"]
    D -->|Receive| E["Express Server<br/>(routes/)"]
    E -->|Route| F["Command Handler"]
    F -->|Execute| G["CLI Command<br/>(same as CLI)"]
    G -->|Get Results| H["Format for UI<br/>(Markdown Table)"]
    H -->|Send Back| I["WebSocket Response"]
    I -->|Receive| J["Web UI"]
    J -->|Render| K["Display Results<br/>in App"]
    
    style A fill:#0070C0,color:#fff
    style B fill:#FF6B6B,color:#fff
    style F fill:#FFD93D,color:#000
    style G fill:#95E1D3,color:#000
    style K fill:#51CF66,color:#fff
```

## REST API Request Flow

```mermaid
graph TD
    A["HTTP Client<br/>(curl / Postman)"] -->|POST| B["Express Route"]
    B -->|Parse| C["Request Body<br/>(JSON)"]
    C -->|Extract| D["Command & Args"]
    D -->|Execute| E["CLI Handler"]
    E -->|Query| F["Database"]
    F -->|Results| G["Format for HTTP<br/>(JSON)"]
    G -->|Send| H["HTTP Response<br/>(200 / 400 / 500)"]
    H -->|Receive| I["HTTP Client"]
    I -->|Parse| J["Display/Process"]
    
    style A fill:#0070C0,color:#fff
    style B fill:#FF6B6B,color:#fff
    style E fill:#FFD93D,color:#000
    style F fill:#95E1D3,color:#000
    style J fill:#51CF66,color:#fff
```

## Error Handling Flow

```mermaid
graph TD
    A["Operation Executes"] -->|Error| B["Catch Exception"]
    B -->|Type| C{"Error Type?"}
    C -->|Connection| D["Database Unreachable"]
    C -->|Permission| E["Access Denied"]
    C -->|Syntax| F["Invalid SQL"]
    C -->|Data| G["Data Type Mismatch"]
    C -->|System| H["Out of Memory"]
    D & E & F & G & H -->|Format| I["User-Friendly<br/>Error Message"]
    I -->|Add| J["Suggestion Text"]
    J -->|Debug| K{"Debug Mode?"}
    K -->|Yes| L["Add Stack Trace"]
    K -->|No| M["Skip Details"]
    L & M -->|Return| N["Error Response<br/>(stderr or HTTP)"]
    N -->|Exit| O["Exit Code<br/>(non-zero)"]
    
    style A fill:#0070C0,color:#fff
    style B fill:#FF6B6B,color:#fff
    style I fill:#FFD93D,color:#000
    style O fill:#FF6B6B,color:#fff
```

## Performance Optimization Flow

```mermaid
graph TD
    A["Command Startup"] -->|Check| B["Lazy Loading<br/>Enabled?"]
    B -->|Yes| C["Skip Loading<br/>Unused Modules"]
    B -->|No| D["Load All Commands<br/>(slow)"]
    C -->|On first use| E["Load Only<br/>Needed Module"]
    E -->|Cache| F["Module Cache"]
    F -->|Subsequent runs| G["Use Cache"]
    D -->|Skip| G
    G -->|Ready| H["Command Executes<br/>(fast)"]
    
    style A fill:#0070C0,color:#fff
    style C fill:#51CF66,color:#fff
    style H fill:#51CF66,color:#fff
    style D fill:#FF6B6B,color:#fff
```

## See Also

- [REST API Documentation](./index.md)
- [Swagger Interactive Docs](./swagger.md)
- [Command Reference](../../02-commands/)
- [Architecture Details](../../developer-notes/architecture/application.md)
