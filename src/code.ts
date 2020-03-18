// This plugin will open a modal to prompt the user to enter a number, and
// it will then create that many rectangles on the screen.

// This file holds the main code for the plugins. It has access to the *document*.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser enviroment (see documentation).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, {width: 400, height: 400});

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
  const pageNodes: { [name: string]: PageNode } = {};
  const playerFrames: { [name: string]: string } = {};
  let assetNode: ComponentNode | null = null;
  const game = selection[0];
  let players = new Set<string>();

  for (const node of game.children) {
    if (node.type === "COMPONENT" && node.name === "assets") {
      assetNode = node;
      game.insertChild(game.children.length - 1, node);
    }
  }

  for (const page of figma.root.children) {
    if (page.name.substring(0, PLAYER_PREFIX.length) === PLAYER_PREFIX) {
      pageNodes[page.name] = page;
    } else if (page.name === "Assets" && assetNode === null) {
      assetNode = figma.createComponent();
      assetNode.name = "assets";
      game.appendChild(assetNode);
      const hiddenFrame = figma.createFrame();
      hiddenFrame.name = "hidden-data";
      hiddenFrame.visible = false;
      hiddenFrame.locked = true;

      let xOffset = MARGIN;
      for (const frame of page.children) {
        if (frame.type !== "FRAME") continue;

        let back: SceneNode | null = null;
        let yOffset = MARGIN;
        for (const child of frame.children) {
          if (back === null) {
            back = child;
          } else if (child.type === "COMPONENT") {
            continue;
          } else {
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

      let viewerFrame: FrameNode | null = null;
      for (const node of playerPage.children) {
        if (node.type === "FRAME" && node.name === "viewer") {
          viewerFrame = node;
        } else {
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
      let periscope: InstanceNode | null = null;
      for (const child of viewerFrame.children) {
        if (child.type === "INSTANCE" && child.name === "periscope" && child.masterComponent === assetNode) {
          periscope = child;
        } else {
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
      if (toShuffle.length === 0) return;
      const node = figma.getNodeById(toShuffle[0]) as SceneNode;
      const parent = node.parent;
      let xPos = node.x;
      let yPos = node.y;

      for (let i = 0; i < toShuffle.length; i++) {
        const idx = Math.floor(Math.random() * (toShuffle.length - i)) + i;
        const target = figma.getNodeById(toShuffle[idx]) as SceneNode;
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
        if (node.type !== "INSTANCE") continue;

        node = node.masterComponent;

        if (node.children.length === 2) {
          const clone = node.children[1].clone();
          node.appendChild(clone);
          clone.y = 0;
        } else if (node.children.length === 3) {
          node.children[2].remove();
        }
      }
    }
  };
}

main();
