import * as React from 'react';
import * as moment from 'moment';
import {distanceTypes, goalTypes} from "../../../models";
import {Link} from "react-router-dom";
import {Actions} from "../../../state/actions";
import {Glyphicon} from "react-bootstrap";
import {CollapsableList} from "./common";

const GoalName = props => {
    let g = props.goal, name = "", url;
    if (g.goal_type_id == 1) {
        name = goalTypes[g.goal_type_id];
        url = `/measurement/weight/${g.user_id}/`;
    }
    else if (g.goal_type_id == 2) {
        name = goalTypes[g.goal_type_id];
        url = `/measurement/bodyfat/${g.user_id}/`;
    }
    else if (g.goal_type_id == 3) {
        name = g.parameters.exercise;
        url = `/achievement/strength/${g.user_id}/${g.parameters.exercise}/`;
    } else if (g.goal_type_id == 4) {
        name = g.parameters.exercise;
        url = `/achievement/endurance/${g.user_id}/${g.parameters.exercise}/`;
    }
    else name = goalTypes[g.goal_type_id];
    return <span><Link to={url}>{name}</Link>:</span>;
};

const GoalTarget = props => {
    let g = props.goal, target = "";
    if (g.goal_type_id == 1) target = `${g.value} Pounds`;
    if (g.goal_type_id == 2) target = `${g.value}%`;
    if (g.goal_type_id == 3) target = `${g.value} × ${g.parameters.repetitions}`;
    if (g.goal_type_id == 4) {
        let t = moment.utc(g.value * 1000),
            distanceUnits = distanceTypes[g.parameters.distance_type_id],
            durationText = t.hours() ? t.format("h:mm:ss") : t.format("m:ss");
        target = `${g.parameters.distance} ${distanceUnits} in ${durationText}`
    }
    return <span>{target}</span>;
};

const GoalComponent = ({goal, dispatch}) => {
    let onClick = () => dispatch(Actions.modal.goal(goal));
    return (
        <div key={goal.id} className="calendar-day-list-item">
            <GoalName goal={goal}/>
            <div className="calendar-day-list-item-right">
                <GoalTarget goal={goal}/>
                <a onClick={onClick}><Glyphicon glyph="edit"/></a>
            </div>
        </div>
    )
};

export class Goals extends CollapsableList {
    constructor(props) {
        super(props);
        this.state = {collapsed: true}
    }

    toComponent(m) {
        return <GoalComponent key={m.id} goal={m} dispatch={this.props.dispatch}/>;
    }

    title = "Goals";
    alwaysDisplayTree = true;
}