import * as React from 'react';
import {Actions} from "../../../state/actions";
import {Link} from "react-router-dom";
import {Glyphicon} from "react-bootstrap";
import {CollapsableList} from "./common";

const Expenditure = ({expenditure, dispatch}) => {
    let url = `/calorie_expenditure/${expenditure.user_id}/`,
        onClick = () => dispatch(Actions.modal.calorie.expenditure(expenditure));
    return (
        <div key={expenditure.id} className="calendar-day-list-item">
            <span>{expenditure.name}{expenditure.value && ":"}</span>
            <div className="calendar-day-list-item-right">
                {expenditure.value && <span>{expenditure.value} cal</span>}
                <a onClick={onClick}><Glyphicon glyph="edit"/></a>
            </div>
        </div>
    )
};

export class CalorieExpenditures extends CollapsableList {

    toComponent(m) {
        return <Expenditure key={m.id} expenditure={m} dispatch={this.props.dispatch}/>;
    }

    title = "Exercise Performed";
}