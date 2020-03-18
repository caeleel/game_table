/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/code.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/code.ts":
/*!*********************!*\
  !*** ./src/code.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

function main() {
    figma.showUI(__html__, { width: 400, height: 400 });
    const selection = figma.currentPage.selection;
    if (selection.length !== 1) {
        figma.notify("Select exactly 1 frame to start game");
        figma.closePlugin();
        return;
    }
    if (selection[0].type !== "FRAME") {
        figma.notify("Must select a frame node");
        figma.closePlugin();
        return;
    }
    const PLAYER_PREFIX = "Player: ";
    const HIDE_OFFSET = 20000;
    const MARGIN = 100;
    const pageNodes = {};
    const playerFrames = {};
    let assetNode = null;
    const game = selection[0];
    game.setRelaunchData({ players: "Click on a player to get a link for their secret hand info" });
    let players = new Set();
    for (const node of game.children) {
        if (node.type === "COMPONENT" && node.name === "assets") {
            assetNode = node;
            game.insertChild(game.children.length - 1, node);
        }
    }
    for (const page of figma.root.children) {
        if (page.name.substring(0, PLAYER_PREFIX.length) === PLAYER_PREFIX) {
            pageNodes[page.name] = page;
        }
        else if (page.name === "Assets" && assetNode === null) {
            assetNode = figma.createComponent();
            assetNode.name = "assets";
            game.appendChild(assetNode);
            const prevHidden = game.getPluginData("hiddenNode");
            if (prevHidden !== "") {
                figma.getNodeById(prevHidden).remove();
            }
            const hiddenFrame = figma.createFrame();
            hiddenFrame.name = "hidden-data";
            hiddenFrame.visible = false;
            hiddenFrame.locked = true;
            game.setPluginData("hiddenNode", hiddenFrame.id);
            let xOffset = MARGIN;
            for (const frame of page.children) {
                if (frame.type !== "FRAME")
                    continue;
                let back = null;
                let yOffset = MARGIN;
                for (const child of frame.children) {
                    if (back === null) {
                        back = child;
                    }
                    else if (child.type === "COMPONENT") {
                        continue;
                    }
                    else {
                        const widget = figma.createComponent();
                        const backClone = back.clone();
                        backClone.x = 0;
                        backClone.y = 0;
                        backClone.locked = true;
                        widget.name = frame.name;
                        widget.clipsContent = false;
                        hiddenFrame.appendChild(widget);
                        widget.appendChild(backClone);
                        const clone = child.clone();
                        widget.appendChild(clone);
                        clone.x = 0;
                        clone.y = HIDE_OFFSET;
                        clone.locked = true;
                        widget.resize(clone.width, clone.height);
                        widget.setRelaunchData({
                            shuffle: '',
                            gather: '',
                            flip: '',
                        });
                        const instance = widget.createInstance();
                        instance.setPluginData("assetNode", assetNode.id);
                        assetNode.appendChild(instance);
                        instance.x = xOffset;
                        instance.y = yOffset;
                        yOffset--;
                    }
                }
                xOffset += 20 + frame.width;
            }
        }
    }
    assetNode.resize(game.width, game.height + HIDE_OFFSET);
    assetNode.x = 0;
    assetNode.y = 0;
    for (const node of game.children) {
        if (["COMPONENT", "INSTANCE", "FRAME", "RECTANGLE"].indexOf(node.type) >= 0 &&
            node.name.substring(0, PLAYER_PREFIX.length) == PLAYER_PREFIX) {
            const name = node.name.substring(PLAYER_PREFIX.length);
            if (players.has(name)) {
                figma.notify("Player names must be unique");
                figma.closePlugin();
                return;
            }
            let playerPage = pageNodes[node.name];
            if (!playerPage) {
                playerPage = figma.createPage();
                playerPage.name = node.name;
            }
            let viewerFrame = null;
            for (const node of playerPage.children) {
                if (node.type === "FRAME" && node.name === "viewer") {
                    viewerFrame = node;
                }
                else {
                    node.remove();
                }
            }
            if (viewerFrame === null) {
                viewerFrame = figma.createFrame();
                playerPage.appendChild(viewerFrame);
                viewerFrame.name = "viewer";
            }
            playerFrames[name] = viewerFrame.id;
            viewerFrame.resize(node.width, node.height);
            let periscope = null;
            for (const child of viewerFrame.children) {
                if (child.type === "INSTANCE" && child.name === "periscope" && child.masterComponent === assetNode) {
                    periscope = child;
                }
                else {
                    child.remove();
                }
            }
            if (periscope === null) {
                periscope = assetNode.createInstance();
                viewerFrame.appendChild(periscope);
            }
            periscope.x = assetNode.x - node.x;
            periscope.y = assetNode.y - node.y - HIDE_OFFSET;
        }
    }
    const url = figma.root.getPluginData("url");
    if (url !== null) {
        figma.ui.postMessage({ type: "setURL", url });
    }
    figma.ui.postMessage({ type: "playerFrames", playerFrames });
    figma.ui.onmessage = msg => {
        if (msg.type === "setURL") {
            figma.root.setPluginData("url", msg.url);
        }
    };
}
function turnFaceDown(node) {
    if (node.type === "INSTANCE") {
        const master = node.masterComponent;
        if (master.children.length === 3) {
            master.children[2].remove();
        }
    }
}
function shuffle() {
    const toShuffle = figma.currentPage.selection.map((node) => node.id);
    if (toShuffle.length === 0)
        return;
    const node = figma.getNodeById(toShuffle[0]);
    const parent = node.parent;
    let xPos = node.x;
    let yPos = node.y;
    for (let i = 0; i < toShuffle.length; i++) {
        const idx = Math.floor(Math.random() * (toShuffle.length - i)) + i;
        const target = figma.getNodeById(toShuffle[idx]);
        turnFaceDown(target);
        target.x = xPos;
        target.y = yPos;
        yPos--;
        parent.insertChild(i, target);
        const tmp = toShuffle[idx];
        toShuffle[idx] = toShuffle[i];
        toShuffle[i] = tmp;
    }
    figma.notify("Finished shuffling");
    figma.closePlugin();
}
function gather() {
    const toGather = figma.currentPage.selection;
    if (toGather.length !== 1) {
        figma.notify("Select a single item to gather");
        return;
    }
    const target = toGather[0];
    const targetName = target.name;
    const assetNodeID = target.getPluginData("assetNode");
    if (assetNodeID === "")
        return;
    const assetNode = figma.getNodeById(assetNodeID);
    if (assetNode.removed)
        return;
    if (assetNode.type !== "COMPONENT")
        return;
    let xPos = target.x;
    let yPos = target.y;
    const children = assetNode.children;
    const gathered = [];
    for (const candidate of children) {
        if (candidate.name === targetName) {
            gathered.push(candidate);
            turnFaceDown(candidate);
            candidate.x = xPos;
            candidate.y = yPos;
            yPos--;
        }
    }
    figma.currentPage.selection = gathered;
    figma.closePlugin();
}
function flip() {
    const selected = figma.currentPage.selection;
    for (let node of selected) {
        if (node.type !== "INSTANCE")
            continue;
        node = node.masterComponent;
        if (node.children.length === 2) {
            const clone = node.children[1].clone();
            node.appendChild(clone);
            clone.y = 0;
        }
        else if (node.children.length === 3) {
            node.children[2].remove();
        }
    }
    figma.closePlugin();
}
if (figma.command === "shuffle")
    shuffle();
else if (figma.command === "flip")
    flip();
else if (figma.command === "gather")
    gather();
else
    main();


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0EsNEJBQTRCLDBCQUEwQjtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsd0VBQXdFO0FBQ2xHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixzQkFBc0I7QUFDcEQ7QUFDQSwwQkFBMEIscUNBQXFDO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHNCQUFzQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImNvZGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9jb2RlLnRzXCIpO1xuIiwiZnVuY3Rpb24gbWFpbigpIHtcbiAgICBmaWdtYS5zaG93VUkoX19odG1sX18sIHsgd2lkdGg6IDQwMCwgaGVpZ2h0OiA0MDAgfSk7XG4gICAgY29uc3Qgc2VsZWN0aW9uID0gZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uO1xuICAgIGlmIChzZWxlY3Rpb24ubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIlNlbGVjdCBleGFjdGx5IDEgZnJhbWUgdG8gc3RhcnQgZ2FtZVwiKTtcbiAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoc2VsZWN0aW9uWzBdLnR5cGUgIT09IFwiRlJBTUVcIikge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJNdXN0IHNlbGVjdCBhIGZyYW1lIG5vZGVcIik7XG4gICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgUExBWUVSX1BSRUZJWCA9IFwiUGxheWVyOiBcIjtcbiAgICBjb25zdCBISURFX09GRlNFVCA9IDIwMDAwO1xuICAgIGNvbnN0IE1BUkdJTiA9IDEwMDtcbiAgICBjb25zdCBwYWdlTm9kZXMgPSB7fTtcbiAgICBjb25zdCBwbGF5ZXJGcmFtZXMgPSB7fTtcbiAgICBsZXQgYXNzZXROb2RlID0gbnVsbDtcbiAgICBjb25zdCBnYW1lID0gc2VsZWN0aW9uWzBdO1xuICAgIGdhbWUuc2V0UmVsYXVuY2hEYXRhKHsgcGxheWVyczogXCJDbGljayBvbiBhIHBsYXllciB0byBnZXQgYSBsaW5rIGZvciB0aGVpciBzZWNyZXQgaGFuZCBpbmZvXCIgfSk7XG4gICAgbGV0IHBsYXllcnMgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIGdhbWUuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKG5vZGUudHlwZSA9PT0gXCJDT01QT05FTlRcIiAmJiBub2RlLm5hbWUgPT09IFwiYXNzZXRzXCIpIHtcbiAgICAgICAgICAgIGFzc2V0Tm9kZSA9IG5vZGU7XG4gICAgICAgICAgICBnYW1lLmluc2VydENoaWxkKGdhbWUuY2hpbGRyZW4ubGVuZ3RoIC0gMSwgbm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBwYWdlIG9mIGZpZ21hLnJvb3QuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKHBhZ2UubmFtZS5zdWJzdHJpbmcoMCwgUExBWUVSX1BSRUZJWC5sZW5ndGgpID09PSBQTEFZRVJfUFJFRklYKSB7XG4gICAgICAgICAgICBwYWdlTm9kZXNbcGFnZS5uYW1lXSA9IHBhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocGFnZS5uYW1lID09PSBcIkFzc2V0c1wiICYmIGFzc2V0Tm9kZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgYXNzZXROb2RlID0gZmlnbWEuY3JlYXRlQ29tcG9uZW50KCk7XG4gICAgICAgICAgICBhc3NldE5vZGUubmFtZSA9IFwiYXNzZXRzXCI7XG4gICAgICAgICAgICBnYW1lLmFwcGVuZENoaWxkKGFzc2V0Tm9kZSk7XG4gICAgICAgICAgICBjb25zdCBwcmV2SGlkZGVuID0gZ2FtZS5nZXRQbHVnaW5EYXRhKFwiaGlkZGVuTm9kZVwiKTtcbiAgICAgICAgICAgIGlmIChwcmV2SGlkZGVuICE9PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgZmlnbWEuZ2V0Tm9kZUJ5SWQocHJldkhpZGRlbikucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBoaWRkZW5GcmFtZSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XG4gICAgICAgICAgICBoaWRkZW5GcmFtZS5uYW1lID0gXCJoaWRkZW4tZGF0YVwiO1xuICAgICAgICAgICAgaGlkZGVuRnJhbWUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgaGlkZGVuRnJhbWUubG9ja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGdhbWUuc2V0UGx1Z2luRGF0YShcImhpZGRlbk5vZGVcIiwgaGlkZGVuRnJhbWUuaWQpO1xuICAgICAgICAgICAgbGV0IHhPZmZzZXQgPSBNQVJHSU47XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZyYW1lIG9mIHBhZ2UuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoZnJhbWUudHlwZSAhPT0gXCJGUkFNRVwiKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBsZXQgYmFjayA9IG51bGw7XG4gICAgICAgICAgICAgICAgbGV0IHlPZmZzZXQgPSBNQVJHSU47XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBmcmFtZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFjayA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFjayA9IGNoaWxkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkLnR5cGUgPT09IFwiQ09NUE9ORU5UXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2lkZ2V0ID0gZmlnbWEuY3JlYXRlQ29tcG9uZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBiYWNrQ2xvbmUgPSBiYWNrLmNsb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrQ2xvbmUueCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrQ2xvbmUueSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrQ2xvbmUubG9ja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldC5uYW1lID0gZnJhbWUubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldC5jbGlwc0NvbnRlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZGRlbkZyYW1lLmFwcGVuZENoaWxkKHdpZGdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQuYXBwZW5kQ2hpbGQoYmFja0Nsb25lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb25lID0gY2hpbGQuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldC5hcHBlbmRDaGlsZChjbG9uZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9uZS54ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lLnkgPSBISURFX09GRlNFVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lLmxvY2tlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQucmVzaXplKGNsb25lLndpZHRoLCBjbG9uZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0LnNldFJlbGF1bmNoRGF0YSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2h1ZmZsZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2F0aGVyOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbGlwOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5zdGFuY2UgPSB3aWRnZXQuY3JlYXRlSW5zdGFuY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLnNldFBsdWdpbkRhdGEoXCJhc3NldE5vZGVcIiwgYXNzZXROb2RlLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0Tm9kZS5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS54ID0geE9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLnkgPSB5T2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgeU9mZnNldC0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHhPZmZzZXQgKz0gMjAgKyBmcmFtZS53aWR0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3NldE5vZGUucmVzaXplKGdhbWUud2lkdGgsIGdhbWUuaGVpZ2h0ICsgSElERV9PRkZTRVQpO1xuICAgIGFzc2V0Tm9kZS54ID0gMDtcbiAgICBhc3NldE5vZGUueSA9IDA7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIGdhbWUuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKFtcIkNPTVBPTkVOVFwiLCBcIklOU1RBTkNFXCIsIFwiRlJBTUVcIiwgXCJSRUNUQU5HTEVcIl0uaW5kZXhPZihub2RlLnR5cGUpID49IDAgJiZcbiAgICAgICAgICAgIG5vZGUubmFtZS5zdWJzdHJpbmcoMCwgUExBWUVSX1BSRUZJWC5sZW5ndGgpID09IFBMQVlFUl9QUkVGSVgpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBub2RlLm5hbWUuc3Vic3RyaW5nKFBMQVlFUl9QUkVGSVgubGVuZ3RoKTtcbiAgICAgICAgICAgIGlmIChwbGF5ZXJzLmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgICAgIGZpZ21hLm5vdGlmeShcIlBsYXllciBuYW1lcyBtdXN0IGJlIHVuaXF1ZVwiKTtcbiAgICAgICAgICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBwbGF5ZXJQYWdlID0gcGFnZU5vZGVzW25vZGUubmFtZV07XG4gICAgICAgICAgICBpZiAoIXBsYXllclBhZ2UpIHtcbiAgICAgICAgICAgICAgICBwbGF5ZXJQYWdlID0gZmlnbWEuY3JlYXRlUGFnZSgpO1xuICAgICAgICAgICAgICAgIHBsYXllclBhZ2UubmFtZSA9IG5vZGUubmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB2aWV3ZXJGcmFtZSA9IG51bGw7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgcGxheWVyUGFnZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLnR5cGUgPT09IFwiRlJBTUVcIiAmJiBub2RlLm5hbWUgPT09IFwidmlld2VyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmlld2VyRnJhbWUgPSBub2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodmlld2VyRnJhbWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2aWV3ZXJGcmFtZSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XG4gICAgICAgICAgICAgICAgcGxheWVyUGFnZS5hcHBlbmRDaGlsZCh2aWV3ZXJGcmFtZSk7XG4gICAgICAgICAgICAgICAgdmlld2VyRnJhbWUubmFtZSA9IFwidmlld2VyXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwbGF5ZXJGcmFtZXNbbmFtZV0gPSB2aWV3ZXJGcmFtZS5pZDtcbiAgICAgICAgICAgIHZpZXdlckZyYW1lLnJlc2l6ZShub2RlLndpZHRoLCBub2RlLmhlaWdodCk7XG4gICAgICAgICAgICBsZXQgcGVyaXNjb3BlID0gbnVsbDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2Ygdmlld2VyRnJhbWUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQudHlwZSA9PT0gXCJJTlNUQU5DRVwiICYmIGNoaWxkLm5hbWUgPT09IFwicGVyaXNjb3BlXCIgJiYgY2hpbGQubWFzdGVyQ29tcG9uZW50ID09PSBhc3NldE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcGVyaXNjb3BlID0gY2hpbGQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGVyaXNjb3BlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcGVyaXNjb3BlID0gYXNzZXROb2RlLmNyZWF0ZUluc3RhbmNlKCk7XG4gICAgICAgICAgICAgICAgdmlld2VyRnJhbWUuYXBwZW5kQ2hpbGQocGVyaXNjb3BlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBlcmlzY29wZS54ID0gYXNzZXROb2RlLnggLSBub2RlLng7XG4gICAgICAgICAgICBwZXJpc2NvcGUueSA9IGFzc2V0Tm9kZS55IC0gbm9kZS55IC0gSElERV9PRkZTRVQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgdXJsID0gZmlnbWEucm9vdC5nZXRQbHVnaW5EYXRhKFwidXJsXCIpO1xuICAgIGlmICh1cmwgIT09IG51bGwpIHtcbiAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2UoeyB0eXBlOiBcInNldFVSTFwiLCB1cmwgfSk7XG4gICAgfVxuICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJwbGF5ZXJGcmFtZXNcIiwgcGxheWVyRnJhbWVzIH0pO1xuICAgIGZpZ21hLnVpLm9ubWVzc2FnZSA9IG1zZyA9PiB7XG4gICAgICAgIGlmIChtc2cudHlwZSA9PT0gXCJzZXRVUkxcIikge1xuICAgICAgICAgICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwidXJsXCIsIG1zZy51cmwpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHR1cm5GYWNlRG93bihub2RlKSB7XG4gICAgaWYgKG5vZGUudHlwZSA9PT0gXCJJTlNUQU5DRVwiKSB7XG4gICAgICAgIGNvbnN0IG1hc3RlciA9IG5vZGUubWFzdGVyQ29tcG9uZW50O1xuICAgICAgICBpZiAobWFzdGVyLmNoaWxkcmVuLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgbWFzdGVyLmNoaWxkcmVuWzJdLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuZnVuY3Rpb24gc2h1ZmZsZSgpIHtcbiAgICBjb25zdCB0b1NodWZmbGUgPSBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb24ubWFwKChub2RlKSA9PiBub2RlLmlkKTtcbiAgICBpZiAodG9TaHVmZmxlLmxlbmd0aCA9PT0gMClcbiAgICAgICAgcmV0dXJuO1xuICAgIGNvbnN0IG5vZGUgPSBmaWdtYS5nZXROb2RlQnlJZCh0b1NodWZmbGVbMF0pO1xuICAgIGNvbnN0IHBhcmVudCA9IG5vZGUucGFyZW50O1xuICAgIGxldCB4UG9zID0gbm9kZS54O1xuICAgIGxldCB5UG9zID0gbm9kZS55O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdG9TaHVmZmxlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGlkeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh0b1NodWZmbGUubGVuZ3RoIC0gaSkpICsgaTtcbiAgICAgICAgY29uc3QgdGFyZ2V0ID0gZmlnbWEuZ2V0Tm9kZUJ5SWQodG9TaHVmZmxlW2lkeF0pO1xuICAgICAgICB0dXJuRmFjZURvd24odGFyZ2V0KTtcbiAgICAgICAgdGFyZ2V0LnggPSB4UG9zO1xuICAgICAgICB0YXJnZXQueSA9IHlQb3M7XG4gICAgICAgIHlQb3MtLTtcbiAgICAgICAgcGFyZW50Lmluc2VydENoaWxkKGksIHRhcmdldCk7XG4gICAgICAgIGNvbnN0IHRtcCA9IHRvU2h1ZmZsZVtpZHhdO1xuICAgICAgICB0b1NodWZmbGVbaWR4XSA9IHRvU2h1ZmZsZVtpXTtcbiAgICAgICAgdG9TaHVmZmxlW2ldID0gdG1wO1xuICAgIH1cbiAgICBmaWdtYS5ub3RpZnkoXCJGaW5pc2hlZCBzaHVmZmxpbmdcIik7XG4gICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbn1cbmZ1bmN0aW9uIGdhdGhlcigpIHtcbiAgICBjb25zdCB0b0dhdGhlciA9IGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbjtcbiAgICBpZiAodG9HYXRoZXIubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIlNlbGVjdCBhIHNpbmdsZSBpdGVtIHRvIGdhdGhlclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0YXJnZXQgPSB0b0dhdGhlclswXTtcbiAgICBjb25zdCB0YXJnZXROYW1lID0gdGFyZ2V0Lm5hbWU7XG4gICAgY29uc3QgYXNzZXROb2RlSUQgPSB0YXJnZXQuZ2V0UGx1Z2luRGF0YShcImFzc2V0Tm9kZVwiKTtcbiAgICBpZiAoYXNzZXROb2RlSUQgPT09IFwiXCIpXG4gICAgICAgIHJldHVybjtcbiAgICBjb25zdCBhc3NldE5vZGUgPSBmaWdtYS5nZXROb2RlQnlJZChhc3NldE5vZGVJRCk7XG4gICAgaWYgKGFzc2V0Tm9kZS5yZW1vdmVkKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKGFzc2V0Tm9kZS50eXBlICE9PSBcIkNPTVBPTkVOVFwiKVxuICAgICAgICByZXR1cm47XG4gICAgbGV0IHhQb3MgPSB0YXJnZXQueDtcbiAgICBsZXQgeVBvcyA9IHRhcmdldC55O1xuICAgIGNvbnN0IGNoaWxkcmVuID0gYXNzZXROb2RlLmNoaWxkcmVuO1xuICAgIGNvbnN0IGdhdGhlcmVkID0gW107XG4gICAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGNhbmRpZGF0ZS5uYW1lID09PSB0YXJnZXROYW1lKSB7XG4gICAgICAgICAgICBnYXRoZXJlZC5wdXNoKGNhbmRpZGF0ZSk7XG4gICAgICAgICAgICB0dXJuRmFjZURvd24oY2FuZGlkYXRlKTtcbiAgICAgICAgICAgIGNhbmRpZGF0ZS54ID0geFBvcztcbiAgICAgICAgICAgIGNhbmRpZGF0ZS55ID0geVBvcztcbiAgICAgICAgICAgIHlQb3MtLTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb24gPSBnYXRoZXJlZDtcbiAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xufVxuZnVuY3Rpb24gZmxpcCgpIHtcbiAgICBjb25zdCBzZWxlY3RlZCA9IGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbjtcbiAgICBmb3IgKGxldCBub2RlIG9mIHNlbGVjdGVkKSB7XG4gICAgICAgIGlmIChub2RlLnR5cGUgIT09IFwiSU5TVEFOQ0VcIilcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICBub2RlID0gbm9kZS5tYXN0ZXJDb21wb25lbnQ7XG4gICAgICAgIGlmIChub2RlLmNoaWxkcmVuLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgY29uc3QgY2xvbmUgPSBub2RlLmNoaWxkcmVuWzFdLmNsb25lKCk7XG4gICAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKGNsb25lKTtcbiAgICAgICAgICAgIGNsb25lLnkgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5vZGUuY2hpbGRyZW4ubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuWzJdLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG59XG5pZiAoZmlnbWEuY29tbWFuZCA9PT0gXCJzaHVmZmxlXCIpXG4gICAgc2h1ZmZsZSgpO1xuZWxzZSBpZiAoZmlnbWEuY29tbWFuZCA9PT0gXCJmbGlwXCIpXG4gICAgZmxpcCgpO1xuZWxzZSBpZiAoZmlnbWEuY29tbWFuZCA9PT0gXCJnYXRoZXJcIilcbiAgICBnYXRoZXIoKTtcbmVsc2VcbiAgICBtYWluKCk7XG4iXSwic291cmNlUm9vdCI6IiJ9