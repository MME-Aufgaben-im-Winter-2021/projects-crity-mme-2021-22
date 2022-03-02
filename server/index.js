// Use this for custom permission management.
let userId = process.env.APPWRITE_FUNCTION_USER_ID;

let response = { "foo": "bar", userId };
console.log(JSON.stringify(response));
