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

// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.
// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).
// This shows the HTML page in "ui.html".
figma.showUI(__html__, { width: 400, height: 400 });
function main() {
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
            const hiddenFrame = figma.createFrame();
            hiddenFrame.name = "hidden-data";
            hiddenFrame.visible = false;
            hiddenFrame.locked = true;
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
                        const instance = widget.createInstance();
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
        if (msg.type === "shuffle") {
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
        }
        if (msg.type === "gather") {
            const toGather = figma.currentPage.selection;
            if (toGather.length !== 1) {
                figma.notify("Select a single item to gather");
                return;
            }
            const target = toGather[0];
            const targetName = target.name;
            assetNode.appendChild(target);
            let nextIdx = assetNode.children.length - 1;
            let xPos = target.x;
            let yPos = target.y;
            const children = assetNode.children;
            for (const candidate of children) {
                if (candidate.id !== target.id && candidate.name === targetName) {
                    assetNode.insertChild(nextIdx, candidate);
                    yPos++;
                    candidate.x = xPos;
                    candidate.y = yPos;
                    nextIdx--;
                }
            }
        }
        if (msg.type === "flip") {
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
        }
    };
}
main();


/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2NvZGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FBQ0Esc0RBQXNELCtEQUErRDs7UUFFckg7UUFDQTs7O1FBR0E7UUFDQTs7Ozs7Ozs7Ozs7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHdCQUF3QiwwQkFBMEI7QUFDbEQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsc0JBQXNCO0FBQ3BEO0FBQ0EsMEJBQTBCLHFDQUFxQztBQUMvRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsc0JBQXNCO0FBQ2pEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJjb2RlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvY29kZS50c1wiKTtcbiIsIi8vIFRoaXMgcGx1Z2luIHdpbGwgb3BlbiBhIG1vZGFsIHRvIHByb21wdCB0aGUgdXNlciB0byBlbnRlciBhIG51bWJlciwgYW5kXG4vLyBpdCB3aWxsIHRoZW4gY3JlYXRlIHRoYXQgbWFueSByZWN0YW5nbGVzIG9uIHRoZSBzY3JlZW4uXG4vLyBUaGlzIGZpbGUgaG9sZHMgdGhlIG1haW4gY29kZSBmb3IgdGhlIHBsdWdpbnMuIEl0IGhhcyBhY2Nlc3MgdG8gdGhlICpkb2N1bWVudCouXG4vLyBZb3UgY2FuIGFjY2VzcyBicm93c2VyIEFQSXMgaW4gdGhlIDxzY3JpcHQ+IHRhZyBpbnNpZGUgXCJ1aS5odG1sXCIgd2hpY2ggaGFzIGFcbi8vIGZ1bGwgYnJvd3NlciBlbnZpcm9tZW50IChzZWUgZG9jdW1lbnRhdGlvbikuXG4vLyBUaGlzIHNob3dzIHRoZSBIVE1MIHBhZ2UgaW4gXCJ1aS5odG1sXCIuXG5maWdtYS5zaG93VUkoX19odG1sX18sIHsgd2lkdGg6IDQwMCwgaGVpZ2h0OiA0MDAgfSk7XG5mdW5jdGlvbiBtYWluKCkge1xuICAgIGNvbnN0IHNlbGVjdGlvbiA9IGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbjtcbiAgICBpZiAoc2VsZWN0aW9uLmxlbmd0aCAhPT0gMSkge1xuICAgICAgICBmaWdtYS5ub3RpZnkoXCJTZWxlY3QgZXhhY3RseSAxIGZyYW1lIHRvIHN0YXJ0IGdhbWVcIik7XG4gICAgICAgIGZpZ21hLmNsb3NlUGx1Z2luKCk7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHNlbGVjdGlvblswXS50eXBlICE9PSBcIkZSQU1FXCIpIHtcbiAgICAgICAgZmlnbWEubm90aWZ5KFwiTXVzdCBzZWxlY3QgYSBmcmFtZSBub2RlXCIpO1xuICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IFBMQVlFUl9QUkVGSVggPSBcIlBsYXllcjogXCI7XG4gICAgY29uc3QgSElERV9PRkZTRVQgPSAyMDAwMDtcbiAgICBjb25zdCBNQVJHSU4gPSAxMDA7XG4gICAgY29uc3QgcGFnZU5vZGVzID0ge307XG4gICAgY29uc3QgcGxheWVyRnJhbWVzID0ge307XG4gICAgbGV0IGFzc2V0Tm9kZSA9IG51bGw7XG4gICAgY29uc3QgZ2FtZSA9IHNlbGVjdGlvblswXTtcbiAgICBsZXQgcGxheWVycyA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGNvbnN0IG5vZGUgb2YgZ2FtZS5jaGlsZHJlbikge1xuICAgICAgICBpZiAobm9kZS50eXBlID09PSBcIkNPTVBPTkVOVFwiICYmIG5vZGUubmFtZSA9PT0gXCJhc3NldHNcIikge1xuICAgICAgICAgICAgYXNzZXROb2RlID0gbm9kZTtcbiAgICAgICAgICAgIGdhbWUuaW5zZXJ0Q2hpbGQoZ2FtZS5jaGlsZHJlbi5sZW5ndGggLSAxLCBub2RlKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGNvbnN0IHBhZ2Ugb2YgZmlnbWEucm9vdC5jaGlsZHJlbikge1xuICAgICAgICBpZiAocGFnZS5uYW1lLnN1YnN0cmluZygwLCBQTEFZRVJfUFJFRklYLmxlbmd0aCkgPT09IFBMQVlFUl9QUkVGSVgpIHtcbiAgICAgICAgICAgIHBhZ2VOb2Rlc1twYWdlLm5hbWVdID0gcGFnZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChwYWdlLm5hbWUgPT09IFwiQXNzZXRzXCIgJiYgYXNzZXROb2RlID09PSBudWxsKSB7XG4gICAgICAgICAgICBhc3NldE5vZGUgPSBmaWdtYS5jcmVhdGVDb21wb25lbnQoKTtcbiAgICAgICAgICAgIGFzc2V0Tm9kZS5uYW1lID0gXCJhc3NldHNcIjtcbiAgICAgICAgICAgIGdhbWUuYXBwZW5kQ2hpbGQoYXNzZXROb2RlKTtcbiAgICAgICAgICAgIGNvbnN0IGhpZGRlbkZyYW1lID0gZmlnbWEuY3JlYXRlRnJhbWUoKTtcbiAgICAgICAgICAgIGhpZGRlbkZyYW1lLm5hbWUgPSBcImhpZGRlbi1kYXRhXCI7XG4gICAgICAgICAgICBoaWRkZW5GcmFtZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICBoaWRkZW5GcmFtZS5sb2NrZWQgPSB0cnVlO1xuICAgICAgICAgICAgbGV0IHhPZmZzZXQgPSBNQVJHSU47XG4gICAgICAgICAgICBmb3IgKGNvbnN0IGZyYW1lIG9mIHBhZ2UuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoZnJhbWUudHlwZSAhPT0gXCJGUkFNRVwiKVxuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICBsZXQgYmFjayA9IG51bGw7XG4gICAgICAgICAgICAgICAgbGV0IHlPZmZzZXQgPSBNQVJHSU47XG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBmcmFtZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoYmFjayA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmFjayA9IGNoaWxkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNoaWxkLnR5cGUgPT09IFwiQ09NUE9ORU5UXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgd2lkZ2V0ID0gZmlnbWEuY3JlYXRlQ29tcG9uZW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBiYWNrQ2xvbmUgPSBiYWNrLmNsb25lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrQ2xvbmUueCA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrQ2xvbmUueSA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBiYWNrQ2xvbmUubG9ja2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldC5uYW1lID0gZnJhbWUubmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldC5jbGlwc0NvbnRlbnQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhpZGRlbkZyYW1lLmFwcGVuZENoaWxkKHdpZGdldCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQuYXBwZW5kQ2hpbGQoYmFja0Nsb25lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGNsb25lID0gY2hpbGQuY2xvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdpZGdldC5hcHBlbmRDaGlsZChjbG9uZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbG9uZS54ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lLnkgPSBISURFX09GRlNFVDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsb25lLmxvY2tlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aWRnZXQucmVzaXplKGNsb25lLndpZHRoLCBjbG9uZS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5zdGFuY2UgPSB3aWRnZXQuY3JlYXRlSW5zdGFuY2UoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFzc2V0Tm9kZS5hcHBlbmRDaGlsZChpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS54ID0geE9mZnNldDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc3RhbmNlLnkgPSB5T2Zmc2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgeU9mZnNldC0tO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHhPZmZzZXQgKz0gMjAgKyBmcmFtZS53aWR0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3NldE5vZGUucmVzaXplKGdhbWUud2lkdGgsIGdhbWUuaGVpZ2h0ICsgSElERV9PRkZTRVQpO1xuICAgIGFzc2V0Tm9kZS54ID0gMDtcbiAgICBhc3NldE5vZGUueSA9IDA7XG4gICAgZm9yIChjb25zdCBub2RlIG9mIGdhbWUuY2hpbGRyZW4pIHtcbiAgICAgICAgaWYgKFtcIkNPTVBPTkVOVFwiLCBcIklOU1RBTkNFXCIsIFwiRlJBTUVcIiwgXCJSRUNUQU5HTEVcIl0uaW5kZXhPZihub2RlLnR5cGUpID49IDAgJiZcbiAgICAgICAgICAgIG5vZGUubmFtZS5zdWJzdHJpbmcoMCwgUExBWUVSX1BSRUZJWC5sZW5ndGgpID09IFBMQVlFUl9QUkVGSVgpIHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBub2RlLm5hbWUuc3Vic3RyaW5nKFBMQVlFUl9QUkVGSVgubGVuZ3RoKTtcbiAgICAgICAgICAgIGlmIChwbGF5ZXJzLmhhcyhuYW1lKSkge1xuICAgICAgICAgICAgICAgIGZpZ21hLm5vdGlmeShcIlBsYXllciBuYW1lcyBtdXN0IGJlIHVuaXF1ZVwiKTtcbiAgICAgICAgICAgICAgICBmaWdtYS5jbG9zZVBsdWdpbigpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBwbGF5ZXJQYWdlID0gcGFnZU5vZGVzW25vZGUubmFtZV07XG4gICAgICAgICAgICBpZiAoIXBsYXllclBhZ2UpIHtcbiAgICAgICAgICAgICAgICBwbGF5ZXJQYWdlID0gZmlnbWEuY3JlYXRlUGFnZSgpO1xuICAgICAgICAgICAgICAgIHBsYXllclBhZ2UubmFtZSA9IG5vZGUubmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB2aWV3ZXJGcmFtZSA9IG51bGw7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IG5vZGUgb2YgcGxheWVyUGFnZS5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLnR5cGUgPT09IFwiRlJBTUVcIiAmJiBub2RlLm5hbWUgPT09IFwidmlld2VyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmlld2VyRnJhbWUgPSBub2RlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodmlld2VyRnJhbWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICB2aWV3ZXJGcmFtZSA9IGZpZ21hLmNyZWF0ZUZyYW1lKCk7XG4gICAgICAgICAgICAgICAgcGxheWVyUGFnZS5hcHBlbmRDaGlsZCh2aWV3ZXJGcmFtZSk7XG4gICAgICAgICAgICAgICAgdmlld2VyRnJhbWUubmFtZSA9IFwidmlld2VyXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwbGF5ZXJGcmFtZXNbbmFtZV0gPSB2aWV3ZXJGcmFtZS5pZDtcbiAgICAgICAgICAgIHZpZXdlckZyYW1lLnJlc2l6ZShub2RlLndpZHRoLCBub2RlLmhlaWdodCk7XG4gICAgICAgICAgICBsZXQgcGVyaXNjb3BlID0gbnVsbDtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2hpbGQgb2Ygdmlld2VyRnJhbWUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQudHlwZSA9PT0gXCJJTlNUQU5DRVwiICYmIGNoaWxkLm5hbWUgPT09IFwicGVyaXNjb3BlXCIgJiYgY2hpbGQubWFzdGVyQ29tcG9uZW50ID09PSBhc3NldE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcGVyaXNjb3BlID0gY2hpbGQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjaGlsZC5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocGVyaXNjb3BlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcGVyaXNjb3BlID0gYXNzZXROb2RlLmNyZWF0ZUluc3RhbmNlKCk7XG4gICAgICAgICAgICAgICAgdmlld2VyRnJhbWUuYXBwZW5kQ2hpbGQocGVyaXNjb3BlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBlcmlzY29wZS54ID0gYXNzZXROb2RlLnggLSBub2RlLng7XG4gICAgICAgICAgICBwZXJpc2NvcGUueSA9IGFzc2V0Tm9kZS55IC0gbm9kZS55IC0gSElERV9PRkZTRVQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3QgdXJsID0gZmlnbWEucm9vdC5nZXRQbHVnaW5EYXRhKFwidXJsXCIpO1xuICAgIGlmICh1cmwgIT09IG51bGwpIHtcbiAgICAgICAgZmlnbWEudWkucG9zdE1lc3NhZ2UoeyB0eXBlOiBcInNldFVSTFwiLCB1cmwgfSk7XG4gICAgfVxuICAgIGZpZ21hLnVpLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJwbGF5ZXJGcmFtZXNcIiwgcGxheWVyRnJhbWVzIH0pO1xuICAgIGZpZ21hLnVpLm9ubWVzc2FnZSA9IG1zZyA9PiB7XG4gICAgICAgIGlmIChtc2cudHlwZSA9PT0gXCJzZXRVUkxcIikge1xuICAgICAgICAgICAgZmlnbWEucm9vdC5zZXRQbHVnaW5EYXRhKFwidXJsXCIsIG1zZy51cmwpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtc2cudHlwZSA9PT0gXCJzaHVmZmxlXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHRvU2h1ZmZsZSA9IGZpZ21hLmN1cnJlbnRQYWdlLnNlbGVjdGlvbi5tYXAoKG5vZGUpID0+IG5vZGUuaWQpO1xuICAgICAgICAgICAgaWYgKHRvU2h1ZmZsZS5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgY29uc3Qgbm9kZSA9IGZpZ21hLmdldE5vZGVCeUlkKHRvU2h1ZmZsZVswXSk7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnQgPSBub2RlLnBhcmVudDtcbiAgICAgICAgICAgIGxldCB4UG9zID0gbm9kZS54O1xuICAgICAgICAgICAgbGV0IHlQb3MgPSBub2RlLnk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRvU2h1ZmZsZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGlkeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqICh0b1NodWZmbGUubGVuZ3RoIC0gaSkpICsgaTtcbiAgICAgICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBmaWdtYS5nZXROb2RlQnlJZCh0b1NodWZmbGVbaWR4XSk7XG4gICAgICAgICAgICAgICAgdGFyZ2V0LnggPSB4UG9zO1xuICAgICAgICAgICAgICAgIHRhcmdldC55ID0geVBvcztcbiAgICAgICAgICAgICAgICB5UG9zLS07XG4gICAgICAgICAgICAgICAgcGFyZW50Lmluc2VydENoaWxkKGksIHRhcmdldCk7XG4gICAgICAgICAgICAgICAgY29uc3QgdG1wID0gdG9TaHVmZmxlW2lkeF07XG4gICAgICAgICAgICAgICAgdG9TaHVmZmxlW2lkeF0gPSB0b1NodWZmbGVbaV07XG4gICAgICAgICAgICAgICAgdG9TaHVmZmxlW2ldID0gdG1wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlnbWEubm90aWZ5KFwiRmluaXNoZWQgc2h1ZmZsaW5nXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtc2cudHlwZSA9PT0gXCJnYXRoZXJcIikge1xuICAgICAgICAgICAgY29uc3QgdG9HYXRoZXIgPSBmaWdtYS5jdXJyZW50UGFnZS5zZWxlY3Rpb247XG4gICAgICAgICAgICBpZiAodG9HYXRoZXIubGVuZ3RoICE9PSAxKSB7XG4gICAgICAgICAgICAgICAgZmlnbWEubm90aWZ5KFwiU2VsZWN0IGEgc2luZ2xlIGl0ZW0gdG8gZ2F0aGVyXCIpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHRvR2F0aGVyWzBdO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0TmFtZSA9IHRhcmdldC5uYW1lO1xuICAgICAgICAgICAgYXNzZXROb2RlLmFwcGVuZENoaWxkKHRhcmdldCk7XG4gICAgICAgICAgICBsZXQgbmV4dElkeCA9IGFzc2V0Tm9kZS5jaGlsZHJlbi5sZW5ndGggLSAxO1xuICAgICAgICAgICAgbGV0IHhQb3MgPSB0YXJnZXQueDtcbiAgICAgICAgICAgIGxldCB5UG9zID0gdGFyZ2V0Lnk7XG4gICAgICAgICAgICBjb25zdCBjaGlsZHJlbiA9IGFzc2V0Tm9kZS5jaGlsZHJlbjtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY2FuZGlkYXRlIG9mIGNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNhbmRpZGF0ZS5pZCAhPT0gdGFyZ2V0LmlkICYmIGNhbmRpZGF0ZS5uYW1lID09PSB0YXJnZXROYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgIGFzc2V0Tm9kZS5pbnNlcnRDaGlsZChuZXh0SWR4LCBjYW5kaWRhdGUpO1xuICAgICAgICAgICAgICAgICAgICB5UG9zKys7XG4gICAgICAgICAgICAgICAgICAgIGNhbmRpZGF0ZS54ID0geFBvcztcbiAgICAgICAgICAgICAgICAgICAgY2FuZGlkYXRlLnkgPSB5UG9zO1xuICAgICAgICAgICAgICAgICAgICBuZXh0SWR4LS07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChtc2cudHlwZSA9PT0gXCJmbGlwXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IHNlbGVjdGVkID0gZmlnbWEuY3VycmVudFBhZ2Uuc2VsZWN0aW9uO1xuICAgICAgICAgICAgZm9yIChsZXQgbm9kZSBvZiBzZWxlY3RlZCkge1xuICAgICAgICAgICAgICAgIGlmIChub2RlLnR5cGUgIT09IFwiSU5TVEFOQ0VcIilcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgbm9kZSA9IG5vZGUubWFzdGVyQ29tcG9uZW50O1xuICAgICAgICAgICAgICAgIGlmIChub2RlLmNoaWxkcmVuLmxlbmd0aCA9PT0gMikge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjbG9uZSA9IG5vZGUuY2hpbGRyZW5bMV0uY2xvbmUoKTtcbiAgICAgICAgICAgICAgICAgICAgbm9kZS5hcHBlbmRDaGlsZChjbG9uZSk7XG4gICAgICAgICAgICAgICAgICAgIGNsb25lLnkgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChub2RlLmNoaWxkcmVuLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICBub2RlLmNoaWxkcmVuWzJdLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG59XG5tYWluKCk7XG4iXSwic291cmNlUm9vdCI6IiJ9