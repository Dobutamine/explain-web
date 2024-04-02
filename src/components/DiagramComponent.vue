<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="row justify-center">
      <q-btn-toggle
        color="grey-10"
        class="q-ma-sm"
        toggle-color="primary"
        size="xs"
        v-model="editingSelection"
        @click="changeEditingMode"
        :options="[
          { label: 'selecting', value: 0 },
          { label: 'moving', value: 1 },
          { label: 'rotating', value: 2 },
          { label: 'morphing', value: 3 },
          { label: 'sizing', value: 4 },
        ]"
      />
    </div>
    <div class="stage" :style="{ display: display }">
      <canvas id="stage"></canvas>
    </div>
  </q-card>
</template>
<script>
import { explain } from "../boot/explain";
import { PIXI } from "../boot/pixi";
import BloodCompartment from "./ui_elements/BloodCompartment";

let canvas = null;
export default {
  props: {
    alive: Boolean
  },
  data() {
    return {
      title: "ANIMATED DIAGRAM",
      collapsed: false,
      editingSelection: 1,
      display: "block",
      ticker: null,
      pixiApp: null,
      diagram: {
        settings: {
          backgroundColor: 3355443,
          editingMode: 1,
          scaling: 0.1,
          grid: true,
          gridSize: 10,
          snapToGrid: true,
          skeleton: true,
          skeletonColor: 4473924,
          pathColor: 4473924,
          radius: 0.6,
          componentTypes: [
            "BloodCompartment",
            "BloodConnector",
            "GasCompartment",
            "GasConnector",
            "Container",
            "GasExchanger",
            "Shunt"
          ]
        },
        components: {
          "LV": {
            "label": "LV",
            "models": ["LV"],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "arc",
                "x": 1,
                "y": 1,
                "dgs": 0
              },
              "morph": {
                "x": 1,
                "y": 1
              },
              "scale": {
                "x": 1,
                "y": 1
              },
              "rotation": 0,
              "text": {
                "x": 0,
                "y": 0,
                "size": 10
              }
            }
    },
        }
      },
      diagramComponents: {},
      gridVertical: null,
      gridHorizontal: null,
      skeletonGraphics: null,
      rt_running: false

    };
  },
  methods: {
    test(){},
    changeEditingMode() {
    },
    initDiagram() {
      // get the reference to the canvas
      canvas = document.getElementById("stage");
      // set the resolution of the pix application
      PIXI.settings.RESOLUTION = 2;
      // define a pixi app with the canvas as view
      this.pixiApp = new PIXI.Application({
        transparent: false,
        antialias: true,
        backgroundColor: 0x222222,
        view: canvas,
      });
      // allow sortable children
      this.pixiApp.stage.sortableChildren = true;

      // build the diagram
      this.buildDiagram();

    },
    clearDiagram(){
      this.pixiApp.stage.removeChildren();
    },
    drawSkeletonGraphics(){

      if (this.diagram.settings.skeleton) {
        if (this.skeletonGraphics) {
          this.skeletonGraphics.clear();
          this.pixiApp.stage.removeChild(this.skeletonGraphics);
        }
        const radius = this.diagram.settings.radius;
        const color = this.diagram.settings.skeletonColor;

        // initalize the skeleton graphics
        this.skeletonGraphics = new PIXI.Graphics();

        // get center stage
        const xCenter = this.pixiApp.renderer.width / 4;
        const yCenter = this.pixiApp.renderer.height / 4;
        this.skeletonGraphics.beginFill(color);
        this.skeletonGraphics.lineStyle(1, color, 1);
        this.skeletonGraphics.drawCircle(xCenter, yCenter, xCenter * radius);
        this.skeletonGraphics.endFill();
        this.pixiApp.stage.addChild(this.skeletonGraphics);
      }
    },
    drawGrid() {
      if (this.diagram.settings.grid) {
        const gridSize = this.diagram.settings.gridSize;

        if (this.gridVertical) {
          this.gridVertical.clear();
          this.pixiApp.stage.removeChild(this.gridVertical);
        }
        // build the grid
        this.gridVertical = new PIXI.Graphics();
        for (let x = 0; x < this.pixiApp.renderer.width; x = x + gridSize) {
          this.gridVertical.lineStyle(1, 0x888888, 0.1);
          this.gridVertical.moveTo(x, 0);
          this.gridVertical.lineTo(x, this.pixiApp.renderer.height);
        }
        this.pixiApp.stage.addChild(this.gridVertical);

        if (this.gridHorizontal) {
          this.gridHorizontal.clear();
          this.pixiApp.stage.removeChild(this.gridHorizontal);
        }
        this.gridHorizontal = new PIXI.Graphics();
        for (let y = 0; y < this.pixiApp.renderer.height; y = y + gridSize) {
          this.gridHorizontal.lineStyle(1, 0x888888, 0.1);
          this.gridHorizontal.moveTo(0, y);
          this.gridHorizontal.lineTo(this.pixiApp.renderer.width, y);
        }
        this.pixiApp.stage.addChild(this.gridHorizontal);
      } else {
        if (this.gridVertical) {
          this.gridVertical.clear();
          this.pixiApp.stage.removeChild(this.gridVertical);
        }
        if (this.gridHorizontal) {
          this.gridHorizontal.clear();
          this.pixiApp.stage.removeChild(this.gridHorizontal);
        }
      }
    },
    drawComponents() {
      // get the layout properties
      const xCenter = this.pixiApp.renderer.width / 4;
      const yCenter = this.pixiApp.renderer.height / 4;
      const radius = this.diagram.settings.radius;

      // render the blood compartments
      Object.entries(this.diagram.components).forEach(([key, component]) => {
        switch (component.compType) {
          case "Oxygenator":
            this.diagramComponents[key] = new Oxygenator(
              this.pixiApp,
              key,
              component.label,
              component.models,
              component.layout,
              xCenter,
              yCenter,
              radius,
              component.compPicto
            );
            break;
          case "BloodPump":
            this.diagramComponents[key] = new BloodPump(
              this.pixiApp,
              key,
              component.label,
              component.models,
              component.layout,
              xCenter,
              yCenter,
              radius,
              component.compPicto
            );
            break;
          case "BloodCompartment":
            this.diagramComponents[key] = new BloodCompartment(
              this.pixiApp,
              key,
              component.label,
              component.models,
              component.layout,
              xCenter,
              yCenter,
              radius,
              component.compPicto
            );
            break;
          case "GasCompartment":
            this.diagramComponents[key] = new GasCompartment(
              this.pixiApp,
              key,
              component.label,
              component.models,
              component.layout,
              xCenter,
              yCenter,
              radius,
              component.compPicto
            );
            break;
          case "BloodConnector":
            this.diagramComponents[key] = new BloodConnector(
              this.pixiApp,
              key,
              component.label,
              component.models,
              this.diagramComponents[component.dbcFrom],
              this.diagramComponents[component.dbcTo],
              {},
              component.compPicto
            );
            break;
          case "Shunt":
            this.diagramComponents[key] = new Shunt(
              this.pixiApp,
              key,
              component.label,
              component.models,
              this.diagramComponents[component.dbcFrom],
              this.diagramComponents[component.dbcTo],
              {},
              component.compPicto
            );
            break;
          case "Container":
            this.diagramComponents[key] = new Container(
              this.pixiApp,
              key,
              component.label,
              component.models,
              component.layout,
              xCenter,
              yCenter,
              radius,
              component.compPicto
            );
            break;

          case "GasConnector":
            this.diagramComponents[key] = new GasConnector(
              this.pixiApp,
              key,
              component.label,
              component.models,
              this.diagramComponents[component.dbcFrom],
              this.diagramComponents[component.dbcTo],
              {},
              component.compPicto
            );
            break;
          case "GasExchanger":
            this.diagramComponents[key] = new GasExchanger(
              this.pixiApp,
              key,
              component.label,
              component.models,
              component.gas,
              component.layout,
              xCenter,
              yCenter,
              radius,
              component.compPicto
            );
            break;
        }
      });
    },
    buildDiagram(){
      // first clear all children from the stage
      this.clearDiagram()
      // draw the skeleton graphics
      this.drawSkeletonGraphics()
      // draw the grid
      this.drawGrid()
      // draw the components
      this.drawComponents()
      // add a ticker
      if (!this.ticker) {
        this.ticker = this.pixiApp.ticker.add((delta) => {
          if (this.rt_running) {
            Object.values(this.diagramComponents).forEach((sprite) => {
              if (explain.modelData.length > 0) {
                console.log(explain.modelData[0])
                sprite.update(explain.modelData[0]);
              }
            });
          }
        });
      }

    }
  },
  beforeUnmount() {

  },
  mounted() {
    //this.$bus.on("state", this.processModelState)
    this.initDiagram()
  },
};

</script>
<style scoped>
#stage {
  width: 100%;
}
</style>
