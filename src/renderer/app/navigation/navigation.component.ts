import { Component, Output, EventEmitter, Input } from '@angular/core'
import { ISitesLinks } from './sites.links.interface'
import { ISiteOptions } from '../site/sites.interface'
import { navigationLinks } from '../../config/navigation.menu'
import * as _ from 'lodash'

@Component({
    selector: 'navigation',
    templateUrl: './navigation.partial.html'
})

export class NavigationComponent {
    @Output() currentSite = new EventEmitter<ISitesLinks>()
    @Input('siteOptions') siteOptions: ISiteOptions

    public sitesToParse: ISitesLinks[] = navigationLinks
    public loading: boolean

    constructor() {

    }

    ngDoCheck() {

        _.each(_.keys(this.siteOptions), (siteName: string) => {
            _.each(this.sitesToParse, (siteObj: ISitesLinks, index: number) => {
                if (siteName === siteObj.name) {
                    console.log('this.siteOptions[siteName]: ', this.siteOptions[siteName]);
                    this.sitesToParse[index].parsed = this.siteOptions[siteName].parsed
                }
            })
        })

        console.log('after', this.sitesToParse[0])

    }

    setSite(siteName: ISitesLinks): void {
        siteName.parsed = 'loading'
        this.currentSite.emit(siteName)
    }
}
