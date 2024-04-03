<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="row justify-center">
      <q-select class="q-pa-xs q-mr-sm q-ml-sm col text-overline" v-model="selected_diagram" square
        label="selected animated model diagram" hide-hint :options="diagram_options" dense dark stack-label
        @update:model-value="loadDiagram" />
    </div>

    <div class="stage" :style="{ display: display }">
      <canvas id="stage"></canvas>
    </div>

    <div v-if="shuntOptionsVisible" class="row justify-center">
      <q-option-group v-model="selected_shunts" :options="shunt_options" color="primary" inline size="xs" dense
        class="text-overline" type="checkbox" @update:model-value="toggleShunts"></q-option-group>
    </div>

  </q-card>
</template>
<script>
import { explain } from "../boot/explain";
import { PIXI } from "../boot/pixi";
import BloodCompartment from "./ui_elements/BloodCompartment";
import GasCompartment from "./ui_elements/GasCompartment";
import BloodConnector from "./ui_elements/BloodConnector";
import GasConnector from "./ui_elements/GasConnector";
import GasExchanger from "./ui_elements/GasExchanger";
import Shunt from "./ui_elements/Shunt";

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
      diagram: {},
      diagramComponents: {},
      gridVertical: null,
      gridHorizontal: null,
      skeletonGraphics: null,
      shortTimer: null,
      rt_running: false,
      selected_diagram: 'default',
      diagram_options: ['default', 'ecmo'],
      selected_shunts: [],
      shunt_options: [{
        label: 'ductus arteriosus',
        value: 'DA'
      },
      {
        label: 'foramen ovale',
        value: 'FO'
      },
      {
        label: 'ventricular septal defect',
        value: 'VSD'
      },
      {
        label: 'intrapulmonary shunt',
        value: 'IPS'
      }
      ],
      shuntOptionsVisible: true

    };
  },
  methods: {
    toggleShunts() {
      this.shunt_options.forEach((shunt_option) => {
        this.showOrHideShunt(this.selected_shunts.includes(shunt_option.value), shunt_option.value)
      })

    },
    showOrHideShunt(state, shunt) {
      if (state) {
        // show the shunt if not already shown
        const index_sprite = this.pixiApp.stage.children.findIndex((obj) => obj.name_sprite == shunt);
        if (index_sprite < 0) {
          // not shown already so add it
          this.addDiagramComponent(shunt)
        }
      } else {
        // hide the shunt
        const index_sprite = this.pixiApp.stage.children.findIndex((obj) => obj.name_sprite == shunt);
        if (index_sprite > 0) {
          // it is present so hide it
          this.removeDiagramComponent(shunt)
        }
      }

    },
    loadDiagram(filename = "default") {
      let fn = "/diagrams/" + filename + ".json"
      fetch(new URL(fn, import.meta.url))
        .then((response) => {
          if (!response.ok) {
            throw new Error(
              "Uh oh! could not get the baseline_neonate from the server!"
            );
          }
          return response.json();
        })
        .then((jsonData) => {
          this.diagram = { ...jsonData }
          this.initDiagram()
        })
        .catch((error) => {
          console.error("Error: ", error);
        });
    },
    changeEditingMode(e) {
      Object.values(this.diagramComponents).forEach((comp) => {
        comp.setEditingMode(this.editingSelection);
      });
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
        eventMode: 'passive',
        eventFeatures: {
          move: true,
          /** disables the global move events which can be very expensive in large scenes */
          globalMove: false,
          click: true,
          wheel: true,
        }

      });
      // allow sortable children
      this.pixiApp.stage.sortableChildren = true;

      // build the diagram
      this.buildDiagram();
    },
    clearDiagram() {
      this.pixiApp.stage.removeChildren();
    },
    drawSkeletonGraphics() {

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
        const xCenter = (this.pixiApp.renderer.width / 4) + this.diagram.settings.xOffset
        const yCenter = (this.pixiApp.renderer.height / 4) + this.diagram.settings.yOffset
        this.skeletonGraphics.beginFill(color);
        this.skeletonGraphics.lineStyle(1, color, 1);
        this.skeletonGraphics.drawCircle(xCenter, yCenter, (xCenter - this.diagram.settings.xOffset) * radius);
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
    removeDiagramComponent(comp_name) {
      const index_sprite = this.pixiApp.stage.children.findIndex((obj) => obj.name_sprite == comp_name);
      if (index_sprite > 0) {
        this.pixiApp.stage.removeChild(this.pixiApp.stage.children[index_sprite])
      }

      const index_text = this.pixiApp.stage.children.findIndex((obj) => obj.name_text == comp_name);
      if (index_text > 0) {
        this.pixiApp.stage.removeChild(this.pixiApp.stage.children[index_text])
      }

      const index_path = this.pixiApp.stage.children.findIndex((obj) => obj.name_path == comp_name);
      if (index_path > 0) {
        this.pixiApp.stage.removeChild(this.pixiApp.stage.children[index_path])
      }

      this.diagram.components[comp_name].enabled = false
    },
    addDiagramComponent(comp_name) {
      const index_sprite = this.pixiApp.stage.children.findIndex((obj) => obj.name_sprite == comp_name);
      const index_text = this.pixiApp.stage.children.findIndex((obj) => obj.name_text == comp_name);
      const index_path = this.pixiApp.stage.children.findIndex((obj) => obj.name_path == comp_name);
      if (index_sprite < 0 && index_text < 0 && index_path < 0) {
        let component = {}
        this.diagram.components[comp_name].enabled = true
        component[comp_name] = this.diagram.components[comp_name]
        this.drawComponents(component)
      }

    },
    drawComponents(component_list) {
      // get the layout properties
      const xCenter = (this.pixiApp.renderer.width / 4)
      const yCenter = (this.pixiApp.renderer.height / 4)
      const xOffset = this.diagram.settings.xOffset
      const yOffset = this.diagram.settings.yOffset
      const radius = this.diagram.settings.radius;
      let global_scaling = this.diagram.settings.scaling;
      // render the blood compartments
      Object.entries(component_list).forEach(([key, component]) => {
        // inject the offsets
        if (component.enabled) {
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
                xOffset,
                yOffset,
                radius,
                component.compPicto,
                global_scaling
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
                xOffset,
                yOffset,
                radius,
                component.compPicto,
                global_scaling
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
                xOffset,
                yOffset,
                radius,
                component.compPicto,
                global_scaling
              );
              let watched_models_bc = []
              component.models.forEach(m => {
                watched_models_bc.push(m + ".vol")
                watched_models_bc.push(m + ".aboxy.to2")
              })
              explain.watchModelProps(watched_models_bc)
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
                xOffset,
                yOffset,
                radius,
                component.compPicto,
                global_scaling
              );
              let watched_models_gc = []
              component.models.forEach(m => {
                watched_models_gc.push(m + ".vol")
                watched_models_gc.push(m + ".po2")
              })
              explain.watchModelProps(watched_models_gc)
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
                component.compPicto,
                global_scaling
              );
              let watched_models_bcon = []
              component.models.forEach(m => {
                watched_models_bcon.push(m + ".flow")
              })
              explain.watchModelProps(watched_models_bcon)
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
                component.compPicto,
                global_scaling
              );
              let watched_models_shunt = []
              component.models.forEach(m => {
                watched_models_shunt.push(m + ".flow")
              })
              explain.watchModelProps(watched_models_shunt)
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
                xOffset,
                yOffset,
                radius,
                component.compPicto,
                global_scaling
              );
              let watched_models_cont = []
              component.models.forEach(m => {
                watched_models_cont.push(m + ".vol")
              })
              explain.watchModelProps(watched_models_cont)
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
                component.compPicto,
                global_scaling
              );
              let watched_models_gascon = []
              component.models.forEach(m => {
                watched_models_gascon.push(m + ".flow")
              })
              explain.watchModelProps(watched_models_gascon)
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
                xOffset,
                yOffset,
                radius,
                component.compPicto,
                global_scaling
              );
              let watched_models_gasex = []
              component.models.forEach(m => {
                watched_models_gasex.push(m + ".flux_" + component.gas)
              })
              explain.watchModelProps(watched_models_gasex)
              break;
          }
        }
      });
    },
    processStateChanged() {
      if (!this.rt_running) {
        if (this.alive) {
          Object.values(this.diagramComponents).forEach((sprite) => {
            if (explain.modelData.length > 0) {
              sprite.update(explain.modelData[explain.modelData.length - 1]);
            }
          });
        }
      }

    },
    buildDiagram() {
      // first clear all children from the stage
      this.pixiApp.stage.removeChildren();
      // draw the skeleton graphics
      this.drawSkeletonGraphics()
      // draw the grid
      this.drawGrid()
      // draw the components
      this.drawComponents(this.diagram.components)
      // first remove the old ticker
      if (this.ticker) {
        this.pixiApp.ticker.remove(this.ticker)
      }
      // add a new ticker
      this.ticker = this.pixiApp.ticker.add((delta) => {
        if (this.rt_running && this.alive) {
          Object.values(this.diagramComponents).forEach((sprite) => {
            if (explain.modelData.length > 0) {
              sprite.update(explain.modelData[0]);
            }
          });
        }
      });

      // get the shunt options state of the diagram
      this.shuntOptionsVisible = this.diagram.settings.shuntOptionsVisible

      // get the current shunts state
      this.selected_shunts = []
      if (this.shuntOptionsVisible) {
        try {
          if (this.diagram.components['DA'].enabled) {
            this.selected_shunts.push('DA')
          }
          if (this.diagram.components['FO'].enabled) {
            this.selected_shunts.push('FO')
          }
          if (this.diagram.components['VSD'].enabled) {
            this.selected_shunts.push('VSD')
          }
          if (this.diagram.components['IPS'].enabled) {
            this.selected_shunts.push('IPS')
          }
        } catch { }
      }
    }
  },
  beforeUnmount() {

  },
  mounted() {
    this.loadDiagram()
    this.$bus.on("state", this.processStateChanged)
    this.$bus.on('rt_start', () => this.rt_running = true)
    this.$bus.on('rt_stop', () => this.rt_running = false)


  },
};

</script>
<style scoped>
#stage {
  width: 100%;
}
</style>
