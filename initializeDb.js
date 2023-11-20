window.initializeDb = async function initializeDb(db) {
  const toAdd = []

  const jukugoText = window.getJukugoText()

  const lineRegex = /.+\n/g

  let match;
  while (match = lineRegex.exec(jukugoText)) {
    const line = match[0]
    if (line.startsWith('#')) continue
    // DW26997.0.0132.0 DP09046 精神
    // DW00001.0.H001.0 DPH0001 一飮三百杯
    let groups;
    try {
      groups = /\D+(?<characterNumber>\d+)\.[^\.]+\.(?<jukugoEntryNumber>\D?\d+)\.\d+ (?<pageNumber>\D+\d+) (?<name>.+)/u.exec(line).groups
    } catch (err) {
      console.error('Could not parse line ' + line)
      continue
    }
    const { characterNumber: firstCharacterNumber, jukugoEntryNumber, pageNumber: pageNumberString, name } = groups
    if (name === '＃') continue

    toAdd.push({
      name,
      firstCharacterNumber,
      jukugoEntryNumber,
      pageNumber: pageNumberString,
    })
  }

  console.log(`Adding ${toAdd.length} items total.`)

  const startTime = Date.now()
  const chunkSize = 10000
  for (let i = 0; i < toAdd.length; i += chunkSize) {
    console.log(`Adding items ${i + 1} to ${1 + Math.min(i + chunkSize, toAdd.length)} (${Math.round(100 * (i + chunkSize) / toAdd.length)}%)`)
    const chunk = toAdd.slice(i, i + chunkSize)
    try {
      await db.jukugo.bulkAdd(chunk)
    } catch (err) {
      console.error(err)
    }
    const timeElapsed = Date.now() - startTime
    console.log(`Added items ${i + 1} to ${1 + Math.min(i + chunkSize, toAdd.length)} in ${timeElapsed / 1000}s`)
  }

  console.log('finished importing entries!')
}
