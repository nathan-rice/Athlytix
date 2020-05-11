import * as React from 'react';
import {connect} from 'react-redux';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {Actions} from '../../../state/actions';
import {EstimatorPlot} from "../../plots/estimator";
import {Col, ControlLabel, Form, Row, Button, Glyphicon, Alert, ButtonGroup, Grid} from "react-bootstrap";
import {Link} from "react-router-dom";
import {GoalRecord} from '../../base-components';
import * as moment from "moment";
import {prettyNum} from "../../../common";
import {IAppState} from "../../../state/root";


const WeightBanner = (props: any) => {
    let u = props.user,
        lossUrl = `/leaderboard/weight_loss/${u.gender}/`,
        gainUrl = `/leaderboard/weight_gain/${u.gender}/`;
    return (
        <div className="banner">
            <Row>
                <Col sm={3}>
                    <div className="bodyfat-banner-leaderboard">
                        <ControlLabel>Weight Loss Leaderboard</ControlLabel>
                        <ul className="list-inline">
                            <li><Link to={lossUrl}>All</Link></li>
                            {u.country &&
                            <li><Link to={lossUrl + `${u.country}/`}>Country</Link></li>}
                            {u.country && u.state &&
                            <li><Link to={lossUrl + `${u.country}/${u.state}/`}>State</Link></li>}
                            {u.country && u.state && u.city &&
                            <li><Link to={lossUrl + `${u.country}/${u.state}/${u.city}/`}>City</Link></li>}
                        </ul>
                    </div>
                </Col>
                <Col sm={3}>
                    <div className="bodyfat-banner-leaderboard">
                        <ControlLabel>Weight Gain Leaderboard</ControlLabel>
                        <ul className="list-inline">
                            <li><Link to={gainUrl}>All</Link></li>
                            {u.country &&
                            <li><Link to={gainUrl + `${u.country}/`}>Country</Link></li>}
                            {u.country && u.state &&
                            <li><Link to={gainUrl + `${u.country}/${u.state}/`}>State</Link></li>}
                            {u.country && u.state && u.city &&
                            <li><Link to={gainUrl + `${u.country}/${u.state}/${u.city}/`}>City</Link></li>}
                        </ul>
                    </div>
                </Col>
            </Row>
        </div>
    );
};


const WeightGoalAlert = ({goal, probability, dispatch}) => {
    let p = prettyNum(probability * 100, 1),
        bsStyle = p >= 75 ? "success" : p < 25 ? "danger" : "warning",
        date = goal.date.format("LL"),
        editGoal = () => dispatch(Actions.modal.goal(goal));
    return (
        <Alert bsStyle={bsStyle}>
            <Glyphicon glyph="exclamation-sign"/>{' '}
            You have a <strong>{p}%</strong> chance to meet your goal weight of <strong>{goal.value}</strong> pounds by
            {' '}{date}.
            <div className="pull-right goal-alert-button">
                <Button onClick={editGoal} bsStyle={bsStyle} bsSize="small"><Glyphicon glyph="edit"/></Button>
            </div>
        </Alert>
    );
};


const connectWeight = connect((s: IAppState, p) => {
    let r = s.root, u = r.users[r.selected_user_id], wm = u.weight_measurements,
        userEstimates = r.estimates.weight[u.id],
        weights = Object.keys(wm).map(k => wm[k]),
        estimates = userEstimates || {means: [], stds: [], days: []},
        options = {defaultSortName: 'date', defaultSortOrder: 'desc'},
        goals = {}, goalEstimates = {};

    Object.keys(u.goals).map(k => u.goals[k]).filter(g => g.goal_type_id == 1).forEach(g => {
        let est = r.estimates.goal[g.id];
        goals[g.id] = g;
        if (est) goalEstimates[g.id] = est;
    });
    return {weights, estimates, goals, goalEstimates, options, user: u, ...p}
});


class Weight_ extends GoalRecord {

    protected attribute = "weights";

    load() {
        let id = Math.max(...this.props.weights.map(w => w.id));
        return this.props.dispatch(Actions.estimate.weight(this.props.user, id));
    }

    addWeight() {
        this.props.dispatch(Actions.modal.measurement.weight({date: moment()}));
    }

    addGoal() {
        this.props.dispatch(Actions.modal.goal({goal_type_id: 1}));
    }

    pictureFormatter(cell) {
        if (cell) return <a href={cell} target="_blank"><Glyphicon glyph="picture"/></a>;
        else return "";
    }

    buttonFormatter(cell, row) {
        let click = e => this.props.dispatch(Actions.modal.measurement.weight(row));
        return <Button bsStyle="link" onClick={click}><Glyphicon glyph="edit"/></Button>
    }

    render() {
        let {weights, estimates} = this.props,
            x = weights.map(e => new Date(e.date.format("YYYY/MM/DD"))),
            y = weights.map(e => e.value),
            g = this.props.goals,
            ge = this.props.goalEstimates,
            alerts = Object.keys(ge).map(k => <WeightGoalAlert key={k} goal={g[k]}
                                                               probability={ge[k]} {...this.props}/>);
        return (
            <Grid fluid>
                <WeightBanner {...this.props}/>
                {estimates.days.length > 0 &&
                <EstimatorPlot name="weight" yLabel="Weight (Pounds)" x={x} y={y} {...this.props}/>}
                {alerts.length > 0 && alerts}
                <Form horizontal>
                    <Col xs={1} componentClass={ControlLabel}>Add:</Col>
                    <Col xs={11}>
                        <ButtonGroup>
                            <Button bsStyle="primary" onClick={() => this.addWeight()}>Weight</Button>
                            <Button bsStyle="primary" onClick={() => this.addGoal()}>Goal</Button>
                        </ButtonGroup>
                    </Col>
                </Form>
                <BootstrapTable striped hover pagination condensed options={this.props.options} bordered={false}
                                data={weights}>
                    <TableHeaderColumn dataField="id" isKey hidden>Id</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataField="date"
                                       dataFormat={d => d.format("MM/DD/YYYY")}>Date</TableHeaderColumn>
                    <TableHeaderColumn dataField="value" dataSort>Weight</TableHeaderColumn>
                    <TableHeaderColumn width="50px" dataField="picture" dataFormat={c => this.pictureFormatter(c)}/>
                    <TableHeaderColumn dataField="button" width="50px"
                                       dataFormat={(c, r) => this.buttonFormatter(c, r)}/>
                </BootstrapTable>
            </Grid>
        );
    }
}

export const Weight = connectWeight(Weight_);
