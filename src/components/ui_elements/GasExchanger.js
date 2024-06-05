import { PIXI } from "src/boot/pixi.js";

export default class GasExchanger {
  compType = "GasExchanger";
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
  rotation = 0;
  global_scaling = 1.0;

  sprite = {};
  text = {};
  textStyle = {};

  interactionData = null;
  connectors = {};

  gas = "O2";
  rotation = 0;

  edit_comp_event = null;
  editingMode = 1;
  prevX = 0;
  prevyY = 0;

  constructor(
    pixiApp,
    key,
    label,
    models,
    gas,
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
    this.gas = ".flux_" + gas;
    this.layout = layout;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.radius = radius;
    this.compPicto = picto;
    this.global_scaling = scaling;

    if (!this.compPicto) {
      this.compPicto = "exchange.png";
    }

    this.edit_comp_event = new CustomEvent("edit_comp", { detail: this.key });

    // this is a blood compartment sprite which uses
    this.sprite = PIXI.Sprite.from(this.compPicto);
    this.sprite["name_sprite"] = key;
    this.sprite["compType"] = this.compType;
    this.sprite.eventMode = "none";
    this.sprite.scale.set(
      this.layout.scale.x * this.global_scaling,
      this.layout.scale.y * this.global_scaling
    );
    this.sprite.anchor = { x: 0.5, y: 0.5 };
    this.sprite.tint = "0xbbbbbb";
    this.sprite.zIndex = 12;

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
      fontSize: this.layout.text.size * this.global_scaling,
      fontFamily: "Arial",
      strokeThickness: 0,
    });
    this.text = new PIXI.Text(this.label, this.textStyle);
    this.text["name_text"] = key;
    this.text.anchor = { x: 0.5, y: 0.5 };
    this.text.x = this.sprite.x + this.layout.text.x;
    this.text.y = this.sprite.y + this.layout.text.y;
    this.text.rotation = this.layout.rotation;
    this.text.zIndex = 13;

    this.pixiApp.stage.addChild(this.text);
  }
  setEditingMode(newMode) {
    this.editingMode = newMode;
  }
  update(data) {
    let difO2 = 0;

    this.models.forEach((model) => {
      difO2 += data[model + this.gas];
    });
    if (isNaN(difO2)) {
      difO2 = 0.0;
      this.text.alpha = 0.1;
      this.sprite.tint = 0x666666;
    } else {
      this.sprite.tint = 0xbbbbbb;
      this.text.alpha = 1.0;
    }

    // calculate factors
    this.rotation += (difO2 / this.models.length) * 10000;
    if (this.rotation > 2 * Math.PI) {
      this.rotation = 0;
    }
    //console.log(this.rotation);
    this.sprite.rotation = -this.rotation;
    this.text.rotation = this.layout.rotation;
  }
  redrawConnectors() {
    Object.values(this.connectors).forEach((connector) => connector.drawPath());
  }
  calculateOnCircle(x, y) {
    const f1 = Math.pow(x - this.xCenter, 2);
    const f2 = Math.pow(y - this.yCenter, 2);
    let distance = Math.abs(Math.sqrt(f1 + f2) - this.radius * this.xCenter);
    //console.log(distance - this.radius * this.xCenter);
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
}
