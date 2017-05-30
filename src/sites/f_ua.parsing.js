let Nightmare = require('nightmare')
let vo = require('vo')
let fs = require('fs-extra')
let nightmare = Nightmare({
    electronPath: require('../../node_modules/electron')
})
let json2xls = require('json2xls');

class Parser {
    constructor(ipc, app) {
        this.ipc = ipc
        this.app = app
        this.link = 'https://f.ua/shop/dlya-avtomobilya/'
        this.items = []
        this.filesDir = `${this.app.getPath('appData')}/scrabber/`;
        this.event = null;
        this.init()
    }

    init() {
        this.ipc.on('start-parse-f-ua', (event, arg) => {
            this.event = event.sender;
            this.returnJsonData().then((data) => {
                // console.log('using locally data', data)
                event.sender.send('f-ua-results', data)
            }).catch(err => {
                console.log('err: ', err);
                if (err.action) {
                    console.log('Starting parsing');
                    this.goThroughtCateogories().then(() => {
                        // console.log('parsing has been ended')
                        event.sender.send('f-ua-results', this.items)
                    }).catch(console.error)
                }
            })

        })

        this.ipc.on('export-to-excel', (event, arg) => {
            this.returnJsonData().then((jsonFile) => {
                const file = this.filesDir + 'f_ua.xlsx'
                const xls = json2xls(jsonFile)
                fs.writeFileSync(file, xls, 'binary')
                console.log('jsonFile: ', jsonFile);
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

        return Promise.reject({ action: true })
    }

    getCategoriesData(urls) {

        console.log('urls: ', urls);

        return urls.reduce((accumulator, url) => {
            return accumulator.then((results) => {
                return nightmare.goto(url.href)
                    .wait('body')
                    .evaluate((category) => {
                        let elementInfo = [];
                        let container = document.querySelectorAll('.wrapper .container')

                        container.forEach((item) => {
                            let titleInfo = { name: null, href: null };
                            let priceInfo = null;

                            titleInfo.name = item.querySelector('.title a').innerHTML
                            titleInfo.href = item.querySelector('.title a').href

                            let prices = item.querySelectorAll('.price div')

                            if (prices.length) {
                                prices.forEach((price) => {
                                    if (getComputedStyle(price).getPropertyValue('display') === 'block') {
                                        let elem = price.querySelector('span').firstChild.nodeValue
                                        let value = price.querySelector('span span').innerHTML.replace('&nbsp;', '')
                                        priceInfo = elem + ' ' + value
                                    }
                                })
                            } 

                            if (item.querySelector('.price_block_container.no_product')) {
                                priceInfo = 'Нет в наличии'
                            }

                            elementInfo.push({
                                title: titleInfo,
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
            console.log('Files has been written to ' + this.filesDir)
        })
    }

    getCategoriesLinks() {
        const file = this.filesDir + 'categories.json';

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