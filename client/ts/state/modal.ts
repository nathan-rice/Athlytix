import {
    IBodyfatMeasurement,
    ICalorieData,
    IDietPeriod,
    IEnduranceAchievement,
    IGirthMeasurement,
    IGoal,
    IStrengthAchievement,
    ITrainingPeriod,
    IUser,
    IWeightMeasurement
} from "../models";
import {autopopulate, branches} from "./common";

export interface IModalState {
    type: ModalType | null;
    data?: any;
}

// Enum was causing a strange bug...
export class ModalType {
    static StrengthAchievement = 1;
    static EnduranceAchievement = 2;
    static CalorieIntake = 3;
    static CalorieExpenditure = 4;
    static Girth = 5;
    static Bodyfat = 6;
    static Weight = 7;
    static Goal = 8;
    static User = 9;
    static DietPeriod = 10;
    static TrainingPeriod = 11;
    static Media = 12;
}

const
    openStrengthAchievementModal = `${branches.modal}:STRENGTH_ACHIEVEMENT`,
    openEnduranceAchievementModal = `${branches.modal}:ENDURANCE_ACHIEVEMENT`,
    openCalorieIntakeModal = `${branches.modal}:CALORIE_INTAKE`,
    openCalorieExpenditureModal = `${branches.modal}:CALORIE_EXPENDITURE`,
    openGirthModal = `${branches.modal}:GIRTH_MEASUREMENT`,
    openWeightModal = `${branches.modal}:WEIGHT`,
    openBodyfatModal = `${branches.modal}:BODYFAT`,
    openGoalModal = `${branches.modal}:GOAL`,
    openUserModal = `${branches.modal}:USER`,
    openDietPeriodModal = `${branches.modal}:DIET_PERIOD`,
    openTrainingPeriodModal = `${branches.modal}:TRAINING_PERIOD`,
    openMediaModal = `${branches.modal}:MEDIA`,
    closeModal = `${branches.modal}:CLOSE`;

export class ModalActions {
    public static close() {
        return {type: closeModal};
    }

    public static user(u?: IUser) {
        return (dispatch, getState) => dispatch({
            type: openUserModal,
            data: autopopulate(u, getState)
        })
    }

    public static goal(d?: IGoal) {
        return (dispatch, getState) => dispatch({
            type: openGoalModal,
            data: autopopulate(d, getState)
        })
    }

    public static media(url: string) {
        return dispatch => dispatch({type: openMediaModal, data: url})
    }

    public static achievement = class {

        public static strength(d?: IStrengthAchievement) {
            return (dispatch, getState) => dispatch({
                type: openStrengthAchievementModal,
                data: autopopulate(d, getState)
            })
        }

        public static endurance(d?: IEnduranceAchievement) {
            return (dispatch, getState) => dispatch({
                type: openEnduranceAchievementModal,
                data: autopopulate(d, getState)
            })
        }
    };

    public static measurement = class {
        public static weight(d?: IWeightMeasurement) {
            return (dispatch, getState) => dispatch({
                type: openWeightModal,
                data: autopopulate(d, getState)
            });
        }

        public static bodyfat(d?: IBodyfatMeasurement) {
            return (dispatch, getState) => dispatch({
                type: openBodyfatModal,
                data: autopopulate(d, getState)
            });
        }

        public static girth(d?: IGirthMeasurement) {
            return (dispatch, getState) => dispatch({
                type: openGirthModal,
                data: autopopulate(d, getState)
            });
        }
    };

    public static calorie = class {
        public static intake(d?: ICalorieData) {
            return (dispatch, getState) => dispatch({
                type: openCalorieIntakeModal,
                data: autopopulate(d, getState)
            });
        }

        public static expenditure(d?: ICalorieData) {
            return (dispatch, getState) => dispatch({
                type: openCalorieExpenditureModal,
                data: autopopulate(d, getState)
            });
        }
    };

    public static period = class {
        public static diet(p?: IDietPeriod) {
            return (dispatch, getState) => dispatch({
                type: openDietPeriodModal,
                data: autopopulate(p, getState)
            });
        }

        public static training(p?: ITrainingPeriod) {
            return (dispatch, getState) => dispatch({
                type: openTrainingPeriodModal,
                data: autopopulate(p, getState)
            });
        }
    }
}

export const modalReducer = (state: IModalState, action): IModalState => {
    switch (action.type) {
        case openStrengthAchievementModal:
            return {type: ModalType.StrengthAchievement, data: action.data};
        case openEnduranceAchievementModal:
            return {type: ModalType.EnduranceAchievement, data: action.data};
        case openCalorieIntakeModal:
            return {type: ModalType.CalorieIntake, data: action.data};
        case openCalorieExpenditureModal:
            return {type: ModalType.CalorieExpenditure, data: action.data};
        case openGirthModal:
            return {type: ModalType.Girth, data: action.data};
        case openBodyfatModal:
            return {type: ModalType.Bodyfat, data: action.data};
        case openGoalModal:
            return {type: ModalType.Goal, data: action.data};
        case openWeightModal:
            return {type: ModalType.Weight, data: action.data};
        case openDietPeriodModal:
            return {type: ModalType.DietPeriod, data: action.data};
        case openTrainingPeriodModal:
            return {type: ModalType.TrainingPeriod, data: action.data};
        case openUserModal:
            return {type: ModalType.User, data: action.data};
        case openMediaModal:
            return {type: ModalType.Media, data: action.data};
        case closeModal:
            return {type: null};
    }
};