import * as React from 'react';
import {Col, ControlLabel, Form, FormGroup, Radio, Button, FormControl, HelpBlock} from "react-bootstrap";
import Select from 'react-select';

class OnboardPage extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {is_trainer: null}
    }

    render() {
        let dontOnboard = e => e;
        return (
            <div id="onboard">
                <p>If you're not interested in setting up your account you can go straight to the
                    <a onClick={dontOnboard}>log</a>.</p>
                <Form horizontal>
                    <FormGroup>

                        <Col xs={2} componentClass={ControlLabel}>Role</Col>
                        <Col xs={10}>
                            <Radio name="is_trainer" checked={this.state.is_trainer == true}
                                   onChange={(e: any) => this.setState({is_trainer: false})}>
                                Coach/Personal Trainer
                            </Radio>
                            <Radio name="is_trainer" checked={this.state.is_trainer == false}
                                   onChange={(e: any) => this.setState({is_trainer: false})}>
                                Athlete
                            </Radio>
                        </Col>
                    </FormGroup>
                    {this.state.is_trainer == false &&
                    <FormGroup>

                    </FormGroup>}
                </Form>
            </div>
        );
    }
}

const UserRoleQuery = props => {
    return (
        <div>
            <h3>Are you a coach or personal trainer?</h3>
            <Button>Yes</Button><Button>No</Button>
        </div>
    );
};

const GoalSelectInput = props => {
    return <Select/>
};

const BasicInformationQuery = props => {
    return (
        <div>
            <h3>First, we need some basic information for our formulas</h3>
            <Form horizontal>
                <FormGroup>
                    <Col xs={2} componentClass={ControlLabel}>Gender</Col>
                    <Col xs={10}>
                        <Radio name="gender" value="male" inline>Male</Radio>{' '}
                        <Radio name="gender" value="female" inline>Female</Radio>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col xs={2} componentClass={ControlLabel}>Height</Col>
                    <Col xs={5}>
                        <FormControl id="feet" type="number" placeholder="feet"/>
                    </Col>
                    <Col xs={5}>
                        <FormControl id="inches" type="number" placeholder="inches"/>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col xs={2} componentClass={ControlLabel}>Weight</Col>
                    <Col xs={10}>
                        <FormControl id="pounds" type="number" step={0.1} placeholder="Pounds"/>
                    </Col>
                </FormGroup>
                <FormGroup>
                    <Col xs={2} componentClass={ControlLabel}>Birthday</Col>
                    <Col xs={10}>
                        <FormControl id="birthday" type="date"/>
                        <HelpBlock>We won't share this with anyone.</HelpBlock>
                    </Col>
                </FormGroup>
            </Form>
        </div>
    )
};

const UserGoalsQuery = props => {
    return (
        <div>
            <h3>What are your goals?</h3>
            <GoalSelectInput/>
        </div>
    )
};

const FatLossSpeedSelectInput = props => {
    return (
        <Select/>
    );
};

const FatLossSpeedQuery = props => {
    return (
        <div>
            <h3>How quickly would you like to lose weight?</h3>
            <FatLossSpeedSelectInput/>
        </div>
    )
};


const DietTypeQuery = props => {
    return (
        <div>
            <h3></h3>
        </div>
    )
};