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
  global_scaling = 1.0;
  global_speed = 1.0;

  sprite = {};
  spriteColor = 0xffffff;

  path = null;
  pathColor = 0x555555;
  pathWidth = 7;

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

  constructor(
    pixiApp,
    key,
    label,
    models,
    dbcFrom,
    dbcTo,
    layout,
    picto,
    scaling,
    global_speed = 1.0
  ) {
    this.pixiApp = pixiApp;
    this.key = key;
    this.label = label;
    this.models = models;
    this.dbcFrom = dbcFrom;
    this.dbcTo = dbcTo;
    this.layout = layout;
    this.compPicto = picto;
    this.global_scaling = scaling;
    this.global_speed = global_speed;
    this.pathWidth = this.pathWidth * this.global_scaling;

    if (!this.compPicto) {
      this.compPicto = "blood.png";
    }

    this.edit_comp_event = new CustomEvent("edit_comp", { detail: this.key });

    this.drawPath();
    this.sprite = PIXI.Sprite.from(this.compPicto);
    this.sprite["name_sprite"] = key;
    this.sprite["compType"] = this.compType;
    this.sprite.anchor = { x: 0.5, y: 0.5 };
    this.sprite.x = this.dbcFrom.sprite.x;
    this.sprite.y = this.dbcFrom.sprite.y;
    this.sprite.scale.set(
      0.035 * this.dbcFrom.global_scaling,
      0.07 * this.dbcFrom.global_scaling
    );
    this.sprite.eventMode = "none";
    this.sprite.tint = this.spriteColor;
    this.sprite.zIndex = 8;

    this.pixiApp.stage.addChild(this.sprite);

    this.registerConnectorWithDbc();

    //define the caption style and text object and add it to the stage
    this.textStyle = new PIXI.TextStyle({
      fill: "white",
      fontSize: 10.0,
      fontFamily: "Arial",
      strokeThickness: 0,
    });

    this.text = new PIXI.Text(this.label, this.textStyle);
    this.text["name_text"] = this.key;
    this.text.anchor = { x: 0.5, y: 0.5 };
    this.text.x = this.sprite.x;
    this.text.y = this.sprite.y;
    this.text.rotation = 0;
    this.text.zIndex = 9;

    const x2 = this.dbcTo.sprite.x;
    const y2 = this.dbcTo.sprite.y;

    let xc = this.line.x2 - this.line.x1;
    let yc = this.line.y2 - this.line.y1;
    this.text.x = this.line.x1 + xc / 2.0;
    this.text.y = this.line.y1 + yc / 2.0;

    let angle = 0;
    angle =
      Math.atan2(this.sprite.y - y2, this.sprite.x - x2) -
      0.785 * 2 +
      90 * 0.0174533;

    if (Math.abs(angle) > Math.PI / 2.0) {
      angle -= angle - Math.PI * 2;
    }
    this.text.rotation = angle;
    this.pixiApp.stage.addChild(this.text);
  }
  registerConnectorWithDbc() {
    // register with the dbc
    this.dbcFrom.connectors[this.key] = this;
    this.dbcTo.connectors[this.key] = this;
  }
  drawPath() {
    if (this.path) {
      this.path.clear();
      this.pixiApp.stage.removeChild(this.path);
    }

    this.path = new PIXI.Graphics();
    this.path["name_path"] = this.key;
    this.path.zIndex = 7;
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
    this.path.eventMode = "none";
    this.pixiApp.stage.addChild(this.path);
  }
  setEditingMode(newMode) {}
  update(data) {
    let noData = false;

    this.xCenter = this.dbcFrom.xCenter + this.dbcFrom.xOffset;
    this.yCenter = this.dbcFrom.yCenter + this.dbcFrom.yOffset;

    // get the speed
    let flow = 0;
    let direction = 0;

    this.models.forEach((model) => {
      flow += data[model + ".flow"];
    });

    if (isNaN(flow)) {
      flow = 0.0;
      noData = true;
    }

    this.spritePosition += (flow / this.models.length) * this.global_speed;

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

    this.sprite.rotation = angle + direction;

    this.prevSpriteX = this.sprite.x;
    this.prevSpriteY = this.sprite.y;
  }

  remap(value, from1, to1, from2, to2) {
    return ((value - from1) / (to1 - from1)) * (to2 - from2) + from2;
  }
}
