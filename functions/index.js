// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

// Node E-Mailer is used for sending E-Mails
const nodemailer = require('nodemailer');

const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;

const mailTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: gmailEmail,
        pass: gmailPassword,
    },
});

/**
 * Creates a user in Firebase. Request has 2 parameters
 * @param email mail address of the new user
 * @param password of the new user
 * Responds with a HTTP status code 201 if created the user
 * Responds with a HTTP status code 500 if could not create the user (for any reason)
 */
exports.createUser = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    const email = req.query.email;
    const password = req.query.password;
    admin.auth().createUser({
        email: email,
        password: password
    })
    .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        console.log('Successfully created new user:', userRecord.uid);
        return res.status(201).send('Successfully created new user');
    })
    .catch((error) => {
        console.log('Error creating new user:', error);
        return res.status(500).send(`Error creating new user: ${error}`);
    });
});

/**
 * Function that gets triggered when a new Authentication user is created
 * and:
 * 1. Sends a simple welcome email
 * 2. Saves to Firebase Firestore the creation time in the following format:
 * Users: { key: createdAt, Value: creation time}
 */
exports.handleNewUser = functions.auth.user().onCreate((user) => {

    const email = user.email; // The email of the user.

    addToFirestore(email);
    return sendWelcomeEmail(email);
});

function addToFirestore(email) {
    var db = admin.firestore();
    var docRef = db.collection('users').doc(email);

    var date = new Date();
    var timestamp = date.getTime();

    var set = docRef.set({
        "createdAt": timestamp
    });
}

/**
 * Sends a welcome email to the given user
 */
async function sendWelcomeEmail(email) {
    let opts = {
        to: email,
        subject: 'Welcome to my Firebase app'
    };

    // The user subscribed to the newsletter.
    await mailTransport.sendMail(opts);
    console.log('New welcome email sent to:', email);
    return null;
}
