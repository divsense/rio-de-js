
const fetch = require('./fetcher.js')

const assert = require('./assert')

describe('Test Fetcher Errors', function() {

    it('should reject unknown protocols', function() {
        return assert.isRejected(
            fetch('ftp://not-supported.rio'),
            'Fetch error. Unknown protocol: ftp'
        )
    })

    it('should reject unknown https fixtures', function() {
        return assert.isRejected(
            fetch('https://example.com/unknown.rio'),
            'Fetch error. No local fixture for URL: https://example.com/unknown.rio'
        )
    })

    it('should resolve known https fixture URLs from local files', async function() {
        const source = await fetch(
            'https://gist.githubusercontent.com/divsense/a064e8d5593fc4ed65bd22e0749faad1/raw/598f357f1256c2f3981255aaf7173bdb65c95756/promise-delay.rio'
        )

        assert.include(source, 'export total1, total2')
        assert.include(source, 'promiseResolve')
    })
})
