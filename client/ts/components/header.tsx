import * as React from 'react';
import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import {LinkContainer} from 'react-router-bootstrap';
import Select from 'react-select';
import {withRouter} from 'react-router';
import {ProfilePicture} from './profile-picture';
import {Actions} from '../state/actions';


const connector = connect((s, p) => {
    s = s.root;
    return {...p, user_id: s.user_id, current_user_id: s.selected_user_id, users: s.users};
}) as any;

export const Header = withRouter(connector(({user_id, current_user_id, users, dispatch, ...props}) => {
    let user = users[user_id],
        selectedUser = users[current_user_id],
        profilePicture: any = <ProfilePicture user={user} size={40}/>,
        trainer = user && user.is_trainer,
        selectableUsers = [...user.clients, user],
        selectOptions = selectableUsers.map(u => ({label: `${u.first_name} ${u.last_name}`, value: u.id})),
        selectUser = (o) => {
            let user = {id: o.value},
                newUrl = props.location.pathname.replace(`/${current_user_id}/`, `/${o.value}/`);
            dispatch(Actions.list.all(user));
            dispatch(Actions.user.select(user));
            props.history.push(newUrl);
        },
        selfProfile = `/user/${user_id}/`,
        showBodyComposition = Object.keys(selectedUser.bodyfat_measurements).length > 0 &&
            Object.keys(selectedUser.weight_measurements).length > 0,
        bodyComposition = `/body_composition/${current_user_id}/`,
        showDiet = Object.keys(selectedUser.calorie_intakes).length > 0 &&
            Object.keys(selectedUser.weight_measurements).length > 0,
        diet = `/diet/${current_user_id}/`,
        showStrength = Object.keys(selectedUser.strength_achievements).length > 0,
        strength = `/strength/${current_user_id}/`;
    return (
        <div>
            <Navbar inverse fixedTop collapseOnSelect>
                <Navbar.Header>
                    <Navbar.Brand>
                        <Link to="/log/">
                            <img src="/static/img/logo-white.png" className="nav-logo"/>
                            <span id="navbar-brand-text">
                                Athlytix<sup style={{color: 'red'}}>beta</sup>
                            </span>
                        </Link>
                    </Navbar.Brand>
                    {trainer &&
                    <div id="header-active-user-select">
                        <Select openOnFocus={true} options={selectOptions} value={current_user_id}
                                onChange={selectUser}/>
                    </div>}
                    <Navbar.Toggle/>
                </Navbar.Header>
                <Navbar.Collapse>
                    <Nav pullRight>
                        <NavDropdown id="header-view-dropdown" title="Views">
                            <LinkContainer to="/log/">
                                <NavItem eventKey={1.1}>Log</NavItem>
                            </LinkContainer>
                            {(trainer || user.is_admin) &&
                            <LinkContainer to="/clients/">
                                <NavItem eventKey={1.2}>Clients</NavItem>
                            </LinkContainer>}
                            <LinkContainer to="/trainers/">
                                <NavItem eventKey={1.3}>Trainers</NavItem>
                            </LinkContainer>
                            {showStrength &&
                            <LinkContainer to={strength}>
                                <NavItem eventKey={1.4}>Strength</NavItem>
                            </LinkContainer>}
                            {showDiet &&
                            <LinkContainer to={diet}>
                                <NavItem eventKey={1.5}>Diet</NavItem>
                            </LinkContainer>}
                            {showBodyComposition &&
                            <LinkContainer to={bodyComposition}>
                                <NavItem eventKey={1.6}>Body Composition</NavItem>
                            </LinkContainer>}
                            <LinkContainer to="/program/">
                                <NavItem eventKey={1.7}>Program Editor</NavItem>
                            </LinkContainer>
                        </NavDropdown>
                        <NavDropdown id="header-leaderboard-dropdown" title="Leaderboards">
                            <LinkContainer to="/leaderboard/strength/">
                                <NavItem eventKey={2.1}>Strength</NavItem>
                            </LinkContainer>
                            <LinkContainer to="/leaderboard/endurance/">
                                <NavItem eventKey={2.2}>Endurance</NavItem>
                            </LinkContainer>
                            <LinkContainer to="/leaderboard/bodyfat/">
                                <NavItem eventKey={2.3}>Bodyfat</NavItem>
                            </LinkContainer>
                            <LinkContainer to="/leaderboard/weight_loss/">
                                <NavItem eventKey={2.4}>Weight Loss</NavItem>
                            </LinkContainer>
                            <LinkContainer to="/leaderboard/weight_gain/">
                                <NavItem eventKey={2.5}>Weight Gain</NavItem>
                            </LinkContainer>
                        </NavDropdown>
                        <NavDropdown id="header-account-picture" title={profilePicture}>
                            <LinkContainer to={selfProfile}>
                                <MenuItem eventKey={3.1}>Account</MenuItem>
                            </LinkContainer>
                            <li role="presentation"><a href="/user/sign-out">Log out</a></li>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
        </div>
    )
        ;
}));
