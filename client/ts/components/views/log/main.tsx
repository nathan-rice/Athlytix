import * as React from 'react';
import {connect} from 'react-redux'
import * as moment from 'moment';
import {Moment} from 'moment';
import {newCalendarDay} from "./common";
import {Month} from "./month";
import {Week} from './week';
import {Banner} from './banner';
import {compareDates, xdate} from "../../../common";
import {Day} from "./day";
import {Grid} from "react-bootstrap";


const connector = connect((s, props: { selected?: Moment }) => {
    s = s.root;
    let today = xdate(),
        futureTimestamp = 4102462800000,
        date = props.selected || s.selected_date || today,
        month = {days: {}, date},
        user = s.users[s.selected_user_id],
        view = s.log.view,
        isSelected = e => {
            return e.date && e.date.month() == date.month() && e.date.year() == date.year()
        },
        filter = (a, f) => {
            let values = user && user[a] && Object.keys(user[a]).map(k => user[a][k]) || [];
            values.filter(isSelected).forEach(v => f(v));
        }, getEndDate = p => {
            if (p.end_date) return p.end_date;
            else if (p.program && p.start_date) {
                let days = Math.max(...p.program.workouts.map(w => w.day)) - 1,
                    d = p.start_date.clone();
                d.add(days, 'day');
                return d;
            }
            else return xdate(futureTimestamp);
        },
        setPeriod = (p, a) => {
            let startDate = xdate(p.start_date || 0),
                endDate = getEndDate(p),
                iDate = xdate(new Date(date.year(), date.month(), 1)),
                d;
            do {
                // Avoids timezone weirdness
                if (compareDates(iDate, startDate) >= 0 && compareDates(iDate, endDate) <= 0) {
                    d = iDate.date();
                    if (!month.days[d]) month.days[d] = newCalendarDay(iDate.clone());
                    month.days[d][a] = p;
                }
            } while (iDate.add(1, 'day').month() == date.month());
        };

    Object.keys(user.diet_periods).map(k => user.diet_periods[k]).forEach(p => setPeriod(p, "diet"));
    Object.keys(user.training_periods).map(k => user.training_periods[k]).forEach(p => setPeriod(p, "training"));

    filter('calorie_intakes', intake => {
        let day = intake.date.date();
        if (!month.days[day]) month.days[day] = newCalendarDay(intake.date);
        month.days[day].intake.push(intake);
    });

    filter('calorie_expenditures', expenditure => {
        let day = expenditure.date.date();
        if (!month.days[day]) month.days[day] = newCalendarDay(expenditure.date);
        month.days[day].expenditure.push(expenditure);
    });

    filter('weight_measurements', weight => {
        let day = weight.date.date();
        if (!month.days[day]) month.days[day] = newCalendarDay(weight.date);
        month.days[day].weight.push(weight);
    });

    filter('bodyfat_measurements', bodyfat => {
        let day = bodyfat.date.date();
        if (!month.days[day]) month.days[day] = newCalendarDay(bodyfat.date);
        month.days[day].bodyfat.push(bodyfat);
    });

    filter('girth_measurements', measurement => {
        let day = measurement.date.date();
        if (!month.days[day]) month.days[day] = newCalendarDay(measurement.date);
        month.days[day].girth.push(measurement);
    });

    filter('strength_achievements', achievement => {
        let day = achievement.date.date();
        if (!month.days[day]) month.days[day] = newCalendarDay(achievement.date);
        month.days[day].strength.push(achievement);
    });

    filter('endurance_achievements', achievement => {
        let day = achievement.date.date();
        if (!month.days[day]) month.days[day] = newCalendarDay(achievement.date);
        month.days[day].endurance.push(achievement);
    });

    filter('goals', goal => {
        let day = goal.date.date();
        if (!month.days[day]) month.days[day] = newCalendarDay(goal.date);
        month.days[day].goal.push(goal);
    });

    Object.keys(month.days).forEach(day => {
        let d = month.days[day];
        if (d.date >= today && d.training && d.training.program) {
            let sd = xdate(d.training.start_date),
                td = xdate(d.date),
                programDay = moment.duration(td.valueOf() - sd.valueOf()).days() + 1,
                workouts = d.training.program.workouts.filter(w => {
                    if (w.day == programDay) {
                        let isWorkout = e => e.workout_id == w.id && d.training.program.id == e.program_id;
                        if (d.expenditure) return d.expenditure.filter(isWorkout).length == 0;
                        else return true;
                    }
                });
            d.workouts = workouts;
        }
    });

    return {month, view, user, selected: date};
});

export const Log = connector((props: any) => {
    let {month, selected, view, dispatch, user} = props, component;
    if (view == "month")
        component = <Month selected={selected} month={month} dispatch={dispatch} view={view} user={user}/>;
    else if (view == "week") {
        let days = Object.keys(month.days).map(k => month.days[k]).filter(d => d.date.week() == selected.week());
        component = <Week selected={selected} days={days} dispatch={dispatch} user={user}/>;
    }
    else if (view == "day") {
        let day = Object.keys(month.days).map(k => month.days[k]).filter(d => d.date.date() == selected.date())[0];
        if (!day) day = newCalendarDay(selected);
        component = <Day day={day} selected={selected} view={view} dispatch={dispatch} user={user}/>
    }
    return (
        <div id="log">
            <Grid fluid>
                <Banner selected={selected} month={month} dispatch={dispatch} view={view}/>
                {component}
            </Grid>
        </div>
    );
});