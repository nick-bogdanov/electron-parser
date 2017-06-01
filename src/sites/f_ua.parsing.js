let Nightmare = require('../../nightmare')
let fs = require('fs-extra')
let json2xls = require('json2xls')
let _ = require('lodash')
let { electron, dialog, BrowserWindow, app } = require('electron')
let log = require('electron-log')

let filesDir = `${app.getPath('documents')}/scrabber/`

log.transports.file.level = 'info';
log.transports.file.format = '{h}:{i}:{s}:{ms} {text}';

// Set approximate maximum log size in bytes. When it exceeds, 
// the archived log will be saved as the log.old.log file 
log.transports.file.maxSize = 5 * 1024 * 1024

// Write to this file, must be set before first logging 
log.transports.file.file = filesDir + '/log.txt'

// fs.createWriteStream options, must be set before first logging 
log.transports.file.streamConfig = { flags: 'w' }

// set existed file stream 
log.transports.file.stream = fs.createWriteStream(filesDir + '/log.txt')

class Parser {
    constructor(ipc, createWindow) {
        this.ipc = ipc
        this.link = 'https://f.ua/shop/dlya-avtomobilya/'
        this.items = []
        this.filesDir = filesDir;
        this.event = null;
        this.createWindow = createWindow
        this.init()
    }

    init() {
        this.ipc.on('start-parse-f-ua', (event, arg) => {
            this.event = event.sender;
            this.returnJsonData().then((data) => {
                log.info('using locally data', data)
                event.sender.send('f-ua-results', data)
            }).catch(err => {
                log.info('err: ', err);
                if (err.action) {
                    log.info('Starting parsing');
                    this.goThroughtCateogories().then(() => {
                        log.info('parsing has been ended')
                        event.sender.send('f-ua-results', this.items)
                    }).catch(log.info)
                }
            })

        })

        this.ipc.on('export-to-excel', (event, arg) => {
            let mainWindow = new BrowserWindow();
            const file = `${app.getPath('documents')}/f_ua.xlsx`

            const saveFile = content => {
                var fileName = dialog.showSaveDialog(mainWindow, {
                    title: 'Save to Excel',
                    defaultPath: file
                });

                if (!fileName) {
                    return;
                }

                fs.writeFileSync(fileName, content, 'binary')
                mainWindow.close()

            };

            this.returnJsonData().then((jsonFile) => {
                const jsonData = _.flatten(jsonFile)

                jsonData.forEach((elem) => {
                    delete elem.priceNumber
                })

                const xls = json2xls(_.flatten(jsonData))
                saveFile(xls)
                // this.createWindow()
            })
        })

    }

    goThroughtCateogories() {
        return this.getCategoriesLinks().then(this.getCategoriesData.bind(this))
    }

    returnJsonData() {
        const file = this.filesDir + 'f_ua.json'

        if (fs.existsSync(file)) {
            log.info('Using results data json file instead of parsing');
            return fs.readFile(file, 'utf-8').then(file => JSON.parse(file)).catch(log.info)
        }

        return Promise.reject({
            action: true
        })
    }

    getCategoriesData(urls) {
        let nightmare = Nightmare()

        return urls.reduce((accumulator, url) => {
            return accumulator.then((results) => {
                return nightmare.goto(url.href)
                    .wait('body')
                    .evaluate((category) => {
                        let elementInfo = [];
                        let container = document.querySelectorAll('.wrapper .container')

                        container.forEach((item) => {
                            let name = null
                            let href = null
                            let priceInfo = null
                            let priceNumber = null

                            name = item.querySelector('.title a').innerHTML
                            href = item.querySelector('.title a').href

                            let prices = item.querySelectorAll('.price div')

                            if (prices.length) {
                                prices.forEach((price) => {
                                    if (getComputedStyle(price).getPropertyValue('display') === 'block') {
                                        priceNumber = price.querySelector('span').firstChild.nodeValue
                                        priceNumber = priceNumber.replace(/\s/, '')
                                        let value = price.querySelector('span span').innerHTML.replace('&nbsp;', '')
                                        priceInfo = priceNumber + ' ' + value
                                    }
                                })
                            }

                            if (item.querySelector('.sticker.saled')) {
                                priceInfo = 'Нет в наличии'
                            }

                            if (!priceInfo) {
                                priceInfo = 'Цена не найдена'
                            }

                            elementInfo.push({
                                name,
                                href,
                                priceNumber,
                                price: priceInfo,
                                category
                            })

                        })

                        return elementInfo
                    }, url.name)
                    .then((result) => {
                        log.info('single result', result)
                        this.event.send('single-product', result)
                        this.items.push(result)
                    }).catch((err) => {
                        log.info('error while parsing product: ', err);
                    });
            });
        }, Promise.resolve([])).then(this.writeResult.bind(this)).catch(log.info)
    }

    writeResult() {
        fs.writeJson(this.filesDir + 'f_ua.json', this.items, err => {
            if (err) throw err
            log.info('Files has been written to ' + this.filesDir)
        })
    }

    saveCategoryLinks(data) {
        fs.writeJson(this.filesDir + 'categories.json', data, err => {
            if (err) throw err
            log.info('Category Files has been written to ' + this.filesDir)
        })
    }

    getCategoriesLinks() {
        const file = this.filesDir + 'categories.json';
        let nightmare = Nightmare()

        if (fs.existsSync(file)) {
            log.info('Using lcoally categories json file instead of parsing');
            return fs.readFile(file, 'utf-8').then(file => JSON.parse(file)).catch(log.info)
        }

        return fs.ensureFile(this.filesDir + 'categories.json').then((data) => {
            return nightmare
                .goto(this.link)
                .evaluate(() => {
                    var cats = [];
                    document.querySelectorAll('.subrubric_list .container .title a').forEach(element => {
                        cats.push({
                            href: element.href,
                            name: element.innerHTML
                        })
                    })
                    return cats
                })
                .end()
                .then((res) => {
                    this.saveCategoryLinks(res)
                    return res
                })
        }).catch(log.info)

    }

}

module.exports = Parser