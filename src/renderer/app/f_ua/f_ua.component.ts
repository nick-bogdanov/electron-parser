import { SiteCommon } from './../site/site.class'
import { ISiteOptions } from './../site/sites.interface'
import { Component, Input, Output, EventEmitter, NgZone } from '@angular/core'
import { ipcRenderer } from 'electron'
import { IFUa } from './f_ua.interface'
import * as _ from 'lodash'

@Component({
    selector: 'f-ua',
    templateUrl: './f_ua.partial.html'
})

export class fUAComponent extends SiteCommon {
    @Input('loadedData') loadedData: IFUa[]
    @Output() componentData = new EventEmitter<ISiteOptions>()
    public renderedData: IFUa[] = []

    constructor(private ngZone: NgZone) {
        super()
    }

    onUpdateData(data, args) {
        console.log('data');
        this.ngZone.run(() => {
            this.renderedData = _.flatten(args)
            this.updateSiteSetting(true)
        })
    }

    onSingleDataUpdated(event, args) {
        console.log('chunk');
        this.ngZone.run(() => {
            this.renderedData.push(args)
            this.renderedData = _.flatten(this.renderedData)
            this.updateSiteSetting(false)
        })
    }

    ngOnInit() {

        if (!this.loadedData) {
            this.$releaseTheBeast()
        } else {
            this.renderedData = this.loadedData
        }

    }

    $releaseTheBeast() {
        ipcRenderer.send('start-parse-f-ua', {})

        ipcRenderer.on('f-ua-results', this.onUpdateData.bind(this))
        ipcRenderer.on('single-product', this.onSingleDataUpdated.bind(this))
    }

    ngOnDestroy() {
        console.log('destroy')
    }

    updateSiteSetting(parsed: boolean) {
        this.componentData.emit({
            site: 'fUa',
            data: this.renderedData,
            parsed
        })
    }
}
