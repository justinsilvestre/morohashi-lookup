const { getFilesAndOutlines } = require('./getFilesAndOutlines')
const { findChar } = require('./findChar')
const { exec } = require("child_process");

const wantedCharacterCode = +process.argv[2]
console.log('Finding character ' + wantedCharacterCode)

const LOCATION = '/Users/justin/code/morohashi-lookup/daikanwajiten/'

try {
  getFilesAndOutlines(n => (LOCATION + n)).then(json => {
    const {charSection, volume} = findChar(json, wantedCharacterCode)
    if (charSection) {
      console.log(`Found!`, charSection)
      const url = encodeURI(`file://${LOCATION}${volume.volumePath}`) + `#${charSection.charNumber}`
      console.log(url)
      const command = `/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome ${url}`
      console.log((command))
      // open(`file://${found.volumePath}#${found.charNumber}`, { app: { name: 'google chrome' } })
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout: ${stdout}`);
      });
    } else {
      console.error('Not found.')
    }


  });
} catch (err) {
  throw err;
}
