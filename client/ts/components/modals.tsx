import * as React from 'react';
import {Modal, Button} from 'react-bootstrap';
import {connect} from 'react-redux';
import {reduxForm, Field} from 'redux-form';
import {Moment} from 'moment';
import * as moment from 'moment';
import {Actions} from '../state/actions';
import {ModalType} from '../state/modal';
import {IRootState} from '../state/root';
import {
    User, IDatedRecord, IStrengthAchievement, ICalorieData, IGirthMeasurement, IWeightMeasurement, IUser, CalorieIntake
} from '../models';
import {StrengthAchievementForm} from './forms/strength';
import {Math, Promise} from 'es6-shim';
import YouTube from 'react-youtube';
import InstagramEmbed from 'react-instagram-embed'
import {EnduranceAchievementForm} from "./forms/endurance";
import {UserForm} from "./forms/user";
import {GoalForm} from "./forms/goal";
import {WeightMeasurementForm} from "./forms/weight";
import {BodyfatMeasurementForm} from './forms/bodyfat';
import {GirthMeasurementForm} from "./forms/girth";
import {CalorieExpenditureForm} from './forms/expenditure';
import {CalorieIntakeForm, TabCalorieIntakeForm} from './forms/intake';
import {DietPeriodForm} from "./forms/dietperiod";
import {TrainingPeriodForm} from "./forms/trainingperiod";
import {xdate} from "../common";

const modalProps = {show: true, onHide: () => undefined};

const FormModal = props => {
    let {title, className, form, children, close, del, data} = props, buttons;
    if (data && data.id) {
        buttons = [
            <Button key={1} form={form} bsStyle="primary" type="submit">Update</Button>,
            <Button key={2} onClick={close}>Close</Button>,
        ];
        if (del) buttons.push(<Button key={3} onClick={del} bsStyle="danger">Delete</Button>)
    } else {
        buttons = [
            <Button key={1} form={form} bsStyle="primary" type="submit">Create</Button>,
            <Button key={2} onClick={close}>Close</Button>
        ]
    }
    return (
        <Modal dialogClassName={className} {...modalProps}>
            <Modal.Header>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {children}
                <Modal.Footer>
                    {buttons}
                </Modal.Footer>
            </Modal.Body>
        </Modal>
    );
};

interface IModalProps {
    data: IDatedRecord;
    dispatch: Function;
    user: User
}

const StrengthAchievementModal = ({data, dispatch}: IModalProps) => {
    let close = () => dispatch(Actions.modal.close()),
        create = (v: IStrengthAchievement) => dispatch(Actions.add.achievement.strength(v)).then(close),
        del = data.id && (() => dispatch(Actions.del.achievement.strength(data)).then(close)),
        title = data.id ? "Edit a strength achievement" : "Add a strength achievement";
    return (
        <FormModal
            title={title}
            className="form-modal"
            close={close}
            data={data}
            del={del}
            form="strength-achievement">
            <StrengthAchievementForm onSubmit={create} data={data}/>
        </FormModal>
    );
};

const EnduranceAchievementModal = ({data, dispatch}: IModalProps) => {
    let close = () => dispatch(Actions.modal.close()),
        del = data.id && (() => dispatch(Actions.del.achievement.endurance(data)).then(close)),
        create = ({hours = "0", minutes = "0", seconds = "0", ...v}) => {
            v.time = 3600 * parseInt(hours) + 60 * parseInt(minutes) + parseFloat(seconds);
            return dispatch(Actions.add.achievement.endurance(v)).then(close);
        },
        title = data.id ? "Edit an endurance achievement" : "Add an endurance achievement";
    return (
        <FormModal
            title={title}
            className="form-modal"
            close={close}
            data={data}
            del={del}
            form="endurance-achievement">
            <EnduranceAchievementForm onSubmit={create} data={data}/>
        </FormModal>
    );
};

const CalorieIntakeModal = ({data, user, dispatch}: IModalProps) => {
    let close = () => dispatch(Actions.modal.close()),
        del = data.id && (() => dispatch(Actions.del.calorie.intake(data)).then(close)),
        create = v => {
            if (v.activeTab == 2) {
                if (v.groupIntakes) {
                    let intake = new CalorieIntake({
                        name: v.groupName,
                        date: v.date,
                        value: 0,
                        amount: 0,
                        protein: 0,
                        carbohydrates: 0,
                        fiber: 0,
                        fat: 0,
                        details: v.details
                    });
                    v.intakes.forEach(i => {
                        intake.amount += i.amount;
                        intake.value += i.value;
                        intake.protein += i.protein;
                        intake.carbohydrates += i.carbohydrates;
                        intake.fiber += i.fiber;
                        intake.fat += i.fat;
                    });
                    dispatch(Actions.add.calorie.intake(intake)).then(close);
                }
                else {
                    let action = intake => {
                        let i = {...intake, date: v.date};
                        delete i.id;
                        return Actions.add.calorie.intake(i);
                    };
                    Promise.all(v.intakes.map(i => dispatch(action(i))))
                        .then(close);
                }
            }
            else {
                dispatch(Actions.add.calorie.intake(v)).then(close);
            }
        },
        title = data.id ? "Edit food eaten" : "Add food eaten",
        Form = data.id ? CalorieIntakeForm : TabCalorieIntakeForm;
    return (
        <FormModal
            title={title}
            className="form-modal"
            close={close}
            data={data}
            del={del}
            form="intake">
            <Form onSubmit={create} data={data}/>
        </FormModal>
    );
};

const CalorieExpenditureModal = ({data, dispatch}: IModalProps) => {
    let close = () => dispatch(Actions.modal.close()),
        del = data.id && (() => dispatch(Actions.del.calorie.expenditure(data)).then(close)),
        create = (v: ICalorieData) => dispatch(Actions.add.calorie.expenditure(v)).then(close),
        title = data.id ? "Edit exercise performed" : "Add exercise performed";
    return (
        <FormModal
            title={title}
            className="form-modal"
            close={close}
            data={data}
            del={del}
            form="expenditure">
            <CalorieExpenditureForm onSubmit={create} data={data}/>
        </FormModal>
    );
};

const GirthModal = ({data, dispatch}: IModalProps) => {
    let close = () => dispatch(Actions.modal.close()),
        del = data.id && (() => dispatch(Actions.del.measurement.girth(data)).then(close)),
        create = (v: IGirthMeasurement) => {
            return dispatch(Actions.add.measurement.girth(v)).then(close);
        },
        title = data.id ? "Edit a girth measurement" : "Add a girth measurement";
    return (
        <FormModal
            title={title}
            className="form-modal"
            close={close}
            data={data}
            del={del}
            form="girth-measurement">
            <GirthMeasurementForm onSubmit={create} data={data}/>
        </FormModal>
    );
};

const BodyfatModal = ({data, dispatch, user}: IModalProps) => {
    let userData: IUser = {id: data.user_id},
        title = data.id ? "Edit a bodyfat measurement" : "Add a bodyfat measurement",
        close = () => dispatch(Actions.modal.close()),
        del = () => dispatch(Actions.del.measurement.bodyfat(data)).then(close),
        create = ({gender, birthday, feet, inches = 0, ...v}) => {
            let bodyfat, measurement, action;
            if (feet) userData.height = parseInt(feet) * 12 + inches;
            if (birthday) userData.birthday = moment(birthday);
            if (gender) userData.gender = gender;

            measurement = {...v};

            if (v.measurement_type_id == 1 && !v.value) {
                let height = user.height || userData.height,
                    baseGirth = {user_id: v.user_id, date: v.date};
                dispatch(Actions.add.measurement.girth({...baseGirth, location: "Neck", value: v.neck}));
                if (user.gender == "male" || gender == "male") {
                    bodyfat = 86.010 * Math.log10(parseFloat(v.waist) - parseFloat(v.neck))
                        - 70.041 * Math.log10(height) + 36.76;
                    dispatch(Actions.add.measurement.girth({...baseGirth, location: "Waist", value: v.waist}));
                } else {
                    bodyfat = 163.205 * Math.log10(parseFloat(v.waist) + parseFloat(v.hips) - parseFloat(v.neck))
                        - 97.684 * Math.log10(height) - 78.387;
                    dispatch(Actions.add.measurement.girth({...baseGirth, location: "Hips", value: v.hips}));
                }
                measurement.value = bodyfat;

            }

            else if (v.measurement_type_id == 3 && !v.value) {
                let density, foldSum,
                    bd: Moment = user.birthday || userData.birthday as Moment,
                    age = moment.duration(moment.utc().valueOf() - bd.valueOf()).asYears();
                if (user.gender == "male" || gender == "male") {
                    foldSum = parseFloat(v.abdominal) + parseFloat(v.thigh) + parseFloat(v.pectoral);
                    density = 1.10938 - 0.0008267 * foldSum + 0.0000016 * Math.pow(foldSum, 2) - 0.0002574 * age;
                } else {
                    foldSum = parseFloat(v.triceps) + parseFloat(v.suprailiac) + parseFloat(v.thigh);
                    density = 1.0994921 - 0.0009929 * foldSum + 0.0000023 * Math.pow(foldSum, 2) - 0.0001392 * age;
                }
                bodyfat = 495 / density - 450;
                measurement.value = bodyfat;
            }

            action = Actions.add.measurement.bodyfat(measurement);

            if (feet || birthday || gender) {
                return dispatch(Actions.user.update(userData)).then(dispatch(action)).then(close);
            } else {
                return dispatch(action).then(close);
            }
        };
    return (
        <FormModal
            title={title}
            className="form-modal"
            close={close}
            data={data}
            del={del}
            form="bodyfat-measurement">
            <BodyfatMeasurementForm onSubmit={create} data={data}/>
        </FormModal>
    )
};

const WeightModal = ({data, dispatch}: IModalProps) => {
    let close = () => dispatch(Actions.modal.close()),
        del = () => dispatch(Actions.del.measurement.weight(data)).then(close),
        create = (v: IWeightMeasurement) => dispatch(Actions.add.measurement.weight(v)).then(close),
        title = data.id ? "Edit a weight measurement" : "Add a weight measurement";
    return (
        <FormModal
            title={title}
            className="form-modal"
            close={close}
            data={data}
            del={del}
            form="weight-measurement">
            <WeightMeasurementForm onSubmit={create} data={data}/>
        </FormModal>
    )
};

const GoalModal = ({data, dispatch}: IModalProps) => {
    let title = data.id ? "Edit a goal" : "Add a goal",
        close = () => dispatch(Actions.modal.close()),
        del = () => dispatch(Actions.del.goal(data)).then(close),
        create = (v: any) => {
            let {
                hours = "0", minutes = "0", seconds = "0", fixed = "distance", distance, distance_type_id, repetitions,
                exercise, location, ...g
            } = v, time;
            g.creation_date = xdate();
            if (v.goal_type_id == 3) {
                g.parameters = {repetitions, exercise};
            }
            else if (v.goal_type_id == 4) {
                time = 3600 * parseInt(hours) + 60 * parseInt(minutes) + parseFloat(seconds);
                if (fixed == "time") {
                    g.value = distance;
                    g.parameters = {time, fixed, distance_type_id, exercise};
                } else {
                    g.value = time;
                    g.parameters = {distance, fixed, distance_type_id, exercise};
                }
            }
            else if (v.goal_type_id == 5) {
                g.parameters = {location};
            }
            return dispatch(Actions.add.goal(g)).then(close);
        };
    return (
        <FormModal
            title={title}
            className="form-modal"
            close={close}
            data={data}
            del={del}
            form="goal">
            <GoalForm onSubmit={create} data={data}/>
        </FormModal>
    );
};

const UserModal = ({data, dispatch}) => {
    let close = () => dispatch(Actions.modal.close()),
        create = v => {
            let {feet, inches = "0", ...u} = v;
            if (feet) {
                u.height = parseInt(feet) * 12 + parseFloat(inches)
            }
            return dispatch(Actions.user.create(u)).then(close)
        },
        title = data.id ? "Edit a user" : "Add a user";
    // default public
    data.is_public = true;
    return (
        <FormModal
            title={title}
            className="form-modal"
            close={close}
            form="account_form">
            <UserForm onSubmit={create} user={data}/>
        </FormModal>
    );
};

const DietPeriodModal = ({data, dispatch}: IModalProps) => {
    let close = () => dispatch(Actions.modal.close()),
        del = () => dispatch(Actions.del.period.diet(data)).then(close),
        create = (v: IWeightMeasurement) => dispatch(Actions.add.period.diet(v)).then(close),
        title = data.id ? "Edit a diet period" : "Add a diet period";
    return (
        <FormModal
            title={title}
            className="form-modal"
            close={close}
            data={data}
            del={del}
            form="diet-period">
            <DietPeriodForm onSubmit={create} data={data}/>
        </FormModal>
    )
};

const TrainingPeriodModal = ({data, dispatch}: IModalProps) => {
    let close = () => dispatch(Actions.modal.close()),
        del = () => dispatch(Actions.del.period.training(data)).then(close),
        create = (v: IWeightMeasurement) => dispatch(Actions.add.period.training(v)).then(close),
        title = data.id ? "Edit a training period" : "Add a training period";
    return (
        <FormModal
            title={title}
            className="form-modal"
            close={close}
            data={data}
            del={del}
            form="training-period">
            <TrainingPeriodForm onSubmit={create} data={data}/>
        </FormModal>
    )
};

const getYoutubeVideoId = url => {
    let regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/,
        match = url.match(regExp);
    if (match && match[2].length == 11) {
        return match[2];
    }
};

const MediaModal = props => {
    let d: string = props.data,
        close = () => props.dispatch(Actions.modal.close()),
        body;
    if (d.search(/www\.youtube\.com|youtu\.be/) >= 0) {
        let videoId = getYoutubeVideoId(d);
        body = <YouTube videoId={videoId} opts={{width: 640}}/>;
    } else if (d.search(/instagram\.com|instagr\.am/)) {
        body = <InstagramEmbed url={d} maxWidth={640}/>;
    } else {
        body = <img src={d}/>;
    }
    return (
        <Modal dialogClassName="media-modal" {...modalProps}>
            <Modal.Header>
                <Modal.Title>Media</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {body}
                <Modal.Footer>
                    <Button key={1} onClick={close}>Close</Button>
                </Modal.Footer>
            </Modal.Body>
        </Modal>
    );
};

const connector = connect((state, props?: IModalContainerProps): IModalContainerProps => {
    let root: IRootState = state.root,
        user = root.selected_user_id && root.users[root.selected_user_id] || root.users[root.user_id];
    return {
        ...props,
        ...root.modal,
        user
    }
});

interface IModalContainerProps {
    type?: ModalType;
    data?: IDatedRecord;
    dispatch?: Function;
    user?: User;
}

export const ModalContainer = connector(props => {
    let {type, data, dispatch, user} = props;
    switch (type) {
        case ModalType.StrengthAchievement:
            return <StrengthAchievementModal data={data} user={user} dispatch={dispatch}/>;
        case ModalType.EnduranceAchievement:
            return <EnduranceAchievementModal data={data} user={user} dispatch={dispatch}/>;
        case ModalType.CalorieIntake:
            return <CalorieIntakeModal data={data} user={user} dispatch={dispatch}/>;
        case ModalType.CalorieExpenditure:
            return <CalorieExpenditureModal data={data} user={user} dispatch={dispatch}/>;
        case ModalType.Girth:
            return <GirthModal data={data} user={user} dispatch={dispatch}/>;
        case ModalType.Bodyfat:
            return <BodyfatModal data={data} user={user} dispatch={dispatch}/>;
        case ModalType.Weight:
            return <WeightModal data={data} user={user} dispatch={dispatch}/>;
        case ModalType.Goal:
            return <GoalModal data={data} user={user} dispatch={dispatch}/>;
        case ModalType.User:
            return <UserModal data={data} dispatch={dispatch}/>;
        case ModalType.DietPeriod:
            return <DietPeriodModal data={data} user={user} dispatch={dispatch}/>;
        case ModalType.TrainingPeriod:
            return <TrainingPeriodModal data={data} user={user} dispatch={dispatch}/>;
        case ModalType.Media:
            return <MediaModal data={data} user={user} dispatch={dispatch}/>;
        default:
            return null;
    }
});