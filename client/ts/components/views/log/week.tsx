import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {ICalendarDay, ICalendarDayProps, newCalendarDay} from "./common";
import {Day} from './day';


export const Week = ({days, selected, dispatch, user}) => {
    let dayComponent = d => <Day key={d.date.day()} view="week" day={d} selected={selected} dispatch={dispatch}
                                 user={user}/>,
        dayComponents = new Array(7),
        startDay = selected.clone().day(0);
    days.forEach(d => dayComponents[d.date.day()] = dayComponent(d));
    for (let i = 0; i < dayComponents.length; i++) {
        if (!dayComponents[i]) {
            let day = newCalendarDay(startDay.clone().add(i, 'day'));
            dayComponents[i] = dayComponent(day);
        }
    }
    return (
        <div className="calendar-week">
            {dayComponents}
        </div>
    );
};