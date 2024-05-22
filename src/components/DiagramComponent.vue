<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>

    <div class="stage" :style="{ display: display }">
      <canvas id="stage">
      </canvas>
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
import LymphCompartment from "./ui_elements/LymphCompartment";
import GasCompartment from "./ui_elements/GasCompartment";
import BloodConnector from "./ui_elements/BloodConnector";
import BloodPump from "./ui_elements/BloodPump";
import LymphConnector from "./ui_elements/LymphConnector";
import GasConnector from "./ui_elements/GasConnector";
import GasExchanger from "./ui_elements/GasExchanger";
import Oxygenator from "./ui_elements/Oxygenator";
import Shunt from "./ui_elements/Shunt";

import { useStateStore } from "src/stores/state";

let canvas = null;
export default {
  setup() {
    const state = useStateStore();
    return { state };
  },
  props: {
    alive: Boolean,
    global_speed: Number,
    global_scale: Number
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
      diagram_components: {},
      gridVertical: null,
      gridHorizontal: null,
      skeletonGraphics: null,
      shortTimer: null,
      rt_running: false,
      selected_shunts: [],
      shunt_options: [{
        label: 'PDA',
        value: 'DA',
        description: 'ductus arteriosus',
        models: ['DA']
      },
      {
        label: 'FO',
        value: 'FO',
        description: 'foramen ovale',
        models: ['FO']
      },
      {
        label: 'VSD',
        value: 'VSD',
        description: 'ventricular septal defect',
        models: ['VSD']
      },
      {
        label: 'IPS',
        value: 'IPS',
        description: 'intra-pulmonary shunt',
        models: ['IPS']
      },
      {
        label: 'ECLS',
        value: 'ECLS',
        description: 'ecls',
        models: ['ECLS_TUBIN', 'ECLS_OXY', 'ECLS_PUMP', 'ECLS_TUBOUT', 'ECLS_DR', 'ECLS_TUBIN_PUMP', 'ECLS_PUMP_OXY', 'ECLS_OXY_TUBOUT', 'ECLS_RE']
      }
      ],
      shuntOptionsVisible: true

    };
  },
  methods: {
    changeGlobalSize() {

    },
    changeGlobalSpeed() {

    },
    toggleShunts() {
      this.shunt_options.forEach((shunt_option) => {
        this.showOrHideShunt(this.selected_shunts.includes(shunt_option.value), shunt_option.models)
      })

    },
    showOrHideShunt(state, shunts) {
      if (state) {
        // show the shunt if not already shown
        shunts.forEach(shunt => {
          const index_sprite = this.pixiApp.stage.children.findIndex((obj) => obj.name_sprite == shunt);
          if (index_sprite < 0) {
            // not shown already so add it
            this.addDiagramComponent(shunt)
          }
        })
      } else {
        // hide the shunt
        shunts.forEach(shunt => {
          const index_sprite = this.pixiApp.stage.children.findIndex((obj) => obj.name_sprite == shunt);
          if (index_sprite > 0) {
            // it is present so hide it
            this.removeDiagramComponent(shunt)
          }
        })
      }

    },
    async initDiagram() {
      // first clear all children from the stage
      if (this.pixiApp) {
        this.pixiApp = null
      }
      // get the reference to the canvas
      canvas = document.getElementById("stage");

      // set the resolution of the pix application
      PIXI.settings.RESOLUTION = 2;

      // define a pixi app with the canvas as view
      this.pixiApp = new PIXI.Application({
        transparent: true,
        antialias: true,
        backgroundColor: 0x111111,
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
    },
    clearDiagram() {
      this.pixiApp.stage.removeChildren();
    },
    drawSkeletonGraphics() {

      if (this.state.diagram_definition.settings.skeleton) {
        if (this.skeletonGraphics) {
          this.skeletonGraphics.clear();
          this.pixiApp.stage.removeChild(this.skeletonGraphics);
        }
        const radius = this.state.diagram_definition.settings.radius;
        const color = this.state.diagram_definition.settings.skeletonColor;

        // initalize the skeleton graphics
        this.skeletonGraphics = new PIXI.Graphics();

        // get center stage
        const xCenter = (this.pixiApp.renderer.width / 4) + this.state.diagram_definition.settings.xOffset
        const yCenter = (this.pixiApp.renderer.height / 4) + this.state.diagram_definition.settings.yOffset
        this.skeletonGraphics.beginFill(color);
        this.skeletonGraphics.lineStyle(1, color, 1);
        this.skeletonGraphics.drawCircle(xCenter, yCenter, (xCenter - this.state.diagram_definition.settings.xOffset) * radius);
        this.skeletonGraphics.endFill();
        this.pixiApp.stage.addChild(this.skeletonGraphics);
      }
    },
    drawGrid() {
      if (this.state.diagram_definition.settings.grid) {
        const gridSize = this.state.diagram_definition.settings.gridSize;

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

      this.state.diagram_definition.components[comp_name].enabled = false
    },
    addDiagramComponent(comp_name) {
      const index_sprite = this.pixiApp.stage.children.findIndex((obj) => obj.name_sprite == comp_name);
      const index_text = this.pixiApp.stage.children.findIndex((obj) => obj.name_text == comp_name);
      const index_path = this.pixiApp.stage.children.findIndex((obj) => obj.name_path == comp_name);
      if (index_sprite < 0 && index_text < 0 && index_path < 0) {
        let component = {}
        this.state.diagram_definition.components[comp_name].enabled = true
        component[comp_name] = this.state.diagram_definition.components[comp_name]
        this.drawComponents(component)
      }
    },
    update_component(comp_name) {
      // first remove diagram component from canvas and disable it in the list
      this.removeDiagramComponent(comp_name)

      // add diagram component
      this.addDiagramComponent(comp_name)

    },
    drawComponents(component_list) {
      // get the layout properties
      const xCenter = (this.pixiApp.renderer.width / 4)
      const yCenter = (this.pixiApp.renderer.height / 4)
      const xOffset = this.state.diagram_definition.settings.xOffset
      const yOffset = this.state.diagram_definition.settings.yOffset
      const radius = this.state.diagram_definition.settings.radius;
      let global_scaling = this.state.diagram_definition.settings.scaling * this.global_scale
      // render the blood compartments
      Object.entries(component_list).forEach(([key, component]) => {
        // inject the offsets
        if (component.enabled) {
          switch (component.compType) {
            case "Oxygenator":
              this.diagram_components[key] = new Oxygenator(
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
              let watched_models_oxy = []
              component.models.forEach(m => {
                watched_models_oxy.push(m + ".vol")
                watched_models_oxy.push(m + ".aboxy.to2")
              })
              explain.watchModelProps(watched_models_oxy)
              break;
            case "BloodPump":
              this.diagram_components[key] = new BloodPump(
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
              let watched_models_pump = []
              component.models.forEach(m => {
                watched_models_pump.push(m + ".vol")
                watched_models_pump.push(m + ".aboxy.to2")
                watched_models_pump.push(m + ".pump_rpm")
              })
              explain.watchModelProps(watched_models_pump)
              break;
            case "LymphCompartment":
              this.diagram_components[key] = new LymphCompartment(
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
              let watched_models_lc = []
              component.models.forEach(m => {
                watched_models_lc.push(m + ".vol")
              })
              explain.watchModelProps(watched_models_lc)
              break;
            case "BloodCompartment":
              this.diagram_components[key] = new BloodCompartment(
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
              this.diagram_components[key] = new GasCompartment(
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
              this.diagram_components[key] = new BloodConnector(
                this.pixiApp,
                key,
                component.label,
                component.models,
                this.diagram_components[component.dbcFrom],
                this.diagram_components[component.dbcTo],
                {},
                component.compPicto,
                global_scaling,
                this.global_speed
              );
              let watched_models_bcon = []
              component.models.forEach(m => {
                watched_models_bcon.push(m + ".flow")
              })
              explain.watchModelProps(watched_models_bcon)
              break;
            case "LymphConnector":
              this.diagram_components[key] = new LymphConnector(
                this.pixiApp,
                key,
                component.label,
                component.models,
                this.diagram_components[component.dbcFrom],
                this.diagram_components[component.dbcTo],
                {},
                component.compPicto,
                global_scaling,
                this.global_speed
              );
              let watched_models_lcon = []
              component.models.forEach(m => {
                watched_models_lcon.push(m + ".flow")
              })
              explain.watchModelProps(watched_models_lcon)
              break;
            case "Shunt":
              this.diagram_components[key] = new Shunt(
                this.pixiApp,
                key,
                component.label,
                component.models,
                this.diagram_components[component.dbcFrom],
                this.diagram_components[component.dbcTo],
                {},
                component.compPicto,
                global_scaling,
                this.global_speed
              );
              let watched_models_shunt = []
              component.models.forEach(m => {
                watched_models_shunt.push(m + ".flow")
              })
              explain.watchModelProps(watched_models_shunt)
              break;
            case "Container":
              this.diagram_components[key] = new Container(
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
              this.diagram_components[key] = new GasConnector(
                this.pixiApp,
                key,
                component.label,
                component.models,
                this.diagram_components[component.dbcFrom],
                this.diagram_components[component.dbcTo],
                {},
                component.compPicto,
                global_scaling,
                this.global_speed
              );
              let watched_models_gascon = []
              component.models.forEach(m => {
                watched_models_gascon.push(m + ".flow")
              })
              explain.watchModelProps(watched_models_gascon)
              break;
            case "GasExchanger":
              this.diagram_components[key] = new GasExchanger(
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
    update_watchlist() {
      Object.entries(this.state.diagram_definition.components).forEach(([key, component]) => {
        // inject the offsets
        if (component.enabled) {
          switch (component.compType) {
            case "Oxygenator":
              let watched_models_oxy = []
              component.models.forEach(m => {
                watched_models_oxy.push(m + ".vol")
                watched_models_oxy.push(m + ".aboxy.to2")
              })
              explain.watchModelProps(watched_models_oxy)
              break;
            case "BloodPump":
              let watched_models_pump = []
              component.models.forEach(m => {
                watched_models_pump.push(m + ".vol")
                watched_models_pump.push(m + ".aboxy.to2")
                watched_models_pump.push(m + ".pump_rpm")
              })
              explain.watchModelProps(watched_models_pump)
              break;
            case "LymphCompartment":
              let watched_models_lc = []
              component.models.forEach(m => {
                watched_models_lc.push(m + ".vol")
              })
              explain.watchModelProps(watched_models_lc)
              break;
            case "BloodCompartment":
              let watched_models_bc = []
              component.models.forEach(m => {
                watched_models_bc.push(m + ".vol")
                watched_models_bc.push(m + ".aboxy.to2")
              })
              explain.watchModelProps(watched_models_bc)
              break;
            case "GasCompartment":
              let watched_models_gc = []
              component.models.forEach(m => {
                watched_models_gc.push(m + ".vol")
                watched_models_gc.push(m + ".po2")
              })
              explain.watchModelProps(watched_models_gc)
              break;
            case "BloodConnector":
              let watched_models_bcon = []
              component.models.forEach(m => {
                watched_models_bcon.push(m + ".flow")
              })
              explain.watchModelProps(watched_models_bcon)
              break;
            case "LymphConnector":
              let watched_models_lcon = []
              component.models.forEach(m => {
                watched_models_lcon.push(m + ".flow")
              })
              explain.watchModelProps(watched_models_lcon)
              break;
            case "Shunt":
              let watched_models_shunt = []
              component.models.forEach(m => {
                watched_models_shunt.push(m + ".flow")
              })
              explain.watchModelProps(watched_models_shunt)
              break;
            case "Container":
              let watched_models_cont = []
              component.models.forEach(m => {
                watched_models_cont.push(m + ".vol")
              })
              explain.watchModelProps(watched_models_cont)
              break;
            case "GasConnector":
              let watched_models_gcon = []
              component.models.forEach(m => {
                watched_models_gcon.push(m + ".flow")
              })
              explain.watchModelProps(watched_models_gcon)
              break;
            case "GasExchanger":
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
          Object.values(this.diagram_components).forEach((sprite) => {
            if (explain.modelData.length > 0) {
              sprite.update(explain.modelData[explain.modelData.length - 1]);
            }
          });
        }
      }

    },
    tickerFunction() {
      if (this.rt_running && this.alive) {
        Object.values(this.diagram_components).forEach((sprite) => {
          if (explain.modelData.length > 0) {
            sprite.update(explain.modelData[0]);
          }
        });
      }
    },
    buildDiagram() {
      this.pixiApp.stage.removeChildren();

      // draw the skeleton graphics
      this.drawSkeletonGraphics()

      // draw the grid
      this.drawGrid()

      // draw the components
      this.diagram_components = {}
      this.drawComponents(this.state.diagram_definition.components)

      // first remove the old ticker
      if (this.ticker) {
        this.pixiApp.ticker.remove(this.tickerFunction)
      }
      // add the new ticker function and start it
      this.ticker = this.pixiApp.ticker.add(this.tickerFunction);

      // get the shunt options state of the diagram
      this.shuntOptionsVisible = this.state.diagram_definition.settings.shuntOptionsVisible

      // get the current shunts state
      this.selected_shunts = []
      if (this.shuntOptionsVisible) {
        try {
          if (this.state.diagram_definition.components['DA'].enabled) {

            this.selected_shunts.push('DA')
            this.showOrHideShunt(true, ['DA'])
          }
          if (this.state.diagram_definition.components['FO'].enabled) {
            this.selected_shunts.push('FO')
          }
          if (this.state.diagram_definition.components['IPS'].enabled) {
            this.selected_shunts.push('IPS')
          }
          if (this.state.diagram_definition.components['VSD'].enabled) {
            this.selected_shunts.push('VSD')
          }
          if (this.state.diagram_definition.components['ECLS'].enabled) {
            this.selected_shunts.push('ECLS')
          }

        } catch { }
      }
    }
  },
  beforeUnmount() { },
  mounted() {
    // initialize and build the diagram
    this.initDiagram().then(() => {

      // build the diagram
      this.buildDiagram()
    })

    // add the event listener for the state change
    this.$bus.on("state", this.processStateChanged)

    // add the event listener for the diagram update
    this.$bus.on('rt_start', () => this.rt_running = true)
    this.$bus.on('rt_stop', () => this.rt_running = false)

    this.$bus.on('reset', () => this.buildDiagram())

    this.$bus.on("update_watchlist", () => this.update_watchlist())

    this.$bus.on("update_drainage_site", (new_site) => {
      try {
        this.state.diagram_definition.components['ECLS_DR'].dbcFrom = new_site
        this.update_component('ECLS_DR')
      } catch { }
    })
    this.$bus.on("update_return_site", (new_site) => {
      try {
        this.state.diagram_definition.components['ECLS_RE'].dbcTo = new_site
        this.update_component('ECLS_RE')
      } catch { }

    })
  },
};

</script>
<style scoped>
#stage {
  width: 100%;
}
</style>
