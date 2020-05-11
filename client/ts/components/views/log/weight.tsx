import * as React from 'react';
import {Actions} from "../../../state/actions";
import {Link} from "react-router-dom";
import {Glyphicon} from "react-bootstrap";


export const WeightMeasurements = ({items, view, dispatch, user}) => {
    let last = items[items.length - 1],
        onClick = () => dispatch(Actions.modal.measurement.weight(last)),
        url = `/measurement/weight/${last.user_id}/`;
    return (
        <div className="calendar-day-list-item">
            <span><Link to={url}>Weight</Link>:</span>
            <div className="calendar-day-list-item-right">
                <span>{last.value}</span> pounds
                <a onClick={onClick}><Glyphicon glyph="edit"/></a>
            </div>
        </div>
    );
};