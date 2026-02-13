const fs = require('fs')
const os = require('os')
const path = require('path')
const { spawnSync } = require('child_process')

const assert = require('./assert')

const cliPath = path.resolve(__dirname, '..', 'bin', 'rio.js')

const runCli = args => spawnSync(process.execPath, [cliPath].concat(args), { encoding: 'utf8' })

describe('CLI', function() {

    it('should show usage with no arguments', function() {
        const res = runCli([])

        assert.equal(res.status, 0)
        assert.include(res.stdout, 'Usage:')
        assert.include(res.stdout, 'npm run rio <cmd> <path> [name] [-p]')
    })

    it('should show usage with --help', function() {
        const res = runCli(['--help'])

        assert.equal(res.status, 0)
        assert.include(res.stdout, 'Usage:')
    })

    it('should report missing source file name', function() {
        const res = runCli(['exec'])

        assert.equal(res.status, 0)
        assert.include(res.stdout, 'Error: source file name missing')
    })

    it('should report missing function name for exec', function() {
        const res = runCli(['exec', './examples/maybe'])

        assert.equal(res.status, 0)
        assert.include(res.stdout, 'Error: function name missing')
    })

    it('should report unknown command', function() {
        const res = runCli(['unknown', './examples/maybe'])

        assert.equal(res.status, 0)
        assert.include(res.stdout, 'Unknown command "unknown"')
    })

    it('should print AST as JSON', function() {
        const res = runCli(['ast', './examples/maybe'])

        assert.equal(res.status, 0)
        assert.include(res.stdout, '"type": "Program"')
        assert.include(res.stdout, '"ReturnStatement"')
    })

    it('should print exported function previews for view command', function() {
        const res = runCli(['view', './examples/maybe'])

        assert.equal(res.status, 0)
        assert.include(res.stdout, 'Just::')
        assert.include(res.stdout, 'Nothing::')
    })

    it('should print static module code to stdout', function() {
        const res = runCli(['static', './examples/maybe'])

        assert.equal(res.status, 0)
        assert.include(res.stdout, "require('ramda')")
        assert.include(res.stdout, 'exports.maybe=maybe')
    })

    it('should write static module code to output file', function() {
        const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rio-cli-'))
        const outFile = path.join(tmpDir, 'module.js')

        try {
            const res = runCli(['static', './examples/maybe', '-o', outFile])

            assert.equal(res.status, 0)
            assert.equal(res.stdout.trim(), '')
            assert.isTrue(fs.existsSync(outFile))

            const code = fs.readFileSync(outFile, 'utf8')
            assert.include(code, 'exports.maybe=maybe')
        } finally {
            fs.rmSync(tmpDir, { recursive: true, force: true })
        }
    })

    it('should report when exported function is not found in exec', function() {
        const res = runCli(['exec', './examples/maybe', 'doesNotExist'])

        assert.equal(res.status, 0)
        assert.include(res.stdout, 'Error. file://./examples/maybe::doesNotExist not found')
    })
})
