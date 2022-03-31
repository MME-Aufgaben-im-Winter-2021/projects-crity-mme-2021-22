# Developer Intro

## Development Environment

After cloning the repository, open the directory in VS Code. Make sure you have the MME Extension Pack and the *most recent* LTS of **node.js** installed (not too long ago, the LTS did not support `package.lock.json` version 2. If this file shows up in your diffs after `npm install`, please update).

Now in the VS Code terminal, run: `> npm install`.
Make sure [the NPM scripts are showing](https://stackoverflow.com/questions/66943852/npm-scripts-not-shown-in-explorer-sidebar-how-to-shwo-them-again).

Before a development session, run the `devSession` script.

## Model/UI distinction

We're basically doing MVC, except we ditch the view/controller distinction. Instead we have:
- ... a **model**, contains the abstract application state and logic. In particular, this handles synchronization with the database. Classes have no prefix.
- ... a **UI**, drives the DOM. It updates the model and reacts to changes in the model. The **UI** classes mirror the hierarchical structure of the HTML. Classes start with `Ui***`.

The **UI** talks to the **model** by calling member functions. We've tried to avoid doing any significant amount of abstract logic inside the **UI**, except if the logic involves UI state.
The **model** talks to the **UI** by emitting change events. That way, we avoid circular call dependencies. This comes at the expense of more obtuse control flow :( Grepping for the event names might help.

## Source Tree (out of date)

|Directory|Description|
|--|--|
| `src/third` |3rd party libraries that we don't currently fetch from CDNs.|
| `src/common`|Code that is not related to a particular page.|
| `src/common/ui`|The UI code that can be shared.|
| `src/common/model`|The model code that can be shared.|
| `src/screen`|Every single "page" lives in a subdirectory of this directory.|
| `src/screen/xyz/ui`|The UI code that is specific to screen xyz.|
| `src/screen/xyz/ui/xyz.js`|The source file that gets included by `xyz.html`. At the bottom `UiXyzScreen` gets instantiated, which kicks off UI initialization.|
| `src/screen/xyz/model`|The model code that is specific to screen xyz.|
| `src/screen/xyz/model/data.js`|This defines a global instance of the `XyzData` singleton, called `data`. The constructor of this class handles all model-related initialization.|
