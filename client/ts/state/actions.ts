import {Moment} from "moment";
import {UserActions} from "./user";
import {LogActions} from "./log";
import {selectDate} from "./common";
import {ModalActions} from "./modal";
import {ListActions} from "./list";
import {AddActions} from "./add";
import {DelActions} from "./del";
import {EstimatesActions} from "./estimates";
import {LeaderboardActions} from "./leaderboard";
import {ProgramActions} from "./program";
import {WorkoutActions} from "./workout";

export class Actions {

    public static user = UserActions;

    public static log = LogActions;

    public static date = class {
        public static select(d: Moment) {
            return {
                type: selectDate,
                date: d
            }
        }
    };

    public static modal = ModalActions;

    public static list = ListActions;

    public static add = AddActions;

    public static del = DelActions;

    public static estimate = EstimatesActions;

    public static leaderboard = LeaderboardActions;

    public static program = ProgramActions;

    public static workout = WorkoutActions;
}