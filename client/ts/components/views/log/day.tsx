import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Dropdown, Glyphicon, MenuItem} from "react-bootstrap";
import {Actions} from "../../../state/actions";
import {StrengthAchievements} from "./strength";
import {WeightMeasurements} from "./weight";
import {CalorieIntakes} from './intake';
import {EnduranceAchievements} from "./endurance";
import {BodyfatMeasurements} from "./bodyfat";
import {GirthMeasurements} from "./girth";
import {Goals} from './goal';
import {CalorieExpenditures} from "./expenditure";
import {TrainingPeriod} from "./trainingperiod";
import {DietPeriod} from './dietperiod';
import {Workouts} from './workout';
import {compareDates} from "../../../common";

const dayHasEntry = day => {
    return day.diet || day.training || day.weight.length || day.strength.length || day.endurance.length ||
        day.intake.length || day.expenditure.length || day.bodyfat.length || day.girth.length || day.goal.length;
};

const DayBody = props => {
    let {day, dispatch, view, user} = props;
    return (
        <div className="calendar-day-body">
            {!dayHasEntry(day) &&
            <div className="add-item-instruction">
                Click the <Glyphicon glyph="plus"/> button above to add an entry to this day.
            </div>}
            {day.diet &&
            <DietPeriod period={day.diet} day={day} view={view} user={user} dispatch={props.dispatch}/>}
            {day.training &&
            <TrainingPeriod period={day.training} view={view} dispatch={props.dispatch}/>}
            {day.weight.length > 0 &&
            <WeightMeasurements items={day.weight} view={view} dispatch={dispatch} user={user}/>}
            {day.workouts.length > 0 && <Workouts period={day.training} view={view} items={day.workouts}
                                                  dispatch={dispatch}/>}
            {day.goal.length > 0 && <Goals items={day.goal} view={view} dispatch={dispatch}/>}
            {day.strength.length > 0 &&
            <StrengthAchievements items={day.strength} view={view} dispatch={dispatch} user={user}/>}
            {day.endurance.length > 0 &&
            <EnduranceAchievements items={day.endurance} view={view} dispatch={dispatch} user={user}/>}
            {day.bodyfat.length > 0 &&
            <BodyfatMeasurements items={day.bodyfat} view={view} dispatch={dispatch} user={user}/>}
            {day.girth.length > 0 &&
            <GirthMeasurements items={day.girth} view={view} dispatch={dispatch} user={user}/>}
            {day.expenditure.length > 0 &&
            <CalorieExpenditures items={day.expenditure} view={view} dispatch={dispatch}/>}
            {day.intake.length > 0 && <CalorieIntakes items={day.intake} view={view} dispatch={dispatch}/>}
        </div>
    );
};


const DayHeader = (props) => {
    return (
        <div className="calendar-day-header">
            <span className="calendar-day-header-date">
                {props.day.date.format('dddd')}, {props.day.date.format('M/D')}
            </span>
            <span className="calendar-day-header-menu"><DayMenu {...props}/></span>
        </div>
    );
};

class DropdownToggle extends React.Component<any, any> {
    onClick(e) {
        e.preventDefault();
        if (this.props.onClick) this.props.onClick(e);
    }

    render() {
        return (
            <button className="btn btn-default add-button" onClick={e => this.onClick(e)}>
                <Glyphicon glyph="plus"/>
            </button>
        );
    }
}

class DayMenu extends React.Component<any, any> {

    constructor() {
        super();
        this.state = {dropup: false};
    }

    render() {
        let dispatch = this.props.dispatch,
            strength = () => dispatch(Actions.modal.achievement.strength()),
            endurance = () => dispatch(Actions.modal.achievement.endurance()),
            weight = () => dispatch(Actions.modal.measurement.weight()),
            bodyfat = () => dispatch(Actions.modal.measurement.bodyfat()),
            girth = () => dispatch(Actions.modal.measurement.girth()),
            intake = () => dispatch(Actions.modal.calorie.intake()),
            expenditure = () => dispatch(Actions.modal.calorie.expenditure()),
            diet = () => dispatch(Actions.modal.period.diet()),
            training = () => dispatch(Actions.modal.period.training()),
            goal = () => dispatch(Actions.modal.goal()),
            setDropUp = () => {
                let c = ReactDOM.findDOMNode(this),
                    rect = c.getBoundingClientRect(),
                    dropup = window.innerHeight - rect.bottom < 450;
                if (dropup != this.state.dropup) this.setState({dropup});
            };
        return (
            <div ref={setDropUp} id="calendar-day-dropdown" className="calendar-day-dropdown">
                <Dropdown dropup={this.state.dropup} pullRight id="calendar-day-menu-dropdown-button">
                    <DropdownToggle {...this.props} bsRole="toggle"/>
                    <Dropdown.Menu>
                        <MenuItem header>Achievements</MenuItem>
                        <MenuItem eventKey="1" onClick={strength}>Strength</MenuItem>
                        <MenuItem eventKey="2" onClick={endurance}>Endurance</MenuItem>
                        <MenuItem divider/>
                        <MenuItem header>Calories</MenuItem>
                        <MenuItem eventKey="3" onClick={intake}>Food</MenuItem>
                        <MenuItem eventKey="4" onClick={expenditure}>Exercise</MenuItem>
                        <MenuItem divider/>
                        <MenuItem header>Measurements</MenuItem>
                        <MenuItem eventKey="5" onClick={weight}>Weight</MenuItem>
                        <MenuItem eventKey="6" onClick={bodyfat}>Bodyfat</MenuItem>
                        <MenuItem eventKey="7" onClick={girth}>Girth</MenuItem>
                        <MenuItem divider/>
                        <MenuItem header>Periods</MenuItem>
                        <MenuItem eventKey="8" onClick={diet}>Diet</MenuItem>
                        <MenuItem eventKey="9" onClick={training}>Training</MenuItem>
                        <MenuItem divider/>
                        <MenuItem eventKey="10" onClick={goal}>Goal</MenuItem>
                    </Dropdown.Menu>
                </Dropdown>
            </div>
        );
    }
}

export const Day = props => {
    let {day, dispatch, view, selected, user, stub = false} = props,
        classNames = ["calendar-day"],
        selectDate = () => dispatch(Actions.date.select(day.date)),
        dayComponent = <DayBody dispatch={dispatch} day={day} view={view} user={user}/>;
    if (selected && compareDates(day.date, selected) == 0) {
        classNames.push("calendar-day-selected");
        dayComponent = <DayBody dispatch={dispatch} selected={selected} day={day} view={view} user={user}/>;
    }

    if (stub) classNames.push("calendar-day-stub");
    return (
        <div className={classNames.join(" ")} onClick={selectDate}>
            <DayHeader {...props}/>
            {dayComponent}
        </div>
    );
};