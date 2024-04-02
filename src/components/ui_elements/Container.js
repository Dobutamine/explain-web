import { PIXI } from "src/boot/pixi.js";

export default class Container {
  compType = "Container";
  pixiApp = {};
  key = "";
  label = "";
  models = [];
  layout = null;
  xCenter = 0;
  yCenter = 0;
  radius = 0;
  rotation = 0;

  sprite = {};
  text = {};
  textStyle = {};

  interactionData = null;
  connectors = {};

  volume = 0.1;

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
    radius,
    picto
  ) {
    // store the parameters
    this.pixiApp = pixiApp;
    this.key = key;
    this.label = label;
    this.models = models;
    this.layout = layout;
    this.xCenter = xCenter;
    this.yCenter = yCenter;
    this.radius = radius;
    this.compPicto = picto;

    if (!this.compPicto) {
      this.compPicto = "container.png";
    }

    this.edit_comp_event = new CustomEvent("edit_comp", { detail: this.key });

    // this is a blood compartment sprite which uses
    this.sprite = PIXI.Sprite.from(this.compPicto);
    this.sprite["name_sprite"] = key;
    this.sprite.eventMode = "none";
    this.sprite.scale.set(
      this.volume * this.layout.scale.x,
      this.volume * this.layout.scale.y
    );
    this.sprite.anchor = { x: 0.5, y: 0.5 };
    this.sprite.tint = "0x444444";
    this.sprite.rotation = this.layout.rotation;
    this.sprite.zIndex = 0;

    // place the sprite on the stage
    switch (this.layout.pos.type) {
      case "arc":
        this.sprite.x =
          this.xCenter +
          Math.cos(this.layout.pos.dgs * 0.0174533) *
            this.xCenter *
            this.radius;
        this.sprite.y =
          this.yCenter +
          Math.sin(this.layout.pos.dgs * 0.0174533) *
            this.xCenter *
            this.radius;
        break;
      case "rel":
        this.sprite.x = this.layout.pos.x * this.xCenter;
        this.sprite.y = this.layout.pos.y * this.yCenter;
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
    this.models.forEach((model) => {
      volume += data[model + ".Vol"];
    });
    if (isNaN(volume)) {
      this.volume = 0.15 / this.layout.scale.x;
    } else {
      this.volume = this.calculateRadius(volume);
    }

    this.sprite.scale.set(
      this.volume * this.layout.scale.x,
      this.volume * this.layout.scale.y
    );
    let scaleFont = this.volume * this.layout.text.size;
    if (scaleFont > 1.1) {
      scaleFont = 1.1;
    }
    this.sprite.rotation = this.layout.rotation;
    this.text.rotation = this.layout.rotation;
    this.text.scale.set(scaleFont, scaleFont);
    this.text.alpha = 1.0;
  }
  setEditingMode(newMode) {
    this.editingMode = newMode;
  }
  onDragStart(e) {
    this.interactionData = e.data;
    this.sprite.alpha = 0.5;
    this.text.alpha = 0.5;
  }
  onDragMove(e) {
    switch (this.editingMode) {
      case 1: // moving
        if (this.interactionData) {
          this.sprite.x = this.interactionData.global.x;
          this.sprite.y = this.interactionData.global.y;
          this.text.x = this.sprite.x + this.layout.text.x;
          this.text.y = this.sprite.y + this.layout.text.y;
          this.layout.pos.x = this.sprite.x / this.xCenter;
          this.layout.pos.y = this.sprite.y / this.yCenter;
          this.calculateOnCircle(this.sprite.x, this.sprite.y);
          // redraw the connector
          this.redrawConnectors();
        }
        break;
      case 2: // rotating
        if (this.interactionData) {
          if (this.interactionData.global.x > this.prevX) {
            this.layout.rotation += 0.01;
          } else {
            this.layout.rotation -= 0.01;
          }
          this.sprite.rotation = this.layout.rotation;
          this.text.rotation = this.layout.rotation;
          this.prevX = this.interactionData.global.x;
        }
        break;
      case 3: // morphing
        if (this.interactionData) {
          if (this.interactionData.global.x > this.prevX) {
            this.layout.scale.x += 0.01;
            this.layout.scale.y -= 0.01;
          } else {
            this.layout.scale.x -= 0.01;
            this.layout.scale.y += 0.01;
          }
          this.sprite.scale.set(
            this.volume * this.layout.scale.x,
            this.volume * this.layout.scale.y
          );
          let scaleFont = this.volume * this.layout.text.size;
          if (scaleFont > 1.1) {
            scaleFont = 1.1;
          }
          this.text.scale.set(scaleFont, scaleFont);
          this.prevX = this.interactionData.global.x;
        }
        break;
      case 4: // resizing
        if (this.interactionData) {
          if (this.interactionData.global.x > this.prevX) {
            this.layout.scale.x += 0.01;
            this.layout.scale.y += 0.01;
          } else {
            this.layout.scale.x -= 0.01;
            this.layout.scale.y -= 0.01;
          }
          this.sprite.scale.set(
            this.volume * this.layout.scale.x,
            this.volume * this.layout.scale.y
          );
          let scaleFont = this.volume * this.layout.text.size;
          if (scaleFont > 1.1) {
            scaleFont = 1.1;
          }
          this.text.scale.set(scaleFont, scaleFont);
          this.prevX = this.interactionData.global.x;
        }
        break;
    }
  }
  onDragEnd(e) {
    this.interactionData = null;
    this.sprite.alpha = 1;
    this.text.alpha = 1;
    document.dispatchEvent(this.edit_comp_event);
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
  calculateRadius(volume) {
    const _cubicRadius = volume / ((4.0 / 3.0) * Math.PI);
    const _radius = Math.pow(_cubicRadius, 1.0 / 3.0);
    return _radius;
  }
}
