const { getFilesAndOutlines } = require('./getFilesAndOutlines')


async function write() {
  const string = JSON.stringify(await getFilesAndOutlines(n => ('/Users/justin/code/morohashi-lookup/daikanwajiten/' + n)))

  const outputFilePath = './__indexes.js'

  require('fs').writeFileSync(outputFilePath, `const indexes = ${string}`, 'utf-8')

  console.log('Wrote to '+outputFilePath)
}

write()