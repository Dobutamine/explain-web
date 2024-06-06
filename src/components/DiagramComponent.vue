<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <!-- <div v-if="shuntOptionsVisible" class="row justify-center">
      <q-btn-toggle v-model="edit_mode" toggle-color="primary" size="sm" :options="[
        { label: 'NONE', value: 0 },
        { label: 'EDIT', value: 1 },
        { label: 'SIZE', value: 2 }
      ]" />
    </div> -->

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
import Container from "./ui_elements/Container";
import LymphConnector from "./ui_elements/LymphConnector";
import GasConnector from "./ui_elements/GasConnector";
import GasExchanger from "./ui_elements/GasExchanger";
import Oxygenator from "./ui_elements/Oxygenator";
import Shunt from "./ui_elements/Shunt";
import { useStateStore } from "src/stores/state";

let canvas = null;
let pixiApp = null;
let skeletonGraphics = null;
let gridVertical = null;
let gridHorizontal = null;
let diagram_components = {};


export default {
  setup() {
    const state = useStateStore();
    return { state };
  },
  props: {
    alive: Boolean,
  },
  data() {
    return {
      title: "ANIMATED DIAGRAM",
      collapsed: false,
      editingSelection: 1,
      display: "block",
      ticker: null,
      pixiApp: null,
      global_speed: 1,
      global_scale: 1,
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
          const index_sprite = pixiApp.stage.children.findIndex((obj) => obj.name_sprite == shunt);
          if (index_sprite < 0) {
            // not shown already so add it
            this.addDiagramComponent(shunt)
          }
        })
      } else {
        // hide the shunt
        shunts.forEach(shunt => {
          const index_sprite = pixiApp.stage.children.findIndex((obj) => obj.name_sprite == shunt);
          if (index_sprite > 0) {
            // it is present so hide it
            this.removeDiagramComponent(shunt)
          }
        })
      }

    },
    async initDiagram() {
      // first clear all children from the stage
      if (pixiApp) {
        pixiApp = null
      }
      // get the reference to the canvas
      canvas = document.getElementById("stage");

      // set the resolution of the pix application
      PIXI.settings.RESOLUTION = 2;

      // define a pixi app with the canvas as view
      pixiApp = new PIXI.Application({
        transparent: true,
        antialias: true,
        backgroundColor: 0x111111,
        view: canvas,
        eventMode: 'none',
        eventFeatures: {
          move: false,
          /** disables the global move events which can be very expensive in large scenes */
          globalMove: false,
          click: false,
          wheel: false,
        }

      });

      // allow sortable children
      pixiApp.stage.sortableChildren = true;

    },
    clearDiagram() {
      pixiApp.stage.removeChildren();
    },
    drawSkeletonGraphics() {
      if (isNaN(diagram_components.xOffset)) {
        diagram_components.xOffset = 0
      }
      if (isNaN(diagram_components.yOffset)) {
        diagram_components.yOffset = 0
      }
      if (isNaN(diagram_components.radius) || diagram_components.radius <= 0.01) {
        diagram_components.radius = 0.6
      }

      if (this.state.diagram_definition.settings.skeleton) {
        if (skeletonGraphics) {
          skeletonGraphics.clear();
          pixiApp.stage.removeChild(skeletonGraphics);
        }
        const radius = this.state.diagram_definition.settings.radius;
        const color = this.state.diagram_definition.settings.skeletonColor;

        // initalize the skeleton graphics
        skeletonGraphics = new PIXI.Graphics();

        // get center stage
        const xCenter = (pixiApp.renderer.width / 4) + this.state.diagram_definition.settings.xOffset
        const yCenter = (pixiApp.renderer.height / 4) + this.state.diagram_definition.settings.yOffset
        skeletonGraphics.zIndex = 0;
        skeletonGraphics.beginFill(color);
        skeletonGraphics.lineStyle(1, color, 1);
        skeletonGraphics.drawCircle(xCenter, yCenter, (xCenter - this.state.diagram_definition.settings.xOffset) * radius);
        skeletonGraphics.endFill();
        pixiApp.stage.addChild(skeletonGraphics);
      }
    },
    drawGrid() {
      if (this.state.diagram_definition.settings.grid) {
        if (isNaN(this.state.diagram_definition.settings.gridSize) || this.state.diagram_definition.settings.gridSize <= 5) {
          this.state.diagram_definition.settings.gridSize = 15
        }
        const gridSize = this.state.diagram_definition.settings.gridSize;

        if (gridVertical) {
          gridVertical.clear();
          pixiApp.stage.removeChild(gridVertical);
        }
        // build the grid
        gridVertical = new PIXI.Graphics();
        for (let x = 0; x < pixiApp.renderer.width; x = x + gridSize) {
          gridVertical.lineStyle(1, 0x888888, 0.1);
          gridVertical.moveTo(x, 0);
          gridVertical.lineTo(x, pixiApp.renderer.height);
        }
        pixiApp.stage.addChild(gridVertical);

        if (gridHorizontal) {
          gridHorizontal.clear();
          pixiApp.stage.removeChild(gridHorizontal);
        }
        gridHorizontal = new PIXI.Graphics();
        for (let y = 0; y < pixiApp.renderer.height; y = y + gridSize) {
          gridHorizontal.lineStyle(1, 0x888888, 0.1);
          gridHorizontal.moveTo(0, y);
          gridHorizontal.lineTo(pixiApp.renderer.width, y);
        }
        pixiApp.stage.addChild(gridHorizontal);
      } else {
        if (gridVertical) {
          gridVertical.clear();
          pixiApp.stage.removeChild(gridVertical);
        }
        if (gridHorizontal) {
          gridHorizontal.clear();
          pixiApp.stage.removeChild(gridHorizontal);
        }
      }
    },
    removeDiagramComponent(comp_name) {
      const index_sprite = pixiApp.stage.children.findIndex((obj) => obj.name_sprite == comp_name);
      if (index_sprite > 0) {
        pixiApp.stage.removeChild(pixiApp.stage.children[index_sprite])
      }

      const index_text = pixiApp.stage.children.findIndex((obj) => obj.name_text == comp_name);
      if (index_text > 0) {
        pixiApp.stage.removeChild(pixiApp.stage.children[index_text])
      }

      const index_path = pixiApp.stage.children.findIndex((obj) => obj.name_path == comp_name);
      if (index_path > 0) {
        pixiApp.stage.removeChild(pixiApp.stage.children[index_path])
      }

      this.state.diagram_definition.components[comp_name].enabled = false
    },
    addDiagramComponent(comp_name) {
      const index_sprite = pixiApp.stage.children.findIndex((obj) => obj.name_sprite == comp_name);
      const index_text = pixiApp.stage.children.findIndex((obj) => obj.name_text == comp_name);
      const index_path = pixiApp.stage.children.findIndex((obj) => obj.name_path == comp_name);
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
      const xCenter = (pixiApp.renderer.width / 4)
      const yCenter = (pixiApp.renderer.height / 4)
      const xOffset = this.state.diagram_definition.settings.xOffset
      const yOffset = this.state.diagram_definition.settings.yOffset
      const radius = this.state.diagram_definition.settings.radius;
      let global_scaling = this.state.diagram_definition.settings.scaling * this.global_scale
      // first render all compartments and then the connectors
      Object.entries(component_list).forEach(([key, component]) => {
        // inject the offsets
        if (component.enabled) {
          switch (component.compType) {
            case "Oxygenator":
              diagram_components[key] = new Oxygenator(
                pixiApp,
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
              diagram_components[key] = new BloodPump(
                pixiApp,
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
              diagram_components[key] = new LymphCompartment(
                pixiApp,
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
              diagram_components[key] = new BloodCompartment(
                pixiApp,
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
              diagram_components[key] = new GasCompartment(
                pixiApp,
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
          }
        }
      });

      Object.entries(component_list).forEach(([key, component]) => {
        // inject the offsets
        if (component.enabled) {
          switch (component.compType) {
            case "BloodConnector":
              //console.log(`Connecting ${component.dbcFrom} to ${component.dbcTo}`)
              diagram_components[key] = new BloodConnector(
                pixiApp,
                key,
                component.label,
                component.models,
                diagram_components[component.dbcFrom],
                diagram_components[component.dbcTo],
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
              diagram_components[key] = new LymphConnector(
                pixiApp,
                key,
                component.label,
                component.models,
                diagram_components[component.dbcFrom],
                diagram_components[component.dbcTo],
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
              diagram_components[key] = new Shunt(
                pixiApp,
                key,
                component.label,
                component.models,
                diagram_components[component.dbcFrom],
                diagram_components[component.dbcTo],
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
              diagram_components[key] = new Container(
                pixiApp,
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
              diagram_components[key] = new GasConnector(
                pixiApp,
                key,
                component.label,
                component.models,
                diagram_components[component.dbcFrom],
                diagram_components[component.dbcTo],
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
              diagram_components[key] = new GasExchanger(
                pixiApp,
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
          Object.values(diagram_components).forEach((sprite) => {
            if (explain.modelData.length > 0) {
              sprite.update(explain.modelData[explain.modelData.length - 1]);
            }
          });
        }
      }

    },
    tickerFunction() {
      if (this.rt_running && this.alive) {
        Object.values(diagram_components).forEach((sprite) => {
          if (explain.modelData.length > 0) {
            sprite.update(explain.modelData[0]);
          }
        });
      }
    },
    buildDiagram() {
      if (isNaN(this.state.diagram_definition.settings.speed) || this.state.diagram_definition.settings.speed <= 0.01) {
        this.state.diagram_definition.settings.speed = 1
      }
      if (isNaN(this.state.diagram_definition.settings.scaling) || this.state.diagram_definition.settings.scaling <= 0.01) {
        this.state.diagram_definition.settings.scaling = 1
      }
      this.global_speed = this.state.diagram_definition.settings.speed
      this.global_scale = this.state.diagram_definition.settings.scaling

      pixiApp.stage.removeChildren();

      // draw the skeleton graphics
      this.drawSkeletonGraphics()

      // draw the grid
      this.drawGrid()

      // draw the components
      diagram_components = {}
      this.drawComponents(this.state.diagram_definition.components)

      // remove the event listeners
      pixiApp.stage.children.forEach((child) => {
        child.eventMode = "none";
      })

      // first remove the old ticker
      if (this.ticker) {
        pixiApp.ticker.remove(this.tickerFunction)
      }
      // add the new ticker function and start it
      this.ticker = pixiApp.ticker.add(this.tickerFunction);

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
    this.$bus.on('rebuild_diagram', () => this.buildDiagram())

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
