import * as express from "express";
import {
    auth,
    database as adminDb
} from "firebase-admin";

import {OK, INTERNAL_SERVER_ERROR} from "http-status";
import * as cors from "cors";

const app = express();
app.use(cors());

app.put("/users/:uid/crash", function (req, res) {
    const {uid} = req.params;

    Promise.resolve()
        .then(() => auth().getUser(uid))
        .then(() => Promise.all([
            loadTotal(),
            loadOwn(uid)
        ]))
        .then(([total, own]) => {
            const update: any = {};
            update[`total`] = total + 1;
            update[`users/${uid}`] = own + 1;

            return adminDb().ref("popTeamCrash").update(update);
        })
        .then(() => res.status(OK).send())
        .catch((err) => {
            console.error(err);
            res.status(INTERNAL_SERVER_ERROR).send(err.message);
        });
});

function loadTotal() {
    return adminDb().ref("popTeamCrash/total")
        .once("value")
        .then(snapshot => snapshot.val());
}

function loadOwn(uid: string) {
    return adminDb().ref(`popTeamCrash/users/${uid}`)
        .once("value")
        .then(snapshot => snapshot.val());
}

export default app;
