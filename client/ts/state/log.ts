import {Moment} from 'moment';
import * as Lockr from 'lockr';
import {branches, selectDate} from "./common";

export interface ILogState {
    days: { [key: number]: Object };
    selected: any;
    view: "day" | "week" | "month";
}

const
    setLogView = `${branches.log}:SET_VIEW`,
    selectLogRecord = `${branches.log}:SELECT_RECORD`;

export class LogActions {
    public static view(view) {
        return {type: setLogView, view}
    }

    public static period = class {
        public static previous(m?: Moment) {
            return (dispatch, getState) => {
                let r = getState().root,
                    date = m || r.selected_date,
                    newDate = date.clone().subtract(1, r.log.view);
                return dispatch({
                    type: selectDate,
                    date: newDate
                });
            }
        };

        public static next(m?: Moment) {
            return (dispatch, getState) => {
                let r = getState().root,
                    date = m || r.selected_date,
                    newDate = date.clone().add(1, r.log.view);
                return dispatch({
                    type: selectDate,
                    date: newDate
                });
            }
        }
    };
}

export const logReducer = (state: ILogState, action): ILogState => {
    switch (action.type) {
        case selectLogRecord:
            return {...state, selected: action.record};
        case setLogView:
            Lockr.set("log_view", action.view);
            return {...state, view: action.view};
        default:
            return state;
    }
};

export const getDefaultView = () => {
    let view = Lockr.get("log_view");
    if (view) return view;
    else if (window && window.innerWidth > 1200) return "month";
    else if (window && window.innerHeight > 800) return "week";
    else return "day";
};