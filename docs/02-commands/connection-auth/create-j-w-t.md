# createJWT

> Command: `createJWT`  
> Category: **System Tools**  
> Status: Production Ready

## Description

Create JWT Token and Import Certificate (To obtain the certificate and issuer used in the SQL you need to use the xsuaa service key credentials.url element which should look like this: https://&lt;subdomain&gt;.authentication.&lt;region&gt;.hana.ondemand.com then add /sap/trust/jwt path to it in a browser)

## Syntax

```bash
hana-cli createJWT [name] [options]
```

## Aliases

- `cJWT`
- `cjwt`
- `cJwt`

## Parameters

For a complete list of parameters and options, use:

```bash
hana-cli createJWT --help
```

## Examples

### Basic Usage

```bash
hana-cli hana-cli createJWT --name myJWT --issuer https://example.com
```

Execute the command

## Related Commands

See the [Commands Reference](../all-commands.md) for other commands in this category.

## See Also

- [Category: System Tools](..)
- [All Commands A-Z](../all-commands.md)
