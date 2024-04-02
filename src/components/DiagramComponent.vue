<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="row justify-center">
      <q-select class="q-pa-xs q-mr-sm q-ml-sm col text-overline" v-model="selected_diagram" square
        label="selected model diagram" hide-hint :options="diagram_options" dense dark stack-label
        @update:model-value="loadDiagram" />
    </div>


    <div class="stage" :style="{ display: display }">
      <canvas id="stage"></canvas>
    </div>
    <div class="row justify-center">
      <q-option-group v-model="selected_shunts" :options="shunt_options" color="primary" inline size="xs" dense
        class="text-overline" type="checkbox" @update:model-value="toggleShunts"></q-option-group>
    </div>

  </q-card>
</template>
<script>
import { explain } from "../boot/explain";
import { PIXI } from "../boot/pixi";
import BloodCompartment from "./ui_elements/BloodCompartment";
import BloodConnector from "./ui_elements/BloodConnector";
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
      rt_running: false,
      selected_diagram: 'default',
      diagram_options: ['default', 'ecmo'],
      selected_shunts: ['pda', 'fo', 'ips'],
      shunt_options: [{
        label: 'ductus arteriosus',
        value: 'pda'
      },
      {
        label: 'foramen ovale',
        value: 'fo'
      },
      {
        label: 'ventricular septal defect',
        value: 'vsd'
      },
      {
        label: 'intrapulmonary shunt',
        value: 'ips'
      }
      ]

    };
  },
  methods: {
    toggleShunts() {
      console.log(this.selected_shunts)
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
    toggleLumping() {
      const comp_to_remove = ["AAR_BR", "AAR_RUB", "BR_SVC", "RUB_SVC", "SVC_RA", "AD_INT", "AD_KID", "AD_RLB", "AD_LS", "LS_IVCE", "KID_IVCE", "RLB_IVCE", "INT_IVCE", "IVCE_IVCI", "IVCI_RA", "RUB", "BR", "RLB", "KID", "LS", "INT", "IVCE", "IVCI", "SVC"]
      comp_to_remove.forEach(c => {
        console.log(c)
        let index_sprite = this.pixiApp.stage.children.findIndex((obj) => obj.name_sprite == c);
        let index_text = this.pixiApp.stage.children.findIndex((obj) => obj.name_text == c);
        let index_path = this.pixiApp.stage.children.findIndex((obj) => obj.name_path == c);
        if (index_sprite >= 0) {
          console.log("removing: ", c)
          this.removeDiagramComponent(c)
        }
        if (index_text >= 0) {
          console.log("removing: ", c)
          this.removeDiagramComponent(c)
        }
        if (index_path >= 0) {
          console.log("removing: ", c)
          this.removeDiagramComponent(c)
        }
      })

      const comps_to_show = ["UB", "LB", "AAR_UB", "AD_LB"]
      comps_to_show.forEach(c => {
        let index_sprite = this.pixiApp.stage.children.findIndex((obj) => obj.name_sprite == c);
        let index_text = this.pixiApp.stage.children.findIndex((obj) => obj.name_text == c);
        let index_path = this.pixiApp.stage.children.findIndex((obj) => obj.name_path == c);
        if (index_sprite < 0 && index_text < 0 && index_path < 0) {
          this.addDiagramComponent(c)
        }
      })


    },
    toggleLumpingUpperBody() { },
    toggleLumpingLowerBody() { },
    togglePda() {
      const index_sprite = this.pixiApp.stage.children.findIndex((obj) => obj.name_sprite == "DA_OUT");
      const index_text = this.pixiApp.stage.children.findIndex((obj) => obj.name_text == "DA_OUT");
      const index_path = this.pixiApp.stage.children.findIndex((obj) => obj.name_path == "DA_OUT");
      if (index_sprite < 0 && index_text < 0 && index_path < 0) {
        this.addDiagramComponent("DA_OUT")
      } else {
        this.removeDiagramComponent("DA_OUT")
      }
    },
    toggleFo() {
      const index_sprite = this.pixiApp.stage.children.findIndex((obj) => obj.name_sprite == "FO");
      const index_text = this.pixiApp.stage.children.findIndex((obj) => obj.name_text == "FO");
      const index_path = this.pixiApp.stage.children.findIndex((obj) => obj.name_path == "FO");
      if (index_sprite < 0 && index_text < 0 && index_path < 0) {
        this.addDiagramComponent("FO")
      } else {
        this.removeDiagramComponent("FO")
      }

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
    removeDiagramComponent(comp_name) {
      const index_sprite = this.pixiApp.stage.children.findIndex((obj) => obj.name_sprite == comp_name);
      const index_text = this.pixiApp.stage.children.findIndex((obj) => obj.name_text == comp_name);
      const index_path = this.pixiApp.stage.children.findIndex((obj) => obj.name_path == comp_name);

      if (index_sprite > 0) {
        this.pixiApp.stage.removeChild(this.pixiApp.stage.children[index_sprite])
      }
      if (index_text > 0) {
        this.pixiApp.stage.removeChild(this.pixiApp.stage.children[index_text])
      }
      if (index_path > 0) {
        this.pixiApp.stage.removeChild(this.pixiApp.stage.children[index_path])
      }
    },
    addDiagramComponent(comp_name) {
      const index_sprite = this.pixiApp.stage.children.findIndex((obj) => obj.name_sprite == comp_name);
      const index_text = this.pixiApp.stage.children.findIndex((obj) => obj.name_text == comp_name);
      const index_path = this.pixiApp.stage.children.findIndex((obj) => obj.name_path == comp_name);
      if (index_sprite < 0 && index_text < 0 && index_path < 0) {
        let component = {}
        component[comp_name] = this.diagram.components[comp_name]
        this.drawComponents(component)
      }

    },
    drawComponents(component_list) {
      // get the layout properties
      const xCenter = this.pixiApp.renderer.width / 4;
      const yCenter = this.pixiApp.renderer.height / 4;
      const radius = this.diagram.settings.radius;
      // render the blood compartments
      Object.entries(component_list).forEach(([key, component]) => {
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
              let vol = key + ".vol"
              let to2 = key + ".aboxy.to2"
              explain.watchModelProps([vol, to2])
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
              let vol_gas = key + ".vol"
              let to2_gas = key + ".to2"
              explain.watchModelProps([vol_gas, to2_gas])
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
              let flow = key + ".flow"
              explain.watchModelProps([flow])
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
              let flow_shunt = key + ".flow"
              explain.watchModelProps([flow_shunt])
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
        }
      });
    },
    buildDiagram() {
      // first clear all children from the stage
      this.clearDiagram()
      // draw the skeleton graphics
      this.drawSkeletonGraphics()
      // draw the grid
      this.drawGrid()
      // draw the components
      this.drawComponents(this.diagram.components)
      // add a ticker
      if (!this.ticker) {
        this.ticker = this.pixiApp.ticker.add((delta) => {
          if (this.rt_running && this.alive) {
            Object.values(this.diagramComponents).forEach((sprite) => {
              if (explain.modelData.length > 0) {
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
    this.loadDiagram()
    //this.$bus.on("state", this.processModelState)


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
