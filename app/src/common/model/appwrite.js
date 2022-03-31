import { Appwrite } from "appwrite";

// The global singleton we use to communicate with the server.
var appwrite = new Appwrite();
appwrite
    .setEndpoint("https://appwrite.software-engineering.education/v1")
    .setProject(/* crity */ "6206644928ab8835c77f");

export {appwrite};