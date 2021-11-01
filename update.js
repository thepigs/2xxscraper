import {Builder, By, Capabilities, until, Key} from 'selenium-webdriver'
import chrome from 'chromedriver';

let driver
const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));

//TODO case insensitive, remove CRN, remove all spaces
async function selectByVisibleText(select, textDesired) {
    const option = await select.findElement(By.xpath('.//option[ contains (text(),"' + textDesired + '")]'))
    await option.click()
}

async function addBlock(title) {
    let we = await driver.findElements(By.css('button.block-editor-inserter__toggle'));
    await we[we.length - 1].click()
    await waitFor(200)
    let inserter = await driver.findElement(By.css('div.block-editor-inserter__quick-inserter'));
    let search = await driver.findElement(By.css("input.block-editor-inserter__search-input"));
    await search.sendKeys(title);
    await waitFor(200)
    await inserter.findElement(By.xpath("//button//span[ contains(text(),'" + title + "') ]")).click();
}

async function clickEdit() {
    try {
        await driver.findElement(By.css('div.components-toolbar span.dashicons-edit')).click();
    } catch (e) {
    }
}

async function editShow(s) {
    await driver.get(s);

    try {
        await driver.switchTo().alert().accept()
    } catch (e) {
    }

    let origtitle = await driver.findElement(By.css("h1")).getText()
    let title = origtitle//.replace(/[^\w(),. -]+/g, '').trim()
    console.log(title)
    let amrap;
    try {
        amrap = await driver.findElement(By.xpath("//a[text()='AMRAP']")).getAttribute('href')
    } catch (e) {
        console.log(e.message)
    }
    await driver.findElement(By.css('#wp-admin-bar-edit a')).click();
    await driver.wait(until.titleContains('Edit Page'))
    let we = await driver.findElement(By.id("post-title-0"));
    await we.click()
    await driver.actions().keyDown(Key.CONTROL).sendKeys("aa").keyUp(Key.CONTROL).sendKeys(Key.BACK_SPACE).perform()
    await waitFor(200)

    await addBlock("Heading")
    await driver.actions().sendKeys("About " + origtitle).perform()
    await addBlock("AMRAP Show Description")
    await clickEdit()
    let select = await driver.wait(until.elementLocated(By.xpath('//div[@data-title="AMRAP Show Description"]//select')));
    try {
        await selectByVisibleText(select, title)
    } catch (e) {
        console.log(e.message)
    }
    await addBlock("Heading")
    await driver.actions().sendKeys("Listen to Latest Episodes").perform()
    await addBlock("On Demand Audio")
    await clickEdit()
    select = await driver.wait(until.elementLocated(By.xpath('//div[@data-title="On Demand Audio"]//select')));
    try {
        await selectByVisibleText(select, title)
    } catch (e) {
        console.log(e.message)
    }
    await driver.wait(until.elementLocated(By.xpath('//div[@data-title="On Demand Audio"]//div[@data-name="max_age"]//input'))).sendKeys("30")
    await driver.wait(until.elementLocated(By.xpath('//div[@data-title="On Demand Audio"]//div[@data-name="max_count"]//input'))).sendKeys("10")
    await addBlock("Playlist")
    await clickEdit()
    select = await driver.wait(until.elementLocated(By.xpath('//div[@data-title="Playlist"]//select')));
    try {
        await selectByVisibleText(select, title)
    } catch (e) {
        console.log(e.message)
    }

    await driver.wait(until.elementLocated(By.xpath('//div[@data-title="Playlist"]//div[@data-name="max_age"]//input'))).sendKeys("30")
    await driver.wait(until.elementLocated(By.xpath('//div[@data-title="Playlist"]//div[@data-name="max_count"]//input'))).sendKeys("10")
    if (amrap) {
        await addBlock("Paragraph")
        await driver.actions().sendKeys("AMRAP").keyDown(Key.CONTROL).sendKeys("ak").keyUp(Key.CONTROL).sendKeys(amrap).sendKeys(Key.ENTER).perform()
    }
    await driver.findElement(By.xpath("//button[text()='Update']")).click()
//    await driver.wait(until.elementLocated(By.xpath("//*[text()='Updating']")))
    await waitFor(1000)
    await driver.wait(until.elementLocated(By.xpath("//button[text()='Update']")))
    //await waitFor(7000)

}

async function doStuff() {
    await driver.manage().setTimeouts({implicit: 5000});
    await driver.get('https://www-2xxfm-org-au.mediarealm.dev/wp-admin/');
    await driver.findElement(By.id('user_login')).sendKeys(process.argv[0]);
    await driver.findElement(By.id('user_pass')).sendKeys(process.argv[1]);
    await driver.findElement(By.id('wp-submit')).click();
    await driver.get('https://www-2xxfm-org-au.mediarealm.dev/shows/');
    let shows = await driver.findElements(By.css('div.card a'))
    let attrs = await Promise.all(shows.map(async s => [await s.findElement(By.tagName('h1')).getText(), await s.getAttribute('href')]))
    let j = 2
    for (let a of attrs.slice(j)) {
        if (a[0].toLowerCase().startsWith("m"))
            break;
        console.log(j++, a[0], a[1])
        await editShow(a[1])
    }
}

async function run() {

    var chromeCapabilities = Capabilities.chrome();
//setting chrome options to start the browser fully maximized
    var chromeOptions = {
        'args': ['user-data-dir=c:\\users\\thepi\\IdeaProjects\\scraper\\profile', '--start-maximized']
    };
    chromeCapabilities.set('goog:chromeOptions', chromeOptions);
    driver = await new Builder().forBrowser('chrome').withCapabilities(chromeCapabilities).build();
    try {
        await doStuff();
    } finally {
        //      await driver.quit();
    }
}

run().catch(e => console.log(e))
