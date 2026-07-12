const { produce } = require('./lib')
const spec = require('./specs/' + process.argv[2])
produce(spec).then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) })
