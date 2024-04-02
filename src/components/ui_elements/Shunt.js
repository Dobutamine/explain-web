import { PIXI } from "src/boot/pixi.js";

export default class Shunt {
  compType = "Shunt";
  key = "";
  label = "";
  pixiApp = {};
  models = [];
  dbcFrom = {};
  dbcTo = {};
  layout = {};

  sprite = {};
  spriteColor = 0xffffff;

  path = null;
  pathColor = 0x333333;
  pathWidth = 5;

  arc = {
    enabled: false,
    from: 0,
    to: 0,
    xCenter: 0,
    yCenter: 0,
    radius: 0,
  };

  line = {
    enabled: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    from: 0,
    to: 0,
    xCenter: 0,
    yCenter: 0,
    radius: 0,
  };

  spritePosition = 0;
  prevSpriteX = 0;
  prevSpriteY = 0;

  edit_comp_event = null;

  constructor(pixiApp, key, label, models, dbcFrom, dbcTo, layout, picto) {
    this.pixiApp = pixiApp;
    this.key = key;
    this.label = label;
    this.models = models;
    this.dbcFrom = dbcFrom;
    this.dbcTo = dbcTo;
    this.layout = layout;
    this.compPicto = picto;

    if (!this.compPicto) {
      this.compPicto = "blood.png";
    }

    this.edit_comp_event = new CustomEvent("edit_comp", { detail: this.key });

    this.drawPath();

    this.sprite = PIXI.Sprite.from(this.compPicto);
    this.sprite.anchor = { x: 0.5, y: 0.5 };
    this.sprite.x = this.dbcFrom.sprite.x;
    this.sprite.y = this.dbcFrom.sprite.y;
    this.sprite.scale.set(0.035, 0.07);
    this.sprite.interactive = true;
    this.sprite.on("mouseup", (e) => this.onDragEnd(e));
    this.sprite.on("touchend", (e) => this.onDragEnd(e));
    this.sprite.tint = this.spriteColor;
    this.sprite.zIndex = 6;

    this.pixiApp.stage.addChild(this.sprite);

    this.registerConnectorWithDbc();
  }
  registerConnectorWithDbc() {
    // register with the dbc
    this.dbcFrom.connectors[this.key] = this;
    this.dbcTo.connectors[this.key] = this;
  }
  onDragEnd(e) {
    document.dispatchEvent(this.edit_comp_event);
  }
  drawPath() {
    if (this.path) {
      this.path.clear();
      this.pixiApp.stage.removeChild(this.path);
    }

    this.path = new PIXI.Graphics();
    this.path.zIndex = 1;
    this.path.cacheAsBitmap = true;

    this.arc.enabled = false;
    this.line.enabled = true;

    // now it is difficult to calculate the arc. first calculate center x
    this.line.x1 = this.dbcFrom.sprite.x;
    this.line.y1 = this.dbcFrom.sprite.y;
    this.line.x2 = this.dbcTo.sprite.x;
    this.line.y2 = this.dbcTo.sprite.y;

    this.path.lineStyle(this.pathWidth, this.pathColor, 1);
    this.path.moveTo(this.line.x1, this.line.y1);
    this.path.lineTo(this.line.x2, this.line.y2);
    this.path.interactive = true;

    this.path.on("mouseup", (e) => this.onDragEnd(e));
    this.path.on("touchend", (e) => this.onDragEnd(e));
    this.pixiApp.stage.addChild(this.path);
  }
  setEditingMode(newMode) {}
  update(data) {
    let noData = false;

    this.xCenter = this.dbcFrom.xCenter;
    this.yCenter = this.dbcFrom.yCenter;

    // get the speed
    let flow = 0;
    let direction = 0;

    this.models.forEach((model) => {
      flow += data[model + ".Flow"];
    });

    if (isNaN(flow)) {
      flow = 0.0;
      noData = true;
    }

    this.spritePosition += flow / this.models.length;

    if (flow >= 0) {
      direction = 0;
      this.sprite.tint = this.dbcFrom.sprite.tint;
    } else {
      direction = Math.PI * 2;
      this.sprite.tint = this.dbcTo.sprite.tint;
    }

    if (noData) {
      this.sprite.alpha = 0.0;
    } else {
      this.sprite.alpha = 1.0;
    }

    // get the position of the dbc's
    const x1 = this.dbcFrom.sprite.x;
    const y1 = this.dbcFrom.sprite.y;
    const x2 = this.dbcTo.sprite.x;
    const y2 = this.dbcTo.sprite.y;

    // calculate the angle
    let angle = 0;
    angle = Math.atan2(this.sprite.y - y2, this.sprite.x - x2) - 0.785 * 2;
    if (flow < 0) {
      angle = Math.atan2(this.sprite.y - y1, this.sprite.x - x1) - 0.785 * 2;
    }

    const remapT = this.remap(this.spritePosition, 0, 1, 0, 1);
    const t = remapT / 1;
    this.sprite.x = (1 - t) * x1 + t * x2;
    this.sprite.y = (1 - t) * y1 + t * y2;

    if (remapT > 1) {
      this.spritePosition = 0;
    }
    if (remapT < 0) {
      this.spritePosition = 1;
    }

    //angle = this.spritePosition + Math.PI * 2;

    this.sprite.rotation = angle + direction;

    this.prevSpriteX = this.sprite.x;
    this.prevSpriteY = this.sprite.y;
  }

  remap(value, from1, to1, from2, to2) {
    return ((value - from1) / (to1 - from1)) * (to2 - from2) + from2;
  }
}
