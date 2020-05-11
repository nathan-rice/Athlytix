import * as React from 'react';
import {connect} from 'react-redux';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {Link} from "react-router-dom";
import {Col, Row, ControlLabel, Grid} from "react-bootstrap";
import {CitySelectInput, CountrySelectInput, GenderSelectInput, StateSelectInput} from "../../base-components";
import {appendLocationToUrl, prettyNum, shallowEquality} from "../../../common";
import {mediaFormat} from "./common";
import {IAppState} from "../../../state/root";
import {Actions} from "../../../state/actions";


const WeightChangeLeaderboardBanner = props => {
    let {country, state, city, gender = props.user.gender} = props.match.params,
        h = props.history,
        toVal = v => ({value: v, label: v}),
        genderChange = v => {
            let url = `/leaderboard/${props.changeType}/${v.value}/`;
            h.push(appendLocationToUrl(url, props.match.params));
        },
        countryChange = v => {
            let url = `/leaderboard/${props.changeType}/${gender}/`;
            if (v && v.value) url += `${v.value}/`;
            h.push(url);
        },
        stateChange = v => {
            let url = `/leaderboard/${props.changeType}/${gender}/${country}/`;
            if (v && v.value) url += `${v.value}/`;
            h.push(url);
        },
        cityChange = v => {
            let url = `/leaderboard/${props.changeType}/${gender}/${country}/${state}/`;
            if (v && v.value) url += `${v.value}/`;
            h.push(url);
        };

    return (
        <Row>
            <Col md={2}>
                <ControlLabel>Gender</ControlLabel>
                <GenderSelectInput value={toVal(gender)} onChange={genderChange}/></Col>
            <Col md={2}>
                <ControlLabel>Country</ControlLabel>
                <CountrySelectInput value={toVal(country)} onChange={countryChange}/></Col>
            {country &&
            <Col md={2}>
                <ControlLabel>State</ControlLabel>
                <StateSelectInput country={country} value={toVal(state)} onChange={stateChange}/></Col>}
            {state &&
            <Col md={2}>
                <ControlLabel>City</ControlLabel>
                <CitySelectInput country={country} state={state} value={toVal(city)} onChange={cityChange}/></Col>}
        </Row>
    );
};

const WeightLossLeaderboardBanner = props => {
    return <WeightChangeLeaderboardBanner {...props} changeType="weight_loss"/>
};

const WeightGainLeaderboardBanner = props => {
    return <WeightChangeLeaderboardBanner {...props} changeType="weight_gain"/>
};

abstract class WeightChangeLeaderboard extends React.Component<any, any> {

    protected abstract loadLeadersAction(params);
    protected abstract changeField: string;
    protected abstract changeFieldTitle: string;
    protected abstract banner;

    constructor() {
        super();
        this.state = {loading: false};
    }

    componentDidMount() {
        let p = this.props;
        if (!this.state.loading) {
            this.setState({loading: true});
            p.dispatch(this.loadLeadersAction(p.params));
        }
    }

    componentDidUpdate(prevProps) {
        let p = this.props,
            sameParams = shallowEquality(p.params, prevProps.params);
        if (!sameParams && !this.state.loading) {
            this.setState({loading: true});
            p.dispatch(this.loadLeadersAction(p.params));
        }
        if (this.state.loading && p.entries && prevProps.entries != p.entries) {
            this.setState({loading: false});
        }
    }

    nameFormat(cell, row) {
        let url = `/user/${row.user_id}/`;
        return <Link to={url}>{row.first_name} {row.last_name}</Link>
    }

    render() {
        let entries = this.props.entries || [],
            media = mediaFormat(this.props.dispatch);
        return (
            <Grid fluid>
                <this.banner {...this.props}/>
                <BootstrapTable pagination striped hover condensed bordered={false} data={entries}
                                options={this.props.options}>
                    <TableHeaderColumn dataField="user_id" isKey hidden>User Id</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={(c, r) => this.nameFormat(c, r)} dataField="name">
                        Name
                    </TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={prettyNum} dataField="starting_weight">
                        Starting Weight
                    </TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={prettyNum} dataField="ending_weight">
                        Ending Weight
                    </TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={prettyNum} dataField={this.changeField}>
                        {this.changeFieldTitle}
                    </TableHeaderColumn>
                    <TableHeaderColumn dataFormat={media} dataField="before_media">
                        Before
                    </TableHeaderColumn>
                    <TableHeaderColumn dataFormat={media} dataField="after_media">
                        After
                    </TableHeaderColumn>
                </BootstrapTable>
            </Grid>
        );
    }
}

const connectWeightLossLeaderboard = connect((s: IAppState, p: any) => {
    let r = s.root,
        user = r.users[r.selected_user_id],
        params = {...p.match.params},
        entries = r.leaderboard.weight_loss,
        options = {defaultSortName: 'weight_loss', defaultSortOrder: 'desc'};
    return {params, entries, options, user, ...p}
});

class WeightLossLeaderboard_ extends WeightChangeLeaderboard {

    protected loadLeadersAction(params) {
        return Actions.leaderboard.weight.loss(params)
    }

    protected changeField = "weight_loss";
    protected changeFieldTitle = "Weight Loss";
    protected banner = WeightLossLeaderboardBanner;
}

export const WeightLossLeaderboard = connectWeightLossLeaderboard(WeightLossLeaderboard_);

const connectWeightGainLeaderboard = connect((s: IAppState, p: any) => {
    let r = s.root,
        user = r.users[r.selected_user_id],
        params = {...p.match.params},
        entries = r.leaderboard.weight_gain,
        options = {defaultSortName: 'weight_gain', defaultSortOrder: 'desc'};
    return {params, entries, options, user, ...p}
});

class WeightGainLeaderboard_ extends WeightChangeLeaderboard {

    protected loadLeadersAction(params) {
        return Actions.leaderboard.weight.gain(params)
    }

    protected changeField = "weight_gain";
    protected changeFieldTitle = "Weight Gain";
    protected banner = WeightGainLeaderboardBanner;
}

export const WeightGainLeaderboard = connectWeightGainLeaderboard(WeightGainLeaderboard_);