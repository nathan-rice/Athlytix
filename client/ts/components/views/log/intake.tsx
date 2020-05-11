import * as React from 'react';
import {Actions} from "../../../state/actions";
import {Link} from "react-router-dom";
import {Glyphicon} from "react-bootstrap";
import {CollapsableList} from "./common";

const Intake = ({intake, dispatch}) => {
    let url = `/calorie_intake/${intake.user_id}/`,
        onClick = () => dispatch(Actions.modal.calorie.intake(intake));
    return (
        <div key={intake.id} className="calendar-day-list-item">
            <span><Link to={url}>{intake.name}</Link>:</span>
            <div className="calendar-day-list-item-right">
                <span>{intake.value}</span> calories
                <a onClick={onClick}><Glyphicon glyph="edit"/></a>
            </div>
        </div>
    )
};

export class CalorieIntakes extends CollapsableList {
    constructor(props) {
        super(props);
        this.state = {collapsed: true};
    }

    toComponent(m) {
        return <Intake key={m.id} intake={m} dispatch={this.props.dispatch}/>;
    }

    title = "Food Eaten";
}