# rio-de-js

Concise JavaScript toolchain for loading, compiling, and executing [Rio](https://www.npmjs.com/package/riojs) modules.

`rio-de-js` provides:
- Recursive Rio import resolution
- Compilation to executable JavaScript functions
- Built-in standard libraries (`ramda`, `io`, `math`, `number`, `promise`)
- A small CLI for inspect/exec/static output

## Install

```bash
npm install rio-de-js
```

For local development in this repository:

```bash
npm install
npm test
```

## Quick Start (Programmatic API)

```js
const fs = require('fs')
const { rioLibs, fci, libFunction } = require('rio-de-js')

const fetch = url => {
  const [protocol] = url.split('://')
  if (protocol !== 'file') return Promise.reject(new Error('Only file:// in this example'))

  const path = url.replace('file://', '')
  try {
    return Promise.resolve(fs.readFileSync(path, 'utf8'))
  } catch (e) {
    return Promise.reject(e)
  }
}

;(async () => {
  const url = 'file://./examples/calc.rio'
  const libs = await fci(url, rioLibs, fetch)

  const summa = libFunction(libs, url, 'summa')
  const result = summa([{ value: 1 }, { value: 2 }])

  console.log(result) // 3
})()
```

## CLI

Entrypoint:

```bash
node ./bin/rio.js <command> <path-without-.rio> [functionName] [flags]
```

Example path: `./examples/maybe` means file `./examples/maybe.rio`.

Commands:
- `view <path>`: print compiled exported functions
- `lib <path>`: same output as `view`
- `ast <path>`: print parsed Rio AST
- `exec <path> <name> [-p]`: execute one exported function
- `static <path> [-o output.js]`: emit CommonJS module source

Flags:
- `-p` / `--promise`: treat `exec` result as a Promise and print resolved value
- `-o <file>`: output file path for `static`

Notes:
- `exec` currently calls the function with no arguments.
- CLI reads files through `file://` protocol from current working directory.

## Built-in Libraries

Default in scope:
- `ramda`

Available via import:
- `io`: `delay`, `delayBy`, `log`, `getJson`, `getXml`
- `math`: JavaScript `Math` function wrappers
- `number`: `parseInt`, `parseFloat`, `toNumber`, `isNaN`
- `promise`: `promiseResolve`, `promiseReject`, `promiseAll`, `promiseRace`

Rio import examples:

```rio
import 'math'
import 'io' { delay }
import 'promise' { promiseResolve }
```

## Public API

`require('rio-de-js')` exports:
- `rioLibs`: default library registry
- `install(name, ast, libs)`: compile/install one Rio AST into libs map
- `resolveImports(ast, libs)`: list missing imports for a parsed AST
- `libFunction(libs, url, exportName)`: get compiled exported function
- `fci(url, libs, fetch, endpoints?)`: fetch + compile + install recursively
- `msm(ast)`: build static CommonJS source from AST (`{ code, unresolved }`)

Legacy compatibility file in this repo:
- `rio.de.js` also exposes lower-level helpers (`buildScope`, `compile`, `makeLib`)

## Known Limitations (Current Repo State)

- `static` can fail on modules that use bare imports without explicit specifiers (for example `import 'math'`).

## Repository Layout

- `src/`: compiler/install/linker core
- `helpers/`: fetch-compile-install and static-module helpers
- `libs/`: built-in library symbol/function tables
- `examples/`: sample Rio modules
- `test/`: mocha tests for examples and fetch/install flow
- `bin/rio.js`: CLI
