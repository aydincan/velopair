# VeloPair MCP server

An MCP (Model Context Protocol) server exposing three tools:

- `velopair_validate`: validate any VeloPair document against the official JSON
  Schemas; the type is auto-detected. Bundles are validated member by member.
- `velopair_template`: minimal authoring skeleton per document type.
- `velopair_match`: score a rider-bike pairing with the open, **non-normative**
  `velopair-reference-engine`; returns a valid Compatibility document with a
  per-dimension breakdown and a confidence derived from input completeness.

The VeloPair standard defines data, never scoring. This engine exists so the
ecosystem has one inspectable consumer to test against; its heuristics are
classic static fit formulas and are documented in `engine.mjs`.

## Install

From npm (recommended), registered in Claude Code with one line:

```
claude mcp add velopair -- npx -y velopair
```

From source:

```
cd mcp && npm install
node server.mjs           # stdio transport
npm test                  # 35 checks over schemas, examples and the engine
claude mcp add velopair -- node /absolute/path/to/mcp/server.mjs
```

## License

Apache-2.0, like all code-like artifacts in this repository.
