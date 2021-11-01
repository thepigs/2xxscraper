import fetch from 'node-fetch'
import cheerio from 'cheerio'
import getPixels from 'get-pixels'
import pixelmatch from 'pixelmatch'
import teserract from 'node-tesseract-ocr'
import fs from 'fs/promises'
async function gp(s) {
    return new Promise((res, rej) => {
        getPixels(s, function (err, pixels) {
            if (err) {
                rej(err)
            } else
                res(pixels)
        })
    })
}

async function run() {
    const crnpixels = await gp('crn.jpg')
    console.log(crnpixels)
    const html = await fetch('https://www-2xxfm-org-au.mediarealm.dev/shows/')
    const text = await html.text()
    const $ = cheerio.load(text);
    let a = []
    $('div.card').each(function () {
        a.push($(this))
    })
    await fs.writeFile('output.csv','Title,Default Pic,No text\r\n')
    await Promise.all(a.map(async v => {
         console.log(v.html())
        const url = v.find('a').attr('href')
        const title = v.find('h1').text()
        const t = v.find('div.card-upper').attr('style').slice(23, -3)
        let cl = v.find('div.card-lower').text()
        let text=''
        if (t.length > 0) {
            try {
                text = await teserract.recognize(t, {
                    lang: "eng",
                    binary: '"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"'
                })
            } catch (e) {
                text = ''
            }
            text = text.replace(/\W/g, '')
            if (text.includes('CRN') || text.includes('COMMUNITY'))
                text = 'CRN default pic?';
            else
                text = ''
        } else text = 'No pic?'
        cl = cl.replace(/\W/g,'')
        if (cl.length<6)
            cl= 'No text?'
        else
            cl = ''
        await fs.appendFile('output.csv','"'+title+'",'+text+','+cl+','+url+'\r\n')
    }))
}


run().catch(e => console.log(e))
