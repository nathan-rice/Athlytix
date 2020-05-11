import * as React from 'react';
import {Actions} from "../../../state/actions";
import {Link} from "react-router-dom";
import {Glyphicon} from "react-bootstrap";
import * as TreeView from 'react-treeview';
import {CollapsableList} from './common';

export class StrengthAchievements extends CollapsableList {

    toComponent(a) {
        if (this.props.view == "day") {
            let sa = this.props.user.strength_achievements,
                achievements = Object.keys(sa).map(k => sa[k]),
                prior = achievements.filter(e => e.date.valueOf() <= a.date.valueOf() && e.exercise == a.exercise),
                x = prior.map(e => e.date.toDate()),
                y = prior.map(e => e.predicted_1rm)

        }
        else return <Strength key={a.id} achievement={a} dispatch={this.props.dispatch}/>;
    }

    title = "Strength Achievements";
}

const Strength = ({achievement, dispatch}) => {
    let onClick = () => dispatch(Actions.modal.achievement.strength(achievement)),
        {user_id, exercise} = achievement,
        url = `/achievement/strength/${user_id}/${exercise}/`;
    return (
        <div className="calendar-day-list-item">
            <span><Link to={url}>{achievement.exercise}</Link>:</span>
            <div className="calendar-day-list-item-right">
                <span>{achievement.weight}</span>
                ×
                <span>{achievement.repetitions}</span>
                <a onClick={onClick}><Glyphicon glyph="edit"/></a>
            </div>
        </div>
    );
};

