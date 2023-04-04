if (process.argv.length < 3) {
    console.log('usage: node alert.js <report.json>')
}
const reportPath = process.argv[2]
const report = require(reportPath)
const rpcTestSuite = report.results
    .find(s => s.file = "/test/rpc.js")
    .suites
    .find(s => s.title === 'rpc test suite')
rpcTestSuite.suites.filter(s => s.title !== 'global').forEach(s => {
    const rpc = s.title
    const failedTests = s.tests.filter(t => t.pass === false)
    if (failedTests.length > 0) {
        console.log(`rpc ${rpc} failed tests:`)
        failedTests.forEach(t => console.log(`- ${t.title}: ${t.err.message}`))
    }
})
