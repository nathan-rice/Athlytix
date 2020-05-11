import * as React from 'react';
import {CollapsableList} from "./common";
import {Actions} from '../../../state/actions';
import * as moment from 'moment';
import {distanceTypes, unitsInFeet} from "../../../models";
import {Link} from "react-router-dom";
import {Glyphicon} from "react-bootstrap";

const Endurance = ({achievement, dispatch}) => {
    let subtype, performance, distanceFeet,
        t = moment.utc(achievement.time * 1000),
        distanceUnits = distanceTypes[achievement.distance_type_id],
        durationText = t.hours() ? t.format("h:mm:ss") : t.format("m:ss"),
        url = `/achievement/endurance/${achievement.user_id}/${achievement.exercise}/`,
        onClick = () => dispatch(Actions.modal.achievement.endurance(achievement));
    if (achievement.fixed == "distance") {
        subtype = ` (${achievement.distance} ${distanceUnits})`;
        performance = durationText;
        distanceFeet = achievement.distance * unitsInFeet[achievement.distance_type_id];
        url = url + `distance/${distanceFeet}/`;
    }
    else if (achievement.fixed == "time") {
        subtype = ` (${durationText})`;
        performance = `${achievement.distance} ${distanceUnits}`;
        url = url + `time/${achievement.time}/`
    }
    else {
        performance = `${achievement.distance} ${distanceUnits} in ${durationText}`;

    }
    return (
        <div className="calendar-day-list-item">
            <span><Link to={url}>{achievement.exercise}{subtype}</Link>:</span>
            <div className="calendar-day-list-item-right">
                <span>{performance}</span>
                <a onClick={onClick}><Glyphicon glyph="edit"/></a>
            </div>
        </div>
    );
};

export class EnduranceAchievements extends CollapsableList {

    toComponent(a) {
        return <Endurance key={a.id} achievement={a} dispatch={this.props.dispatch}/>;
    }

    title = "Endurance Achievements";
}