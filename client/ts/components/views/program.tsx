import * as React from 'react';
import {connect} from 'react-redux';
import {
    Form, Col, FormGroup, ControlLabel, FormControl, Checkbox, Button, PanelGroup, Panel,
    Glyphicon, Grid, Row, Tooltip, OverlayTrigger, HelpBlock, Tabs, Tab, ButtonGroup
} from "react-bootstrap";
import Select from 'react-select'
import * as TreeView from 'react-treeview';
import {Set} from 'es6-shim';
import {IWorkoutSet, programTags} from "../../models";
import {integer} from "../../common";
import {Actions} from "../../state/actions";
import {Search} from "../../state/search";


const formatValues = values => values ? values.map(v => ({label: v, value: v})) : [];

const TagSelector = ({dispatch, value}) => {
    let change = os => dispatch(Actions.program.tags(os.map(o => o.value)));
    return <Select.Creatable multi value={formatValues(value)} options={programTags} onChange={change}/>;
};

const ProgramSelector = ({value, dispatch, tags}) => {
    let v = value ? {label: value} : value,
        change = o => {
            o && o.value && dispatch(Actions.program.edit(o.value))
        },
        loadOptions = input => Search.program({query: input, tags})
            .then(results => ({options: results}));
    return <Select.Async value={v} openOnFocus onChange={change} loadOptions={loadOptions}/>;
};

const WorkoutSelector = ({workouts, value, dispatch}) => {
    let options = [],
        names = new Set(workouts.map(w => w.name)),
        change = o => dispatch(Actions.program.workouts(o.map(w => w.value)));
    names.forEach(n => options.push({label: n, value: n}));
    return <Select multi options={options} value={formatValues(value)} onChange={change}/>
};


const connectProgram = connect((s, p) => {
    return {...s.root.program, ...p};
});

export class Program_ extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {activeTab: 1};
        if (props.match.params.id) {
            props.dispatch(Actions.program.edit(parseInt(props.match.params.id)));
        }
    }

    componentWillUpdate(oldProps) {
        let p = this.props.match.params;
        if (p.id != oldProps.match.params.id) this.props.dispatch(Actions.program.edit(parseInt(p.id)));
    }

    onSelect(k) {
        this.setState({activeTab: k})
    }

    setName(e) {
        return this.props.dispatch(Actions.program.name_(e.target.value));
    }

    setShared(e) {
        return this.props.dispatch(Actions.program.shared(e.target.value));
    }

    addWorkout() {
        return this.props.dispatch(Actions.program.workout.add())
    }

    setExercise(o = {value: null}) {
        return this.props.dispatch(Actions.program.exercise(o.value));
    }

    setNewExercise({value}) {
        return this.props.dispatch(Actions.program.newExercise(value));
    }

    setPercent(e) {
        return this.props.dispatch(Actions.program.percent(integer(e.target.value)));
    }

    setNewPercent(e) {
        return this.props.dispatch(Actions.program.newPercent(integer(e.target.value)));
    }

    setRepetitions(e) {
        return this.props.dispatch(Actions.program.repetitions(integer(e.target.value)));
    }

    setNewRepetitions(e) {
        return this.props.dispatch(Actions.program.newRepetitions(integer(e.target.value)));
    }

    setDayOffset(e) {
        return this.props.dispatch(Actions.program.dayOffset(integer(e.target.value)))
    }

    render() {
        let p = this.props,
            d = p.dispatch,
            workouts = p.program.workouts.sort((a, b) => a.day - b.day),
            add = () => d(Actions.program.workout.all.set()),
            copy = () => d(Actions.program.copy()),
            remove = () => d(Actions.program.workout.all.exercise.remove()),
            replace = () => d(Actions.program.workout.all.exercise.replace()),
            shift = () => d(Actions.program.workout.all.day()),
            del = () => {
                d(Actions.program.clear());
                d(Actions.del.program(p.program));
            },
            save = () => {
                let el: any = document.getElementById("new_name"),
                    name = el && el.value ? el.value : this.props.program.name,
                    program = {...p.program, tags: p.program.tags.join(","), name};
                if (this.state.activeTab == 1) delete program.id;
                d(Actions.add.program(program));
            };
        return (
            <Grid id="program-editor" fluid>
                <Form horizontal>
                    <Tabs activeKey={this.state.activeTab} onSelect={k => this.onSelect(k)} id="program-editor-tabs">
                        <Tab eventKey={1} title="Create a program">
                            <FormGroup>
                                <Col xs={2} componentClass={ControlLabel}>Name</Col>
                                <Col xs={10}>
                                    <FormControl value={p.program.name} placeholder="Enter a name for this program"
                                                 onChange={e => this.setName(e)}/>
                                </Col>
                            </FormGroup>
                        </Tab>
                        <Tab eventKey={2} title="Modify an existing program">
                            <FormGroup>
                                <Col xs={2} componentClass={ControlLabel}>Program</Col>
                                <Col xs={10}>
                                    <ProgramSelector value={p.program.name} tags={p.program.tags} dispatch={d}/>
                                    <HelpBlock>Results are filtered using any tags specified below</HelpBlock>
                                </Col>
                            </FormGroup>
                            {p.program.name.length > 0 &&
                            <FormGroup>
                                <Col xs={2} componentClass={ControlLabel}>Name</Col>
                                <Col xs={10}>
                                    <FormControl id="new_name" defaultValue={p.program.name}
                                                 placeholder="Enter a new name for this program"/>
                                </Col>
                            </FormGroup>}
                            {p.program.id &&
                            <FormGroup>
                                <Col xs={10} xsOffset={2}>
                                    <Button onClick={copy}>Edit a copy</Button>
                                </Col>
                            </FormGroup>}
                        </Tab>
                    </Tabs>
                    <FormGroup>
                        <Col xs={2} componentClass={ControlLabel}>Tags</Col>
                        <Col xs={10}>
                            <TagSelector dispatch={d} value={p.program.tags}/>
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col xs={2}/>
                        <Col xs={10}>
                            <Checkbox inline checked={p.program.shared}
                                      onChange={e => this.setShared(e)}>
                                Share this program
                            </Checkbox>
                        </Col>
                    </FormGroup>
                    <h3 className="page-header">Edit multiple workouts</h3>
                    <p>These tools allow you to change multiple workouts simultaneously. Each operation will be
                        performed on all workouts matching the names selected below.</p>
                    <FormGroup>
                        <Col xs={2} componentClass={ControlLabel}>Workouts</Col>
                        <Col xs={10}>
                            <WorkoutSelector dispatch={d} value={p.workout_names}
                                             workouts={p.program.workouts}/>
                        </Col>
                    </FormGroup>
                    <Tabs defaultActiveKey={1} id="workout-editor-tabs">
                        <Tab eventKey={1} title="Add a set">
                            <p>This will add the specified set to all selected workouts.</p>
                            <FormGroup>
                                <Col sm={2} componentClass={ControlLabel}>Exercise</Col>
                                <Col sm={4}>
                                    <StrengthExerciseSelectInput onChange={o => this.setExercise(o)}
                                                                 value={p.exercise}/>
                                </Col>
                                <Col sm={1} componentClass={ControlLabel}>Reps:</Col>
                                <Col sm={2}>
                                    <FormControl value={p.repetitions} onChange={e => this.setRepetitions(e)}/>
                                </Col>
                                <Col sm={1} componentClass={ControlLabel}>%1RM:</Col>
                                <Col sm={2}>
                                    <FormControl value={p.percent} onChange={e => this.setPercent(e)}/>
                                </Col>
                            </FormGroup>
                            <Row>
                                <Col xs={2} xsOffset={2}>
                                    <Button onClick={add}>Add set</Button>
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey={2} title="Remove an exercise">
                            <p>This will remove instances of the specified exercise in all selected workouts.</p>
                            <FormGroup>
                                <Col xs={2} componentClass={ControlLabel}>Exercise</Col>
                                <Col xs={10}><StrengthExerciseSelectInput onChange={o => this.setExercise(o)}
                                                                          value={p.exercise}/>
                                </Col>
                            </FormGroup>
                            <Row>
                                <Col xs={2} xsOffset={2}>
                                    <Button onClick={remove}>Remove exercise</Button>
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey={3} title="Replace sets">
                            <p>This will replace instances of the specified set with a new set in all
                                selected workouts. <em>For the old set</em>, if you specify an exercise but leave
                                repetitions and percentage blank, then all sets matching the given exercise will be
                                replaced. If you also specify repetitions or percentages, only sets with values
                                matching the ones you specify will be replaced. <em>For the new set</em>, if you
                                specify repetitions or a percentage, then those values will be used for replacement
                                sets. If you leave either value blank, the value of the old set will be retained.</p>
                            <Row>
                                <Col sm={4} xsOffset={2} componentClass={ControlLabel}>Exercise</Col>
                                <Col sm={3} componentClass={ControlLabel}>Repetitions</Col>
                                <Col sm={3} componentClass={ControlLabel}>%1RM</Col>
                            </Row>
                            <FormGroup>
                                <Col sm={2} componentClass={ControlLabel}>Old set</Col>
                                <Col sm={4}>
                                    <WorkoutStrengthExerciseSelectInput onChange={o => this.setExercise(o)}
                                                                        value={p.exercise} workouts={p.workout_names}
                                                                        program={p.program}/>
                                </Col>
                                <Col sm={3}>
                                    <FormControl value={p.repetitions} onChange={e => this.setRepetitions(e)}/>
                                </Col>
                                <Col sm={3}>
                                    <FormControl value={p.percent} onChange={e => this.setPercent(e)}/>
                                </Col>
                            </FormGroup>
                            <FormGroup>
                                <Col sm={2} componentClass={ControlLabel}>New set</Col>
                                <Col sm={4}>
                                    <StrengthExerciseSelectInput onChange={o => this.setNewExercise(o)}
                                                                 value={p.new_exercise}/>
                                </Col>
                                <Col sm={3}>
                                    <FormControl value={p.new_repetitions} onChange={e => this.setNewRepetitions(e)}/>
                                </Col>
                                <Col sm={3}>
                                    <FormControl value={p.new_percent} onChange={e => this.setNewPercent(e)}/>
                                </Col>
                            </FormGroup>
                            <Row>
                                <Col xs={2} xsOffset={2}>
                                    <Button onClick={replace}>Replace sets</Button>
                                </Col>
                            </Row>
                        </Tab>
                        <Tab eventKey={4} title="Shift day">
                            <p>This will shift the selected workouts forward (for positive numbers) or backwards
                                (for negative numbers) by the specified number of days. Use this if you want to change
                                the days of the week that certain workouts occur on.</p>
                            <FormGroup>
                                <Col xs={2} componentClass={ControlLabel}>Shift</Col>
                                <Col xs={10}>
                                    <FormControl type="number" placeholder="Days (+/-)" value={p.day_offset}
                                                 onChange={e => this.setDayOffset(e)}/>
                                </Col>
                            </FormGroup>
                            <Row>
                                <Col xs={2} xsOffset={2}>
                                    <Button onClick={shift}>Shift days</Button>
                                </Col>
                            </Row>
                        </Tab>
                    </Tabs>
                </Form>
                <div className="program-editor-workout-menu">
                    <Row>
                        <Col xs={4}><span className="program-editor-workout-menu-title">Workouts</span></Col>
                        <Col xs={8}>
                            <div className="pull-right">
                                {p.program.id && this.state.activeTab == 2 &&
                                <Button bsStyle="danger" onClick={del}>Delete program</Button>}
                                <ButtonGroup>
                                    <Button bsStyle="primary" onClick={e => this.addWorkout()}>Add workout</Button>
                                    <Button bsStyle="primary" onClick={save}>Save program</Button>
                                </ButtonGroup>
                            </div>
                        </Col>
                    </Row>
                </div>
                <PanelGroup>
                    {workouts.map((w, i) => <Workout key={w.id} dispatch={d} workout={w}/>)}
                </PanelGroup>
            </Grid>
        )
    }
}

export const Program = connectProgram(Program_);

class Workout extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {collapsed: true};
    }

    toggleCollapse() {
        this.setState({collapsed: !this.state.collapsed});
    }

    open() {
        this.setState({collapsed: false});
    }

    render() {
        let {workout, dispatch} = this.props,
            collapsed = this.state.collapsed,
            id = workout.id,
            notes = e => dispatch(Actions.program.workout.notes(id, e.target.value)),
            header = <WorkoutHeader dispatch={dispatch} workout={workout} parent={this}/>;
        return (
            <Panel>
                <TreeView collapsed={collapsed} nodeLabel={header} onClick={() => this.toggleCollapse()}>
                    <div className="program-editor-treeview-child">
                        <Form inline key={0}>
                            <FormGroup>
                                <ControlLabel>Notes:</ControlLabel>
                                <FormControl componentClass="textarea" placeholder="Enter any special instructions here"
                                             value={workout.notes || ""} onChange={notes}/>
                            </FormGroup>
                        </Form>
                    </div>
                    {workout.sets.map((s, i) => <WorkoutSet key={s.id} dispatch={dispatch} workout_id={id} set={s}/>)}
                </TreeView>
            </Panel>
        );
    }
}


const WorkoutHeader = ({workout, dispatch, parent}) => {
    let rename = e => dispatch(Actions.program.workout.name_(workout.id, e.target.value)),
        day = e => dispatch(Actions.program.workout.day(workout.id, integer(e.target.value))),
        add = e => parent.open() || dispatch(Actions.program.workout.sets.add(workout.id)),
        copy = e => dispatch(Actions.program.workout.copy(workout.id)),
        del = e => dispatch(Actions.program.workout.remove(workout.id));
    return (
        <div className="program-editor-workout-header">
            <Form inline>
                <ControlLabel onClick={() => parent.toggleCollapse()}>Name:</ControlLabel>
                <FormControl className="program-editor-workout-name" value={workout.name} placeholder="Workout name"
                             onChange={rename}/>
                <span className="program-editor-workout-day">
                    <ControlLabel onClick={() => parent.toggle()}>Day:</ControlLabel>
                    <FormControl value={workout.day} type="number"
                                 placeholder="Day" onChange={day}/>
                </span>
                <OverlayTrigger placement="top" overlay={<Tooltip id="add">Add set</Tooltip>}>
                    <Button bsStyle="link" onClick={add}>
                        <Glyphicon glyph="plus"/>
                    </Button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip id="copy">Copy workout</Tooltip>}>
                    <Button bsStyle="link" onClick={copy}>
                        <Glyphicon glyph="copy"/>
                    </Button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip id="delete">Delete workout</Tooltip>}>
                    <Button bsStyle="link" onClick={del}>
                        <Glyphicon glyph="remove"/>
                    </Button>
                </OverlayTrigger>
            </Form>
        </div>
    );
};

const WorkoutStrengthExerciseSelectInput = ({value, onChange, program, workouts}) => {
    let v = value ? {label: value, value: value} : null,
        exercises = new Set(),
        options = [];
    program.workouts.forEach(w => {
        if (workouts.indexOf(w.name) >= 0) {
            w.sets.forEach(s => {
                exercises.add(s.exercise);
            });
        }

    });
    exercises.forEach(e => options.push({label: e, value: e}));
    return <Select placeholder="Exercise..." onChange={onChange} value={v} autoload={false} openOnFocus={true}
                   options={options}/>;
};

const StrengthExerciseSelectInput = ({value, onChange}) => {
    let v = value ? {label: value, value: value} : null,
        loadOptions = input => Search.exercise.strength({query: input})
            .then(results => ({options: results}));
    return <Select.AsyncCreatable placeholder="Exercise..." onChange={onChange} value={v} autoload={false}
                                  openOnFocus={true} loadOptions={loadOptions}/>;
};

const WorkoutSet = ({set, workout_id, dispatch}: { set: IWorkoutSet, workout_id: number, dispatch: Function }) => {
    let sets = Actions.program.workout.sets,
        exercise = ({value}) => dispatch(sets.exercise(workout_id, set.id, value)),
        reps = e => dispatch(sets.repetitions(workout_id, set.id, integer(e.target.value))),
        percent = e => dispatch(sets.percent(workout_id, set.id, integer(e.target.value))),
        remove = e => dispatch(sets.remove(workout_id, set.id));
    return (
        <div className="program-editor-workout-set program-editor-treeview-child">
            <Form inline>
                <Row>
                    <div className="program-editor-workout-set-exercise">
                        <StrengthExerciseSelectInput value={set.exercise} onChange={exercise}/>
                    </div>
                    <div className="program-editor-workout-set-details">
                        <ControlLabel>Reps:</ControlLabel>
                        <FormControl type="number" placeholder="Reps" value={set.repetitions || ""}
                                     onChange={reps}/>
                        <ControlLabel>%1RM:</ControlLabel>
                        <FormControl type="number" placeholder="% 1RM" value={set.percent || ""}
                                     onChange={percent} step={0.1}/>
                        <Button bsStyle="link" onClick={remove}>
                            <Glyphicon glyph="remove"/>
                        </Button>
                    </div>
                </Row>
            </Form>
        </div>
    );
};