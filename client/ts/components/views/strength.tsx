import * as React from 'react';
import * as ReactDOM from 'react-dom'
import {connect} from 'react-redux';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {IAppState} from "../../state/root";
import {compareDates, prettyNum} from "../../common";
import {Link} from 'react-router-dom';
import {Grid} from "react-bootstrap";


const connectStrength = connect((s: IAppState, p: any) => {
    let r = s.root,
        params = p.match.params,
        user = r.users[params.user_id],
        a,
        current = {},
        achievements;
    if (user) a = user.strength_achievements;
    else a = [];
    // Only need the last strength achievement
    Object.keys(a).map(k => a[k]).forEach(ach => {
        if (!current[ach.exercise]) current[ach.exercise] = ach;
        else {
            let ca = current[ach.exercise];
            if (compareDates(ca.date, ach.date) < 0) current[ach.exercise] = ach;
        }
    });
    achievements = Object.keys(current).map(k => current[k]);
    return {user, achievements, ...p}
});


const StrengthTable = ({achievements}) => {
    let options = {defaultSortName: 'date', defaultSortOrder: 'desc'};
    let exerciseFormat = (cell, row) => {
        let url = `/achievement/strength/${row.user_id}/${row.exercise}/`;
        return <Link to={url}>{cell}</Link>;
    };
    return (
        <BootstrapTable striped hover condensed bordered={false} options={options} data={achievements}>
            <TableHeaderColumn dataField="id" isKey hidden>Id</TableHeaderColumn>
            <TableHeaderColumn dataField="exercise" dataFormat={exerciseFormat} dataSort>
                Exercise
            </TableHeaderColumn>
            <TableHeaderColumn dataField="date" dataSort dataFormat={c => c.format("MM/DD/YYYY")}>
                Date
            </TableHeaderColumn>
            <TableHeaderColumn dataField="weight" dataSort>Weight</TableHeaderColumn>
            <TableHeaderColumn dataField="repetitions" dataSort>Repetitions</TableHeaderColumn>
            <TableHeaderColumn dataField="predicted_1rm" dataSort dataFormat={prettyNum}>
                Predicted 1RM
            </TableHeaderColumn>
        </BootstrapTable>
    )
};

const Strength_ = ({achievements}) => {
    return (
        <Grid fluid>
            <StrengthTable achievements={achievements}/>
        </Grid>
    )
};

export const Strength = connectStrength(Strength_);