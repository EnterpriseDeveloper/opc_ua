# OPC UA Demo Project

## Documentation

- PROJECT_CONTEXT.md - architecture and current progress.

Current development stage:

Node.js Client <-> Ignition integration.

## Browse published Ignition tags

The `browse:ignition` script securely connects to the Ignition OPC UA server and
prints the address-space tree below `Objects`. It does not write or change tags.

```powershell
npm run browse:ignition
```

The default endpoint is `opc.tcp://localhost:62541`. Override it when needed:

```powershell
$env:OPCUA_ENDPOINT = "opc.tcp://gateway-host:62541"
npm run browse:ignition
```

Use `OPCUA_BROWSE_DEPTH` to limit how deeply the tree is explored (default: 8).

## Read PLC tags from Ignition

Read every variable below Motor, Pump, and Electricity in the `Sample_Tags`
provider:

```powershell
npm run read:ignition
```

Set `IGNITION_TAG_PROVIDER` or `IGNITION_PLC_NAMES` if the provider or PLC
folder names change.

## Live HTML dashboard

Start the local dashboard, then open `http://127.0.0.1:3010` in a
browser. It refreshes all three PLC groups every five seconds.

```powershell
npm run dashboard
```

Use `DASHBOARD_PORT` to choose another local port. The server binds only to
`127.0.0.1` by default.
