import * as React from 'react';
import {Switch, Route as DomRoute} from 'react-router-dom';
import {StrengthAchievements} from './views/achievements/strength';
import {EnduranceAchievements} from './views/achievements/endurance';
import {Dashboard} from './views/dashboard';
import {Goals} from './views/goals';
import {Log} from './views/log/main';
import {Account} from './views/account';
import {Clients} from "./views/clients";
import {Trainers} from "./views/trainers";
import {Girth} from "./views/measurements/girth";
import {Weight} from "./views/measurements/weight";
import {Bodyfat} from "./views/measurements/bodyfat";
import {StrengthLeaderboard} from "./views/leaderboard/strength";
import {EnduranceLeaderboard} from "./views/leaderboard/endurance";
import {BodyfatLeaderboard} from "./views/leaderboard/bodyfat";
import {WeightLossLeaderboard, WeightGainLeaderboard} from "./views/leaderboard/weight"
import {Diet} from "./views/diet";
import {BodyComposition} from "./views/bodycomposition";
import {Program} from './views/program';
import {Workout} from './views/workout';
import {Strength} from './views/strength';

// Workaround for editor error checking fail.
var Route: any = DomRoute;

export const Routes = () => {
    return (
        <Switch>
            <Route path="/" component={Log} exact/>
            <Route path="/program/" component={Program} exact/>
            <Route path="/program/:id/" component={Program} exact/>
            <Route path="/workout/:period_id/:workout_id/" component={Workout} exact/>
            <Route path="/strength/:user_id/" component={Strength}/>
            <Route path="/achievement/strength/:user_id/:exercise/" component={StrengthAchievements as any}/>
            <Route path="/achievement/endurance/:user_id/:exercise/:fixed/:value/" exact
                   component={EnduranceAchievements as any}/>
            <Route path="/achievement/endurance/:user_id/:exercise/" exact component={EnduranceAchievements as any}/>
            <Route path="/measurement/girth/:user_id/:location/" component={Girth as any}/>
            <Route path="/measurement/weight/:user_id/" component={Weight as any}/>
            <Route path="/measurement/bodyfat/:user_id/" component={Bodyfat as any}/>
            <Route path="/leaderboard/strength/" exact component={StrengthLeaderboard as any}/>
            <Route path="/leaderboard/strength/:exercise/:gender/" exact component={StrengthLeaderboard as any}/>
            <Route path="/leaderboard/strength/:exercise/:gender/:country/" exact
                   component={StrengthLeaderboard as any}/>
            <Route path="/leaderboard/strength/:exercise/:gender/:country/:state/" exact
                   component={StrengthLeaderboard as any}/>
            <Route path="/leaderboard/strength/:exercise/:gender/:country/:state/:city/" exact
                   component={StrengthLeaderboard as any}/>
            <Route path="/leaderboard/endurance/" exact component={EnduranceLeaderboard as any}/>
            <Route path="/leaderboard/endurance/:exercise/:fixed/:value/:gender/" exact
                   component={EnduranceLeaderboard as any}/>
            <Route path="/leaderboard/endurance/:exercise/:fixed/:value/:gender/:country/" exact
                   component={EnduranceLeaderboard as any}/>
            <Route path="/leaderboard/endurance/:exercise/:fixed/:value/:gender/:country/:state/" exact
                   component={EnduranceLeaderboard as any}/>
            <Route path="/leaderboard/endurance/:exercise/:fixed/:value/:gender/:country/:state/:city/" exact
                   component={EnduranceLeaderboard as any}/>
            <Route path="/leaderboard/bodyfat/" exact component={BodyfatLeaderboard as any}/>
            <Route path="/leaderboard/bodyfat/:gender/" exact component={BodyfatLeaderboard as any}/>
            <Route path="/leaderboard/bodyfat/:gender/:country/" exact
                   component={BodyfatLeaderboard as any}/>
            <Route path="/leaderboard/bodyfat/:gender/:country/:state/" exact
                   component={BodyfatLeaderboard as any}/>
            <Route path="/leaderboard/bodyfat/:gender/:country/:state/:city/" exact
                   component={BodyfatLeaderboard as any}/>
            <Route path="/leaderboard/weight_loss/" exact component={WeightLossLeaderboard as any}/>
            <Route path="/leaderboard/weight_loss/:gender/" exact component={WeightLossLeaderboard as any}/>
            <Route path="/leaderboard/weight_loss/:gender/:country/" exact
                   component={WeightLossLeaderboard as any}/>
            <Route path="/leaderboard/weight_loss/:gender/:country/:state/" exact
                   component={WeightLossLeaderboard as any}/>
            <Route path="/leaderboard/weight_loss/:gender/:country/:state/:city/" exact
                   component={WeightLossLeaderboard as any}/>
            <Route path="/leaderboard/weight_gain/" exact component={WeightGainLeaderboard as any}/>
            <Route path="/leaderboard/weight_gain/:gender/" exact component={WeightGainLeaderboard as any}/>
            <Route path="/leaderboard/weight_gain/:gender/:country/" exact
                   component={WeightGainLeaderboard as any}/>
            <Route path="/leaderboard/weight_gain/:gender/:country/:state/" exact
                   component={WeightGainLeaderboard as any}/>
            <Route path="/leaderboard/weight_gain/:gender/:country/:state/:city/" exact
                   component={WeightGainLeaderboard as any}/>
            <Route path="/diet/:user_id/" component={Diet}/>
            <Route path="/body_composition/:user_id/" component={BodyComposition}/>
            <Route path="/dashboard/" component={Dashboard}/>
            <Route path="/goals/" component={Goals}/>
            <Route path="/log/" component={Log as any}/>
            <Route path="/user/:user_id/" component={Account as any}/>
            <Route path="/clients/" component={Clients as any}/>
            <Route path="/trainers/" component={Trainers as any}/>
        </Switch>
    )
};