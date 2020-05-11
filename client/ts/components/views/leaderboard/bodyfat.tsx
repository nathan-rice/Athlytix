import * as React from 'react';
import {connect} from 'react-redux';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {Link} from "react-router-dom";
import {Glyphicon, Col, Row, ControlLabel, Grid} from "react-bootstrap";
import Select from 'react-select';
import {bodyfatMeasurementTypes} from "../../../models";
import {CitySelectInput, CountrySelectInput, GenderSelectInput, StateSelectInput} from "../../base-components";
import {appendLocationToUrl, prettyNum, shallowEquality} from "../../../common";
import {mediaFormat} from "./common";
import {IAppState} from "../../../state/root";
import {Actions} from "../../../state/actions";

const MeasurementMethodSelectInput = props => {
    let mt = bodyfatMeasurementTypes,
        values = props.value.map(v => v.value),
        keys = Object.keys(bodyfatMeasurementTypes),
        options = keys.reduce((o, k) => o.concat({label: mt[k], value: parseInt(k)}), []);
    return <Select openOnFocus={true} multi {...props} options={options.filter(o => values.indexOf(o.value) == -1)}/>
};


const BodyfatLeaderboardBanner = props => {
    let {country, state, city, gender = props.user.gender} = props.match.params,
        h = props.history,
        methods = props.methods,
        getQuery = bm => bm.reduce((q, m) => q + `${q == "?" ? "" : "&"}method=${m}`, "?"),
        toVal = v => ({value: v, label: v}),
        toValArray = a => a.map(v => ({value: v, label: bodyfatMeasurementTypes[v]})),
        methodChange = values => {
            let url = `/leaderboard/bodyfat/${gender}/`,
                v = values.map(o => o.value);
            h.push(appendLocationToUrl(url, props.match.params) + getQuery(v));
        },
        genderChange = v => {
            let url = `/leaderboard/bodyfat/${v.value}/`;
            h.push(appendLocationToUrl(url, props.match.params) + getQuery(methods));
        },
        countryChange = v => {
            let url = `/leaderboard/bodyfat/${gender}/`;
            if (v && v.value) url += `${v.value}/`;
            h.push(url + getQuery(methods));
        },
        stateChange = v => {
            let url = `/leaderboard/bodyfat/${gender}/${country}/`;
            if (v && v.value) url += `${v.value}/`;
            h.push(url + getQuery(methods));
        },
        cityChange = v => {
            let url = `/leaderboard/bodyfat/${gender}/${country}/${state}/`;
            if (v && v.value) url += `${v.value}/`;
            h.push(url + getQuery(methods));
        };

    return (
        <Row>
            <Col md={2}>
                <ControlLabel>Gender</ControlLabel>
                <GenderSelectInput value={toVal(gender)} onChange={genderChange}/></Col>
            <Col md={3}>
                <ControlLabel>Method</ControlLabel>
                <MeasurementMethodSelectInput value={toValArray(props.methods)} onChange={methodChange}/></Col>
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

const connectBodyfatLeaderboard = connect((s: IAppState, p: any) => {
    let r = s.root,
        user = r.users[r.selected_user_id],
        params = {...p.match.params},
        methods = [],
        entries = r.leaderboard.bodyfat,
        options = {defaultSortName: 'value', defaultSortOrder: 'asc'};
    try {
        let q = p.location.search.split("?")[1],
            m = q.split("&");
        m.forEach(p => {
            let ipv, [pn, pv] = p.split("=");
            if (pn == "method")
                ipv = parseInt(pv);
                if (ipv > 0) methods.push(ipv);
        });
    } catch (e) {}

    return {user, params, methods, entries, options, ...p}
});

class BodyfatLeaderboard_ extends React.Component<any, any> {

    constructor() {
        super();
        this.state = {loading: false};
    }

    componentDidMount() {
        let p = this.props;
        if (!this.state.loading) {
            this.setState({loading: true});
            p.dispatch(Actions.leaderboard.bodyfat(p.params, p.methods));
        }
    }

    componentDidUpdate(prevProps) {
        let p = this.props,
            sameParams = shallowEquality(p.params, prevProps.params),
            sameMethods = shallowEquality(p.methods, prevProps.methods);
        if (!(sameParams && sameMethods) && !this.state.loading) {
            this.setState({loading: true});
            p.dispatch(Actions.leaderboard.bodyfat(p.params, p.methods));
        }
        if (this.state.loading && p.entries && prevProps.entries != p.entries) {
            this.setState({loading: false});
        }
    }

    render() {
        let entries = this.props.entries || [],
            nameFormat = (cell, row) => {
                let url = `/user/${row.user_id}/`;
                return <Link to={url}>{row.first_name} {row.last_name}</Link>
            },
            typeFormat = v => bodyfatMeasurementTypes[v],
            media = mediaFormat(this.props.dispatch);
        return (
            <Grid fluid>
                <BodyfatLeaderboardBanner {...this.props}/>
                <BootstrapTable pagination striped hover condensed bordered={false} data={entries}
                                options={this.props.options}>
                    <TableHeaderColumn dataField="measurement_id" isKey hidden>Id</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataField="date"
                                       dataFormat={d => d.format("MM/DD/YYYY")}>Date</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={nameFormat} dataField="name">Name</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={typeFormat}
                                       dataField="measurement_type_id">Type</TableHeaderColumn>
                    <TableHeaderColumn dataSort dataFormat={prettyNum} dataField="value">
                        Bodyfat %
                    </TableHeaderColumn>
                    <TableHeaderColumn width="50px" dataFormat={media} dataField="media"/>
                </BootstrapTable>
            </Grid>
        )
    }
}

export const BodyfatLeaderboard = connectBodyfatLeaderboard(BodyfatLeaderboard_);