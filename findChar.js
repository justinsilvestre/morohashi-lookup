const DAI_KANWA_TOTAL_CHARS = 51110


function findChar(json, wantedCharacterCode) {
  console.log('searching for ' + wantedCharacterCode)
  const volume = getVolumeWithChar(json, wantedCharacterCode)
  const charSection = volume && getSectionWithinVolume(volume, wantedCharacterCode)
  return {charSection, volume}
}

function binarySearch(ar, compare_fn) {
  var m = 0;
  var n = ar.length - 1;
  while (m <= n) {
    var k = (n + m) >> 1;
    var cmp = compare_fn(ar[k]);
    if (cmp > 0) {
      m = k + 1;
    } else if (cmp < 0) {
      n = k - 1;
    } else {
      return k;
    }
  }
  return -m - 1;
}

function getVolumeWithChar(volumes, wantedCharacterCode) {
  for (const volume of volumes) {
    const { first, last } = getCharactersRangeInVolume(volumes, volume.volumeIndex)
    if (wantedCharacterCode >= first && wantedCharacterCode <= last) return volume
  }
}

function getSectionWithinVolume(volume, wantedCharacterCode) {
  const index = binarySearch(volume.headerChars,  ({charNumber: b, index}) => {
    if (wantedCharacterCode < b) return -1
    if (wantedCharacterCode > getCharactersRangeInSection(volume, index).last) return 1
    return 0
  })
  return volume.headerChars[index]
}

function getCharactersRangeInSection(volume, sectionIndex) {
  const firstChar = volume.headerChars[0].charNumber
  const nextSection = volume.headerChars[sectionIndex + 1]
  const lastChar = nextSection
    ? nextSection.charNumber
    : DAI_KANWA_TOTAL_CHARS
  return {
    first: firstChar,
    last: lastChar
  }
}

function firstHeadChar(volumes, volumeIndex) {
  const { headerChars } = volumes[volumeIndex]
  return headerChars[0]
}

function lastHeadChar(volumes, volumeIndex) {
  const { headerChars } = volumes[volumeIndex]
  return headerChars[headerChars.length - 1]
}

function getCharactersRangeInVolume(volumes, volumeIndex) {
  const firstCharacterNumberInVolume = firstHeadChar(volumes, volumeIndex).charNumber

  const nextVolume = volumes[volumeIndex + 1]
  const lastCharacterNumberinVolume = nextVolume ? lastHeadChar(volumes, volumeIndex).charNumber : DAI_KANWA_TOTAL_CHARS

  return {
    first: firstCharacterNumberInVolume,
    last: lastCharacterNumberinVolume
  }
}


if (!this.window && module && module.exports) {
  module.exports.findChar = findChar
}