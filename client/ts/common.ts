import * as moment from 'moment';
import {Moment} from 'moment';

export const prettyNum = (v, p = 1) => {
    let m = Math.pow(10, p) || 10;
    return Math.round(v * m) / m;
};

export const integer = (v: number | string) => {
    if (typeof v == "string") return parseInt(v) || null;
    else return v;
};

export const xdate = (v?: any) => {
    if (v == null || !v.year && !v.month && !v.date) v = v != null ? moment.utc(v) : moment();
    return moment([v.year(), v.month(), v.date()]);
};

export const compareDates = (a: Moment, b: Moment) => {
    if (a.year() < b.year()) return -1;
    else if (a.year() > b.year()) return 1;
    else if (a.dayOfYear() < b.dayOfYear()) return -1;
    else if (a.dayOfYear() > b.dayOfYear()) return 1;
    else return 0;
};

export const shallowEquality = (o1, o2) => {
    let k1 = Object.keys(o1).sort(),
        k2 = Object.keys(o2).sort(),
        v1 = k1.map(k => o1[k]),
        v2 = k2.map(k => o2[k]),
        same = (l, r) => l.length == r.length && l.every((e, i) => e == r[i]);
    return same(k1, k2) && same(v1, v2);
};

export const appendLocationToUrl = (url, u: {city?: string, state?: string, country?: string}) => {
    if (u.country) {
        url += `${u.country}/`;
        if (u.state) {
            url += `${u.state}/`;
            if (u.city) url += `${u.city}`;
        }
    }
    return url;
};