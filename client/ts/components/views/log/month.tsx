import * as React from 'react';
import {Moment} from 'moment';
import {ICalendarMonth, ICalendarProps, newCalendarDay} from "./common";
import {Day} from './day';
import {compareDates, xdate} from "../../../common";


const firstDay = (m: ICalendarMonth): Moment | null => {
    let dayLabel = Object.keys(m.days).sort()[0];
    if (dayLabel) return m.days[dayLabel].date.clone().date(1);
    else return;
};

export const Month = ({selected, month, dispatch, user}: ICalendarProps) => {
    let first = firstDay(month) || selected.clone().date(1) || xdate().date(1),
        date = first.clone().startOf('isoWeek'),
        days = [];
    while (compareDates(date, first) < 0) {
        let d = date.clone(),
            props = {selected, day: newCalendarDay(d), view: "month", dispatch, key: d.dayOfYear(), user};
        days.push(<Day {...props} stub={true}/>);
        date.add(1, 'day');
    }
    while (date.month() == first.month()) {
        let d = date.clone(),
            day = month.days[d.date()] || newCalendarDay(d),
            props = {selected, day: day, view: "month", dispatch, key: d.dayOfYear(), user};
        days.push(<Day {...props}/>);
        date.add(1, 'day')
    }
    while (date.isoWeekday() != 1) {
        let d = date.clone(),
            props = {selected, day: newCalendarDay(d), view: "month", dispatch, key: d.dayOfYear(), user};
        days.push(<Day {...props} stub={true}/>);
        date.add(1, 'day');
    }
    return (
        <div className="calendar-month">
            {days}
        </div>
    );
};

