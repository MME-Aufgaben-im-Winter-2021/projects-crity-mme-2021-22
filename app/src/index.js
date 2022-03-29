// Crity web client, entry point: Webpack bundling starts here.
//
//
//         \ \   \ \   \ \                    (_) | |                / /   / /   / /
//          \ \   \ \   \ \       ___   _ __   _  | |_   _   _      / /   / /   / /
//           > >   > >   > >     / __| | '__| | | | __| | | | |    < <   < <   < <
//          / /   / /   / /     | (__  | |    | | | |_  | |_| |     \ \   \ \   \ \
//         /_/   /_/   /_/       \___| |_|    |_|  \__|  \__, |      \_\   \_\   \_\
//                                                        __/ |
//                                                       |___/
//
// Uni Regensburg, MME Abschlussprojekte WS 20/21.
//
// Team Crity (feedback loop):
//      - Lee-Ann Seegets
//      - Marcelo Mutzbauer
//      - Maximilian Schmerle
//      - Philipp Hohenthanner
//      - Selina Roos
//

// Causes Webpack to distribute and <link> the css file.
import "/app/resources/css/text_layer_builder.css";

// The screens rely on the navbar, so let's import this first.
import "./navbar/UiNavbar.js";

// UiScreens depend on the screenbar, so let's import this now
// to make dependencies clear, even though this is only needed
// farther down.
import { uiScreenSwapper } from "./screens/uiScreenSwapper.js";

// Will register all our screen URLs. The screen swapper and the navbar are agnostic to
// the concrete UiScreen implementations, so the UiScreens can make use of both without
// any circular dependencies. 
import "./screens/import-screens.js";

// And GO!!!
uiScreenSwapper.loadScreenFromUrl();
