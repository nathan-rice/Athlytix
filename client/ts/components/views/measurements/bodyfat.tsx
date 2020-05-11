import * as React from 'react';
import {connect} from 'react-redux';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import Select from 'react-select';
import {Actions} from '../../../state/actions';
import {IAppState, IRootState} from '../../../state/root';
import {EstimatorPlot} from "../../plots/estimator";
import {Col, ControlLabel, Form, FormGroup, Row, Button, Glyphicon, Alert, ButtonGroup, Grid} from "react-bootstrap";
import {Link} from "react-router-dom";
import {bodyfatMeasurementTypes, IGoal} from "../../../models";
import {Percentiles, GoalRecord} from '../../base-components';
import * as moment from "moment";
import {prettyNum} from "../../../common";


const BodyfatBanner = (props: any) => {
    let u = props.user,
        url = `/leaderboard/bodyfat/${u.gender}/`;
    return (
        <div className="banner">
            <Row>
                <Col sm={3}>
                    <div className="bodyfat-banner-leaderboard">
                        <ControlLabel>Leaderboard</ControlLabel>
                        <ul className="list-inline">
                            <li><Link to={url}>All</Link></li>
                            {u.country &&
                            <li><Link to={url + `${u.country}/`}>Country</Link></li>}
                            {u.country && u.state &&
                            <li><Link to={url + `${u.country}/${u.state}/`}>State</Link></li>}
                            {u.country && u.state && u.city &&
                            <li><Link to={url + `${u.country}/${u.state}/${u.city}/`}>City</Link></li>}
                        </ul>
                    </div>
                </Col>
                <Col sm={4}>
                    <BodyfatPercentiles {...props}/>
                </Col>
            </Row>
        </div>
    );
};

const connectBodyfatPercentiles = connect((s: IAppState, p: any) => {
    let r = s.root, user_id = p.match.params.user_id, bp = r.estimates.percentile.bodyfat, all, country, state, city;
    try {
        all = bp.all[user_id];
    } catch (e) {
    }
    try {
        country = bp.country[user_id];
    } catch (e) {
    }
    try {
        state = bp.state[user_id];
    } catch (e) {
    }
    try {
        city = bp.city[user_id];
    } catch (e) {
    }
    return {...p, user_id, percentiles: {all, country, state, city}};
});


class BodyfatPercentiles_ extends Percentiles {

    protected attribute = "bodyfats";

    protected getEstimatorAction(o: any, level: string) {
        return Actions.estimate.percentile.measurement.bodyfat(o, level);
    }

    protected conditionsChanged(prevProps): boolean {
        return false;
    }
}

const BodyfatPercentiles = connectBodyfatPercentiles(BodyfatPercentiles_);


const BodyfatGoalAlert = ({goal, probability, dispatch}) => {
    let p = prettyNum(probability * 100),
        bsStyle = p >= 75 ? "success" : p < 25 ? "danger" : "warning",
        date = goal.date.format("LL"),
        editGoal = () => dispatch(Actions.modal.goal(goal));
    return (
        <Alert bsStyle={bsStyle}>
            <Glyphicon glyph="exclamation-sign"/>{'  '}
            You have a <strong>{p}%</strong> chance to meet your goal bodyfat of <strong>{goal.value}%</strong> by
            {' '}{date}.
            <div className="pull-right goal-alert-button">
                <Button onClick={editGoal} bsStyle={bsStyle} bsSize="small"><Glyphicon glyph="edit"/></Button>
            </div>
        </Alert>
    );
};

const connectBodyfat = connect((s, p) => {
    let r: IRootState = s.root, u = r.users[r.selected_user_id], bm = u.bodyfat_measurements,
        userEstimates = r.estimates.bodyfat[u.id],
        bodyfats = Object.keys(bm).map(k => bm[k]),
        estimates = userEstimates || {means: [], stds: [], days: []},
        options = {defaultSortName: 'date', defaultSortOrder: 'desc'},
        goals = {}, goalEstimates = {};
    Object.keys(u.goals).map(k => u.goals[k]).filter(g => g.goal_type_id == 2).forEach(g => {
        let est = r.estimates.goal[g.id];
        goals[g.id] = g;
        if (est) goalEstimates[g.id] = est;
    });
    return {bodyfats, estimates, goals, goalEstimates, options, user: u, ...p}
});

class Bodyfat_ extends GoalRecord {

    protected attribute = "bodyfats";

    load() {
        let id = Math.max(...this.props.bodyfats.map(b => b.id));
        return this.props.dispatch(Actions.estimate.bodyfat(this.props.user, id));
    }

    addBodyfat() {
        this.props.dispatch(Actions.modal.measurement.bodyfat({date: moment.utc()}));
    }

    addGoal() {
        this.props.dispatch(Actions.modal.goal({goal_type_id: 2}));
    }

    buttonFormatter(cell, row) {
        let click = e => this.props.dispatch(Actions.modal.measurement.bodyfat(row));
        return <Button bsStyle="link" onClick={click}><Glyphicon glyph="edit"/></Button>
    }

    render() {
        let {bodyfats, estimates} = this.props,
            x = bodyfats.map(e => new Date(e.date.format("YYYY/MM/DD"))),
            y = bodyfats.map(e => e.value),
            g = this.props.goals,
            ge = this.props.goalEstimates,
            alerts = Object.keys(ge).map(k => <BodyfatGoalAlert key={k} goal={g[k]}
                                                                probability={ge[k]} {...this.props}/>);
        return (
            <Grid fluid>
                <BodyfatBanner {...this.props}/>
                {estimates.days.length > 0 &&
                <EstimatorPlot name="bodyfat" x={x} y={y} yLabel="Bodyfat %" {...this.props}/>}
                {alerts.length > 0 && alerts}
                <Form horizontal>
                    <Col xs={1} componentClass={ControlLabel}>Add:</Col>
                    <Col xs={11}>
                        <ButtonGroup>
                            <Button bsStyle="primary" onClick={() => this.addBodyfat()}>Bodyfat</Button>
                            <Button bsStyle="primary" onClick={() => this.addGoal()}>Goal</Button>
                        </ButtonGroup>
                    </Col>
                </Form>
                <BootstrapTable striped hover pagination condensed options={this.props.options} bordered={false}
                                data={bodyfats}>
                    <TableHeaderColumn dataField="id" isKey hidden>Id</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataField="date"
                                       dataFormat={d => d.format("MM/DD/YYYY")}>Date</TableHeaderColumn>
                    <TableHeaderColumn dataField="value" dataFormat={prettyNum} dataSort>
                        Bodyfat (%)
                    </TableHeaderColumn>
                    <TableHeaderColumn dataFormat={v => bodyfatMeasurementTypes[v]} dataField="measurement_type_id">
                        Method
                    </TableHeaderColumn>
                    <TableHeaderColumn dataField="button" width="50px"
                                       dataFormat={(c, r) => this.buttonFormatter(c, r)}/>
                </BootstrapTable>
            </Grid>
        );
    }
}

export const Bodyfat = connectBodyfat(Bodyfat_);