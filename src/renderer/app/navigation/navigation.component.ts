import { Component } from '@angular/core';
import { ISitesLinks } from './sites.links.interface';
import { navigationLinks } from '../../config/navigation.menu'

@Component({
    selector: 'navigation',
    templateUrl: './navigation.partial.html'
})

export class NavigationComponent {
    public sitesToParse: ISitesLinks[] = navigationLinks;
    public loading: boolean;
}
