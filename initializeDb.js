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

  console.log(`Adding ${toAdd.length} items`)

  await db.jukugo.bulkAdd(toAdd)

  console.log('finished importing entries!')
}
