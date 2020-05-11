import * as React from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router-dom';
import {UserForm} from '../forms/user';
import {IUser, User} from "../../models";
import {Button, Col, ControlLabel, Grid, Row, Glyphicon, Alert, FormControl} from "react-bootstrap";
import {Actions} from "../../state/actions";
import {IAppState} from "../../state/root";
import {TrainerRequestAlert} from './trainers';

class AccountDetails extends React.Component<any, any> {

    constructor() {
        super();
        this.state = {message: ""};
    }

    render() {
        let {user, request, dispatch, is_trainer} = this.props,
            name = `${user.first_name ? user.first_name + ' ' : ''}${user.last_name || ''}`, youtube, trainer_url,
            requestTraining = () => {
                return dispatch(Actions.add.trainerRequest({trainer_id: user.id, message: this.state.message}));
            };

        if (user.youtube) {
            if (user.youtube.indexOf("/") > 0) youtube = user.youtube;
            else youtube = `http://www.youtube.com/channel/${user.youtube}`;
        }

        if (user.trainer_id) trainer_url = `/api/user/${user.trainer_id}/`;

        return (
            <div id="account-details">
                <Row>
                    <Col xs={12}>
                        <div className="page-header">
                            <span className="inline-header">{name}</span>
                            <div className="profile-social-buttons">
                                {user.email && <a href={`mailto:${user.email}`}><Glyphicon glyph="envelope"/></a>}
                                {user.instagram &&
                                <a href={`http://www.instagram.com/${user.instagram}`} target="_blank">
                                    <img src="/static/img/instagram.png" className="social-icon-small"/>
                                </a>}
                                {youtube &&
                                <a href={youtube} target="_blank">
                                    <img src="/static/img/youtube.png" className="social-icon-small"/>
                                </a>}
                                {user.twitter &&
                                <a href={`http://www.twitter.com/${user.instagram}`} target="_blank">
                                    <img src="/static/img/twitter.png" className="social-icon-small"/>
                                </a>}
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col xs={8}>
                        {user.age &&
                        <Row>
                            <Col xs={4} componentClass={ControlLabel}>
                                Age
                            </Col>
                            <Col xs={8}>{user.age}</Col>
                        </Row>}
                        {user.height &&
                        <Row>
                            <Col xs={4} componentClass={ControlLabel}>
                                Height
                            </Col>
                            <Col xs={8}>{Math.floor(user.height / 12)}' {user.height % 12}"</Col>
                        </Row>}
                        {user.gender !== null &&
                        <Row>
                            <Col xs={4} componentClass={ControlLabel}>
                                Gender
                            </Col>
                            < Col xs={8}>{user.gender}</Col>
                        </Row>}
                        {user.country &&
                        <Row>
                            <Col xs={4} componentClass={ControlLabel}>
                                Country
                            </Col>
                            < Col xs={8}>{user.country}</Col>
                        </Row>}
                        {user.state &&
                        <Row>
                            <Col xs={4} componentClass={ControlLabel}>
                                State/Province
                            </Col>
                            < Col xs={8}>{user.state}</Col>
                        </Row>}
                        {user.city &&
                        <Row>
                            <Col xs={4} componentClass={ControlLabel}>
                                City
                            </Col>
                            < Col xs={8}>{user.city}</Col>
                        </Row>}
                        {user.trainer_id &&
                        <Row>
                            <Col xs={4} componentClass={ControlLabel}>
                            </Col>
                            <Col xs={8}>
                                <Link to={trainer_url}>{user.trainer_name}</Link>
                            </Col>
                        </Row>}
                        {user.about &&
                        <Row>
                            <Col xs={4} componentClass={ControlLabel}>
                                About
                            </Col>
                            < Col xs={8}>{user.about}</Col>
                        </Row>}
                    </Col>
                    <Col xs={4}><img className="pull-right" src={user.gravatar}/></Col>
                </Row>
                <hr/>
                {user.is_trainer && !request && !is_trainer &&
                <Row>
                    <Col xs={2} componentClass={ControlLabel}>Message</Col>
                    <Col xs={8}>
                        <FormControl name="message" componentClass="textarea"
                                     onChange={(e: any) => this.setState({message: e.target.value})}/>
                    </Col>
                    <Col xs={2}>
                        <Button bsStyle="primary" onClick={requestTraining}>Request Training</Button>
                    </Col>

                </Row>}
                {request && <TrainerRequestAlert dispatch={dispatch} request={request}/>}
            </div>
        )
    }
}

const AccountFormContainer = (props) => {
    return (
        <Grid>
            <UserForm {...props}/>
            <div className="pull-right">
                <Button bsStyle="primary" form="account_form" type="submit">Update</Button>
            </div>
        </Grid>
    );
};

interface IAccountProps {
    user: User;
    editable?: boolean;
    dispatch?: Function;
}

const connectAccount = connect((s: IAppState, p: any) => {
    let r = s.root, user_id, user, editable, request, is_trainer = false, tr;
    user_id = p.match.params.user_id;
    user = r.users[user_id];
    editable = user && (user.id == r.user_id || user.trainer_id == r.user_id);
    try {
        is_trainer = r.users[r.user_id].trainer_id == user.id;
        tr = r.users[r.user_id].trainer_requests;
        request = Object.keys(tr).map(k => tr[k]).filter(req => r.user_id == req.user_id)[0];
    } catch (e) {
    }
    return {...p, user, request, is_trainer, editable} as IAccountProps
});

class Account_ extends React.Component<any, any> {

    constructor() {
        super();
        this.state = {loading: false}
    }

    componentDidMount() {
        if (!this.state.loading && !this.props.user) {
            this.loadUser();
        }
    }

    componentDidUpdate(prevProps) {
        // Had to move the setState here because then callback on loadUser was firing immediately
        if (this.state.loading && this.props.user != prevProps.user) this.setState({loading: false});
        if (!this.state.loading && (!this.props.user || this.props.user_id != prevProps.user_id)) {
            this.loadUser();
        }
    }

    loadUser() {
        let p = this.props, pm = p.match.params;
        this.setState({loading: true});
        p.dispatch(Actions.user.get({id: pm.user_id}));
    }

    onSubmit(u) {
        let is_public = u.is_public === true || false,
            is_trainer = u.is_trainer === true || false;
        return this.props.dispatch(Actions.user.update({...u, is_public, is_trainer}));
    }

    render() {
        let p = this.props;
        return (
            <Grid>
                {p.user &&
                (p.editable &&
                    <AccountFormContainer {...p} onSubmit={e => this.onSubmit(e)}/> ||
                    <AccountDetails {...p}/>)}
            </Grid>
        );
    }
}

export const Account = connectAccount(Account_);

