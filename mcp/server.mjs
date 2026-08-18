#!/usr/bin/env node
// VeloPair MCP server: validate, author and match VeloPair documents.
// Register in Claude Code:  claude mcp add velopair -- node /path/to/mcp/server.mjs
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { validateDocument, template, TYPES } from "./lib.mjs";
import { match } from "./engine.mjs";

const server = new McpServer({ name: "velopair", version: "0.1.0" });

const asObject = input => (typeof input === "string" ? JSON.parse(input) : input);
const text = value => ({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }] });

server.tool(
  "velopair_validate",
  "Validate a VeloPair document (rider, ride-profile, bike, compatibility, or bundle) against the official JSON Schemas. Type is auto-detected unless given.",
  {
    document: z.union([z.string(), z.record(z.any())]).describe("The document, as JSON object or string"),
    type: z.enum(TYPES).optional().describe("Document type; auto-detected if omitted")
  },
  async ({ document, type }) => {
    const doc = asObject(document);
    const result = validateDocument(doc, type);
    if (result.type === "bundle" && result.valid) {
      for (const member of ["rider", "ride_profile", "bike", "compatibility"]) {
        if (doc[member]) {
          const r = validateDocument(doc[member], member.replace("_", "-"));
          if (!r.valid) result.errors.push(...r.errors.map(e => `/${member}${e}`));
        }
      }
      result.valid = result.errors.length === 0;
    }
    return text(result);
  }
);

server.tool(
  "velopair_template",
  "Return a minimal skeleton for authoring a VeloPair document of the given type, with required fields present.",
  { type: z.enum(TYPES) },
  async ({ type }) => text(template(type))
);

server.tool(
  "velopair_match",
  "Score rider-bike compatibility with the open, NON-NORMATIVE velopair-reference-engine. Inputs must be valid VeloPair documents; returns a valid Compatibility document with a per-dimension breakdown.",
  {
    rider: z.union([z.string(), z.record(z.any())]).describe("A valid Rider document"),
    bike: z.union([z.string(), z.record(z.any())]).describe("A valid Bike document"),
    ride_profile: z.union([z.string(), z.record(z.any())]).optional().describe("Optional Ride Profile document")
  },
  async ({ rider, bike, ride_profile }) => {
    try {
      return text(match({
        rider: asObject(rider),
        bike: asObject(bike),
        ride_profile: ride_profile ? asObject(ride_profile) : null
      }));
    } catch (err) {
      return { content: [{ type: "text", text: `Match failed: ${err.message}` }], isError: true };
    }
  }
);

await server.connect(new StdioServerTransport());
