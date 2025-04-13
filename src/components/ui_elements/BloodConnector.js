import { PIXI } from "src/boot/pixi.js";

export default class BloodConnector {
  compType = "BloodConnector";
  compPicto = "blood.png";
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
  angleCorrection = 0;

  text = {};
  textStyle = {};

  path = null;
  pathColor = 0x666666;
  pathWidth = 7;
  prevPosition = 0;

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
    this.compPicto = picto;
    this.global_scaling = scaling;
    this.global_speed = global_speed;
    this.pathWidth = this.pathWidth * this.global_scaling;

    if (!this.compPicto) {
      this.compPicto = "blood.png";
    }

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
    this.sprite.eventMode = "none";

    this.registerConnectorWithDbc();
  }
  registerConnectorWithDbc() {
    // register with the dbc
    this.dbcFrom.connectors[this.key] = this;
    this.dbcTo.connectors[this.key] = this;
  }
  setEditingMode(newMode) {}
  drawPath() {
    if (this.path) {
      this.path.clear();
      this.pixiApp.stage.removeChild(this.path);
    }
    this.path = new PIXI.Graphics();
    this.path["name_path"] = this.key;
    this.path.zIndex = 7;
    this.path.cacheAsBitmap = true;

    if (
      this.dbcFrom.layout.pos.type == "arc" &&
      this.dbcTo.layout.pos.type == "arc"
    ) {
      // get the path characteristics
      this.line.enabled = false;
      this.arc.enabled = true;
      let c = 0;
      if (this.dbcFrom.layout.pos.dgs > this.dbcTo.layout.pos.dgs) {
        c = 360;
      }
      this.arc.from = this.dbcFrom.layout.pos.dgs * 0.0174533;
      this.arc.to = (this.dbcTo.layout.pos.dgs + c) * 0.0174533;
      this.arc.radius = this.dbcFrom.xCenter * this.dbcFrom.radius;
      this.arc.xCenter = this.dbcFrom.xCenter + this.dbcFrom.xOffset;
      this.arc.yCenter = this.dbcFrom.yCenter + this.dbcFrom.yOffset;
      // draw the path
      this.path.lineStyle(this.pathWidth, this.pathColor, 1);
      this.path.arc(
        this.arc.xCenter,
        this.arc.yCenter,
        this.arc.radius,
        this.arc.from,
        this.arc.to
      );
      this.spritePosition = this.dbcFrom.layout.pos.dgs * 0.0174533;
    } else {
      this.arc.enabled = false;
      this.line.enabled = true;

      // now it is difficult to calculate the arc. first calculate center x
      this.line.x1 = this.dbcFrom.sprite.x;
      this.line.y1 = this.dbcFrom.sprite.y;
      this.line.x2 = this.dbcTo.sprite.x;
      this.line.y2 = this.dbcTo.sprite.y;
      this.line.radius = this.dbcFrom.xCenter * this.dbcFrom.radius;

      let radsq = this.line.radius * this.line.radius;
      let q = Math.sqrt(
        (this.line.x2 - this.line.x1) * (this.line.x2 - this.line.x1) +
          (this.line.y2 - this.line.y1) * (this.line.y2 - this.line.y1)
      );
      let x3 = (this.line.x1 + this.line.x2) / 2;
      let y3 = (this.line.y1 + this.line.y2) / 2;

      this.line.xCenter =
        x3 +
        Math.sqrt(radsq - (q / 2) * (q / 2)) *
          ((this.line.y1 - this.line.y2) / q);

      this.line.yCenter =
        y3 +
        Math.sqrt(radsq - (q / 2) * (q / 2)) *
          ((this.line.x2 - this.line.x1) / q);

      let angle1 =
        Math.atan2(
          this.line.yCenter - this.line.y1,
          this.line.x1 - this.line.xCenter
        ) * 57.2958;
      if (this.line.yCenter - this.line.y1 >= 0) {
        angle1 = 180 + (180 - angle1);
      } else {
        angle1 = -angle1;
      }
      this.line.from = angle1 * 0.0174533;

      let angle2 =
        Math.atan2(
          this.line.yCenter - this.line.y2,
          this.line.x2 - this.line.xCenter
        ) * 57.2958;
      if (this.line.yCenter - this.line.y2 >= 0) {
        angle2 = 180 + (180 - angle2);
      } else {
        angle2 = -angle2;
      }
      this.line.to = angle2 * 0.0174533;

      this.path.lineStyle(this.pathWidth, this.pathColor, 1);
      this.path.arc(
        this.line.xCenter,
        this.line.yCenter,
        this.line.radius,
        this.line.from,
        this.line.to
      );

      this.angleCorrection = 0;
      // if the position line.from is greater then line.to we need a correction factor
      if (this.line.from > this.line.to) {
        this.angleCorrection = Math.PI * 2.0;
      }
    }
    this.path.eventMode = "none";
    this.pixiApp.stage.addChild(this.path);
  }
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
      direction = Math.PI;
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

    // caulcate the new position if the
    if (this.line.enabled) {
      // it only looks at x coordinates which why it fails
      if (this.spritePosition > this.line.to) {
        this.spritePosition = this.line.from - this.angleCorrection;
      }
      if (this.spritePosition < this.line.from - this.angleCorrection) {
        this.spritePosition = this.line.to;
      }

      this.sprite.x =
        this.line.xCenter + Math.cos(this.spritePosition) * this.line.radius;
      this.sprite.y =
        this.line.yCenter + Math.sin(this.spritePosition) * this.line.radius;

      angle = this.spritePosition + Math.PI;
    }

    if (this.arc.enabled) {
      if (this.spritePosition > this.arc.to) {
        this.spritePosition = this.arc.from;
      }
      if (this.spritePosition < this.arc.from) {
        this.spritePosition = this.arc.to;
      }
      this.sprite.x =
        this.arc.xCenter + Math.cos(this.spritePosition) * this.arc.radius;
      this.sprite.y =
        this.arc.yCenter + Math.sin(this.spritePosition) * this.arc.radius;

      angle = this.spritePosition + Math.PI;
    }

    this.sprite.rotation = angle + direction;
    this.prevPosition = this.spritePosition;

    this.prevSpriteX = this.sprite.x;
    this.prevSpriteY = this.sprite.y;
  }

  remap(value, from1, to1, from2, to2) {
    return ((value - from1) / (to1 - from1)) * (to2 - from2) + from2;
  }
}
