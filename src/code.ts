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

function swap(arr: any[], i: number, j: number) {
  const tmp = arr[i];
  arr[i] = arr[j];
  arr[j] = tmp;
}

function shuffleArray(arr: any[], startIdx: number) {
  for (let i = startIdx; i < arr.length; i++) {
    const idx = Math.floor(Math.random() * (arr.length - i));
    swap(arr, i, i + idx);
  }
}

function setupCatan(board: FrameNode) {
  const indexToPosition = [
    [2, 4],
    [2, 6],
    [3, 5],
    [3, 3],
    [2, 2],
    [1, 3],
    [1, 5],
    [2, 8],
    [3, 7],
    [4, 6],
    [4, 4],
    [4, 2],
    [3, 1],
    [2, 0],
    [1, 1],
    [0, 2],
    [0, 4],
    [0, 6],
    [1, 7],
  ].reverse();

  const positionToIndex: { [position: string]: number } = {}
  for (let i = 0; i < indexToPosition.length; i++) {
    const position = indexToPosition[i];

    positionToIndex[`${position}`] = i;
  }

  const biomes = ["Field", "Forest", "Ore", "Desert", "Wheat", "Clay"];
  const allBiomes = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 4, 4, 4, 4, 5, 5, 5];
  const biomeComponents: (ComponentNode | null)[] = [null, null, null, null, null, null];
  let biomesFound = 0;

  const ports = ["Field", "Forest", "Ore", "Any", "Wheat", "Clay"];
  const allPorts = [0, 1, 2, 3, 3, 3, 3, 4, 5];
  const portComponents: (ComponentNode | null)[] = [null, null, null, null, null, null];
  let portsFound = 0;

  const numbers = ["2", "3", "4", "5", "6", "8", "9", "10", "11", "12"];
  const allNumbers = [0, 1, 1, 2, 2, 3, 3, 6, 6, 7, 7, 8, 8, 9];
  const numberComponents: (ComponentNode | null)[] = [null, null, null, null, null, null, null, null, null, null];
  let numbersFound = 0;

  for (const child of figma.root.children) {
    if (child.name.indexOf("Components") < 0) continue;

    for (const candidate of child.children) {
      if (candidate.type !== "COMPONENT") continue;

      if (candidate.name.indexOf("Biome / ") === 0) {
        const biomeName = candidate.name.substring(8);
        const biomeIdx = biomes.indexOf(biomeName);
        if (biomeIdx < 0) continue;
        if (biomeComponents[biomeIdx] != null) continue;

        biomesFound++;
        biomeComponents[biomeIdx] = candidate;
      } else if (candidate.name.indexOf("Port / ") === 0) {
        const portName = candidate.name.substring(7);
        const portIdx = ports.indexOf(portName);
        if (portIdx < 0) continue;
        if (portComponents[portIdx] != null) continue;

        portsFound++;
        portComponents[portIdx] = candidate;
      } else if (candidate.name.indexOf("Number Tile / ") === 0) {
        const numberName = candidate.name.substring(14);
        const numberIdx = numbers.indexOf(numberName);
        if (numberIdx < 0) continue;
        if (numberComponents[numberIdx] != null) continue;

        numbersFound++;
        numberComponents[numberIdx] = candidate;
      }

      if (biomesFound === 6 && portsFound === 6 && numbersFound === 10) break;
    }

    if (biomesFound === 6 && portsFound === 6 && numbersFound === 10) break;
  }

  shuffleArray(allBiomes, 0);
  shuffleArray(allPorts, 0);
  let currBiomeIdx = 0;
  let currPortIdx = 0;

  const numberPositions: number[] = [];
  for (let i = 0; i < allBiomes.length; i++) {
    if (allBiomes[i] !== 3) numberPositions.push(i);
  }

  const specialNumbers = [4, 4, 5, 5];
  let currIdx = 0;
  for (let i = 0; i < 4; i++) {
    const num = specialNumbers[i];
    allNumbers.splice(currIdx, 0, num);

    const idx = Math.floor(Math.random() * (numberPositions.length - currIdx));
    swap(numberPositions, currIdx, idx + currIdx);

    const coords = indexToPosition[numberPositions[currIdx]];
    currIdx++;

    const neighbors = [
      [coords[0] - 1, coords[1] - 1], [coords[0] - 1, coords[1] + 1],
      [coords[0], coords[1] - 2], [coords[0], coords[1] + 2],
      [coords[0] + 1, coords[1] - 1], [coords[0] + 1, coords[1] + 1],
    ];
    for (const neighbor of neighbors) {
      const position = positionToIndex[`${neighbor}`];
      if (position == undefined) continue;

      const idx = numberPositions.indexOf(position);
      if (idx < currIdx) continue;

      swap(numberPositions, currIdx, idx);

      const toSwap = Math.floor(Math.random() * (allNumbers.length - currIdx));
      swap(allNumbers, currIdx, currIdx + toSwap);
      currIdx++;
    }
  }

  shuffleArray(allNumbers, currIdx);

  const positionToComponent: { [pos: number]: ComponentNode } = {}
  for (let i = 0; i < allNumbers.length; i++) {
    positionToComponent[numberPositions[i]] = numberComponents[allNumbers[i]];
  }

  for (const child of board.children) {
    if (child.type !== "INSTANCE") continue;

    if (child.name.indexOf("Biome / ") === 0) {
      child.masterComponent = biomeComponents[allBiomes[currBiomeIdx]];
      if (positionToComponent[currBiomeIdx] && child.children[1].type === "INSTANCE") {
        child.children[1].masterComponent = positionToComponent[currBiomeIdx];
      }

      currBiomeIdx++;
    }

    if (child.name.indexOf("Port / ") === 0) {
      child.masterComponent = portComponents[allPorts[currPortIdx]];
      currPortIdx++;
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
  if (assetNode.type !== "FRAME" && assetNode.type !== "PAGE") return;

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

  let cachedHash: { [guid: string]: string } = {};

  const recompute = async () => {
    const selection = figma.currentPage.selection;
    let all_same = true;

    for (const node of selection) {
      if (cachedHash[node.id] !== `${node.x}:${node.y}`) {
        cachedHash[node.id] = `${node.x}:${node.y}`;
        all_same = false;
      }
    }

    if (all_same) return;

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

  figma.ui.on("message", (msg) => {
    if (msg.type === "trigger-refresh") recompute();
  });
  figma.on("selectionchange", () => {
    cachedHash = {};
    recompute();
  });
}

const selection = figma.currentPage.selection;

if (selection.length === 1 && (selection[0].name === "Catan Game Board" || figma.command === "reset_catan") && selection[0].type === "FRAME") {
  selection[0].setRelaunchData({ reset_catan: "" });
  setupCatan(selection[0]);
} else if (figma.command && figma.command !== "" && figma.command !== "reset") {
  const selection = figma.currentPage.selection;
  if (figma.root.getPluginData("url") !== "" ||
      (selection.length > 0 && selection[0].getPluginData("assetNode") !== "")) {
    figma.showUI(__html__, { width: 400, height: 400 });
    figma.ui.postMessage({ type: "warn" });
  } else if (figma.command === "shuffle") shuffle();
  else if (figma.command === "flip") flip();
  else if (figma.command === "gather" || figma.command === "tidy") {
    gather();
    figma.closePlugin();
  } else if (figma.command === "show") show();
  else if (figma.command === "count") {
    figma.notify(`${figma.currentPage.selection.length} selected`);
    figma.closePlugin();
  }
} else main();


