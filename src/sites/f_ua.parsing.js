let Nightmare = require('nightmare')
let fs = require('fs-extra')
let json2xls = require('json2xls')
let _ = require('lodash')
let electron = require('electron')
let dialog = electron.dialog
const BrowserWindow = electron.BrowserWindow;


class Parser {
    constructor(ipc, app, createWindow) {
        this.ipc = ipc
        this.app = app
        this.link = 'https://f.ua/shop/dlya-avtomobilya/'
        this.items = []
        this.filesDir = `${this.app.getPath('appData')}/scrabber/`;
        this.event = null;
        this.createWindow = createWindow
        this.init()
    }

    init() {
        this.ipc.on('start-parse-f-ua', (event, arg) => {
            this.event = event.sender;
            this.returnJsonData().then((data) => {
                console.log('using locally data', data)
                event.sender.send('f-ua-results', data)
            }).catch(err => {
                console.log('err: ', err);
                if (err.action) {
                    console.log('Starting parsing');
                    this.goThroughtCateogories().then(() => {
                        console.log('parsing has been ended')
                        event.sender.send('f-ua-results', this.items)
                    }).catch(console.error)
                }
            })

        })

        this.ipc.on('export-to-excel', (event, arg) => {
            let mainWindow = new BrowserWindow();
            const file = `${this.app.getPath('documents')}/f_ua.xlsx`

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
            console.log('Using results data json file instead of parsing');
            return fs.readFile(file, 'utf-8').then(file => JSON.parse(file)).catch(console.error)
        }

        return Promise.reject({
            action: true
        })
    }

    getCategoriesData(urls) {
        let nightmare = Nightmare({
            electronPath: require('../../node_modules/electron')
        })

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
                        console.log('single result', result)
                        this.event.send('single-product', result)
                        this.items.push(result)
                    }).catch((err) => {
                        console.log('error while parsing product: ', err);
                    });
            });
        }, Promise.resolve([])).then(this.writeResult.bind(this)).catch(console.log)
    }

    writeResult() {
        fs.writeJson(this.filesDir + 'f_ua.json', this.items, err => {
            if (err) throw err
            console.log('Files has been written to ' + this.filesDir)
        })
    }

    saveCategoryLinks(data) {
        fs.writeJson(this.filesDir + 'categories.json', data, err => {
            if (err) throw err
            console.log('Category Files has been written to ' + this.filesDir)
        })
    }

    getCategoriesLinks() {
        const file = this.filesDir + 'categories.json';
        let nightmare = Nightmare({
            electronPath: require('../../node_modules/electron')
        })

        if (fs.existsSync(file)) {
            console.log('Using lcoally categories json file instead of parsing');
            return fs.readFile(file, 'utf-8').then(file => JSON.parse(file)).catch(console.error)
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
        }).catch(console.error)

    }

}

module.exports = Parser