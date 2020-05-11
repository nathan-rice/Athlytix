import * as React from 'react';
import {Link} from "react-router-dom";
import {Actions} from "../../../state/actions";
import {Col, Glyphicon, ProgressBar, Row} from "react-bootstrap";
import {compareDates, prettyNum} from "../../../common";


export const DietPeriod = ({period, view, dispatch, day, user}) => {
    if (view == "day") {
        return <ExpandedDietPeriod period={period} dispatch={dispatch} user={user} day={day}/>
    }
    else return <MinimalDietPeriod period={period} dispatch={dispatch}/>
};

let barStyle = (v, min) => {
    if (!min || v > min) return "info";
    else return "danger";
};

const NutritionProgress = ({label, min = 0, max = 0, current = 0, units = "g"}) => {
    let progressMax = Math.max(min, max, current),
        firstValue = prettyNum(max > 0 ? Math.min(current, max) : current),
        firstPercent = firstValue / progressMax * 100,
        secondValue = prettyNum(current - max),
        secondPercent = secondValue / progressMax * 100,
        style = barStyle(current, min);
    return (
        <div>
            <Col xs={3}>{label}</Col>
            <Col xs={9}>
                <ProgressBar>
                    <ProgressBar key={1} now={firstPercent} bsStyle={style} label={`${firstValue} ${units}`}/>
                    {max > 0 && secondValue > 0 &&
                    <ProgressBar key={2} bsStyle="danger" now={secondPercent} label={`${secondValue} ${units}`}/>}
                </ProgressBar>
            </Col>
        </div>
    );
};

const ExpandedDietPeriod = ({period, dispatch, day, user}) => {

    let intake, calories, protein, carbohydrates, fiber, fat, hasProgress, dietPeriod,
        caloriesProgress = period.max_calories > 0 || period.min_calories > 0,
        proteinProgress = period.max_protein > 0 || period.min_protein > 0,
        carbohydratesProgress = period.max_carbohydrates > 0 || period.min_carbohydrates > 0,
        fiberProgress = period.max_fiber > 0 || period.min_fiber > 0,
        fatProgress = period.max_fat > 0 || period.min_fat > 0;

    hasProgress = caloriesProgress || proteinProgress || carbohydratesProgress || fiberProgress || fatProgress;

    if (hasProgress) {
        dietPeriod = (
            <div className="page-header-small">
                <MinimalDietPeriod period={period} dispatch={dispatch}/>
            </div>
        );
    } else {
        dietPeriod = <MinimalDietPeriod period={period} dispatch={dispatch}/>;
    }

    if (day.intake.length == 0 && period.example_date) {
        intake = Object.keys(user.calorie_intakes)
            .map(k => user.calorie_intakes[k])
            .filter(i => compareDates(i.date, period.example_date) == 0)
    } else intake = day.intake;

    calories = prettyNum(intake.reduce((s, i) => s + i.value, 0));
    protein = prettyNum(intake.reduce((s, i) => s + i.protein, 0));
    carbohydrates = prettyNum(intake.reduce((s, i) => s + i.carbohydrates, 0));
    fiber = prettyNum(intake.reduce((s, i) => s + i.fiber, 0));
    fat = prettyNum(intake.reduce((s, i) => s + i.fat, 0));

    return (
        <div>
            {dietPeriod}
            {caloriesProgress &&
            <NutritionProgress label="Calories" min={period.min_calories} max={period.max_calories} current={calories}
                               units="cal"/>}
            {proteinProgress &&
            <NutritionProgress label="Protein" min={period.min_protein} max={period.max_protein} current={protein}/>}
            {carbohydratesProgress &&
            <NutritionProgress label="Carbohydrates" min={period.min_carbohydrates} max={period.max_carbohydrates}
                               current={carbohydrates}/>}
            {fiberProgress &&
            <NutritionProgress label="Fiber" min={period.min_fiber} max={period.max_fiber} current={fiber}/>}
            {fatProgress &&
            <NutritionProgress label="Fat" min={period.min_fat} max={period.max_fat} current={fat}/>}
        </div>
    )
};

const MinimalDietPeriod = ({period, dispatch}) => {
    let onClick = () => dispatch(Actions.modal.period.diet(period)),
        url = `/diet/${period.user_id}/`;
    return (
        <div key={period.id} className="calendar-day-list-item">
            <span><Link to={url}>Diet</Link>:</span>
            <div className="calendar-day-list-item-right">
                <span>{period.name}</span>
                <a onClick={onClick}><Glyphicon glyph="edit"/></a>
            </div>
        </div>
    );
};