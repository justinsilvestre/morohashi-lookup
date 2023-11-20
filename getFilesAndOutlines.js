const P = require("pdfjs-dist/legacy/build/pdf.js");
const { exec } = require("child_process");
const fs = require('fs')

const firstMainTextRunningPages = [
  1,
  1083,

  3403
]

const assert = {
  match(value, regExp, message) {
    if (!regExp.test(value)) throw new Error(message)
  },
  equal(actual, expected, message) {
    if (actual !== expected) throw new Error(message)
  }
}

async function getFilesAndOutlines(nameToPath) {
  const volumeFilenames = [
    "大漢和辞典　巻一 [修訂版] by 諸橋轍次.pdf",
    "大漢和辞典　巻二 [修訂版] by 諸橋轍次.pdf",
    "大漢和辞典　巻三 [修訂版] by 諸橋轍次.pdf",
    "大漢和辞典　巻四 [修訂版] by 諸橋轍次.pdf",
    "大漢和辞典　巻五 [修訂版] by 諸橋轍次.pdf",
    "大漢和辞典　巻六 [修訂版] by 諸橋轍次.pdf",
    "大漢和辞典　巻七 [修訂版] by 諸橋轍次.pdf",
    "大漢和辞典　巻八 [修訂版] by 諸橋轍次.pdf",
    "大漢和辞典　巻九 [修訂版] by 諸橋轍次.pdf",
    "大漢和辞典　巻十 [修訂版] by 諸橋轍次.pdf",
    "大漢和辞典　巻十一 [修訂版] by 諸橋轍次.pdf",
    "大漢和辞典　巻十二 [修訂版] by 諸橋轍次.pdf",
    // supplement: "大漢和辞典　補巻.pdf"
  ];
  const volumePaths = volumeFilenames

  const volumesWithSections = await Promise.all(
    volumePaths.map((volumePath, volumeIndex) => {
      return P.getDocument(nameToPath(volumePath)).promise.then(async (volume) => {
        const outline = await volume.getOutline();
        const [intro, mainText] = outline;

        assert.match(
          mainText.title,
          /本文/,
          "Main text not found for vol " + volumeIndex + 1
        );
        return { volume, volumeIndex, volumePath, intro, mainText };
      });
    })
  );


  const volumesWithPageHeaderCharacters = await Promise.all(volumesWithSections.map(async ({ volume, volumePath, mainText, volumeIndex }) => {
    const mainTextStartPageIndex = await (volume.getPageIndex(mainText.dest[0]))
    const mainTextEndPageIndex = volume.numPages
    const sections = mainText.items
    return { 
      path: volumePath,
      totalPages: volume.numPages,
      index: volumeIndex,
      mainTextStartPageIndex,
      pagesInMainText: mainTextEndPageIndex - mainTextStartPageIndex,
      pageHeaderCharacters: await Promise.all(sections.map(async (item) => {
        assert.match(
          item.title,
          /^\d+$/,
          `vol ${volumeIndex + 1} unexpected section title ${item.title}`
        );
        const charNumber = +item.title ?? 0
        if (Number.isNaN(charNumber)) {
          throw new Error(`Could not parse title ${item.title} in volume ${volumeIndex + 1}`)
        }
        assert.equal(
          item.items.length,
          0,
          `Item ${charNumber} in volume ${volumeIndex + 1} contains sub-destinations`
        );

        if (!item.dest?.[0]) {
          console.error(`No dest found in volume ${volumeIndex + 1} for item ${item.title}`)
          // return null
        }
        const pageIndex = item.dest?.[0] ? await (volume.getPageIndex(item.dest?.[0])) : null

        if (pageIndex === null) {
          console.error(`No page found in volume ${volumeIndex + 1} for item ${item.title}`)
          console.log(item.title, item)
        }

        return { charNumber, page: pageIndex + 1 };
      }))
    }

  }
  ));

  let pagesSoFar = 0
  let mainTextPagesSoFar = 0
  const json = volumesWithPageHeaderCharacters.map((v, i) => {
    const newItem = {
      mainTextStartPageNumber: v.mainTextStartPageIndex + 1,
      mainTextStartPageRunningNumber: mainTextPagesSoFar + 1,
      volumePath: v.path,
      volumeIndex: v.index,
      headerChars: v.pageHeaderCharacters.map(({ charNumber, page }, index) => {
        if (!page) return []

        return { charNumber, page, index }
      })
    }

    pagesSoFar += volumesWithPageHeaderCharacters[i].totalPages
    mainTextPagesSoFar += volumesWithPageHeaderCharacters[i].pagesInMainText - 2

    return newItem
  })

  return json
}


if (!this.window && module && module.exports) module.exports.getFilesAndOutlines = getFilesAndOutlines