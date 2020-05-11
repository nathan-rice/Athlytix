import * as React from 'react';
import {connect} from 'react-redux';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {Link} from "react-router-dom";
import {Row, Col, ControlLabel, Glyphicon, Alert, Button, Grid} from "react-bootstrap";
import {
    CitySelectInput, CountrySelectInput, GenderSelectInput, StateSelectInput, FirstNameSelectInput,
    LastNameSelectInput
} from "../base-components";
import {Actions} from "../../state/actions";
import {Search} from "../../state/search";
import {IUser} from "../../models";

class TrainerSearch extends React.Component<any, any> {
    constructor() {
        super();
        this.state = {};
    }

    componentDidMount() {
        let u = this.props.user;
        if (u.id > 0) this.setQueryParams(u);
    }

    componentDidUpdate(prevProps, prevState) {
        let u = this.props.user;
        if (u.id > 0 && u.id != prevProps.user.id) this.setQueryParams(u);
        else {
            if (!this.queryEqual(prevState, this.state))
                Search.trainer(this.state).then(r => {
                    this.setState({results: r})
                });
        }
    }

    setQueryParams(u: IUser) {
        let s: any = {};
        if (u.gender && !this.state.gender) s.gender = u.gender;
        if (u.country && !this.state.country) s.country = u.country;
        if (u.state && !this.state.state) s.state = u.state;
        if (u.city && !this.state.city) s.city = u.city;
        this.setState(s);
    }

    queryEqual(c, p) {
        return (c.first_name == p.first_name && c.last_name == p.last_name && c.gender == p.gender &&
            c.country == p.country && c.state == p.state && c.city == p.city)
    }

    firstNameChange(o) {
        let value = o ? o.value : null;
        this.setState({first_name: value});
    }

    lastNameChange(o) {
        let value = o ? o.value : null;
        this.setState({last_name: value});
    }

    genderChange(o) {
        let value = o ? o.value : null;
        this.setState({gender: value});
    }

    countryChange(o) {
        let value = o ? o.value : null;
        this.setState({country: value, state: null, city: null});
    }

    stateChange(o) {
        let value = o ? o.value : null;
        this.setState({state: value, city: null});
    }

    cityChange(o) {
        let value = o ? o.value : null;
        this.setState({city: value});
    }

    gravatarFormat(cell) {
        return <img src={cell}/>;
    }

    nameFormat(cell, row) {
        let url = `/user/${row.id}/`;
        return <Link className="vertical-center" to={url}>{row.first_name} {row.last_name}</Link>
    }

    socialFormat(cell, row) {
        // Need to deal with youtube specially since it doesn't automatically give people friendly social urls.
        let youtube;
        if (row.youtube && row.youtube.indexOf("/") > 0) youtube = row.youtube;
        else youtube = `http://www.youtube.com/channel/${row.youtube}`;
        return (
            <div className="vertical-center">
                {row.instagram &&
                <a href={`http://www.instagram.com/${row.instagram}`} target="_blank">
                    <img src="/static/img/instagram.png" className="social-icon-small"/>
                </a>}
                {row.twitter &&
                <a href={`http://www.twitter.com/${row.instagram}`} target="_blank">
                    <img src="/static/img/twitter.png" className="social-icon-small"/>
                </a>}
                {row.youtube &&
                <a href={youtube} target="_blank">
                    <img src="/static/img/youtube.png" className="social-icon-small"/>
                </a>}
            </div>
        );
    }

    render() {
        let s = this.state, toVal = v => ({value: v, label: v});
        return (
            <Grid fluid>
                <Row>
                    <Col md={2}>
                        <ControlLabel>First Name</ControlLabel>
                        <FirstNameSelectInput value={toVal(s.first_name)} onChange={o => this.firstNameChange(o)}/>
                    </Col>
                    <Col md={2}>
                        <ControlLabel>Last Name</ControlLabel>
                        <LastNameSelectInput value={toVal(s.last_name)} onChange={o => this.lastNameChange(o)}/>
                    </Col>
                    <Col md={2}>
                        <ControlLabel>Gender</ControlLabel>
                        <GenderSelectInput value={toVal(s.gender)} onChange={o => this.genderChange(o)}/>
                    </Col>
                    <Col md={2}>
                        <ControlLabel>Country</ControlLabel>
                        <CountrySelectInput value={toVal(s.country)} onChange={o => this.countryChange(o)}/>
                    </Col>
                    <Col md={2}>
                        <ControlLabel>State</ControlLabel>
                        <StateSelectInput value={toVal(s.state)} onChange={o => this.stateChange(o)}/>
                    </Col>
                    <Col md={2}>
                        <ControlLabel>City</ControlLabel>
                        <CitySelectInput value={toVal(s.city)} onChange={o => this.cityChange(o)}/>
                    </Col>
                </Row>
                <BootstrapTable trClassName="vertical-center" striped hover pagination condensed bordered={false}
                                data={this.state.results} options={this.props.options}>
                    <TableHeaderColumn dataField="id" isKey hidden>Id</TableHeaderColumn>
                    <TableHeaderColumn width="90px" dataFormat={c => this.gravatarFormat(c)} dataField="gravatar"/>
                    <TableHeaderColumn dataFormat={(c, r) => this.nameFormat(c, r)}
                                       dataField="name">Name</TableHeaderColumn>
                    <TableHeaderColumn dataField="about">About</TableHeaderColumn>
                    <TableHeaderColumn width="120px" dataFormat={(c, r) => this.socialFormat(c, r)} dataField="social"/>
                </BootstrapTable>
            </Grid>
        )
    }
}

const trainerConnector = connect((s, p) => {
    let r = s.root,
        user = r.users[r.user_id],
        allRequests = Object.keys(user.trainer_requests).map(k => user.trainer_requests[k]),
        requests = allRequests.filter(req => req.user_id == r.user_id);
    return {...p, user, requests}
});

export const Trainers = trainerConnector(props => {
    return (
        <div id="trainers">
            <TrainerSearch {...props}/>
            {props.requests.length > 0 && <TrainersRequested {...props as any}/>}
        </div>
    );
});

export const TrainerRequestAlert = ({request, dispatch}) => {
    let del = () => dispatch(Actions.del.trainerRequest(request));
    return (
        <Alert bsStyle="info">
            <Glyphicon glyph="exclamation-sign"/>{'  '}
            You requested training from <Link to={`/user/${request.trainer_id}/`}>{request.trainer_full_name}</Link>
            {' '}on {request.date.format("LL")}
            <div className="pull-right goal-alert-button">
                <Button onClick={del} bsStyle="info" bsSize="small"><Glyphicon glyph="trash"/></Button>
            </div>
        </Alert>
    )
};

const TrainersRequested = ({requests, dispatch}) => {
    let alerts = requests.map(r => <TrainerRequestAlert key={r.id} request={r} dispatch={dispatch}/>);
    return (
        <div>
            {alerts}
        </div>
    )
};