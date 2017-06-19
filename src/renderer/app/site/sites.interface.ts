import {IFUa} from '../f_ua/f_ua.interface';

export interface ISites {
    fUa?: IFUa
}

export interface ISiteOptions {
    data: IFUa[]
    parsed: boolean | string
    site: string
}