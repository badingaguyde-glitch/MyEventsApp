---
name: rea
description: Reverse Engineer Anything (REA) toolkit from https://github.com/morluto/rea.git. Analyze, inspect, decompile, and reverse engineer applications, Electron/JavaScript packages, native binaries, firmware, and web apps. Use when asked to reverse engineer an application, inspect binaries, decompile code, unpack ASAR/Electron apps, or when the user mentions REA.
---

# REA (Reverse Engineer Anything)

REA is an open-source reverse engineering toolkit designed for AI coding agents and developer environments (from [morluto/rea](https://github.com/morluto/rea)).

Detailed documentation and procedures are organized into:
- [reverse-engineer-anything](../reverse-engineer-anything/SKILL.md): Comprehensive instructions for static analysis, native binary decompilation (Ghidra, Hopper, IDA), JavaScript/Electron ASAR inspection, and runtime evidence collection.
- [rea-tool-design](../rea-tool-design/SKILL.md): Tool design and adapter development for REA.
- [rea-analysis-optimization](../rea-analysis-optimization/SKILL.md): Optimizing reverse engineering workflows and evidence synthesis.

## Quick CLI & MCP Setup

To configure or verify the local REA environment:
```bash
npx -y rea-agents@6.8.0 setup
```

Or run doctor checks:
```bash
npx -y rea-agents@6.8.0 doctor
```
