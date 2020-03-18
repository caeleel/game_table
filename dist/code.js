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
            const prevHidden = figma.root.getPluginData("hiddenNode");
            if (prevHidden !== "") {
                figma.getNodeById(prevHidden).remove();
            }
            const hiddenFrame = figma.createFrame();
            hiddenFrame.name = "hidden-data";
            hiddenFrame.visible = false;
            hiddenFrame.locked = true;
            figma.root.setPluginData("hiddenNode", hiddenFrame.id);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0EsNEJBQTRCLDBCQUEwQjtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5QkFBeUI7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsc0JBQXNCO0FBQ3BEO0FBQ0EsMEJBQTBCLHFDQUFxQztBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLHNCQUFzQjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiY29kZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2NvZGUudHNcIik7XG4iLCJmdW5jdGlvbiBtYWluKCkge1xuICAgIGZpZ21hLnNob3dVSShfX2h0bWxfXywgeyB3aWR0aDogNDAwLCBoZWlnaHQ6IDQwMCB9KTtcbiAgICBjb25zdCBzZWxlY3Rpb24gPSBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb247XG4gICAgaWYgKHNlbGVjdGlvbi5sZW5ndGggIT09IDEpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiU2VsZWN0IGV4YWN0bHkgMSBmcmFtZSB0byBzdGFydCBnYW1lXCIpO1xuICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzZWxlY3Rpb25bMF0udHlwZSAhPT0gXCJGUkFNRVwiKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIk11c3Qgc2VsZWN0IGEgZnJhbWUgbm9kZVwiKTtcbiAgICAgICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBQTEFZRVJfUFJFRklYID0gXCJQbGF5ZXI6IFwiO1xuICAgIGNvbnN0IEhJREVfT0ZGU0VUID0gMjAwMDA7XG4gICAgY29uc3QgTUFSR0lOID0gMTAwO1xuICAgIGNvbnN0IHBhZ2VOb2RlcyA9IHt9O1xuICAgIGNvbnN0IHBsYXllckZyYW1lcyA9IHt9O1xuICAgIGxldCBhc3NldE5vZGUgPSBudWxsO1xuICAgIGNvbnN0IGdhbWUgPSBzZWxlY3Rpb25bMF07XG4gICAgbGV0IHBsYXllcnMgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIGdhbWUuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKG5vZGUudHlwZSA9PT0gXCJDT01QT05FTlRcIiAmJiBub2RlLm5hbWUgPT09IFwiYXNzZXRzXCIpIHtcbiAgICAgICAgICAgIGFzc2V0Tm9kZSA9IG5vZGU7XG4gICAgICAgICAgICBnYW1lLmluc2VydENoaWxkKGdhbWUuY2hpbGRyZW4ubGVuZ3RoIC0gMSwgbm9kZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCBwYWdlIG9mIGZpZ21hLnJvb3QuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKHBhZ2UubmFtZS5zdWJzdHJpbmcoMCwgUExBWUVSX1BSRUZJWC5sZW5ndGgpID09PSBQTEFZRVJfUFJFRklYKSB7XG4gICAgICAgICAgICBwYWdlTm9kZXNbcGFnZS5uYW1lXSA9IHBhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAocGFnZS5uYW1lID09PSBcIkFzc2V0c1wiICYmIGFzc2V0Tm9kZSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgYXNzZXROb2RlID0gZmlnbWEuY3JlYXRlQ29tcG9uZW50KCk7XG4gICAgICAgICAgICBhc3NldE5vZGUubmFtZSA9IFwiYXNzZXRzXCI7XG4gICAgICAgICAgICBnYW1lLmFwcGVuZENoaWxkKGFzc2V0Tm9kZSk7XG4gICAgICAgICAgICBjb25zdCBwcmV2SGlkZGVuID0gZmlnbWEucm9vdC5nZXRQbHVnaW5EYXRhKFwiaGlkZGVuTm9kZVwiKTtcbiAgICAgICAgICAgIGlmIChwcmV2SGlkZGVuICE9PSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgZmlnbWEuZ2V0Tm9kZUJ5SWQocHJldkhpZGRlbikucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBoaWRkZW5GcmFtZSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XG4gICAgICAgICAgICBoaWRkZW5GcmFtZS5uYW1lID0gXCJoaWRkZW4tZGF0YVwiO1xuICAgICAgICAgICAgaGlkZGVuRnJhbWUudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgaGlkZGVuRnJhbWUubG9ja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGZpZ21hLnJvb3Quc2V0UGx1Z2luRGF0YShcImhpZGRlbk5vZGVcIiwgaGlkZGVuRnJhbWUuaWQpO1xuICAgICAgICAgICAgbGV0IHhPZmZzZXQgPSBNQVJHSU47XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZyYW1lIG9mIHBhZ2UuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoZnJhbWUudHlwZSAhPT0gXCJGUkFNRVwiKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBsZXQgYmFjayA9IG51bGw7XG4gICAgICAgICAgICAgICAgbGV0IHlPZmZzZXQgPSBNQVJHSU47XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBmcmFtZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFjayA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFjayA9IGNoaWxkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkLnR5cGUgPT09IFwiQ09NUE9ORU5UXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2lkZ2V0ID0gZmlnbWEuY3JlYXRlQ29tcG9uZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBiYWNrQ2xvbmUgPSBiYWNrLmNsb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrQ2xvbmUueCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrQ2xvbmUueSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrQ2xvbmUubG9ja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldC5uYW1lID0gZnJhbWUubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldC5jbGlwc0NvbnRlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZGRlbkZyYW1lLmFwcGVuZENoaWxkKHdpZGdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQuYXBwZW5kQ2hpbGQoYmFja0Nsb25lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb25lID0gY2hpbGQuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldC5hcHBlbmRDaGlsZChjbG9uZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9uZS54ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lLnkgPSBISURFX09GRlNFVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lLmxvY2tlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQucmVzaXplKGNsb25lLndpZHRoLCBjbG9uZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgd2lkZ2V0LnNldFJlbGF1bmNoRGF0YSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2h1ZmZsZTogJycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2F0aGVyOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbGlwOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5zdGFuY2UgPSB3aWRnZXQuY3JlYXRlSW5zdGFuY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLnNldFBsdWdpbkRhdGEoXCJhc3NldE5vZGVcIiwgYXNzZXROb2RlLmlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0Tm9kZS5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS54ID0geE9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLnkgPSB5T2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgeU9mZnNldC0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHhPZmZzZXQgKz0gMjAgKyBmcmFtZS53aWR0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3NldE5vZGUucmVzaXplKGdhbWUud2lkdGgsIGdhbWUuaGVpZ2h0ICsgSElERV9PRkZTRVQpO1xuICAgIGFzc2V0Tm9kZS54ID0gMDtcbiAgICBhc3NldE5vZGUueSA9IDA7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIGdhbWUuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKFtcIkNPTVBPTkVOVFwiLCBcIklOU1RBTkNFXCIsIFwiRlJBTUVcIiwgXCJSRUNUQU5HTEVcIl0uaW5kZXhPZihub2RlLnR5cGUpID49IDAgJiZcbiAgICAgICAgICAgIG5vZGUubmFtZS5zdWJzdHJpbmcoMCwgUExBWUVSX1BSRUZJWC5sZW5ndGgpID09IFBMQVlFUl9QUkVGSVgpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBub2RlLm5hbWUuc3Vic3RyaW5nKFBMQVlFUl9QUkVGSVgubGVuZ3RoKTtcbiAgICAgICAgICAgIGlmIChwbGF5ZXJzLmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgICAgIGZpZ21hLm5vdGlmeShcIlBsYXllciBuYW1lcyBtdXN0IGJlIHVuaXF1ZVwiKTtcbiAgICAgICAgICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBwbGF5ZXJQYWdlID0gcGFnZU5vZGVzW25vZGUubmFtZV07XG4gICAgICAgICAgICBpZiAoIXBsYXllclBhZ2UpIHtcbiAgICAgICAgICAgICAgICBwbGF5ZXJQYWdlID0gZmlnbWEuY3JlYXRlUGFnZSgpO1xuICAgICAgICAgICAgICAgIHBsYXllclBhZ2UubmFtZSA9IG5vZGUubmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB2aWV3ZXJGcmFtZSA9IG51bGw7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgcGxheWVyUGFnZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLnR5cGUgPT09IFwiRlJBTUVcIiAmJiBub2RlLm5hbWUgPT09IFwidmlld2VyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmlld2VyRnJhbWUgPSBub2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodmlld2VyRnJhbWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2aWV3ZXJGcmFtZSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XG4gICAgICAgICAgICAgICAgcGxheWVyUGFnZS5hcHBlbmRDaGlsZCh2aWV3ZXJGcmFtZSk7XG4gICAgICAgICAgICAgICAgdmlld2VyRnJhbWUubmFtZSA9IFwidmlld2VyXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwbGF5ZXJGcmFtZXNbbmFtZV0gPSB2aWV3ZXJGcmFtZS5pZDtcbiAgICAgICAgICAgIHZpZXdlckZyYW1lLnJlc2l6ZShub2RlLndpZHRoLCBub2RlLmhlaWdodCk7XG4gICAgICAgICAgICBsZXQgcGVyaXNjb3BlID0gbnVsbDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2Ygdmlld2VyRnJhbWUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQudHlwZSA9PT0gXCJJTlNUQU5DRVwiICYmIGNoaWxkLm5hbWUgPT09IFwicGVyaXNjb3BlXCIgJiYgY2hpbGQubWFzdGVyQ29tcG9uZW50ID09PSBhc3NldE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcGVyaXNjb3BlID0gY2hpbGQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGVyaXNjb3BlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcGVyaXNjb3BlID0gYXNzZXROb2RlLmNyZWF0ZUluc3RhbmNlKCk7XG4gICAgICAgICAgICAgICAgdmlld2VyRnJhbWUuYXBwZW5kQ2hpbGQocGVyaXNjb3BlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBlcmlzY29wZS54ID0gYXNzZXROb2RlLnggLSBub2RlLng7XG4gICAgICAgICAgICBwZXJpc2NvcGUueSA9IGFzc2V0Tm9kZS55IC0gbm9kZS55IC0gSElERV9PRkZTRVQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgdXJsID0gZmlnbWEucm9vdC5nZXRQbHVnaW5EYXRhKFwidXJsXCIpO1xuICAgIGlmICh1cmwgIT09IG51bGwpIHtcbiAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2UoeyB0eXBlOiBcInNldFVSTFwiLCB1cmwgfSk7XG4gICAgfVxuICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJwbGF5ZXJGcmFtZXNcIiwgcGxheWVyRnJhbWVzIH0pO1xuICAgIGZpZ21hLnVpLm9ubWVzc2FnZSA9IG1zZyA9PiB7XG4gICAgICAgIGlmIChtc2cudHlwZSA9PT0gXCJzZXRVUkxcIikge1xuICAgICAgICAgICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwidXJsXCIsIG1zZy51cmwpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHNodWZmbGUoKSB7XG4gICAgY29uc3QgdG9TaHVmZmxlID0gZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uLm1hcCgobm9kZSkgPT4gbm9kZS5pZCk7XG4gICAgaWYgKHRvU2h1ZmZsZS5sZW5ndGggPT09IDApXG4gICAgICAgIHJldHVybjtcbiAgICBjb25zdCBub2RlID0gZmlnbWEuZ2V0Tm9kZUJ5SWQodG9TaHVmZmxlWzBdKTtcbiAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudDtcbiAgICBsZXQgeFBvcyA9IG5vZGUueDtcbiAgICBsZXQgeVBvcyA9IG5vZGUueTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRvU2h1ZmZsZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBpZHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAodG9TaHVmZmxlLmxlbmd0aCAtIGkpKSArIGk7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGZpZ21hLmdldE5vZGVCeUlkKHRvU2h1ZmZsZVtpZHhdKTtcbiAgICAgICAgdGFyZ2V0LnggPSB4UG9zO1xuICAgICAgICB0YXJnZXQueSA9IHlQb3M7XG4gICAgICAgIHlQb3MtLTtcbiAgICAgICAgcGFyZW50Lmluc2VydENoaWxkKGksIHRhcmdldCk7XG4gICAgICAgIGNvbnN0IHRtcCA9IHRvU2h1ZmZsZVtpZHhdO1xuICAgICAgICB0b1NodWZmbGVbaWR4XSA9IHRvU2h1ZmZsZVtpXTtcbiAgICAgICAgdG9TaHVmZmxlW2ldID0gdG1wO1xuICAgIH1cbiAgICBmaWdtYS5ub3RpZnkoXCJGaW5pc2hlZCBzaHVmZmxpbmdcIik7XG4gICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbn1cbmZ1bmN0aW9uIGdhdGhlcigpIHtcbiAgICBjb25zdCB0b0dhdGhlciA9IGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbjtcbiAgICBpZiAodG9HYXRoZXIubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgIGZpZ21hLm5vdGlmeShcIlNlbGVjdCBhIHNpbmdsZSBpdGVtIHRvIGdhdGhlclwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB0YXJnZXQgPSB0b0dhdGhlclswXTtcbiAgICBjb25zdCB0YXJnZXROYW1lID0gdGFyZ2V0Lm5hbWU7XG4gICAgY29uc3QgYXNzZXROb2RlSUQgPSB0YXJnZXQuZ2V0UGx1Z2luRGF0YShcImFzc2V0Tm9kZVwiKTtcbiAgICBpZiAoYXNzZXROb2RlSUQgPT09IFwiXCIpXG4gICAgICAgIHJldHVybjtcbiAgICBjb25zdCBhc3NldE5vZGUgPSBmaWdtYS5nZXROb2RlQnlJZChhc3NldE5vZGVJRCk7XG4gICAgaWYgKGFzc2V0Tm9kZS5yZW1vdmVkKVxuICAgICAgICByZXR1cm47XG4gICAgaWYgKGFzc2V0Tm9kZS50eXBlICE9PSBcIkNPTVBPTkVOVFwiKVxuICAgICAgICByZXR1cm47XG4gICAgbGV0IHhQb3MgPSB0YXJnZXQueDtcbiAgICBsZXQgeVBvcyA9IHRhcmdldC55O1xuICAgIGNvbnN0IGNoaWxkcmVuID0gYXNzZXROb2RlLmNoaWxkcmVuO1xuICAgIGNvbnN0IGdhdGhlcmVkID0gW107XG4gICAgZm9yIChjb25zdCBjYW5kaWRhdGUgb2YgY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKGNhbmRpZGF0ZS5uYW1lID09PSB0YXJnZXROYW1lKSB7XG4gICAgICAgICAgICBnYXRoZXJlZC5wdXNoKGNhbmRpZGF0ZSk7XG4gICAgICAgICAgICBjYW5kaWRhdGUueCA9IHhQb3M7XG4gICAgICAgICAgICBjYW5kaWRhdGUueSA9IHlQb3M7XG4gICAgICAgICAgICB5UG9zLS07XG4gICAgICAgIH1cbiAgICB9XG4gICAgZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uID0gZ2F0aGVyZWQ7XG4gICAgZmlnbWEuY2xvc2VQbHVnaW4oKTtcbn1cbmZ1bmN0aW9uIGZsaXAoKSB7XG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb247XG4gICAgZm9yIChsZXQgbm9kZSBvZiBzZWxlY3RlZCkge1xuICAgICAgICBpZiAobm9kZS50eXBlICE9PSBcIklOU1RBTkNFXCIpXG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgbm9kZSA9IG5vZGUubWFzdGVyQ29tcG9uZW50O1xuICAgICAgICBpZiAobm9kZS5jaGlsZHJlbi5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgICAgIGNvbnN0IGNsb25lID0gbm9kZS5jaGlsZHJlblsxXS5jbG9uZSgpO1xuICAgICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZChjbG9uZSk7XG4gICAgICAgICAgICBjbG9uZS55ID0gMDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChub2RlLmNoaWxkcmVuLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgbm9kZS5jaGlsZHJlblsyXS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xufVxuaWYgKGZpZ21hLmNvbW1hbmQgPT09IFwic2h1ZmZsZVwiKVxuICAgIHNodWZmbGUoKTtcbmVsc2UgaWYgKGZpZ21hLmNvbW1hbmQgPT09IFwiZmxpcFwiKVxuICAgIGZsaXAoKTtcbmVsc2UgaWYgKGZpZ21hLmNvbW1hbmQgPT09IFwiZ2F0aGVyXCIpXG4gICAgZ2F0aGVyKCk7XG5lbHNlXG4gICAgbWFpbigpO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==