function main() {
  const selection = figma.currentPage.selection;
  if (selection.length !== 1) {
    figma.notify("Select exactly 1 frame to start game");
    figma.closePlugin();
    return;
  }

  let game = selection[0];

  if (game.type !== "FRAME") {
    figma.notify("Must select a frame node");
    figma.closePlugin();
    return;
  }

  const MARGIN = 100;
  game.setRelaunchData({
    reset: "Reset the game to the default state",
  });

  figma.root.setPluginData("url", "");

  for (const node of game.children) {
    if (node.getPluginData("gameId") === game.id || (node.name === "assets" && node.type === "COMPONENT")) {
      node.remove();
    }
  }

  let itemIdx = 0;

  for (const page of figma.root.children) {
    if (page.name === "Assets") {
      let xOffset = MARGIN;
      for (const frame of page.children) {
        if (frame.type !== "FRAME") continue;

        itemIdx++;

        let back: SceneNode | null = null;
        let yOffset = MARGIN;
        for (const child of frame.children) {
          if (back === null) {
            back = child;
          } else if (child.type === "COMPONENT") {
            continue;
          } else {
            const backClone = back.clone();
            backClone.x = 0;
            backClone.y = 0;
            backClone.locked = true;

            const clone = child.clone();
            clone.x = 0;
            clone.y = 0;
            clone.locked = true;

            const widget = figma.createFrame();
            game.appendChild(widget);
            widget.name = frame.name;
            widget.fills = [];
            widget.clipsContent = false;
            widget.appendChild(clone);
            widget.appendChild(backClone);
            widget.resize(clone.width, clone.height);
            widget.x = xOffset;
            widget.y = yOffset;

            const spacer = figma.createRectangle();
            game.appendChild(spacer);
            spacer.name = "----";
            spacer.resize(clone.width, 1);
            spacer.x = widget.x;
            spacer.y = widget.y + widget.height;
            spacer.fills = [];

            const item = figma.group([widget, spacer], game);
            item.name = frame.name;
            item.setPluginData("gameId", game.id);
            item.setPluginData("class", `item-${itemIdx}`)
            item.setRelaunchData({
              shuffle: '',
              gather: '',
              flip: '',
              tidy: '',
              show: 'Only you see the hidden info',
              count: `Count ${frame.name}s`
            })

            yOffset--;
          }
        }

        if (back) {
          xOffset += MARGIN + back.width;
        }
      }
    }
  }

  figma.closePlugin();
}

function turnFaceDown(node: SceneNode) {
  if (node.type === "GROUP") {
    if (node.children.length > 0 && node.children[0].type === "FRAME") {
      node = node.children[0];
      if (node.children.length === 3) {
        node.children[2].remove();
      }
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

  const assetNode = target.parent;
  if (assetNode.removed) return;
  if (assetNode.type !== "FRAME") return;

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

  const targetName = target.getPluginData("class");
  const children = assetNode.children;
  const gathered: SceneNode[] = [];

  for (const candidate of children) {
    if (candidate.getPluginData("class") === targetName) {
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
    if (node.type !== "GROUP") continue;
    if (node.children.length === 0 || node.children[0].type !== "FRAME") continue;

    node.parent.appendChild(node);
    node = node.children[0];

    if (node.children.length === 2) {
      const clone = node.children[0].clone();
      node.appendChild(clone);
    } else if (node.children.length === 3) {
      node.children[2].remove();
    }
  }
  figma.closePlugin();
}

function show() {
  figma.showUI(__html__, { width: 400, height: 400 });

  const recompute = async () => {
    const selection = figma.currentPage.selection;
    const container = figma.createFrame();
    container.clipsContent = false;
    container.x = - 100000000;

    for (const node of selection) {
      if (node.type === "GROUP" && node.getPluginData("gameId") !== "") {
        if (node.children.length === 0 || node.children[0].type !== "FRAME") continue;

        const inner = node.children[0];
        const child = inner.children[0].clone();
        container.appendChild(child);
        child.x = inner.absoluteTransform[0][2];
        child.y = inner.absoluteTransform[1][2];
      }
    }

    let uri: string | null = null;
    if (container.children.length > 0) {
      const group = figma.group(container.children, container);

      await new Promise(resolve => setTimeout(resolve, 100));
      const bytes = await group.exportAsync({ format: "PNG", contentsOnly: false });

      uri = bytes.reduce((data, byte) => data + String.fromCharCode(byte), '');
    }
    figma.ui.postMessage({ type: "img", uri });
    container.remove();
  }

  recompute();

  figma.on("selectionchange", recompute);
}



if (figma.command && figma.command !== "" && figma.command !== "reset") {
  const selection = figma.currentPage.selection;
  if (figma.root.getPluginData("url") !== "" ||
      (selection.length > 0 && selection[0].getPluginData("assetNode") !== "")) {
    figma.showUI(__html__, { width: 400, height: 400 });
    figma.ui.postMessage({ type: "warn" });
  } else if (figma.command === "shuffle") shuffle();
  else if (figma.command === "flip") flip();
  else if (figma.command === "gather") gather();
  else if (figma.command === "tidy") gather();
  else if (figma.command === "show") show();
  else if (figma.command === "count") {
    figma.notify(`${figma.currentPage.selection.length} selected`);
    figma.closePlugin();
  }
} else main();


