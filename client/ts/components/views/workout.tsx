import * as React from 'react';
import {connect} from 'react-redux';
import {Actions} from "../../state/actions";
import {IAppState} from "../../state/root";
import {
    Button, Col, ControlLabel, Form, FormControl, FormGroup, Glyphicon, Grid, ProgressBar,
    Row
} from "react-bootstrap";
import {TrainingPeriod} from "../../models";
import {prettyNum, xdate} from "../../common";

const roundFive = w => Math.floor(w / 5) * 5;

const connectWorkout = connect((s: IAppState, p: any) => {
    let r = s.root,
        params = p.match.params,
        user = s.root.users[r.selected_user_id],
        estimates = s.root.workout.estimates,
        training_period = user.training_periods[params.period_id],
        date,
        workout;
    try {
        workout = training_period.program.workouts.filter(w => w.id == params.workout_id)[0];
        date = xdate(training_period.start_date).add(workout.day - 1, 'day');
    } catch (e) {
        workout = {sets: [], name: "", id: -1};
        training_period = new TrainingPeriod({});
        date = xdate();
    }
    return {user, workout, estimates, training_period, date, ...p};
});

class Workout_ extends React.Component<any, any> {

    constructor(props) {
        super(props);
        let complete = props.workout.sets.reduce((o, s) => Object.assign(o, {[s.id]: false}), {});
        this.state = {loadingEstimates: false, complete, repetitions: {}, estimates: props.estimates};
    }

    loadEstimates() {
        let p = this.props;
        this.props.dispatch(Actions.workout.estimates(p.user.id, p.training_period.id, p.workout.id))
            .then(this.setState({loadingEstimates: false}));
    }

    componentDidMount() {
        let p = this.props;
        if (!Object.keys(p.estimates).length && p.workout.sets.length && !this.state.loadingEstimates) {
            this.setState({loadingEstimates: true});
            this.loadEstimates();
        }
    }

    componentDidUpdate(oldProps) {
        let p = this.props;
        if (p.workout.id != oldProps.workout.id || p.training_period.id != oldProps.training_period.id) {
            let complete = p.workout.sets.reduce((o, s) => Object.assign(o, {[s.id]: false}), {});
            this.setState({complete, repetitions: {}, estimates: {}});
            if (!Object.keys(p.estimates).length && p.workout.sets.length && !this.state.loadingEstimates) {
                this.setState({loadingEstimates: true});
                this.loadEstimates();
            }
        }
        if (p.estimates != oldProps.estimates) this.setState({estimates: p.estimates});
    }

    percentComplete() {
        let keys = Object.keys(this.state.complete), total = keys.length, complete = 0;
        keys.forEach(k => {
            if (this.state.complete[k]) complete += 1;
        });
        return prettyNum(complete / total * 100);
    }

    completeSet(id: number, reps: number) {
        let c = this.state.complete,
            r = this.state.repetitions,
            complete = {...c, [id]: true},
            repetitions = {...r, [id]: reps};
        this.setState({complete, repetitions})
    }

    completedSets() {
        let s = this.state;
        return this.props.workout.sets.filter(set => s.complete[set.id] && s.repetitions[set.id]);
    }

    incompleteSets() {
        let s = this.state;
        return this.props.workout.sets.filter(set => !s.complete[set.id]);
    }

    missingEstimates() {
        let p = this.props,
            e = p.estimates,
            hasWeight = k => p.workout.sets.filter(s => s.exercise == k && s.percent).length > 0;
        return Object.keys(e).filter(k => !e[k] && hasWeight(k));
    }

    setEstimate(exercise, weight) {
        this.setState({estimates: {...this.state.estimates, [exercise]: weight}});
    }

    missingField(exercise) {
        return (
            <Row key={exercise}>
                <Col xs={3} componentClass={ControlLabel}>{exercise}</Col>
                <Col xs={3}>
                    <FormGroup>
                        <FormControl type="number" step={0.5} placeholder="Pounds"
                                     onChange={(e: any) => this.setEstimate(exercise, e.target.value)}/>
                    </FormGroup>
                </Col>
            </Row>
        )
    }

    missingRender(missing) {
        return (
            <div>
                <p>Please enter 1 rep max values for the following exercises:</p>
                <Form horizontal>
                    {missing.map(k => this.missingField(k))}
                </Form>
            </div>
        );
    }

    incompleteRender() {
        return (
            <div>
                <Row>
                    <Col xs={3} xsOffset={3} componentClass={ControlLabel}>Repetitions</Col>
                    <Col xs={3} componentClass={ControlLabel}>Weight</Col>
                </Row>
                <Form horizontal>
                    {this.incompleteSets().map(s => <WorkoutSet set={s} key={s.id} date={this.props.date}
                                                                estimate={this.state.estimates[s.exercise]}
                                                                complete={r => this.completeSet(s.id, r)}
                                                                dispatch={this.props.dispatch}/>)}
                </Form>
            </div>
        )
    }

    saveRender() {
        let p = this.props,
            exercises = [],
            w = p.workout,
            save = () => {
                let details = exercises.join("\n"),
                    workout_id = p.workout.id,
                    program_id = p.training_period.program.id,
                    e = {user_id: p.user.id, name: p.workout.name, date: p.date, details, workout_id, program_id};
                p.dispatch(Actions.add.calorie.expenditure(e));
            };
        w.sets.forEach(s => {
            let reps = this.state.repetitions[s.id],
                weight = roundFive(this.props.estimates[s.exercise] * s.percent / 100);
            if (reps) {
                if (weight) exercises.push(`${s.exercise}: ${reps} × ${weight}`);
                else exercises.push(`${s.exercise}: ${reps}`);
            }
        });
        return (
            <Row>
                <Col xs={2} xsOffset={2}>
                    <Button bsStyle="primary" onClick={save}>Save workout</Button>
                </Col>
            </Row>
        )
    }

    completedRender() {
        let getWeight = s => this.state.estimates[s.exercise] * s.percent / 100;
        return (
            <div>
                <h4 className="page-header-small" id="workout-completed-sets">Completed sets</h4>
                <Row>
                    <Col xs={3} componentClass={ControlLabel}>Exercise</Col>
                    <Col xs={3} componentClass={ControlLabel}>Repetitions</Col>
                    <Col xs={3} componentClass={ControlLabel}>Weight</Col>
                </Row>
                {this.completedSets().map(s => <CompletedWorkoutSet key={s.id} exercise={s.exercise}
                                                                    weight={getWeight(s)}
                                                                    repetitions={this.state.repetitions[s.id]}/>)}
            </div>
        )
    }

    render() {
        let percent = this.percentComplete(),
            label = `${percent}% complete`,
            workout = this.props.workout,
            missing = this.missingEstimates();
        return (
            <Grid fluid>
                <h3 className="page-header-small">{workout.name}</h3>
                {workout.notes && <p>{workout.notes}</p>}
                {missing.length > 0 && this.missingRender(missing)}
                <Row>
                    <Col xs={10} xsOffset={1}><ProgressBar now={percent} label={label}/></Col>
                </Row>
                {percent == 100 && this.saveRender()}
                {percent < 100 && this.incompleteRender()}
                {percent > 0 && this.completedRender()}
            </Grid>
        )
    }
}

class WorkoutSet extends React.Component<any, any> {
    constructor(props) {
        super(props);
        this.state = this.getNewState(props);
    }

    componentWillReceiveProps(newProps) {
        this.setState(this.getNewState(newProps));
    }

    getNewState(props) {
        let {set, estimate} = props,
            repetitions = set.repetitions || "",
            weight = this.props.estimate && set.percent ? roundFive(estimate * set.percent / 100) : "";
        return {repetitions, weight};
    }

    render() {
        let {set, complete, dispatch, date} = this.props,
            {weight, repetitions} = this.state,
            click = () => {
                if (!set.repetitions) {
                    dispatch(Actions.add.achievement.strength({exercise: set.exercise, date, weight, repetitions}));
                }
                complete(this.state.repetitions);
            };
        return (
            <div className="workout-form-set">
                <Row>
                    <Col xs={3} componentClass={ControlLabel}>{set.exercise}</Col>
                    <Col xs={3}>
                        <FormGroup>
                            <FormControl placeholder="Repetitions" type="number" value={repetitions}
                                         onChange={(e: any) => this.setState({repetitions: e.target.value})}/>
                        </FormGroup>
                    </Col>
                    <Col xs={3}>
                        <FormGroup>
                            <FormControl placeholder="Weight" type="number" step={0.5} value={weight}
                                         onChange={(e: any) => this.setState({weight: e.target.value})}/>
                        </FormGroup>
                    </Col>
                    <Col xs={1}>
                        {repetitions &&
                        <Button bsStyle="link" onClick={click}>
                            <Glyphicon glyph="ok"/>
                        </Button>}
                    </Col>
                    <Col xs={1}>
                        <Button bsStyle="link" onClick={() => complete(0)}>
                            <Glyphicon glyph="remove"/>
                        </Button>
                    </Col>
                </Row>
            </div>
        );
    }
}

const CompletedWorkoutSet = ({exercise, repetitions, weight}) => {
    return (
        <Row>
            <Col xs={3}>{exercise}</Col>
            <Col xs={3}>{repetitions}</Col>
            <Col xs={3}>{roundFive(weight) || ""}</Col>
        </Row>
    )
};

export const Workout = connectWorkout(Workout_);