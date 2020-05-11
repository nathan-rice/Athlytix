import * as React from 'react';
import {ICalendarProps} from "./common";
import {Form, Button, Col, Glyphicon, ControlLabel, Row} from "react-bootstrap";
import Select from 'react-select';
import {Actions} from "../../../state/actions";
import {compareDates, xdate} from "../../../common";

const ViewSelector = ({month, dispatch, selected, view}: ICalendarProps) => {
    let change = v => dispatch(Actions.log.view(v)),
        selectProps = {
            options: [
                {label: "Day", value: "day"},
                {label: "Week", value: "week"},
                {label: "Month", value: "month"}
            ],
            value: view,
            onChange: change,
            simpleValue: true
        };
    return (
        <div className="calendar-banner-view">
            <Form inline>
                <ControlLabel>Period:</ControlLabel>{' '}
                <Select openOnFocus {...selectProps}/>
            </Form>
        </div>
    );
};

export const Banner = ({month, dispatch, selected, view}: ICalendarProps) => {
    return (
        <div className="calendar-banner">
            <Row>
                <Col sm={6}>
                    <DateSelector selected={selected} month={month} dispatch={dispatch} view={view}/>
                </Col>
                <Col sm={6}>
                    <ViewSelector selected={selected} month={month} dispatch={dispatch} view={view}/>
                </Col>
            </Row>
        </div>
    );
};

export const DateSelector = ({selected, dispatch}: ICalendarProps) => {
    let today = xdate(),
        title = selected.format('dddd MMMM Do, YYYY'),
        previous = () => dispatch(Actions.log.period.previous(selected)),
        next = () => dispatch(Actions.log.period.next(selected)),
        selectToday = () => dispatch(Actions.date.select(today));
    return (
        <div className="calendar-banner-date">
            <Button bsStyle="link" onClick={() => previous()}>
                <Glyphicon glyph="menu-left"/>
            </Button>
            {title}
            <Button bsStyle="link" onClick={() => next()}>
                <Glyphicon glyph="menu-right"/>
            </Button>
            {compareDates(selected, today) != 0 &&
            <Button bsStyle="link" onClick={selectToday}>Today</Button>}
        </div>
    );
};