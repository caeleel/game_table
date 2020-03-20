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
                            tidy: '',
                            count: `Count ${frame.name}s`
                        });
                        const instance = widget.createInstance();
                        instance.setPluginData("assetNode", assetNode.id);
                        assetNode.appendChild(instance);
                        instance.x = xOffset;
                        instance.y = yOffset;
                        yOffset--;
                    }
                }
                if (back) {
                    xOffset += MARGIN + back.width;
                }
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
    const toGather = [...figma.currentPage.selection];
    if (toGather.length === 0) {
        figma.notify("Select item or itmes to gather");
        return;
    }
    const target = toGather[0];
    let xPos = target.x;
    let yPos = target.y;
    const assetNodeID = target.getPluginData("assetNode");
    if (assetNodeID === "")
        return;
    const assetNode = figma.getNodeById(assetNodeID);
    if (assetNode.removed)
        return;
    if (assetNode.type !== "COMPONENT")
        return;
    if (toGather.length > 1) {
        toGather.sort((a, b) => {
            if (a.x < b.x)
                return -1;
            if (a.x > b.x)
                return 1;
            if (a.y < b.y)
                return -1;
            if (a.y > b.y)
                return 1;
            return 0;
        });
        for (const item of toGather) {
            item.x = xPos;
            item.y = yPos;
            xPos += 100;
            assetNode.appendChild(item);
        }
        figma.closePlugin();
        return;
    }
    const targetName = target.name;
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
else if (figma.command === "tidy")
    gather();
else if (figma.command === "count") {
    figma.notify(`${figma.currentPage.selection.length} selected`);
    figma.closePlugin();
}
else
    main();


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0EsNEJBQTRCLDBCQUEwQjtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQkFBMEIsd0VBQXdFO0FBQ2xHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLFdBQVc7QUFDdkQseUJBQXlCO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDhCQUE4QixzQkFBc0I7QUFDcEQ7QUFDQSwwQkFBMEIscUNBQXFDO0FBQy9EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHNCQUFzQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixtQ0FBbUM7QUFDdkQ7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2NvZGUudHNcIik7XG4iLCJmdW5jdGlvbiBtYWluKCkge1xuICAgIGZpZ21hLnNob3dVSShfX2h0bWxfXywgeyB3aWR0aDogNDAwLCBoZWlnaHQ6IDQwMCB9KTtcbiAgICBjb25zdCBzZWxlY3Rpb24gPSBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb247XG4gICAgaWYgKHNlbGVjdGlvbi5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiU2VsZWN0IGV4YWN0bHkgMSBmcmFtZSB0byBzdGFydCBnYW1lXCIpO1xuICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzZWxlY3Rpb25bMF0udHlwZSAhPT0gXCJGUkFNRVwiKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIk11c3Qgc2VsZWN0IGEgZnJhbWUgbm9kZVwiKTtcbiAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBQTEFZRVJfUFJFRklYID0gXCJQbGF5ZXI6IFwiO1xuICAgIGNvbnN0IEhJREVfT0ZGU0VUID0gMjAwMDA7XG4gICAgY29uc3QgTUFSR0lOID0gMTAwO1xuICAgIGNvbnN0IHBhZ2VOb2RlcyA9IHt9O1xuICAgIGNvbnN0IHBsYXllckZyYW1lcyA9IHt9O1xuICAgIGxldCBhc3NldE5vZGUgPSBudWxsO1xuICAgIGNvbnN0IGdhbWUgPSBzZWxlY3Rpb25bMF07XG4gICAgZ2FtZS5zZXRSZWxhdW5jaERhdGEoeyBwbGF5ZXJzOiBcIkNsaWNrIG9uIGEgcGxheWVyIHRvIGdldCBhIGxpbmsgZm9yIHRoZWlyIHNlY3JldCBoYW5kIGluZm9cIiB9KTtcbiAgICBsZXQgcGxheWVycyA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2YgZ2FtZS5jaGlsZHJlbikge1xuICAgICAgICBpZiAobm9kZS50eXBlID09PSBcIkNPTVBPTkVOVFwiICYmIG5vZGUubmFtZSA9PT0gXCJhc3NldHNcIikge1xuICAgICAgICAgICAgYXNzZXROb2RlID0gbm9kZTtcbiAgICAgICAgICAgIGdhbWUuaW5zZXJ0Q2hpbGQoZ2FtZS5jaGlsZHJlbi5sZW5ndGggLSAxLCBub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IHBhZ2Ugb2YgZmlnbWEucm9vdC5jaGlsZHJlbikge1xuICAgICAgICBpZiAocGFnZS5uYW1lLnN1YnN0cmluZygwLCBQTEFZRVJfUFJFRklYLmxlbmd0aCkgPT09IFBMQVlFUl9QUkVGSVgpIHtcbiAgICAgICAgICAgIHBhZ2VOb2Rlc1twYWdlLm5hbWVdID0gcGFnZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwYWdlLm5hbWUgPT09IFwiQXNzZXRzXCIgJiYgYXNzZXROb2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICBhc3NldE5vZGUgPSBmaWdtYS5jcmVhdGVDb21wb25lbnQoKTtcbiAgICAgICAgICAgIGFzc2V0Tm9kZS5uYW1lID0gXCJhc3NldHNcIjtcbiAgICAgICAgICAgIGdhbWUuYXBwZW5kQ2hpbGQoYXNzZXROb2RlKTtcbiAgICAgICAgICAgIGNvbnN0IHByZXZIaWRkZW4gPSBnYW1lLmdldFBsdWdpbkRhdGEoXCJoaWRkZW5Ob2RlXCIpO1xuICAgICAgICAgICAgaWYgKHByZXZIaWRkZW4gIT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICBmaWdtYS5nZXROb2RlQnlJZChwcmV2SGlkZGVuKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGhpZGRlbkZyYW1lID0gZmlnbWEuY3JlYXRlRnJhbWUoKTtcbiAgICAgICAgICAgIGhpZGRlbkZyYW1lLm5hbWUgPSBcImhpZGRlbi1kYXRhXCI7XG4gICAgICAgICAgICBoaWRkZW5GcmFtZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICBoaWRkZW5GcmFtZS5sb2NrZWQgPSB0cnVlO1xuICAgICAgICAgICAgZ2FtZS5zZXRQbHVnaW5EYXRhKFwiaGlkZGVuTm9kZVwiLCBoaWRkZW5GcmFtZS5pZCk7XG4gICAgICAgICAgICBsZXQgeE9mZnNldCA9IE1BUkdJTjtcbiAgICAgICAgICAgIGZvciAoY29uc3QgZnJhbWUgb2YgcGFnZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGlmIChmcmFtZS50eXBlICE9PSBcIkZSQU1FXCIpXG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIGxldCBiYWNrID0gbnVsbDtcbiAgICAgICAgICAgICAgICBsZXQgeU9mZnNldCA9IE1BUkdJTjtcbiAgICAgICAgICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIGZyYW1lLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChiYWNrID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrID0gY2hpbGQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY2hpbGQudHlwZSA9PT0gXCJDT01QT05FTlRcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB3aWRnZXQgPSBmaWdtYS5jcmVhdGVDb21wb25lbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhY2tDbG9uZSA9IGJhY2suY2xvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tDbG9uZS54ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tDbG9uZS55ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJhY2tDbG9uZS5sb2NrZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0Lm5hbWUgPSBmcmFtZS5uYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0LmNsaXBzQ29udGVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaGlkZGVuRnJhbWUuYXBwZW5kQ2hpbGQod2lkZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldC5hcHBlbmRDaGlsZChiYWNrQ2xvbmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgY2xvbmUgPSBjaGlsZC5jbG9uZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0LmFwcGVuZENoaWxkKGNsb25lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lLnggPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvbmUueSA9IEhJREVfT0ZGU0VUO1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xvbmUubG9ja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldC5yZXNpemUoY2xvbmUud2lkdGgsIGNsb25lLmhlaWdodCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQuc2V0UmVsYXVuY2hEYXRhKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaHVmZmxlOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnYXRoZXI6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsaXA6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpZHk6ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50OiBgQ291bnQgJHtmcmFtZS5uYW1lfXNgXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlID0gd2lkZ2V0LmNyZWF0ZUluc3RhbmNlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5zZXRQbHVnaW5EYXRhKFwiYXNzZXROb2RlXCIsIGFzc2V0Tm9kZS5pZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhc3NldE5vZGUuYXBwZW5kQ2hpbGQoaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UueCA9IHhPZmZzZXQ7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS55ID0geU9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHlPZmZzZXQtLTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoYmFjaykge1xuICAgICAgICAgICAgICAgICAgICB4T2Zmc2V0ICs9IE1BUkdJTiArIGJhY2sud2lkdGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGFzc2V0Tm9kZS5yZXNpemUoZ2FtZS53aWR0aCwgZ2FtZS5oZWlnaHQgKyBISURFX09GRlNFVCk7XG4gICAgYXNzZXROb2RlLnggPSAwO1xuICAgIGFzc2V0Tm9kZS55ID0gMDtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2YgZ2FtZS5jaGlsZHJlbikge1xuICAgICAgICBpZiAoW1wiQ09NUE9ORU5UXCIsIFwiSU5TVEFOQ0VcIiwgXCJGUkFNRVwiLCBcIlJFQ1RBTkdMRVwiXS5pbmRleE9mKG5vZGUudHlwZSkgPj0gMCAmJlxuICAgICAgICAgICAgbm9kZS5uYW1lLnN1YnN0cmluZygwLCBQTEFZRVJfUFJFRklYLmxlbmd0aCkgPT0gUExBWUVSX1BSRUZJWCkge1xuICAgICAgICAgICAgY29uc3QgbmFtZSA9IG5vZGUubmFtZS5zdWJzdHJpbmcoUExBWUVSX1BSRUZJWC5sZW5ndGgpO1xuICAgICAgICAgICAgaWYgKHBsYXllcnMuaGFzKG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgZmlnbWEubm90aWZ5KFwiUGxheWVyIG5hbWVzIG11c3QgYmUgdW5pcXVlXCIpO1xuICAgICAgICAgICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHBsYXllclBhZ2UgPSBwYWdlTm9kZXNbbm9kZS5uYW1lXTtcbiAgICAgICAgICAgIGlmICghcGxheWVyUGFnZSkge1xuICAgICAgICAgICAgICAgIHBsYXllclBhZ2UgPSBmaWdtYS5jcmVhdGVQYWdlKCk7XG4gICAgICAgICAgICAgICAgcGxheWVyUGFnZS5uYW1lID0gbm9kZS5uYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHZpZXdlckZyYW1lID0gbnVsbDtcbiAgICAgICAgICAgIGZvciAoY29uc3Qgbm9kZSBvZiBwbGF5ZXJQYWdlLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgaWYgKG5vZGUudHlwZSA9PT0gXCJGUkFNRVwiICYmIG5vZGUubmFtZSA9PT0gXCJ2aWV3ZXJcIikge1xuICAgICAgICAgICAgICAgICAgICB2aWV3ZXJGcmFtZSA9IG5vZGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBub2RlLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2aWV3ZXJGcmFtZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHZpZXdlckZyYW1lID0gZmlnbWEuY3JlYXRlRnJhbWUoKTtcbiAgICAgICAgICAgICAgICBwbGF5ZXJQYWdlLmFwcGVuZENoaWxkKHZpZXdlckZyYW1lKTtcbiAgICAgICAgICAgICAgICB2aWV3ZXJGcmFtZS5uYW1lID0gXCJ2aWV3ZXJcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBsYXllckZyYW1lc1tuYW1lXSA9IHZpZXdlckZyYW1lLmlkO1xuICAgICAgICAgICAgdmlld2VyRnJhbWUucmVzaXplKG5vZGUud2lkdGgsIG5vZGUuaGVpZ2h0KTtcbiAgICAgICAgICAgIGxldCBwZXJpc2NvcGUgPSBudWxsO1xuICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiB2aWV3ZXJGcmFtZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGlmIChjaGlsZC50eXBlID09PSBcIklOU1RBTkNFXCIgJiYgY2hpbGQubmFtZSA9PT0gXCJwZXJpc2NvcGVcIiAmJiBjaGlsZC5tYXN0ZXJDb21wb25lbnQgPT09IGFzc2V0Tm9kZSkge1xuICAgICAgICAgICAgICAgICAgICBwZXJpc2NvcGUgPSBjaGlsZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNoaWxkLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwZXJpc2NvcGUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBwZXJpc2NvcGUgPSBhc3NldE5vZGUuY3JlYXRlSW5zdGFuY2UoKTtcbiAgICAgICAgICAgICAgICB2aWV3ZXJGcmFtZS5hcHBlbmRDaGlsZChwZXJpc2NvcGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGVyaXNjb3BlLnggPSBhc3NldE5vZGUueCAtIG5vZGUueDtcbiAgICAgICAgICAgIHBlcmlzY29wZS55ID0gYXNzZXROb2RlLnkgLSBub2RlLnkgLSBISURFX09GRlNFVDtcbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdCB1cmwgPSBmaWdtYS5yb290LmdldFBsdWdpbkRhdGEoXCJ1cmxcIik7XG4gICAgaWYgKHVybCAhPT0gbnVsbCkge1xuICAgICAgICBmaWdtYS51aS5wb3N0TWVzc2FnZSh7IHR5cGU6IFwic2V0VVJMXCIsIHVybCB9KTtcbiAgICB9XG4gICAgZmlnbWEudWkucG9zdE1lc3NhZ2UoeyB0eXBlOiBcInBsYXllckZyYW1lc1wiLCBwbGF5ZXJGcmFtZXMgfSk7XG4gICAgZmlnbWEudWkub25tZXNzYWdlID0gbXNnID0+IHtcbiAgICAgICAgaWYgKG1zZy50eXBlID09PSBcInNldFVSTFwiKSB7XG4gICAgICAgICAgICBmaWdtYS5yb290LnNldFBsdWdpbkRhdGEoXCJ1cmxcIiwgbXNnLnVybCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gdHVybkZhY2VEb3duKG5vZGUpIHtcbiAgICBpZiAobm9kZS50eXBlID09PSBcIklOU1RBTkNFXCIpIHtcbiAgICAgICAgY29uc3QgbWFzdGVyID0gbm9kZS5tYXN0ZXJDb21wb25lbnQ7XG4gICAgICAgIGlmIChtYXN0ZXIuY2hpbGRyZW4ubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBtYXN0ZXIuY2hpbGRyZW5bMl0ucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG5mdW5jdGlvbiBzaHVmZmxlKCkge1xuICAgIGNvbnN0IHRvU2h1ZmZsZSA9IGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbi5tYXAoKG5vZGUpID0+IG5vZGUuaWQpO1xuICAgIGlmICh0b1NodWZmbGUubGVuZ3RoID09PSAwKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3Qgbm9kZSA9IGZpZ21hLmdldE5vZGVCeUlkKHRvU2h1ZmZsZVswXSk7XG4gICAgY29uc3QgcGFyZW50ID0gbm9kZS5wYXJlbnQ7XG4gICAgbGV0IHhQb3MgPSBub2RlLng7XG4gICAgbGV0IHlQb3MgPSBub2RlLnk7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0b1NodWZmbGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgaWR4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKHRvU2h1ZmZsZS5sZW5ndGggLSBpKSkgKyBpO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBmaWdtYS5nZXROb2RlQnlJZCh0b1NodWZmbGVbaWR4XSk7XG4gICAgICAgIHR1cm5GYWNlRG93bih0YXJnZXQpO1xuICAgICAgICB0YXJnZXQueCA9IHhQb3M7XG4gICAgICAgIHRhcmdldC55ID0geVBvcztcbiAgICAgICAgeVBvcy0tO1xuICAgICAgICBwYXJlbnQuaW5zZXJ0Q2hpbGQoaSwgdGFyZ2V0KTtcbiAgICAgICAgY29uc3QgdG1wID0gdG9TaHVmZmxlW2lkeF07XG4gICAgICAgIHRvU2h1ZmZsZVtpZHhdID0gdG9TaHVmZmxlW2ldO1xuICAgICAgICB0b1NodWZmbGVbaV0gPSB0bXA7XG4gICAgfVxuICAgIGZpZ21hLm5vdGlmeShcIkZpbmlzaGVkIHNodWZmbGluZ1wiKTtcbiAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xufVxuZnVuY3Rpb24gZ2F0aGVyKCkge1xuICAgIGNvbnN0IHRvR2F0aGVyID0gWy4uLmZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbl07XG4gICAgaWYgKHRvR2F0aGVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJTZWxlY3QgaXRlbSBvciBpdG1lcyB0byBnYXRoZXJcIik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdGFyZ2V0ID0gdG9HYXRoZXJbMF07XG4gICAgbGV0IHhQb3MgPSB0YXJnZXQueDtcbiAgICBsZXQgeVBvcyA9IHRhcmdldC55O1xuICAgIGNvbnN0IGFzc2V0Tm9kZUlEID0gdGFyZ2V0LmdldFBsdWdpbkRhdGEoXCJhc3NldE5vZGVcIik7XG4gICAgaWYgKGFzc2V0Tm9kZUlEID09PSBcIlwiKVxuICAgICAgICByZXR1cm47XG4gICAgY29uc3QgYXNzZXROb2RlID0gZmlnbWEuZ2V0Tm9kZUJ5SWQoYXNzZXROb2RlSUQpO1xuICAgIGlmIChhc3NldE5vZGUucmVtb3ZlZClcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmIChhc3NldE5vZGUudHlwZSAhPT0gXCJDT01QT05FTlRcIilcbiAgICAgICAgcmV0dXJuO1xuICAgIGlmICh0b0dhdGhlci5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRvR2F0aGVyLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIGlmIChhLnggPCBiLngpXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgaWYgKGEueCA+IGIueClcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIGlmIChhLnkgPCBiLnkpXG4gICAgICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICAgICAgaWYgKGEueSA+IGIueSlcbiAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9KTtcbiAgICAgICAgZm9yIChjb25zdCBpdGVtIG9mIHRvR2F0aGVyKSB7XG4gICAgICAgICAgICBpdGVtLnggPSB4UG9zO1xuICAgICAgICAgICAgaXRlbS55ID0geVBvcztcbiAgICAgICAgICAgIHhQb3MgKz0gMTAwO1xuICAgICAgICAgICAgYXNzZXROb2RlLmFwcGVuZENoaWxkKGl0ZW0pO1xuICAgICAgICB9XG4gICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgdGFyZ2V0TmFtZSA9IHRhcmdldC5uYW1lO1xuICAgIGNvbnN0IGNoaWxkcmVuID0gYXNzZXROb2RlLmNoaWxkcmVuO1xuICAgIGNvbnN0IGdhdGhlcmVkID0gW107XG4gICAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGNhbmRpZGF0ZS5uYW1lID09PSB0YXJnZXROYW1lKSB7XG4gICAgICAgICAgICBnYXRoZXJlZC5wdXNoKGNhbmRpZGF0ZSk7XG4gICAgICAgICAgICB0dXJuRmFjZURvd24oY2FuZGlkYXRlKTtcbiAgICAgICAgICAgIGNhbmRpZGF0ZS54ID0geFBvcztcbiAgICAgICAgICAgIGNhbmRpZGF0ZS55ID0geVBvcztcbiAgICAgICAgICAgIHlQb3MtLTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb24gPSBnYXRoZXJlZDtcbiAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xufVxuZnVuY3Rpb24gZmxpcCgpIHtcbiAgICBjb25zdCBzZWxlY3RlZCA9IGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbjtcbiAgICBmb3IgKGxldCBub2RlIG9mIHNlbGVjdGVkKSB7XG4gICAgICAgIGlmIChub2RlLnR5cGUgIT09IFwiSU5TVEFOQ0VcIilcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICBub2RlID0gbm9kZS5tYXN0ZXJDb21wb25lbnQ7XG4gICAgICAgIGlmIChub2RlLmNoaWxkcmVuLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgY29uc3QgY2xvbmUgPSBub2RlLmNoaWxkcmVuWzFdLmNsb25lKCk7XG4gICAgICAgICAgICBub2RlLmFwcGVuZENoaWxkKGNsb25lKTtcbiAgICAgICAgICAgIGNsb25lLnkgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG5vZGUuY2hpbGRyZW4ubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBub2RlLmNoaWxkcmVuWzJdLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG59XG5pZiAoZmlnbWEuY29tbWFuZCA9PT0gXCJzaHVmZmxlXCIpXG4gICAgc2h1ZmZsZSgpO1xuZWxzZSBpZiAoZmlnbWEuY29tbWFuZCA9PT0gXCJmbGlwXCIpXG4gICAgZmxpcCgpO1xuZWxzZSBpZiAoZmlnbWEuY29tbWFuZCA9PT0gXCJnYXRoZXJcIilcbiAgICBnYXRoZXIoKTtcbmVsc2UgaWYgKGZpZ21hLmNvbW1hbmQgPT09IFwidGlkeVwiKVxuICAgIGdhdGhlcigpO1xuZWxzZSBpZiAoZmlnbWEuY29tbWFuZCA9PT0gXCJjb3VudFwiKSB7XG4gICAgZmlnbWEubm90aWZ5KGAke2ZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbi5sZW5ndGh9IHNlbGVjdGVkYCk7XG4gICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbn1cbmVsc2VcbiAgICBtYWluKCk7XG4iXSwic291cmNlUm9vdCI6IiJ9