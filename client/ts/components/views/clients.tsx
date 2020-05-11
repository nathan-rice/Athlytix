import * as React from 'react';
import {connect} from 'react-redux';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import {Link} from "react-router-dom";
import {Button, Col, Glyphicon, ControlLabel, Row, PageHeader, Tabs, Tab, Grid} from "react-bootstrap";
import {Actions} from "../../state/actions";

const ClientsRequestingTraining = (props) => {
    let {requests, dispatch} = props,
        userFormatter = (cell, row) => <Link to={`/user/${row.user_id}/`}>{cell}</Link>,
        buttonFormatter = (cell, row) => {
            let approve = e => dispatch(Actions.user.approveTrainerRequest(row)),
                reject = e => dispatch(Actions.del.trainerRequest(row));
            return (
                <div>
                    <Button bsStyle="link" onClick={approve}><Glyphicon glyph="thumbs-up"/></Button>
                    <Button bsStyle="link" onClick={reject}><Glyphicon glyph="thumbs-down"/></Button>
                </div>
            )
        };
    return (
        <div>
            <BootstrapTable striped hover condensed bordered={false} data={requests}>
                <TableHeaderColumn dataField="id" isKey hidden>Id</TableHeaderColumn>
                <TableHeaderColumn dataSort dataField="date"
                                   dataFormat={d => d.format("MM/DD/YYYY")}>Date</TableHeaderColumn>
                <TableHeaderColumn dataField="user_full_name" dataFormat={userFormatter}>
                    Name
                </TableHeaderColumn>
                <TableHeaderColumn dataField="message">Message</TableHeaderColumn>
                <TableHeaderColumn dataField="button" width="100px" dataFormat={buttonFormatter}/>
            </BootstrapTable>
        </div>
    )
};

const ExistingClients = (props) => {
    let emailFormatter = d => {
        let url = `mailto:${d}`;
        return <a href={url} target="_blank">{d}</a>;
    }, buttonFormatter = (cell, row) => {
        let edit = e => props.dispatch(Actions.modal.user(row));
        let del = e => props.dispatch(Actions.user.clients.remove(row));
        return (
            <div>
                <Button bsStyle="link" onClick={edit}><Glyphicon glyph="edit"/></Button>
                <Button bsStyle="link" onClick={del}><Glyphicon glyph="remove"/></Button>
            </div>
        );
    }, onClick = () => props.dispatch(Actions.modal.user());
    return (
        <div>
            <BootstrapTable striped hover condensed bordered={false} data={props.user.clients}>
                <TableHeaderColumn dataField="id" isKey hidden>Id</TableHeaderColumn>
                <TableHeaderColumn dataSort dataField="first_name">First
                    Name</TableHeaderColumn>
                <TableHeaderColumn dataSort dataField="last_name">Last
                    Name</TableHeaderColumn>
                <TableHeaderColumn dataSort dataFormat={emailFormatter} dataField="email">E-mail</TableHeaderColumn>
                <TableHeaderColumn dataField="button" width="100px" dataFormat={buttonFormatter}/>
            </BootstrapTable>
            <Button bsStyle="primary" onClick={onClick}>Add</Button>
        </div>
    );
};

const clientConnector = connect((s, p) => {
    let r = s.root,
        user = r.users[r.user_id],
        allRequests = Object.keys(user.trainer_requests).map(k => user.trainer_requests[k]),
        requests = allRequests.filter(req => req.trainer_id == r.user_id);
    return {...p, user, requests}
});

export const Clients = clientConnector((props: any) => {
    return (
        <Grid fluid>
            <Tabs id="clients-tabs">
                <Tab eventKey={1} title="Clients">
                    <ExistingClients {...props}/>
                </Tab>
                {props.requests.length > 0 && <Tab eventKey={2} title="Training Requests">
                    <ClientsRequestingTraining {...props}/>
                </Tab>}
            </Tabs>
        </Grid>
    );
});