import * as React from 'react';
import {Glyphicon} from "react-bootstrap";
import {bodyfatMeasurementTypes} from "../../../models";
import {Link} from "react-router-dom";
import {Actions} from "../../../state/actions";
import {CollapsableList} from "./common";
import {prettyNum} from "../../../common";

export class BodyfatMeasurements extends CollapsableList {

    toComponent(m) {
        return <Bodyfat key={m.id} measurement={m} dispatch={this.props.dispatch}/>;
    }

    title = "Bodyfat Measurements"
}

const Bodyfat = ({measurement, dispatch}) => {
    let url = `/measurement/bodyfat/${measurement.user_id}/`,
        onClick = () => dispatch(Actions.modal.measurement.bodyfat(measurement));
    return (
        <div className="calendar-day-list-item">
            <span><Link to={url}>Bodyfat ({bodyfatMeasurementTypes[measurement.measurement_type_id]})</Link>:</span>
            <div className="calendar-day-list-item-right">
                <span>{prettyNum(measurement.value)}</span>%
                <a onClick={onClick}><Glyphicon glyph="edit"/></a>
            </div>
        </div>
    )
};