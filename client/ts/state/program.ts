import * as jQuery from 'jquery';
import {branches} from "./common";
import {Program, WorkoutSet, IWorkoutSet} from "../models";
import {integer} from "../common";

export interface IProgramState {
    program: Program;
    workout_names: string[];
    exercise: string;
    new_exercise: string;
    repetitions: number | string;
    new_repetitions: number | string;
    percent: number | string;
    new_percent: number | string;
    day_offset: number | string;
}

const
    addWorkout = `${branches.program}:ADD_WORKOUT`,
    copyWorkout = `${branches.program}:COPY_WORKOUT`,
    removeWorkout = `${branches.program}:REMOVE_WORKOUT`,
    renameWorkout = `${branches.program}:RENAME_WORKOUT`,
    setWorkoutDay = `${branches.program}:WORKOUT_DAY`,
    setWorkoutNotes = `${branches.program}:WORKOUT_NOTES`,
    editProgram = `${branches.program}:EDIT`,
    copyProgram = `${branches.program}:COPY`,
    clearProgram = `${branches.program}:CLEAR`,
    addSet = `${branches.program}:ADD_SET`,
    removeSet = `${branches.program}:REMOVE_SET`,
    setExercise = `${branches.program}:SET_EXERCISE`,
    setRepetitions = `${branches.program}:SET_REPETITIONS`,
    setPercent = `${branches.program}:PERCENT`,
    setProgramName = `${branches.program}:PROGRAM_NAME`,
    setProgramTags = `${branches.program}:TAGS`,
    setProgramShared = `${branches.program}:SHARED`,
    programAllRemoveExercise = `${branches.program}:ALL_REMOVE`,
    programAllReplacSets = `${branches.program}:ALL_REPLACE`,
    allWorkoutNames = `${branches.program}:ALL_WORKOUT_NAME`,
    programAllAddSet = `${branches.program}:ALL_ADD_SET`,
    programAllShiftDay = `${branches.program}:ALL_SHIFT_DAY`,
    programExercise = `${branches.program}:PROGRAM_EXERCISE`,
    programNewExercise = `${branches.program}:PROGRAM_NEW_EXERCISE`,
    programPercent = `${branches.program}:PROGRAM_PERCENT`,
    programRepetitions = `${branches.program}:PROGRAM_REPETITIONS`,
    programNewPercent = `${branches.program}:PROGRAM_NEW_PERCENT`,
    programNewRepetitions = `${branches.program}:PROGRAM_NEW_REPETITIONS`,
    programDayOffset = `${branches.program}:PROGRAM_DAY_OFFSET`;


export class ProgramActions {
    public static edit(id) {
        return (dispatch, getState) => {
            let user_id = getState().root.user_id;
            return jQuery.ajax({
                url: `/api/program/${id}/`,
                type: 'GET',
                contentType: 'application/json'
            }).then(d => {
                if (d.program.user_id != user_id) delete d.program.id;
                return dispatch({type: editProgram, program: d.program})
            });
        }
    }

    public static copy() {
        return {type: copyProgram};
    }

    public static clear() {
        return {type: clearProgram};
    }

    public static exercise(exercise) {
        return {type: programExercise, exercise};
    }

    public static workouts(workout_names) {
        return {type: allWorkoutNames, workout_names}
    }

    public static newExercise(exercise) {
        return {type: programNewExercise, exercise}
    }

    public static repetitions(repetitions) {
        return {type: programRepetitions, repetitions};
    }

    public static newRepetitions(repetitions) {
        return {type: programNewRepetitions, repetitions};
    }

    public static percent(percent) {
        return {type: programPercent, percent};
    }

    public static newPercent(percent) {
        return {type: programNewPercent, percent};
    }

    public static dayOffset(day_offset) {
        return {type: programDayOffset, day_offset};
    }

    public static name_(name) {
        return {type: setProgramName, name}
    }

    public static tags(tags) {
        return {type: setProgramTags, tags}
    }

    public static shared(shared) {
        return {type: setProgramShared, shared};
    }

    public static workout = class {
        public static add() {
            return {type: addWorkout};
        }

        public static remove(id) {
            return {type: removeWorkout, id};
        }

        public static name_(id, name) {
            return {type: renameWorkout, id, name};
        }

        public static notes(id, notes) {
            return {type: setWorkoutNotes, id, notes};
        }

        public static day(id, day) {
            return {type: setWorkoutDay, id, day};
        }

        public static copy(id) {
            return {type: copyWorkout, id};
        }

        public static sets = class {
            public static add(workout_id, exercise?, repetitions?, percent?) {
                return {type: addSet, workout_id, exercise, repetitions, percent};
            }

            public static remove(workout_id, set_id) {
                return {type: removeSet, workout_id, set_id}
            }

            public static exercise(workout_id, set_id, exercise) {
                return {type: setExercise, workout_id, set_id, exercise}
            }

            public static repetitions(workout_id, set_id, repetitions) {
                return {type: setRepetitions, workout_id, set_id, repetitions};
            }

            public static percent(workout_id, set_id, percent) {
                return {type: setPercent, workout_id, set_id, percent};
            }
        };

        public static all = class {
            public static exercise = class {
                public static remove() {
                    return {type: programAllRemoveExercise}
                }

                public static replace() {
                    return {type: programAllReplacSets}
                }
            };

            public static set() {
                return {type: programAllAddSet}
            }

            public static day() {
                return {type: programAllShiftDay}
            }
        }
    };
}

function newWorkout(workouts, workout?) {
    let day, w;
    try {
        w = workouts.slice(-1)[0];
        if (workout) day = Math.max(workout.day + 7, w.day + 1);
        else day = w.day + 1;
        return {...w, ...workout, id: w.id + 1, day};
    } catch (e) {
        w = {name: "", id: 1, day: 1, sets: []};
        return {...w, ...workout};
    }
}

function newSet(workout, set: IWorkoutSet = {exercise: "", repetitions: "", percent: ""}) {
    try {
        let ls = workout.sets.slice(-1)[0],
            ns = {...ls};
        if (set.exercise) ns.exercise = set.exercise;
        if (set.repetitions) ns.repetitions = set.repetitions;
        if (set.percent) ns.percent = set.percent;
        return new WorkoutSet({...ns, id: ls.id + 1});
    } catch (e) {
        return new WorkoutSet({...set, id: 1});
    }
}

const replaceSet = (s, c, v) => {
    if (c.exercise && s.exercise != c.exercise) return s;
    else if (c.repetitions && s.repetitions != c.repetitions) return s;
    else if (c.percent && s.percent != c.percent) return s;
    else {
        let sNew = {...s};
        if (v.exercise) sNew.exercise = v.exercise;
        if (v.repetitions) sNew.repetitions = v.repetitions;
        if (v.percent) sNew.percent = v.percent;
        return sNew;
    }
};


export const programReducer = (s: IProgramState, a): IProgramState => {
    let program, workouts, workout;
    switch (a.type) {
        case editProgram:
            return {...s, program: new Program(a.program)};
        case copyProgram:
            return {...s, program: new Program({...s.program, id: null})};
        case clearProgram:
            return {...s, program: new Program({})};
        case allWorkoutNames:
            return {...s, workout_names: a.workout_names};
        case programExercise:
            return {...s, exercise: a.exercise};
        case programNewExercise:
            return {...s, new_exercise: a.exercise};
        case programPercent:
            return {...s, percent: a.percent};
        case programNewPercent:
            return {...s, new_percent: a.percent};
        case programRepetitions:
            return {...s, repetitions: a.repetitions};
        case programNewRepetitions:
            return {...s, new_repetitions: a.repetitions};
        case programDayOffset:
            return {...s, day_offset: a.day_offset};
        case setProgramName:
            return {...s, program: {...s.program, name: a.name}};
        case setProgramTags:
            return {...s, program: {...s.program, tags: a.tags}};
        case setProgramShared:
            return {...s, program: {...s.program, shared: a.shared}};
        case addWorkout:
            workouts = [...s.program.workouts, newWorkout(s.program.workouts)];
            return {...s, program: {...s.program, workouts}};
        case copyWorkout:
            try {
                workouts = s.program.workouts;
                workout = workouts.filter(w => w.id == a.id)[0];
                program = {...s.program, workouts: [...workouts, newWorkout(workouts, workout)]};
                return {...s, program}
            } catch (e) {
                return s;
            }
        case removeWorkout:
            workouts = s.program.workouts.filter(w => w.id != a.id);
            return {...s, program: {...s.program, workouts}};
        case renameWorkout:
            workouts = s.program.workouts.map(w => {
                if (w.id == a.id) return {...w, name: a.name};
                else return w;
            });
            return {...s, program: {...s.program, workouts}};
        case setWorkoutDay:
            workouts = s.program.workouts.map(w => {
                if (w.id == a.id) return {...w, day: a.day};
                else return w;
            });
            return {...s, program: {...s.program, workouts}};
        case setWorkoutNotes:
            workouts = s.program.workouts.map(w => {
                if (w.id == a.id) return {...w, notes: a.notes};
                else return w;
            });
            return {...s, program: {...s.program, workouts}};
        case addSet:
            workouts = s.program.workouts.map(w => {
                if (w.id == a.workout_id) {
                    return {...w, sets: [...w.sets, newSet(w)]}
                } else return w;
            });
            return {...s, program: {...s.program, workouts}};
        case removeSet:
            workouts = s.program.workouts.map(w => {
                if (w.id == a.workout_id) {
                    return {...w, sets: w.sets.filter(s => s.id != a.set_id)};
                } else return w;
            });
            return {...s, program: {...s.program, workouts}};
        case setExercise:
            workouts = s.program.workouts.map(w => {
                if (w.id == a.workout_id) {
                    let sets = w.sets.map(s => {
                        if (s.id == a.set_id) return {...s, exercise: a.exercise};
                        else return s;
                    });
                    return {...w, sets};
                } else return w;
            });
            return {...s, program: {...s.program, workouts}};
        case setRepetitions:
            workouts = s.program.workouts.map(w => {
                if (w.id == a.workout_id) {
                    let sets = w.sets.map(s => {
                        if (s.id == a.set_id) return {...s, repetitions: a.repetitions};
                        else return s;
                    });
                    return {...w, sets};
                } else return w;
            });
            return {...s, program: {...s.program, workouts}};
        case setPercent:
            workouts = s.program.workouts.map(w => {
                if (w.id == a.workout_id) {
                    let sets = w.sets.map(s => {
                        if (s.id == a.set_id) return {...s, percent: a.percent};
                        else return s;
                    });
                    return {...w, sets};
                } else return w;
            });
            return {...s, program: {...s.program, workouts}};
        case programAllRemoveExercise:
            workouts = s.program.workouts.map(w => {
                if (s.workout_names.indexOf(w.name) >= 0) {
                    let sets = w.sets.filter(set => set.exercise != s.exercise);
                    return {...w, sets}
                } else return w;
            });
            return {...s, program: {...s.program, workouts}};
        case programAllReplacSets:
            let newValues = {exercise: s.new_exercise, repetitions: s.new_repetitions, percent: s.new_percent};
            workouts = s.program.workouts.map(w => {
                if (s.workout_names.indexOf(w.name) >= 0) {
                    let sets = w.sets.map(set => {
                        return replaceSet(set, s, newValues);
                    });
                    return {...w, sets};
                } else return w;
            });
            return {...s, program: {...s.program, workouts}};
        case programAllAddSet:
            workouts = s.program.workouts.map(w => {
                if (s.workout_names.indexOf(w.name) >= 0) {
                    let exercise = s.exercise,
                        repetitions = integer(s.repetitions),
                        percent = integer(s.percent),
                        sets = [...w.sets, newSet(w, {exercise, repetitions, percent})];
                    return {...w, sets};
                } else return w;
            });
            return {...s, program: {...s.program, workouts}};
        case programAllShiftDay:
            workouts = s.program.workouts.map(w => {
                if (s.workout_names.indexOf(w.name) >= 0) {
                    return {...w, day: w.day + integer(s.day_offset)};
                } else return w;
            });
            return {...s, program: {...s.program, workouts}};
        default:
            return s;
    }
};

export const defaultProgramState = (): IProgramState => {
    return {
        program: new Program({name: "", tags: [], shared: false, workouts: []}),
        workout_names: [],
        exercise: "",
        new_exercise: "",
        repetitions: "",
        new_repetitions: "",
        percent: "",
        new_percent: "",
        day_offset: ""
    }
};