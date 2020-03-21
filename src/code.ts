function main() {
  const UI_HEIGHT = 150;
  const UI_WIDTH = 400;
  figma.showUI(__html__, { width: UI_WIDTH, height: UI_HEIGHT });

  const selection = figma.currentPage.selection;
  if (selection.length !== 1) {
    figma.notify("Select exactly 1 frame to start game");
    figma.closePlugin();
    return;
  }

  const url = figma.root.getPluginData("url");
  if (url !== null) {
    figma.ui.postMessage({ type: "setURL", url });
  }

  let game = selection[0];

  function showViewerInfo(target: SceneNode) {
    const viewerRef = target.getPluginData("viewerRef");
    const viewerFrame = figma.getNodeById(viewerRef);
    figma.ui.resize(UI_WIDTH, viewerFrame ? 400 : UI_HEIGHT);
    figma.ui.postMessage({ type: "setViewerFrame", viewerFrame: viewerFrame ? viewerRef : null });
  }

  if (game.getPluginData("gameRef") !== "") {
    const candidate = figma.getNodeById(game.getPluginData("gameRef"));
    if (candidate && !candidate.removed) {
      game = candidate as SceneNode;
    };
  }

  if (game.type !== "FRAME") {
    figma.notify("Must select a frame node");
    figma.closePlugin();
    return;
  }

  const HIDE_OFFSET = 20000;
  const MARGIN = 100;
  let assetNode: ComponentNode | null = null;
  game.setRelaunchData({ players: "Select or create a Viewing Window to see secret info" })

  for (const node of game.children) {
    if (node.type === "COMPONENT" && node.name === "assets") {
      assetNode = node;
      game.insertChild(game.children.length - 1, node);
    }
  }

  for (const page of figma.root.children) {
    const srcNode = page.getPluginData("srcNode");

    if (srcNode) {
      const node = figma.getNodeById(srcNode);
      if (!node || node.removed) page.remove();
    } else if (page.name === "Assets" && assetNode === null) {
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
            widget.setRelaunchData({
              shuffle: '',
              gather: '',
              flip: '',
              tidy: '',
              count: `Count ${frame.name}s`
            })

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

  function checkSelection() {
    function unset() {
      figma.ui.postMessage({ type: "unsetViewerFrame" });
      figma.ui.resize(UI_WIDTH, UI_HEIGHT);
    }

    if (figma.currentPage.selection.length !== 1) {
      unset();
      return;
    }

    const target = figma.currentPage.selection[0];
    if (target.parent !== assetNode) {
      unset();
      return;
    }

    showViewerInfo(target);
  }
  figma.on("selectionchange", checkSelection);
  checkSelection();

  figma.ui.onmessage = msg => {
    if (msg.type === "setURL") {
      figma.root.setPluginData("url", msg.url);
    } else if (msg.type === "setViewerFrame") {
      if (figma.currentPage.selection.length !== 1) return;

      const target = figma.currentPage.selection[0];
      const viewerRef = target.getPluginData("viewerRef");
      if (figma.getNodeById(viewerRef)) return;
      if (target.type !== "RECTANGLE" && target.type !== "FRAME" && target.type !== "INSTANCE") return;
      target.fills = [];
      target.strokes = [
        { type: "SOLID", color: { r: 0, g: 0, b: 0 }, opacity: 0.5 },
        { type: "SOLID", color: { r: 1, g: 1, b: 1 }, opacity: 0.5 },
      ];
      target.locked = true;
      target.dashPattern = [32, 32];
      target.strokeWeight = 8;
      target.name = "Viewing Window";

      const playerPage = figma.createPage();
      playerPage.name = "viewer-page";
      playerPage.setPluginData("srcNode", target.id);

      const viewerFrame = figma.createFrame();
      playerPage.appendChild(viewerFrame);
      viewerFrame.name = "viewer";
      target.setPluginData("viewerRef", viewerFrame.id);
      target.setPluginData("gameRef", game.id);
      target.setRelaunchData({ players: "Get link to secret viewing window" });
      viewerFrame.resize(target.width, target.height);

      const periscope = assetNode.createInstance();
      viewerFrame.appendChild(periscope);
      periscope.x = assetNode.x - target.x;
      periscope.y = assetNode.y - target.y - HIDE_OFFSET;

      figma.ui.resize(UI_WIDTH, 400);
      figma.ui.postMessage({ type: "setViewerFrame", viewerFrame: viewerFrame.id });
    }
  }
}

function turnFaceDown(node: SceneNode) {
  if (node.type === "INSTANCE") {
    const master = node.masterComponent;
    if (master.children.length === 3) {
      master.children[2].remove();
    }
  }
}

function shuffle() {
  const toShuffle = figma.currentPage.selection.map((node) => node.id);
  if (toShuffle.length === 0) return;
  const node = figma.getNodeById(toShuffle[0]) as SceneNode;
  const parent = node.parent;
  let xPos = node.x;
  let yPos = node.y;

  for (let i = 0; i < toShuffle.length; i++) {
    const idx = Math.floor(Math.random() * (toShuffle.length - i)) + i;
    const target = figma.getNodeById(toShuffle[idx]) as SceneNode;
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

  let target = toGather[0];
  let xPos = target.x;
  let yPos = target.y;

  const assetNodeID = target.getPluginData("assetNode");
  if (assetNodeID === "") return;
  const assetNode = figma.getNodeById(assetNodeID);
  if (assetNode.removed) return;
  if (assetNode.type !== "COMPONENT") return;

  if (toGather.length > 1) {
    toGather.sort((a, b) => {
      if (a.x < b.x) return -1;
      if (a.x > b.x) return 1;
      if (a.y < b.y) return -1;
      if (a.y > b.y) return 1;
      return 0;
    });

    target = toGather[0];
    xPos = target.x;
    yPos = target.y;

    for (const item of toGather) {
      item.x = xPos;
      item.y = yPos;
      xPos += item.width + 2;
      assetNode.appendChild(item);
    }
    figma.closePlugin();
    return;
  }

  const targetName = target.name;
  const children = assetNode.children;
  const gathered: SceneNode[] = [];

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
  figma.closePlugin();
}

if (figma.command === "shuffle") shuffle();
else if (figma.command === "flip") flip();
else if (figma.command === "gather") gather();
else if (figma.command === "tidy") gather();
else if (figma.command === "count") {
  figma.notify(`${figma.currentPage.selection.length} selected`);
  figma.closePlugin();
} else main();
