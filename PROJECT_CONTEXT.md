# OPC UA Project Context

## Project Goal

Build a realistic industrial OPC UA architecture consisting of:

```
Motor PLC      Pump PLC      Electricity PLC
      \            |             /
       \           |            /
        +------ Ignition Gateway ------+
                      |
                Node.js Backend
                      |
                REST API (future)
                      |
                HTML Dashboard (future)
```

## Current Status

### Completed
- Implemented three simulated PLCs:
  - Motor
  - Pump
  - Electricity
- Implemented OPC UA servers with node-opcua.
- Designed structured namespaces:
  - Factory
    - Line01
      - Motor01
      - Pump01
      - Electricity01
- Created writable command nodes (Start/Stop/Reset).
- Created read-only measurement nodes.
- Created Root CA using XCA.
- Generated and signed PLC certificates.
- Configured secure OPC UA communication.
- Connected all PLCs to Ignition.
- Imported PLC tags into Ignition.
- Successfully connected a Node.js OPC UA Client to Ignition using certificates.

## Current Stage

We are currently working on:

**Node.js OPC UA Client <-> Ignition**

Connection and session creation work correctly.

The remaining task is discovering the published Ignition address space and reading/writing tags through Ignition.

---

## Problems Solved

### PKI / Certificates

- SubjectAlternativeName missing
- ApplicationURI mismatch
- Invalid KeyUsage
- Missing ExtendedKeyUsage
- BadCertificateUriInvalid
- BadCertificateChainIncomplete
- BadCertificateUntrusted
- Bad_SecurityChecksFailed
- Anonymous authentication not enabled
- Username authentication configuration
- Root CA trust configuration
- Ignition self-signed certificate trust

### node-opcua

- ApplicationUri mismatch with manually generated certificates.
- CertificateManager integration.
- Certificate chain validation.
- Secure channel creation.
- Session activation.

### Ignition

- OPC Connections configured.
- PLC discovery completed.
- Tags imported.
- Investigating OPC UA browsing of published tags.

---

## Next Tasks

### Phase 1
- Browse Ignition address space.
- Read values through Ignition.
- Write commands (Start/Stop/Reset) through Ignition.

### Phase 2
Create a small HTML application that displays live PLC values.

Suggested dashboard:

```
Motor
------------------------
Running
Speed
Voltage
Current
Temperature

Buttons:
[Start]
[Stop]
[Reset]
```

Repeat the same for Pump and Electricity.

### Phase 3
Create a Node.js REST API.

### Phase 4
Connect the HTML dashboard to the REST API.

### Phase 5
Add subscriptions for live updates.

### Phase 6
Historical data, alarms and logging.

---

## Long-Term Goal

Create a production-like Industry 4.0 architecture demonstrating:

- OPC UA
- Ignition Gateway
- Secure PKI
- Multiple PLCs
- Backend integration
- Web dashboard
