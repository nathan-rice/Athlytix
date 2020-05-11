import {Moment} from 'moment';
import * as moment from 'moment';
import {string} from 'es6-shim';
import {xdate} from "./common";

export const bodyfatMeasurementTypes = {
    1: "Navy",
    2: "BIA",
    3: "Caliper",
    4: "DXA",
    5: "Bod Pod",
    6: "Hydro"
};

export const distanceTypes = {
    1: "Miles",
    2: "Kilometers",
    3: "Meters",
    4: "Feet",
    5: "Yards",
    6: "Steps"
};

export const goalTypes = {
    1: "Weight",
    2: "Bodyfat",
    3: "Strength",
    4: "Endurance",
    5: "Girth"
};

export const unitsInFeet = {
    1: 5280,
    2: 3280.84,
    3: 3.28084,
    4: 1,
    5: 3,
    6: 2.5
};

export const programTags = [
    {label: "Powerlifting", value: "Powerlifting"},
    {label: "Bodybuilding", value: "Bodybuilding"},
    {label: "Weightlifting", value: "Weightlifting"},
    {label: "Crossfit", value: "Crossfit"},
    {label: "Strongman", value: "Strongman"},
    {label: "Football", value: "Football"},
    {label: "Beginner", value: "Beginner"},
    {label: "Intermediate", value: "Intermediate"},
    {label: "Advanced", value: "Advanced"},
    {label: "Elite", value: "Elite"},
    {label: "Peaking", value: "Peaking"},
    {label: "Fitness", value: "Fitness"}
];


export interface IDatedRecord {
    id?: number;
    user_id?: number;
    date?: string | Moment;
}

export interface ICalorieData extends IDatedRecord {
    id?: number;
    user_id?: number;
    value?: number;
    date?: string | Moment;
    name?: string;
    details?: string | Object;
}

export interface ICalorieIntake extends ICalorieData {
    amount?: number;
    protein?: number;
    carbohydrates?: number;
    fat?: number;
    fiber?: number;
}

class CalorieData implements ICalorieData {
    id: number;
    user_id: number;
    date: Moment;
    name: string;
    value: number;
    details: Object;

    constructor(data: ICalorieData) {
        for (let k in data) {
            if (!data.hasOwnProperty(k)) continue;
            else if (k == "date") this.date = xdate(data[k]);
            else this[k] = data[k];
        }
    }
}

export class CalorieIntake extends CalorieData implements ICalorieIntake {
    amount: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;

    constructor(data: ICalorieIntake) {
        super(data);
    }
}

export interface ICalorieExpenditure extends ICalorieData {
    training_period_id?: number;
    workout_id?: number;
}

export class CalorieExpenditure extends CalorieData implements ICalorieExpenditure {
    training_period_id?: number;
    workout_id?: number;
}


export interface IGoal extends IDatedRecord {
    goal_type_id?: number;
    value?: number;
    parameters?: any;
}

export interface IStrengthGoalParameters {
    exercise: string;
    repetitions?: number;
}

export interface IEnduranceGoalParameters {
    exercise: string;
    distance?: number;
    distance_type_id?: number;
    time?: number;
}

export class Goal implements IGoal {
    id: number;
    goal_type_id: number;
    user_id: number;
    date: Moment;
    value: number;
    parameters: IStrengthGoalParameters | IEnduranceGoalParameters | {};

    constructor(goal: IGoal) {
        for (let k in goal) {
            if (!goal.hasOwnProperty(k)) continue;
            else if (k == "date") this.date = xdate(goal[k]);
            else if (typeof goal[k] === "string" && k == "parameters") this.parameters = JSON.parse(goal[k] as string);
            else this[k] = goal[k];
        }
    }
}

interface IExerciseAchievement extends IDatedRecord {
    exercise?: string;
}

export interface IStrengthAchievement extends IExerciseAchievement {
    weight?: number;
    repetitions?: number;
}

export class StrengthAchievement implements IStrengthAchievement {
    id: number;
    user_id: number;
    date: Moment;
    exercise: string;
    weight: number;
    repetitions: number;
    predicted_1rm: number;
    adjusted_score: number;

    constructor(achievement: IStrengthAchievement) {
        for (let k in achievement) {
            if (!achievement.hasOwnProperty(k)) continue;
            else if (k == "date") this.date = xdate(achievement[k]);
            else this[k] = achievement[k];
        }
    }
}

export interface IEnduranceAchievement extends IExerciseAchievement {
    distance?: number;
    distance_type_id?: number;
    fixed?: string | null;
    time?: number;
    average_heart_rate?: number;
}

export class EnduranceAchievement implements IEnduranceAchievement {
    id: number;
    user_id: number;
    date: Moment;
    exercise: string;
    distance: number;
    distance_type_id: number;
    fixed: "time" | "distance" | null;
    time: number;
    average_heart_rate: number;

    constructor(achievement: IEnduranceAchievement) {
        for (let k in achievement) {
            if (!achievement.hasOwnProperty(k)) continue;
            else if (k == "date") this.date = xdate(achievement[k]);
            else this[k] = achievement[k];
        }
    }

    pace() {
        let fps = this.distance * unitsInFeet[this.distance_type_id] / this.time;
        return 5280 / fps / 60;
    }
}

export interface IGirthMeasurement extends IDatedRecord {
    location?: string;
    value?: number;
}

export class GirthMeasurement implements IGirthMeasurement {
    id: number;
    user_id: number;
    date: Moment;
    location: string;
    value: number;

    constructor(measurement: IGirthMeasurement) {
        for (let k in measurement) {
            if (!measurement.hasOwnProperty(k)) continue;
            else if (k == "date") this.date = xdate(measurement[k]);
            else this[k] = measurement[k];
        }
    }
}

export interface IWeightMeasurement extends IDatedRecord {
    value?: number;
}

export class WeightMeasurement implements IWeightMeasurement {
    id: number;
    user_id: number;
    date: Moment;
    value: number;

    constructor(measurement: IWeightMeasurement) {
        for (let k in measurement) {
            if (!measurement.hasOwnProperty(k)) continue;
            else if (k == "date") this.date = xdate(measurement[k]);
            else this[k] = measurement[k];
        }
    }
}

export interface IBodyfatMeasurement extends IDatedRecord {
    value?: number;
    measurement_type_id?: number;
}

export class BodyfatMeasurement implements IBodyfatMeasurement {
    id: number;
    user_id: number;
    date: Moment;
    value: number;
    measurement_type_id: number;

    constructor(measurement: IBodyfatMeasurement) {
        for (let k in measurement) {
            if (!measurement.hasOwnProperty(k)) continue;
            else if (k == "date") this.date = xdate(measurement[k]);
            else this[k] = measurement[k];
        }
    }
}

export interface ITrainerRequest {
    id?: number;
    user_id?: number;
    trainer_id?: number;
    date?: string | Moment;
    message?: string;
    user_full_name?: string;
    trainer_full_name?: string;
}

export class TrainerRequest implements ITrainerRequest {
    id: number;
    user_id: number;
    trainer_id: number;
    date: Moment;

    constructor(request: ITrainerRequest) {
        for (let k in request) {
            if (!request.hasOwnProperty(k)) continue;
            else if (k == "date") this.date = xdate(request[k]);
            else this[k] = request[k];
        }
    }
}

export interface IUser {
    id?: number;
    email?: string;
    is_trainer?: boolean;
    is_premium?: boolean;
    is_public?: boolean;
    next_bill_date?: Moment | string;
    first_name?: string;
    last_name?: string;
    gender?: string;
    birthday?: Moment | string;
    age?: number;
    height?: number;
    city?: string;
    state?: string;
    country?: string;
    trainer_id?: number;
    layouts?: string | Object;
    clients?: IUser[];
    join_date?: Moment | string;
}

export class User implements IUser {
    id: number;
    email?: string;
    is_trainer: boolean;
    is_premium: boolean;
    is_public: boolean;
    next_bill_date?: Moment;
    first_name?: string;
    last_name?: string;
    gender?: string;
    birthday?: Moment;
    age?: number;
    city?: string;
    state?: string;
    country?: string;
    height?: number;
    trainer_id?: number;
    layouts?: Object;
    join_date: Moment;
    goals: { [key: number]: Goal };
    calorie_intakes: { [key: number]: CalorieData };
    calorie_expenditures: { [key: number]: CalorieData };
    strength_achievements: { [key: number]: StrengthAchievement };
    endurance_achievements: { [key: number]: EnduranceAchievement };
    weight_measurements: { [key: number]: WeightMeasurement };
    bodyfat_measurements: { [key: number]: BodyfatMeasurement };
    girth_measurements: { [key: number]: GirthMeasurement };
    diet_periods: {[key: number]: DietPeriod};
    training_periods: {[key: number]: TrainingPeriod};
    clients: User[];
    trainer_requests: { [key: number]: TrainerRequest };

    constructor(user: IUser | User) {
        this.goals = {};
        this.calorie_intakes = {};
        this.calorie_expenditures = {};
        this.strength_achievements = {};
        this.endurance_achievements = {};
        this.weight_measurements = {};
        this.girth_measurements = {};
        this.bodyfat_measurements = {};
        this.trainer_requests = {};
        this.diet_periods = {};
        this.training_periods = {};
        this.clients = [];
        for (let k in user) {
            if (!user.hasOwnProperty(k)) continue;
            if (k == "next_bill_date") this.next_bill_date = xdate(user[k]);
            else if (k == "birthday") this.birthday = xdate(user[k]);
            else if (k == "layouts" && typeof user[k] == "string") this.layouts = JSON.parse(user[k] as string);
            else if (k == "clients") this.clients = (user[k] as User[]).map(u => new User(u));
            else if (k == "join_date") this.join_date = xdate(user[k]);
            else if (typeof user[k] == "object") this[k] = {...user[k]};
            else this[k] = user[k];
        }
    }

    getAge() {
        if (this.birthday) {
            let time = moment_ => moment_.toDate().getTime();
            return moment.duration(time(moment.utc()) - time(this.birthday), 'milliseconds').years()
        }
    }

    heightInFeet() {
        return {} || {feet: Math.floor(this.height / 12), inches: this.height / 12}
    };

    lastWeight() {
        let values = o => Object.keys(o).map(k => o[k]),
            hasWeights = values(this.weight_measurements),
            reversed = (a, b) => b.date - a.date;
        return hasWeights && values(this.weight_measurements).sort(reversed)[0]
    }
}

export interface IStrengthLeaderboardEntry {
    first_name: string;
    last_name: string;
    user_id: number;
    achievement_id: number;
    adjusted_score: number;
    predicted_1rm: number;
    date: string | Moment;
    weight: number;
    repetitions: number;
}

export class StrengthLeaderboardEntry implements IStrengthLeaderboardEntry {
    first_name: string;
    last_name: string;
    user_id: number;
    achievement_id: number;
    adjusted_score: number;
    predicted_1rm: number;
    date: Moment;
    weight: number;
    repetitions: number;

    constructor(e: IStrengthLeaderboardEntry) {
        for (let k in e) {
            if (!e.hasOwnProperty(k)) continue;
            else if (k == "date") this.date = xdate(e[k]);
            else this[k] = e[k];
        }
    }
}

export interface IEnduranceLeaderboardEntry {
    first_name: string;
    last_name: string;
    user_id: number;
    achievement_id: number;
    exercise: string;
    date: string | Moment
    distance: number;
    distance_type_id: number;
    time: number;
}

export class EnduranceLeaderboardEntry implements IEnduranceLeaderboardEntry {
    first_name: string;
    last_name: string;
    user_id: number;
    achievement_id: number;
    exercise: string;
    date: Moment;
    distance: number;
    distance_type_id: number;
    time: number;

    constructor(e: IEnduranceLeaderboardEntry) {
        for (let k in e) {
            if (!e.hasOwnProperty(k)) continue;
            else if (k == "date") this.date = xdate(e[k]);
            else this[k] = e[k];
        }
    }
}

export interface IBodyfatLeaderboardEntry {
    first_name: string;
    last_name: string;
    user_id: number;
    measurement_id: number;
    measurement_type_id: number;
    date: string | Moment;
    value: number;
    picture: string;
}

export class BodyfatLeaderboardEntry {
    first_name: string;
    last_name: string;
    user_id: number;
    measurement_id: number;
    measurement_type_id: number;
    date: Moment;
    value: number;
    picture: string;

    constructor(m: IBodyfatLeaderboardEntry) {
        for (let k in m) {
            if (!m.hasOwnProperty(k)) continue;
            else if (k == "date") this.date = xdate(m[k]);
            else this[k] = m[k];
        }
    }
}

export interface IWeightLossLeaderboardEntry {
    beginning_weight?: number;
    ending_weight?: number;
    weight_loss?: number;
    before_picture?: string;
    after_picture?: string;
    user_id?: number;
    first_name?: string;
    last_name?: string;
}

export class WeightLossLeaderboardEntry implements IWeightLossLeaderboardEntry {
    beginning_weight: number;
    ending_weight: number;
    weight_loss: number;
    before_picture: string;
    after_picture: string;
    user_id: number;
    first_name: string;
    last_name: string;

    constructor(e: IWeightLossLeaderboardEntry) {
        for (let k in e) {
            if (!e.hasOwnProperty(k)) continue;
            else this[k] = e[k];
        }
    }
}

export interface IWeightGainLeaderboardEntry {
    beginning_weight?: number;
    ending_weight?: number;
    weight_gain?: number;
    before_picture?: string;
    after_picture?: string;
    user_id?: number;
    first_name?: string;
    last_name?: string;
}

export class WeightGainLeaderboardEntry implements IWeightGainLeaderboardEntry {
    beginning_weight: number;
    ending_weight: number;
    weight_gain: number;
    before_picture: string;
    after_picture: string;
    user_id: number;
    first_name: string;
    last_name: string;

    constructor(e: IWeightGainLeaderboardEntry) {
        for (let k in e) {
            if (!e.hasOwnProperty(k)) continue;
            else this[k] = e[k];
        }
    }
}

export interface IDietPeriod {
    id?: number;
    user_id?: number;
    start_date?: string | Moment;
    end_date?: string | Moment;
    example_date?: string | Moment;
    name?: string;
    details?: string;
}

export class DietPeriod implements IDietPeriod {
    id: number;
    user_id: number;
    start_date: Moment;
    end_date: Moment;
    example_date: Moment;
    name: string;
    details: string;

    constructor(p: IDietPeriod) {
        for (let k in p) {
            if (!p.hasOwnProperty(k)) continue;
            else if (k.match(/_date/) && p[k]) this[k] = xdate(p[k]);
            else this[k] = p[k];
        }
    }
}

export interface ITrainingPeriod {
    id?: number;
    user_id?: number;
    start_date?: string | Moment;
    end_date?: string | Moment;
    name?: string;
    details?: string;
    program?: IProgram;
}

export class TrainingPeriod implements ITrainingPeriod {
    id: number;
    user_id: number;
    start_date: Moment;
    end_date: Moment;
    name: string;
    details: string;
    program: Program;

    constructor(p: IDietPeriod) {
        for (let k in p) {
            if (!p.hasOwnProperty(k)) continue;
            else if (k.match(/_date/) && p[k]) this[k] = xdate(p[k]);
            else if (k == "program") this[k] = new Program(p[k]);
            else this[k] = p[k];
        }
    }
}

export interface IWorkoutSet {
    id?: number;
    exercise?: string;
    repetitions?: number | string;
    percent?: number | string;
}

export class WorkoutSet implements IWorkoutSet {
    id: number;
    exercise: string;
    repetitions: number | null;
    percent?: number | null;

    constructor(s: IWorkoutSet) {
        for (let k in s) {
            if (!s.hasOwnProperty(k)) continue;
            else if (k == "repetitions" && typeof s.repetitions == "string") this[k] = parseInt(s.repetitions) || null;
            else if (k == "percent" && typeof s.percent == "string") this[k] = parseInt(s.percent) || null;
            else this[k] = s[k];
        }
    }
}

export interface IWorkout {
    id?: number;
    name?: string;
    day?: number | string;
    sets?: IWorkoutSet[];
}

export class Workout implements IWorkout {
    id: number;
    name: string;
    day: number;
    sets: IWorkoutSet[];

    constructor(w: IWorkout) {
        this.sets = [];
        for (let k in w) {
            if (!w.hasOwnProperty(k)) continue;
            else if (k == "sets") this[k] = w.sets.map(s => new WorkoutSet(s));
            else if (k == "day" && typeof w.day == "string") this[k] = parseInt(w.day);
            else this[k] = w[k];
        }
    }
}

export interface IProgram {
    id?: number;
    user_id?: number;
    name?: string;
    tags?: string | string[];
    shared?: boolean;
    workouts?: IWorkout[];
}

export class Program implements IProgram {
    id: number;
    user_id: number;
    name: string;
    tags: string[];
    shared: boolean;
    workouts: Workout[];

    constructor(p: IProgram) {
        this.name = "";
        this.shared = false;
        this.workouts = [];
        this.tags = [];
        for (let k in p) {
            if (!p.hasOwnProperty(k)) continue;
            else if (k == "tags" && typeof p.tags == "string" && p.tags) this[k] = p.tags.split(",");
            else if (k == "workouts") this[k] = p[k].map(w => new Workout(w));
            else this[k] = p[k];
        }
    }
}