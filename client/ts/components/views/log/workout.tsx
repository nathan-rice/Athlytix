import * as React from 'react';
import {Link} from "react-router-dom";
import {Glyphicon} from "react-bootstrap";
import {CollapsableList} from './common';

export class Workouts extends CollapsableList {

    toComponent(w) {
        return <Workout key={w.id} period={this.props.period} workout={w}/>;
    }

    title = "Workouts";
}

const Workout = ({period, workout}) => {
    let workoutUrl = `/workout/${period.id}/${workout.id}/`,
        programUrl = `/program/${period.program.id}/`;
    return (
        <div className="calendar-day-list-item">
            <span><Link to={workoutUrl}>{workout.name}</Link></span>
            <div className="calendar-day-list-item-right">
                <Link to={programUrl}><Glyphicon glyph="edit"/></Link>
            </div>
        </div>
    );
};