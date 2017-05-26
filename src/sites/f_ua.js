const ipc = require('electron').ipcRenderer

class F_UA {
    constructor(idOfHTMLElement) {
        this.link = idOfHTMLElement
        this.onUpdateData = null
        this.init()
    }

    init() {
        document.getElementById(this.link).addEventListener('click', this.$releaseTheBeast.bind(this))
    }

    $releaseTheBeast() {
        console.log('parsing has been started');

        ipc.send('start-parse-f-ua', {})

        ipc.on('f-ua-results', this.onUpdateData)
    }
}



module.exports = F_UA