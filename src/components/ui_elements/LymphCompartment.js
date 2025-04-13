import { PIXI } from "src/boot/pixi.js";

export default class LymphCompartment {
  compType = "LymphCompartment";
  compPicto = "container.png";
  pixiApp = {};
  key = "";
  label = "";
  models = [];
  layout = null;
  xCenter = 0;
  yCenter = 0;
  xOffset = 0;
  yOffset = 0;
  radius = 0;
  angle = 0;
  rotation = 0;
  distanceToCenter = 0;
  global_scaling = 1.0;

  sprite = {};
  text = {};
  textStyle = {};

  interactionData = null;
  connectors = {};

  volume = 0.1;
  to2 = 7.4;

  edit_comp_event = null;
  editingMode = 1;
  prevX = 0;
  prevyY = 0;

  constructor(
    pixiApp,
    key,
    label,
    models,
    layout,
    xCenter,
    yCenter,
    xOffset,
    yOffset,
    radius,
    picto,
    scaling
  ) {
    // store the parameters
    this.pixiApp = pixiApp;
    this.key = key;
    this.label = label;
    this.models = models;
    this.layout = layout;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.radius = radius;
    this.compPicto = picto;
    this.global_scaling = scaling;

    if (!this.compPicto) {
      this.compPicto = "container.png";
    }

    // this is a blood compartment sprite which uses
    this.sprite = PIXI.Sprite.from(this.compPicto);
    this.sprite["name_sprite"] = key;
    this.sprite["compType"] = this.compType;
    this.sprite.eventMode = "none";
    this.sprite.scale.set(
      this.volume * this.layout.scale.x * this.global_scaling,
      this.volume * this.layout.scale.y * this.global_scaling
    );
    this.sprite.anchor = { x: 0.5, y: 0.5 };
    this.sprite.tint = "0x151a7b";
    this.sprite.rotation = this.layout.rotation;
    this.sprite.zIndex = 1;

    // place the sprite on the stage
    switch (this.layout.pos.type) {
      case "arc":
        this.sprite.x =
          this.xCenter +
          this.xOffset +
          Math.cos(this.layout.pos.dgs * 0.0174533) *
            this.xCenter *
            this.radius;
        this.sprite.y =
          this.yCenter +
          this.yOffset +
          Math.sin(this.layout.pos.dgs * 0.0174533) *
            this.xCenter *
            this.radius;
        break;
      case "rel":
        this.sprite.x =
          this.xCenter +
          this.xOffset +
          this.layout.pos.x * (this.xCenter * radius);
        this.sprite.y =
          this.yCenter +
          this.yOffset +
          this.layout.pos.y * (this.xCenter * radius);
        break;
    }

    this.pixiApp.stage.addChild(this.sprite);

    //define the caption style and text object and add it to the stage
    this.textStyle = new PIXI.TextStyle({
      fill: "white",
      fontSize: this.layout.text.size,
      fontFamily: "Arial",
      strokeThickness: 0,
    });

    this.text = new PIXI.Text(this.label, this.textStyle);
    this.text["name_text"] = key;
    this.text.anchor = { x: 0.5, y: 0.5 };
    this.text.x = this.sprite.x + this.layout.text.x;
    this.text.y = this.sprite.y + this.layout.text.y;
    this.text.rotation = this.layout.rotation;
    this.text.zIndex = 2;

    this.pixiApp.stage.addChild(this.text);
  }
  update(data) {
    let volume = 0;
    let volumes = [];
    let to2s = [];
    this.models.forEach((model) => {
      volume += data[model + ".vol"];
      volumes.push(data[model + ".vol"]);
    });
    // calculate factors

    if (isNaN(volume)) {
      this.volume = (0.15 / this.layout.scale.x) * this.global_scaling;
    } else {
      this.volume = this.calculateRadius(volume);
    }

    this.sprite.scale.set(
      this.volume * this.layout.scale.x * this.global_scaling,
      this.volume * this.layout.scale.y * this.global_scaling
    );
    let scaleFont = this.volume * this.layout.text.size * this.global_scaling;
    if (scaleFont > 1.1) {
      scaleFont = 1.1;
    }

    this.sprite.rotation = this.layout.rotation;
    this.text.rotation = this.layout.rotation;

    this.text.scale.set(scaleFont, scaleFont);
    this.text.alpha = 1.0;
    if (isNaN(this.to2)) {
      this.text.alpha = 0.1;
    }
    this.sprite.alpha = 0.7;
    this.sprite.tint = "0x003333";
  }
  setEditingMode(newMode) {
    this.editingMode = newMode;
  }
  redrawConnectors() {
    Object.values(this.connectors).forEach((connector) => connector.drawPath());
  }
  calculateOnCircle(x, y) {
    const f1 = Math.pow(x - this.xCenter, 2);
    const f2 = Math.pow(y - this.yCenter, 2);
    let distance = Math.abs(Math.sqrt(f1 + f2) - this.radius * this.xCenter);
    let angle = 0;
    if (distance < 5) {
      // on circle
      angle = Math.atan2(this.yCenter - y, x - this.xCenter) * 57.2958;
      if (this.yCenter - y > 0) {
        angle = 180 + (180 - angle);
      } else {
        angle = -angle;
      }
      this.layout.pos.type = "arc";
      this.layout.pos.dgs = angle;
      // snap to the circle
      this.sprite.x =
        this.xCenter + Math.cos(angle * 0.0174533) * this.xCenter * this.radius;
      this.sprite.y =
        this.yCenter + Math.sin(angle * 0.0174533) * this.xCenter * this.radius;
      this.text.x = this.sprite.x + this.layout.text.x;
      this.text.y = this.sprite.y + this.layout.text.y;
    } else {
      this.layout.pos.type = "rel";
    }
  }
  calculateRadius(volume) {
    const _cubicRadius = volume / ((4.0 / 3.0) * Math.PI);
    const _radius = Math.pow(_cubicRadius, 1.0 / 3.0);
    return _radius;
  }
  calculateColor(to2) {
    if (isNaN(to2)) {
      return 0x666666;
    }
    if (to2 > 6.95) {
      to2 = 6.95;
    }
    let remap = this.remap(to2, 0, 6.95, -10, 1);
    if (remap < 0) remap = 0;
    const red = (remap * 210).toFixed(0);
    const green = (remap * 80).toFixed(0);
    const blue = (80 + remap * 75).toFixed(0);
    const color = "0x" + this.fullColorHex(red, green, blue);
    return color;
  }
  remap(value, from1, to1, from2, to2) {
    return ((value - from1) / (to1 - from1)) * (to2 - from2) + from2;
  }
  rgbToHex(rgb) {
    let hex = Number(rgb).toString(16);
    if (hex.length < 2) {
      hex = "0" + hex;
    }
    return hex;
  }
  fullColorHex(r, g, b) {
    const red = this.rgbToHex(r);
    const green = this.rgbToHex(g);
    const blue = this.rgbToHex(b);
    return red + green + blue;
  }
}
