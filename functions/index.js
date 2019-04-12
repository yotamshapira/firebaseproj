// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

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
