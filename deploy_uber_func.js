import * as appwriteSdk from "node-appwrite";
import * as fs from "fs";
import path from "path";


let appwrite = new appwriteSdk.Client();

let functions = new appwriteSdk.Functions(appwrite);

appwrite
    .setEndpoint("https://appwrite.software-engineering.education/v1")
    .setProject(/* crity */ "6206644928ab8835c77f")
    .setKey("9c53639badcd8a4d4ec701c35e90fb21eeae4d2fe1bbf5469fd1126f4d41e96c06421eef598b60f831a7b976d3a2e0c7654eb652f8c1a73d18d9a483a07383e679b093020bdcb17606eeac05c43a7373c4374eb2f310076edd471e5be37688e761e3c4c4ab9cefa00219d00ff5f7ff6fb619845f3f990821d7fcf7041bc7969e")
;

let __dirname = path.resolve();
let archive = `${__dirname}/code.tar.gz`;

(async () => {
    let tag = await functions.createTag("uberFunc", "node index.js", fs.createReadStream(archive));
    await functions.updateTag("uberFunc", tag.$id);
    fs.unlinkSync(archive); 
})();
