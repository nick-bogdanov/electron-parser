const ipc = require('electron').ipcRenderer

class F_UA {
    constructor() {
        this.onUpdateData = null
        this.onSingleDataUpdated = null
    }

    $releaseTheBeast() {
        console.log('parsing has been started')

        ipc.send('start-parse-f-ua', {})

        ipc.on('f-ua-results', this.onUpdateData)
        ipc.on('single-product', this.onSingleDataUpdated)
    }

    export() {
         ipc.send('export-to-excel', {})
    }
}



module.exports = F_UA