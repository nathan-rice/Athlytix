import * as React from 'react';
import {CollapsableList} from "./common";
import {Actions} from "../../../state/actions";
import {Link} from "react-router-dom";
import {Glyphicon} from "react-bootstrap";

const Girth = ({measurement, dispatch}) => {
    let url = `/measurement/girth/${measurement.user_id}/${measurement.location}/`,
        onClick = () => dispatch(Actions.modal.measurement.girth(measurement));
    return (
        <div key={measurement.id} className="calendar-day-list-item">
            <span><Link to={url}>{measurement.location}</Link>:</span>
            <div className="calendar-day-list-item-right">
                <span>{measurement.value}</span>"
                <a onClick={onClick}><Glyphicon glyph="edit"/></a>
            </div>
        </div>
    )
};

export class GirthMeasurements extends CollapsableList {

    toComponent(m) {
        return <Girth key={m.id} measurement={m} dispatch={this.props.dispatch}/>;
    }

    title = "Girth Measurements";
}