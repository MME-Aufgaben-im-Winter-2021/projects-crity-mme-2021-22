/* eslint-env node */

import "dotenv/config";
import express from "express";
import open from "open";

function init() {
    let app = express();
    app.use("/", express.static("dist"));
    app.listen(process.env.DEV_PORT, function() {
        console.log("Server started. Opening application in browser ... [Press CTRL + C to stop server]");
        open(`http://localhost:${process.env.DEV_PORT}/index.html`);
    });
}

// Wait for the build process to finish.
setTimeout(() => init(), 1000);