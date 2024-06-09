<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <div class="row text-overline justify-center" @click="collapsed = !collapsed">
      {{ title }}
    </div>
    <div v-if="!collapsed">
      <div class="q-ml-md q-mr-sm q-mb-sm  text-overline justify-center">
        <div class="text-center" @click="generalSettingsCollapsed = !generalSettingsCollapsed">general settings</div>
        <div v-if="!generalSettingsCollapsed" class="q-ma-sm row justify-center">
          <q-toggle class="col-6" v-model="state.diagram_definition.settings.grid" label="grid" dense dark size="sm"
            @update:model-value="updateDiagram" />
          <q-input class="col-6" v-model.number="state.diagram_definition.settings.gridSize" type="number" :min="5"
            :max="100" :step="1" label="grid size" dense dark @update:model-value="updateDiagram" />
        </div>

        <div v-if="!generalSettingsCollapsed" class="q-ma-sm row">
          <q-toggle v-model="state.diagram_definition.settings.skeleton" label="skeleton" dense dark size="sm"
            @update:model-value="updateDiagram" />
        </div>
        <div v-if="state.diagram_definition.settings.skeleton && !generalSettingsCollapsed" class="q-ma-sm row">
          <q-input class="col-4" v-model.number="state.diagram_definition.settings.xOffset" label="x-offset"
            type="number" :min="-1000" :max="1000" :step="1" dense dark @update:model-value="updateDiagram" />
          <q-input class="col-4" v-model.number="state.diagram_definition.settings.yOffset" label="y-offset"
            type="number" :min="-1000" :max="1000" :step="1" dense dark @update:model-value="updateDiagram" />
          <q-input class="col-4" v-model.number="state.diagram_definition.settings.radius" label="radius" dense dark
            type="number" :min="0.01" :max="1" :step="0.01" @update:model-value="updateDiagram" />
        </div>

        <div v-if="!generalSettingsCollapsed" class="q-ma-sm row">
          <q-input class="col-6" v-model.number="state.diagram_definition.settings.scaling" label="scaling" dense dark
            type="number" :min="0.1" :max="1000" :step="0.1" @update:model-value="updateDiagram" />
          <q-input class="col-6" v-model.number="state.diagram_definition.settings.speed" label="speed" dense dark
            type="number" :min="0.1" :max="1000" :step="0.1" @update:model-value="updateDiagram" />
        </div>

        <div v-if="!generalSettingsCollapsed" class="q-ma-sm row">
          <q-toggle v-model="state.diagram_definition.settings.shuntOptionsVisible" label="shunt and ecls options" dense
            dark size="sm" @update:model-value="updateDiagram" />
        </div>

        <div v-if="!generalSettingsCollapsed" class="q-ma-sm row justify-center">
          <q-btn class="col q-ma-sm" color="negative" size="sm" @click="clearDiagram">CLEAR DIAGRAM</q-btn>
          <q-btn v-if="this.state.prev_diagram_definition" class="col q-ma-sm" color="secondary" size="sm"
            @click="restore_diagram">RESTORE DIAGRAM</q-btn>
        </div>

      </div>

      <div class="text-center text-overline" @click="componentSettingsCollapsed = !componentSettingsCollapsed">component
        settings</div>
      <div v-if="!componentSettingsCollapsed" class="q-ml-md q-mr-sm q-mb-sm row text-overline justify-center">
        <q-select class="col-9" v-model:model-value="selectedDiagramComponentName"
          :options="Object.keys(state.diagram_definition.components)" label="diagram component" dense
          @update:model-value="editComponent"></q-select>
        <q-btn color="secondary" label="ADD NEW" dark class="q-ma-sm q-mt-md col" dense size="sm">
          <q-menu dark>
            <q-list dense>
              <div v-for="(
                  diagramComponentType, index
                ) in diagramComponentTypes" :key="index">
                <q-item clickable dense>
                  <q-item-section clickable v-close-popup @click="addComponent(diagramComponentType)">
                    {{ diagramComponentType }}
                  </q-item-section>
                </q-item>
              </div>
            </q-list>
          </q-menu>
        </q-btn>

      </div>


      <div v-if="!componentSettingsCollapsed">
        <!-- editor mode 1 or 2 -->
        <div v-if="editorMode == 1 || editorMode == 2"
          class="q-pa-sm q-mt-xs q-mb-sm q-ml-md q-mr-md row text-overline justify-center">
          {{ compType }}
          <div :style="{ 'font-size': '10px', width: '100%' }">
            <q-toggle label="enabled" v-model="compEnabled" dense size="sm" style="width: 100%" />
            <q-input label="name" v-model="compName" square hide-hint dense dark stack-label style="width: 100%" />
            <q-input label="label" v-model="compLabel" square hide-hint dense dark stack-label style="width: 100%" />
            <q-select class="col-9" label="models" v-model="compModelSelection" :options="compModels" hide-bottom-space
              dense multiple style="font-size: 12px" />
            <div v-if="
              advancedMode &&
              (compType == 'BloodCompartment' ||
                compType == 'BloodPump' ||
                compType == 'Oxygenator' ||
                compType == 'GasCompartment' ||
                compType == 'Container' ||
                compType == 'GasExchanger')
            ">
              layout
              <q-btn-toggle class="q-ma-sm col-9" v-model="compLayoutType" size="sm" dark spread dense no-caps
                toggle-color="blue-grey-6" color="grey-9" text-color="black" :options="[
                  { label: 'Arc', value: true },
                  { label: 'Relative', value: false },
                ]" />
              <div class="row">
                <q-select class="col q-ma-sm" label="pictogram" square hide-hint stack-label v-model="compPicto"
                  :options="pictos" hide-bottom-space dense dark style="font-size: 12px" />
              </div>
              <div v-if="!compLayoutType" class="row">
                <q-input class="col q-ma-sm" label="postion x" v-model="compLayoutX" square type="number" hide-hint
                  dense dark stack-label />
                <q-input class="col q-ma-sm" label="position Y" v-model="compLayoutY" square type="number" hide-hint
                  dense dark stack-label />
              </div>
              <div v-if="compLayoutType" class="row">
                <q-input class="col q-ma-sm" label="position Degrees" v-model="compLayoutDgs" square type="number"
                  hide-hint dense dark stack-label />
              </div>

              <div class="row">
                <q-input class="col q-ma-sm" label="scale X" v-model="compScaleX" square type="number" hide-hint dense
                  dark stack-label />
                <q-input class="col q-ma-sm" label="scale Y" v-model="compScaleY" square type="number" hide-hint dense
                  dark stack-label />
                <q-input class="col q-ma-sm" label="rotation" v-model="compRotation" square type="number" hide-hint
                  dense dark stack-label />
              </div>
              <div class="row">
                <q-input class="col q-ma-sm" label="label pos X" v-model="compTextX" square type="number" hide-hint
                  dense dark stack-label />
                <q-input class="col q-ma-sm" label="label pos Y" v-model="compTextY" square type="number" hide-hint
                  dense dark stack-label />
                <q-input class="col q-ma-sm" label="label size" v-model="compTextSize" square type="number" hide-hint
                  dense dark stack-label />
              </div>
            </div>

            <div v-if="
              compType == 'BloodConnector' ||
              compType == 'GasConnector' ||
              compType == 'Shunt'
            ">
              <div class="row">
                <q-select class="col" label="Diagram comp from" v-model="compDbcFrom" :options="compDbcFroms"
                  hide-bottom-space dense style="font-size: 12px" />
                <q-select class="col" label="Diagram comp To" v-model="compDbcTo" :options="compDbcTos"
                  hide-bottom-space dense style="font-size: 12px" />
              </div>
            </div>
          </div>
        </div>
        <!-- editor mode 3 -->
        <div v-if="editorMode === 3">
          <div class="q-gutter-sm row text-overline justify-center q-mb-sm q-mt-xs">
            Are you sure you want to remove {{ compName }}?
          </div>
          <div class="q-gutter-sm row text-overline justify-center q-mb-sm q-mt-xs">
            <q-btn color="red-10" dense size="sm" style="width: 50px" icon="fa-solid fa-trash-can"
              @click="deleteComponentFromStore"></q-btn>
            <q-btn color="grey-14" size="xs" dense style="width: 50px" @click="cancelDiagramBuild"
              icon="fa-solid fa-refresh"></q-btn>
          </div>
        </div>
        <!-- server communication buttons -->
        <div v-if="editorMode < 3 && editorMode > 0"
          class="q-gutter-sm row text-overline justify-center q-mb-sm q-mt-xs">
          <q-btn color="secondary" dense size="sm" style="width: 50px" icon="fa-solid fa-check"
            @click="saveDiagramComponent"></q-btn>
          <q-btn color="negative" dense size="sm" style="width: 50px" icon="fa-solid fa-trash-can"
            @click="deleteComponent">
          </q-btn>
          <q-btn color="grey-14" size="xs" dense style="width: 50px" @click="cancelDiagramBuild"
            icon="fa-solid fa-xmark"></q-btn>
        </div>
        <!-- status message -->
        <div class="q-gutter-sm row text-overline justify-center q-mb-xs" style="font-size: 10px">
          {{ statusMessage }}
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import { explain } from "../boot/explain";

import { useUserStore } from "src/stores/user";
import { useStateStore } from "src/stores/state";
import { useGeneralStore } from "src/stores/general";

export default {
  components: {},
  setup() {
    const user = useUserStore();
    const state = useStateStore();
    const general = useGeneralStore();
    return {
      user,
      state,
      general,
    };
  },
  data() {
    return {
      selectedDiagramComponentName: "",
      selectedDiagramComponentExp: {},

      advancedMode: true,
      editorMode: 0,
      title: "DIAGRAM EDITOR",
      generalSettingsCollapsed: true,
      componentSettingsCollapsed: false,
      collapsed: true,
      modelsTree: {},
      selectedModelType: [],
      selectedModelItems: [],
      modelTypes: [],
      selectedDiagramComponent: "",
      diagramComponentTypes: ["BloodCompartment", "BloodPump", "BloodConnector", "Shunt", "GasCompartment", "GasConnector", "Container", "GasExchanger", "Oxygenator"],
      diagramComponentNames: [],
      compEnabled: false,
      compName: "",
      compLabel: "",
      compType: "",
      compModels: [],
      compLayoutType: true,
      compRotation: 0,
      compLayoutX: 1,
      compLayoutY: 1,
      compMorphX: 1,
      compMorphY: 1,
      compScaleX: 1,
      compScaleY: 1,
      compTextX: 0,
      compTextY: 0,
      compTextSize: 10,
      compLayoutDgs: 0,
      compDbcFrom: "",
      compDbcFroms: [],
      compDbcTo: "",
      compDbcTos: [],
      compModelSelection: [],
      compGas: "O2",
      compGasses: ["O2", "Co2"],
      compPicto: null,
      pictos: [
        "blood.png",
        "container.png",
        "exchange.png",
        "gas_container.png",
        "square.png",
        "heart.png",
        "pump.png",
        "rounded_rectangle.png",
        "star.png",
        "vessel.png",
      ],
      rebuild_event: null,
      statusMessage: "",
    };
  },
  methods: {
    restore_diagram() {
      if (this.state.prev_diagram_definition) {
        this.state.diagram_definition = JSON.parse(JSON.stringify(this.prev_diagram_definition));
        this.$bus.emit("rebuild_diagram");
      }
    },
    clearDiagram() {
      this.prev_diagram_definition = JSON.parse(JSON.stringify(this.state.diagram_definition));
      this.state.diagram_definition.components = {};
      this.$bus.emit("rebuild_diagram");
    },
    updateDiagram() {
      this.$bus.emit("rebuild_diagram");
    },
    getAllDiagramComponents() {
      this.diagramComponentNames = [];
      if (this.state.diagram_definition.components) {
        Object.keys(this.state.diagram_definition.components).forEach((component) => {
          this.diagramComponentNames.push(component);
        });
      }
      this.diagramComponentNames.sort();
    },
    saveDiagramComponent() {
      let layoutType = "rel";
      switch (this.compType) {
        case "GasCompartment":
          layoutType = "rel";
          if (this.compLayoutType) {
            layoutType = "arc";
          }
          this.state.diagram_definition.components[this.compName] = {
            enabled: this.compEnabled,
            label: this.compLabel,
            models: this.compModelSelection,
            compType: this.compType,
            compPicto: this.compPicto,
            layout: {
              pos: {
                type: layoutType,
                x: parseFloat(this.compLayoutX),
                y: parseFloat(this.compLayoutY),
                dgs: parseFloat(this.compLayoutDgs),
              },
              morph: {
                x: parseFloat(this.compMorphX),
                y: parseFloat(this.compMorphY),
              },
              scale: {
                x: parseFloat(this.compScaleX),
                y: parseFloat(this.compScaleY),
              },
              rotation: parseFloat(this.compRotation),
              text: {
                x: parseFloat(this.compTextX),
                y: parseFloat(this.compTextY),
                size: parseFloat(this.compTextSize),
              },
            },
          };
          this.$bus.emit("rebuild_diagram");
          break;
        case "Oxygenator":
          layoutType = "rel";
          if (this.compLayoutType) {
            layoutType = "arc";
          }
          this.state.diagram_definition.components[this.compName] = {
            enabled: this.compEnabled,
            label: this.compLabel,
            models: this.compModelSelection,
            compType: this.compType,
            compPicto: this.compPicto,
            layout: {
              pos: {
                type: layoutType,
                x: parseFloat(this.compLayoutX),
                y: parseFloat(this.compLayoutY),
                dgs: parseFloat(this.compLayoutDgs),
              },
              morph: {
                x: parseFloat(this.compMorphX),
                y: parseFloat(this.compMorphY),
              },
              scale: {
                x: parseFloat(this.compScaleX),
                y: parseFloat(this.compScaleY),
              },
              rotation: parseFloat(this.compRotation),
              text: {
                x: parseFloat(this.compTextX),
                y: parseFloat(this.compTextY),
                size: parseFloat(this.compTextSize),
              },
            },
          };
          this.$bus.emit("rebuild_diagram");
          break;
        case "BloodPump":
          layoutType = "rel";
          if (this.compLayoutType) {
            layoutType = "arc";
          }
          this.state.diagram_definition.components[this.compName] = {
            enabled: this.compEnabled,
            label: this.compLabel,
            models: this.compModelSelection,
            compType: this.compType,
            compPicto: this.compPicto,
            layout: {
              pos: {
                type: layoutType,
                x: parseFloat(this.compLayoutX),
                y: parseFloat(this.compLayoutY),
                dgs: parseFloat(this.compLayoutDgs),
              },
              morph: {
                x: parseFloat(this.compMorphX),
                y: parseFloat(this.compMorphY),
              },
              scale: {
                x: parseFloat(this.compScaleX),
                y: parseFloat(this.compScaleY),
              },
              rotation: parseFloat(this.compRotation),
              text: {
                x: parseFloat(this.compTextX),
                y: parseFloat(this.compTextY),
                size: parseFloat(this.compTextSize),
              },
            },
          };
          this.$bus.emit("rebuild_diagram");
          break;
        case "BloodCompartment":
          layoutType = "rel";
          if (this.compLayoutType) {
            layoutType = "arc";
          }
          this.state.diagram_definition.components[this.compName] = {
            enabled: this.compEnabled,
            label: this.compLabel,
            models: this.compModelSelection,
            compType: this.compType,
            compPicto: this.compPicto,
            layout: {
              pos: {
                type: layoutType,
                x: parseFloat(this.compLayoutX),
                y: parseFloat(this.compLayoutY),
                dgs: parseFloat(this.compLayoutDgs),
              },
              morph: {
                x: parseFloat(this.compMorphX),
                y: parseFloat(this.compMorphY),
              },
              scale: {
                x: parseFloat(this.compScaleX),
                y: parseFloat(this.compScaleY),
              },
              rotation: parseFloat(this.compRotation),
              text: {
                x: parseFloat(this.compTextX),
                y: parseFloat(this.compTextY),
                size: parseFloat(this.compTextSize),
              },
            },
          };
          this.$bus.emit("rebuild_diagram");
          break;
        case "Container":
          layoutType = "rel";
          if (this.compLayoutType) {
            layoutType = "arc";
          }
          this.state.diagram_definition.components[this.compName] = {
            enabled: this.compEnabled,
            label: this.compLabel,
            models: this.compModelSelection,
            compType: this.compType,
            compPicto: this.compPicto,
            layout: {
              pos: {
                type: layoutType,
                x: parseFloat(this.compLayoutX),
                y: parseFloat(this.compLayoutY),
                dgs: parseFloat(this.compLayoutDgs),
              },
              morph: {
                x: parseFloat(this.compMorphX),
                y: parseFloat(this.compMorphY),
              },
              scale: {
                x: parseFloat(this.compScaleX),
                y: parseFloat(this.compScaleY),
              },
              rotation: parseFloat(this.compRotation),
              text: {
                x: parseFloat(this.compTextX),
                y: parseFloat(this.compTextY),
                size: parseFloat(this.compTextSize),
              },
            },
          };
          this.$bus.emit("rebuild_diagram");
          break;
        case "BloodConnector":
          this.state.diagram_definition.components[this.compName] = {
            enabled: this.compEnabled,
            label: this.compLabel,
            models: this.compModelSelection,
            compType: this.compType,
            compPicto: this.compPicto,
            dbcFrom: this.compDbcFrom,
            dbcTo: this.compDbcTo
          };
          this.$bus.emit("rebuild_diagram");
          break;
        case "Shunt":
          this.state.diagram_definition.components[this.compName] = {
            enabled: this.compEnabled,
            label: this.compLabel,
            models: this.compModelSelection,
            compType: this.compType,
            compPicto: this.compPicto,
            dbcFrom: this.compDbcFrom,
            dbcTo: this.compDbcTo
          };
          this.$bus.emit("rebuild_diagram");
          break;
        case "GasConnector":
          this.state.diagram_definition.components[this.compName] = {
            enabled: this.compEnabled,
            label: this.compLabel,
            models: this.compModelSelection,
            compType: this.compType,
            compPicto: this.compPicto,
            dbcFrom: this.compDbcFrom,
            dbcTo: this.compDbcTo
          };
          this.$bus.emit("rebuild_diagram");
          break;
        case "GasExchanger":
          layoutType = "rel";
          if (this.compLayoutType) {
            layoutType = "arc";
          }
          this.state.diagram_definition.components[this.compName] = {
            enabled: this.compEnabled,
            label: this.compLabel,
            models: this.compModelSelection,
            compType: this.compType,
            compPicto: this.compPicto,
            gas: this.compGas,
            layout: {
              pos: {
                type: layoutType,
                x: parseFloat(this.compLayoutX),
                y: parseFloat(this.compLayoutY),
                dgs: parseFloat(this.compLayoutDgs),
              },
              morph: {
                x: parseFloat(this.compMorphX),
                y: parseFloat(this.compMorphY),
              },
              scale: {
                x: parseFloat(this.compScaleX),
                y: parseFloat(this.compScaleY),
              },
              rotation: parseFloat(this.compRotation),
              text: {
                x: parseFloat(this.compTextX),
                y: parseFloat(this.compTextY),
                size: parseFloat(this.compTextSize),
              },
            },
          };
          this.$bus.emit("rebuild_diagram");
          break;
      }
    },
    cancelDiagramBuild() {
      this.clearFields();
      this.getAllDiagramComponents();
      this.compType = "";
      this.selectedDiagramComponentName = "";
      this.selectedModelItems = [];
      this.editorMode = 0;
    },
    deleteComponent() {
      this.editorMode = 3;
      this.compName = this.selectedDiagramComponentName;
    },
    deleteComponentFromStore() {
      // also delete all connector which are pointing to this component
      let compToDelete = [];
      compToDelete.push(this.compName);

      let compType = this.state.diagram_definition.components[this.compName].compType;
      if (
        compType === "GasCompartment" ||
        compType === "BloodCompartment" ||
        compType === "BloodPump" ||
        compType === "Oxygenator"
      ) {
        Object.entries(this.state.diagram_definition.components).forEach(
          ([component_name, component]) => {
            if (
              component.compType === "GasConnector" ||
              component.compType === "BloodConnector" ||
              component.compType === "Shunt"
            ) {
              if (
                component.dbcFrom === this.compName ||
                component.dbcTo === this.compName
              ) {
                compToDelete.push(component_name);
              }
            }
          }
        );
      }
      compToDelete.forEach((c) => {
        delete this.state.diagram_definition.components[c];
      });

      //delete this.state.diagram_definition.components[this.compName];
      this.$bus.emit("rebuild_diagram");
      this.cancelDiagramBuild();
    },
    editComponent() {
      this.editorMode = 2;
      // get all the properties
      this.selectedDiagramComponent = this.state.diagram_definition.components[this.selectedDiagramComponentName];

      // get all possible model types
      this.compModels = [];
      this.compModelSelection = [];

      switch (this.selectedDiagramComponent.compType) {
        case "BloodConnector":
          this.compEnabled = this.selectedDiagramComponent.enabled;
          this.compType = this.selectedDiagramComponent.compType;
          this.compName = this.selectedDiagramComponentName;
          this.compLabel = this.selectedDiagramComponent.label;
          this.selectModelTypeToAdd(this.selectedDiagramComponent.compType);
          this.compModelSelection = this.selectedDiagramComponent.models;
          this.compDbcFrom = this.selectedDiagramComponent.dbcFrom;
          this.compDbcTo = this.selectedDiagramComponent.dbcTo;
          this.findDiagramComponents("BloodCompartment");
          this.findDiagramComponents("BloodPump");
          this.findDiagramComponents("Oxygenator");

          break;

        case "GasConnector":
          this.compEnabled = this.selectedDiagramComponent.enabled;
          this.compType = this.selectedDiagramComponent.compType;
          this.compName = this.selectedDiagramComponentName;
          this.compLabel = this.selectedDiagramComponent.label;
          this.selectModelTypeToAdd(this.selectedDiagramComponent.compType);
          this.compModelSelection = this.selectedDiagramComponent.models;
          this.compDbcFrom = this.selectedDiagramComponent.dbcFrom;
          this.compDbcTo = this.selectedDiagramComponent.dbcTo;
          this.findDiagramComponents("GasCompartment");
          break;

        case "Shunt":
          this.compEnabled = this.selectedDiagramComponent.enabled;
          this.compType = this.selectedDiagramComponent.compType;
          this.compName = this.selectedDiagramComponentName;
          this.compLabel = this.selectedDiagramComponent.label;
          this.selectModelTypeToAdd(this.selectedDiagramComponent.compType);
          this.compModelSelection = this.selectedDiagramComponent.models;
          this.compDbcFrom = this.selectedDiagramComponent.dbcFrom;
          this.compDbcTo = this.selectedDiagramComponent.dbcTo;
          this.findDiagramComponents("BloodCompartment");
          this.findDiagramComponents("BloodPump");
          this.findDiagramComponents("Oxygenator");
          break;

        case "BloodCompartment":
          this.compEnabled = this.selectedDiagramComponent.enabled;
          this.compType = this.selectedDiagramComponent.compType;
          this.compName = this.selectedDiagramComponentName;
          this.compLabel = this.selectedDiagramComponent.label;
          this.selectModelTypeToAdd(this.selectedDiagramComponent.compType);
          this.compModelSelection = this.selectedDiagramComponent.models;
          if (this.selectedDiagramComponent.layout.pos.type == "arc") {
            this.compLayoutType = true;
          } else {
            this.compLayoutType = false;
          }
          this.compLayoutDgs = parseFloat(
            this.selectedDiagramComponent.layout.pos.dgs.toFixed(2)
          );
          this.compLayoutX = parseFloat(
            this.selectedDiagramComponent.layout.pos.x.toFixed(2)
          );
          this.compLayoutY = parseFloat(
            this.selectedDiagramComponent.layout.pos.y.toFixed(2)
          );
          this.compMorphX = parseFloat(
            this.selectedDiagramComponent.layout.morph.x.toFixed(2)
          );
          this.compMorphY = parseFloat(
            this.selectedDiagramComponent.layout.morph.y.toFixed(2)
          );
          this.compScaleX = parseFloat(
            this.selectedDiagramComponent.layout.scale.x.toFixed(2)
          );
          this.compScaleY = parseFloat(
            this.selectedDiagramComponent.layout.scale.y.toFixed(2)
          );
          this.compTextX = parseFloat(
            this.selectedDiagramComponent.layout.text.x.toFixed(2)
          );
          this.compTextY = parseFloat(
            this.selectedDiagramComponent.layout.text.y.toFixed(2)
          );
          this.compRotation = parseFloat(
            this.selectedDiagramComponent.layout.rotation.toFixed(2)
          );
          this.compTextSize = parseFloat(
            this.selectedDiagramComponent.layout.text.size.toFixed(2)
          );

          // add the other possible models
          break;
        case "Oxygenator":
          this.compEnabled = this.selectedDiagramComponent.enabled;
          this.compType = this.selectedDiagramComponent.compType;
          this.compName = this.selectedDiagramComponentName;
          this.compLabel = this.selectedDiagramComponent.label;
          this.selectModelTypeToAdd(this.selectedDiagramComponent.compType);
          this.compModelSelection = this.selectedDiagramComponent.models;
          if (this.selectedDiagramComponent.layout.pos.type == "arc") {
            this.compLayoutType = true;
          } else {
            this.compLayoutType = false;
          }
          this.compLayoutDgs = parseFloat(
            this.selectedDiagramComponent.layout.pos.dgs.toFixed(2)
          );
          this.compLayoutX = parseFloat(
            this.selectedDiagramComponent.layout.pos.x.toFixed(2)
          );
          this.compLayoutY = parseFloat(
            this.selectedDiagramComponent.layout.pos.y.toFixed(2)
          );
          this.compMorphX = parseFloat(
            this.selectedDiagramComponent.layout.morph.x.toFixed(2)
          );
          this.compMorphY = parseFloat(
            this.selectedDiagramComponent.layout.morph.y.toFixed(2)
          );
          this.compScaleX = parseFloat(
            this.selectedDiagramComponent.layout.scale.x.toFixed(2)
          );
          this.compScaleY = parseFloat(
            this.selectedDiagramComponent.layout.scale.y.toFixed(2)
          );
          this.compTextX = parseFloat(
            this.selectedDiagramComponent.layout.text.x.toFixed(2)
          );
          this.compTextY = parseFloat(
            this.selectedDiagramComponent.layout.text.y.toFixed(2)
          );
          this.compRotation = parseFloat(
            this.selectedDiagramComponent.layout.rotation.toFixed(2)
          );
          this.compTextSize = parseFloat(
            this.selectedDiagramComponent.layout.text.size.toFixed(2)
          );

          // add the other possible models
          break;
        case "BloodPump":
          this.compEnabled = this.selectedDiagramComponent.enabled;
          this.compType = this.selectedDiagramComponent.compType;
          this.compName = this.selectedDiagramComponentName;
          this.compLabel = this.selectedDiagramComponent.label;
          this.selectModelTypeToAdd(this.selectedDiagramComponent.compType);
          this.compModelSelection = this.selectedDiagramComponent.models;
          if (this.selectedDiagramComponent.layout.pos.type == "arc") {
            this.compLayoutType = true;
          } else {
            this.compLayoutType = false;
          }
          this.compLayoutDgs = parseFloat(
            this.selectedDiagramComponent.layout.pos.dgs.toFixed(2)
          );
          this.compLayoutX = parseFloat(
            this.selectedDiagramComponent.layout.pos.x.toFixed(2)
          );
          this.compLayoutY = parseFloat(
            this.selectedDiagramComponent.layout.pos.y.toFixed(2)
          );
          this.compMorphX = parseFloat(
            this.selectedDiagramComponent.layout.morph.x.toFixed(2)
          );
          this.compMorphY = parseFloat(
            this.selectedDiagramComponent.layout.morph.y.toFixed(2)
          );
          this.compScaleX = parseFloat(
            this.selectedDiagramComponent.layout.scale.x.toFixed(2)
          );
          this.compScaleY = parseFloat(
            this.selectedDiagramComponent.layout.scale.y.toFixed(2)
          );
          this.compTextX = parseFloat(
            this.selectedDiagramComponent.layout.text.x.toFixed(2)
          );
          this.compTextY = parseFloat(
            this.selectedDiagramComponent.layout.text.y.toFixed(2)
          );
          this.compRotation = parseFloat(
            this.selectedDiagramComponent.layout.rotation.toFixed(2)
          );
          this.compTextSize = parseFloat(
            this.selectedDiagramComponent.layout.text.size.toFixed(2)
          );

          // add the other possible models
          break;
        case "GasCompartment":
          this.compEnabled = this.selectedDiagramComponent.enabled;
          this.compType = this.selectedDiagramComponent.compType;
          this.compName = this.selectedDiagramComponentName;
          this.compLabel = this.selectedDiagramComponent.label;
          this.selectModelTypeToAdd(this.selectedDiagramComponent.compType);
          this.compModelSelection = this.selectedDiagramComponent.models;
          if (this.selectedDiagramComponent.layout.pos.type == "arc") {
            this.compLayoutType = true;
          } else {
            this.compLayoutType = false;
          }
          this.compLayoutDgs = parseFloat(
            this.selectedDiagramComponent.layout.pos.dgs.toFixed(2)
          );
          this.compLayoutX = parseFloat(
            this.selectedDiagramComponent.layout.pos.x.toFixed(2)
          );
          this.compLayoutY = parseFloat(
            this.selectedDiagramComponent.layout.pos.y.toFixed(2)
          );
          this.compMorphX = parseFloat(
            this.selectedDiagramComponent.layout.morph.x.toFixed(2)
          );
          this.compMorphY = parseFloat(
            this.selectedDiagramComponent.layout.morph.y.toFixed(2)
          );
          this.compScaleX = parseFloat(
            this.selectedDiagramComponent.layout.scale.x.toFixed(2)
          );
          this.compScaleY = parseFloat(
            this.selectedDiagramComponent.layout.scale.y.toFixed(2)
          );
          this.compTextX = parseFloat(
            this.selectedDiagramComponent.layout.text.x.toFixed(2)
          );
          this.compTextY = parseFloat(
            this.selectedDiagramComponent.layout.text.y.toFixed(2)
          );
          this.compRotation = parseFloat(
            this.selectedDiagramComponent.layout.rotation.toFixed(2)
          );
          this.compTextSize = parseFloat(
            this.selectedDiagramComponent.layout.text.size.toFixed(2)
          );

          // add the other possible models
          break;
        case "Container":
          this.compEnabled = this.selectedDiagramComponent.enabled;
          this.compType = this.selectedDiagramComponent.compType;
          this.compName = this.selectedDiagramComponentName;
          this.compLabel = this.selectedDiagramComponent.label;
          this.selectModelTypeToAdd(this.selectedDiagramComponent.compType);
          this.compModelSelection = this.selectedDiagramComponent.models;
          if (this.selectedDiagramComponent.layout.pos.type == "arc") {
            this.compLayoutType = true;
          } else {
            this.compLayoutType = false;
          }
          this.compLayoutDgs = parseFloat(
            this.selectedDiagramComponent.layout.pos.dgs.toFixed(2)
          );
          this.compLayoutX = parseFloat(
            this.selectedDiagramComponent.layout.pos.x.toFixed(2)
          );
          this.compLayoutY = parseFloat(
            this.selectedDiagramComponent.layout.pos.y.toFixed(2)
          );
          this.compMorphX = parseFloat(
            this.selectedDiagramComponent.layout.morph.x.toFixed(2)
          );
          this.compMorphY = parseFloat(
            this.selectedDiagramComponent.layout.morph.y.toFixed(2)
          );
          this.compScaleX = parseFloat(
            this.selectedDiagramComponent.layout.scale.x.toFixed(2)
          );
          this.compScaleY = parseFloat(
            this.selectedDiagramComponent.layout.scale.y.toFixed(2)
          );
          this.compTextX = parseFloat(
            this.selectedDiagramComponent.layout.text.x.toFixed(2)
          );
          this.compTextY = parseFloat(
            this.selectedDiagramComponent.layout.text.y.toFixed(2)
          );
          this.compRotation = parseFloat(
            this.selectedDiagramComponent.layout.rotation.toFixed(2)
          );
          this.compTextSize = parseFloat(
            this.selectedDiagramComponent.layout.text.size.toFixed(2)
          );

          // add the other possible models
          break;
        case "GasExchanger":
          this.compEnabled = this.selectedDiagramComponent.enabled;
          this.compType = this.selectedDiagramComponent.compType;
          this.compName = this.selectedDiagramComponentName;
          this.compLabel = this.selectedDiagramComponent.label;
          this.compGas = this.selectedDiagramComponent.gas;
          this.selectModelTypeToAdd(this.selectedDiagramComponent.compType);
          this.compModelSelection = this.selectedDiagramComponent.models;
          if (this.selectedDiagramComponent.layout.pos.type == "arc") {
            this.compLayoutType = true;
          } else {
            this.compLayoutType = false;
          }
          this.compLayoutDgs = parseFloat(
            this.selectedDiagramComponent.layout.pos.dgs.toFixed(2)
          );
          this.compLayoutX = parseFloat(
            this.selectedDiagramComponent.layout.pos.x.toFixed(2)
          );
          this.compLayoutY = parseFloat(
            this.selectedDiagramComponent.layout.pos.y.toFixed(2)
          );
          this.compMorphX = parseFloat(
            this.selectedDiagramComponent.layout.morph.x.toFixed(2)
          );
          this.compMorphY = parseFloat(
            this.selectedDiagramComponent.layout.morph.y.toFixed(2)
          );
          this.compScaleX = parseFloat(
            this.selectedDiagramComponent.layout.scale.x.toFixed(2)
          );
          this.compScaleY = parseFloat(
            this.selectedDiagramComponent.layout.scale.y.toFixed(2)
          );
          this.compTextX = parseFloat(
            this.selectedDiagramComponent.layout.text.x.toFixed(2)
          );
          this.compTextY = parseFloat(
            this.selectedDiagramComponent.layout.text.y.toFixed(2)
          );
          this.compRotation = parseFloat(
            this.selectedDiagramComponent.layout.rotation.toFixed(2)
          );
          this.compTextSize = parseFloat(
            this.selectedDiagramComponent.layout.text.size.toFixed(2)
          );

          // add the other possible models
          break;
      }
      if (this.selectedDiagramComponent.compPicto) {
        this.compPicto = this.selectedDiagramComponent.compPicto;
      }
    },
    findDiagramComponents(compType) {
      Object.keys(this.state.diagram_definition.components).forEach((compName) => {
        if (this.state.diagram_definition.components[compName].compType == compType) {
          this.compDbcFroms.push(compName);
          this.compDbcTos.push(compName);
        }
      });
    },
    clearFields() {
      this.compEnabled = false;
      this.compLabel = "";
      this.compName = "";
      this.compModels = [];
      this.compLayoutType = true;
      this.compLayoutDgs = 0;
      this.compLayoutX = 1;
      this.compLayoutY = 1;
      this.compMorphX = 1;
      this.compMorphY = 1;
      this.compScaleX = 1;
      this.compScaleY = 1;
      this.compTextX = 0;
      this.compTextY = 0;
      this.compRotation = 0;
      this.compTextSize = 10;
      this.compDbcFroms = [];
      this.compDbcFrom = "";
      this.compDbcTo = "";
      this.compDbcTos = [];
    },
    addComponent(compType) {
      this.editorMode = 1;
      this.clearFields();
      this.compEnabled = true;
      this.selectModelTypeToAdd(compType);
      switch (compType) {
        case "BloodConnector":
          this.findDiagramComponents("BloodCompartment");
          this.findDiagramComponents("BloodPump");
          this.findDiagramComponents("Oxygenator");
          break;
        case "GasConnector":
          this.findDiagramComponents("GasCompartment");
          break;
        case "Container":
          this.findDiagramComponents("BloodCompartment");
          this.findDiagramComponents("GasCompartment");
          this.findDiagramComponents("BloodPump");
          this.findDiagramComponents("Oxygenator");
          break;
        case "Shunt":
          this.findDiagramComponents("BloodCompartment");
          this.findDiagramComponents("BloodPump");
          this.findDiagramComponents("Oxygenator");
          break;
        case "Pump":
          this.findDiagramComponents("BloodCompartment");
          this.findDiagramComponents("BloodPump");
          this.findDiagramComponents("Oxygenator");
          break;
        case "Oxygenator":
          break;
      }
    },
    selectModelTypeToAdd(compType) {
      this.compType = compType;
      // find all models which this compType could hold
      this.compModels = [];
      this.compModelSelection = [];
      let models = [];
      switch (this.compType) {
        case "BloodPump":
          this.compPicto = "container.png";
          models = ["BloodPump"];
          break;
        case "BloodCompartment":
          this.compPicto = "container.png";
          models = ["BloodCapacitance", "BloodTimeVaryingElastance"];
          break;
        case "BloodConnector":
          this.compPicto = "blood.png";
          models = ["BloodResistor", "BloodValve"];
          break;
        case "Shunt":
          this.compPicto = "blood.png";
          models = ["BloodResistor", "BloodValve"];
          break;
        case "GasCompartment":
          this.compPicto = "gas_container.png";
          models = ["GasCapacitance"];
          break;
        case "GasConnector":
          this.compPicto = "blood.png";
          models = ["GasResistor"];
          break;
        case "Container":
          this.compPicto = "container.png";
          models = ["Container"];
          break;
        case "GasExchanger":
          this.compPicto = "exchange.png";
          models = ["GasExchanger"];
          break;
        case "Oxygenator":
          this.compPicto = "gas_container.png";
          models = ["BloodCapacitance"];
          break;
      }
      Object.keys(explain.modelState.models).forEach((model) => {
        if (models.includes(explain.modelState.models[model].model_type)) {
          this.compModels.push(model);
        }
      });
      this.compModels.sort();
    },
    buildModelItemTree() {
      // build the grouperItem tree from the ui store
      this.modelsTree = {};
    },
    addToDiagramFromOutside(new_element) {
      // translate the new_element to an element which can be added to the diagram
      // add the new element to the diagram

      console.log(new_element)
    }
  },
  beforeUnmount() {
    // remove the model state event listener
    document.removeEventListener("state", this.buildModelItemTree);
    document.removeEventListener(
      "edit_comp",
      (e) => {
        this.editComponent(e.detail);
      },
      false
    );
  },
  mounted() {
    this.rebuild_event = new CustomEvent("rebuild_diagram");

    try {
      document.removeEventListener("state", this.buildModelItemTree);
      document.removeEventListener(
        "edit_comp",
        (e) => {
          this.editComponent(e.detail);
        },
        false
      );
    } catch { }
    // add an event listener for when the model state is ready
    document.addEventListener("state", this.buildModelItemTree);

    // get the model state
    explain.getModelState();

    // get all diagram component names
    this.getAllDiagramComponents();

    document.addEventListener(
      "edit_comp",
      (e) => {
        this.editComponent(e.detail);
      },
      false
    );

    this.$bus.on("diagram_loaded", () => this.getAllDiagramComponents());

    this.$bus.on("addNewModelToDiagram", (new_element) => {
      this.addToDiagramFromOutside(new_element);
    });
  },
};
</script>

<style></style>
