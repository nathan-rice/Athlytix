import * as React from 'react';
import {Link} from "react-router-dom";
import {Actions} from "../../../state/actions";
import {Glyphicon} from "react-bootstrap";


export const TrainingPeriod = ({period, view, dispatch}) => {
    let onClick = () => dispatch(Actions.modal.period.training(period)),
        name = period.program ? period.program.name : "xxx";
    return (
        <div key={period.id} className="calendar-day-list-item">
            <span>Program:</span>
            <div className="calendar-day-list-item-right">
                <div>{name}</div>
                <a onClick={onClick}><Glyphicon glyph="edit"/></a>
            </div>
        </div>
    );
};