import {ipcRenderer} from 'electron'

export class F_UA {
    public onUpdateData:any
    public onSingleDataUpdated:any

    constructor() {
        this.onUpdateData = null
        this.onSingleDataUpdated = null
    }

    $releaseTheBeast() {
        console.log('parsing has been started')

        ipcRenderer.send('start-parse-f-ua', {})

        ipcRenderer.on('f-ua-results', this.onUpdateData)
        ipcRenderer.on('single-product', this.onSingleDataUpdated)
    }

    export() {
         ipcRenderer.send('export-to-excel', {})
    }
}
