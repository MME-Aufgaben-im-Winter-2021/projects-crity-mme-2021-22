// Use this for custom permission management.
//let userId = process.env.APPWRITE_FUNCTION_USER_ID;

//let response = { "foo": "bar", userId };
//console.log(JSON.stringify(response));

const sdk = require('node-appwrite');

// Init SDK
let client = new sdk.Client();

let database = new sdk.Database(client);

client
    .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your API Endpoint
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID) // Your project ID
    .setKey(process.env.APPWRITE_API_KEY) // Your secret API key
;

let promise = database.createDocument('comments', 'unique()', {
    text, author
});

promise.then(function (response) {
    console.log(response);
}, function (error) {
    console.log(error);
});
