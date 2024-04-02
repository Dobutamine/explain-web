<template>
  <q-card class="q-pb-xs q-pt-xs q-ma-sm" bordered>
    <!-- <div class="row justify-center">

      <q-btn-toggle color="grey-10" class="q-ma-sm" toggle-color="primary" size="xs" v-model="editingSelection"
        @click="changeEditingMode" :options="[
        { label: 'selecting', value: 0 },
        { label: 'moving', value: 1 },
        { label: 'rotating', value: 2 },
        { label: 'morphing', value: 3 },
        { label: 'sizing', value: 4 },
      ]" />
    </div> -->
    <q-btn @click="togglePda">pda</q-btn>
    <q-btn @click="toggleFo">fo</q-btn>
    <div class="stage" :style="{ display: display }">
      <canvas id="stage"></canvas>
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
      diagram: {
        settings: {
          backgroundColor: 3355443,
          editingMode: 1,
          scaling: 0.3,
          grid: false,
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
            "enabled": true,
            "label": "LV",
            "models": [
              "LV"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "arc",
                "x": 1,
                "y": 1,
                "dgs": 330
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
          "LA": {
            "enabled": true,
            "label": "LA",
            "models": [
              "LA"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "arc",
                "x": 1,
                "y": 0,
                "dgs": 317
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
          "RA": {
            "enabled": true,
            "label": "RA",
            "models": [
              "RA"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "arc",
                "x": 1,
                "y": 1,
                "dgs": 210
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
          "RV": {
            "enabled": true,
            "label": "RV",
            "models": [
              "RV"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "arc",
                "x": 0.42652188455657486,
                "y": 0.7404115698267074,
                "dgs": 223
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
          "PA": {
            "enabled": true,
            "label": "PA",
            "models": [
              "PA"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "arc",
                "x": 0,
                "y": 0,
                "dgs": 243
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
          "LL": {
            "enabled": true,
            "label": "LL",
            "models": [
              "LL"
            ],
            "compType": "BloodCompartment",
            "compPicto": "container.png",
            "layout": {
              "pos": {
                "type": "arc",
                "x": 1.0,
                "y": 0.2,
                "dgs": 270
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
          "RL": {
            "enabled": true,
            "label": "RL",
            "models": [
              "RL"
            ],
            "compType": "BloodCompartment",
            "compPicto": "container.png",
            "layout": {
              "pos": {
                "type": "rel",
                "x": 1.0,
                "y": 0.38,
                "dgs": 284.85
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
          "PV": {
            "enabled": true,
            "label": "PV",
            "models": [
              "PV"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "arc",
                "x": 0,
                "y": 0,
                "dgs": 297
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
          "PA_LL": {
            "enabled": true,
            "label": "PA_LL",
            "models": [
              "PA_LL"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "PA",
            "dbcTo": "LL"
          },
          "PA_RL": {
            "enabled": true,
            "label": "PA_RL",
            "models": [
              "PA_RL"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "PA",
            "dbcTo": "RL"
          },
          "LL_PV": {
            "enabled": true,
            "label": "LL_PV",
            "models": [
              "LL_PV"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "LL",
            "dbcTo": "PV"
          },
          "PV_LA": {
            "enabled": true,
            "label": "PV_LA",
            "models": [
              "PV_LA"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "PV",
            "dbcTo": "LA"
          },
          "RV_PA": {
            "enabled": true,
            "label": "RV_PA",
            "models": [
              "RV_PA"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "RV",
            "dbcTo": "PA"
          },
          "RL_PV": {
            "enabled": true,
            "label": "RL_PV",
            "models": [
              "RL_PV"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "RL",
            "dbcTo": "PV"
          },
          "RA_RV": {
            "enabled": true,
            "label": "RA_RV",
            "models": [
              "RA_RV"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "RA",
            "dbcTo": "RV"
          },
          "LA_LV": {
            "enabled": true,
            "label": "LA_LV",
            "models": [
              "LA_LV"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "LA",
            "dbcTo": "LV"
          },
          "AA": {
            "enabled": true,
            "label": "AA",
            "models": [
              "AA"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "arc",
                "x": 1.5910052049446972,
                "y": 1.1849788549121665,
                "dgs": 350
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
          "AAR": {
            "enabled": true,
            "label": "AAR",
            "models": [
              "AAR"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "arc",
                "x": 1.5387117761873779,
                "y": 1.3783208631533288,
                "dgs": 10
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
          "COR": {
            "enabled": true,
            "label": "COR",
            "models": [
              "COR"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "rel",
                "x": 1,
                "y": 0.85,
                "dgs": 350
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
          "AD": {
            "enabled": true,
            "label": "AD",
            "models": [
              "AD"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "arc",
                "x": 1.4534198113207546,
                "y": 1.5342523313814789,
                "dgs": 30
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
          "RLB": {
            "enabled": true,
            "label": "RLB",
            "models": [
              "RLB"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "arc",
                "x": 1.02,
                "y": 1.79,
                "dgs": 90
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
          "IVCE": {
            "enabled": true,
            "label": "IVCE",
            "models": [
              "IVCE"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "arc",
                "x": 0.6565908137583892,
                "y": 1.672329418344519,
                "dgs": 150
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
          "IVCI": {
            "enabled": true,
            "label": "IVCI",
            "models": [
              "IVCI"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "arc",
                "x": 0.44486682046979864,
                "y": 1.2985994593586874,
                "dgs": 190
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
          "SVC": {
            "enabled": true,
            "label": "SVC",
            "models": [
              "SVC"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "rel",
                "x": 0.6523056278464542,
                "y": 0.8,
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
          "INT": {
            "enabled": true,
            "label": "INT",
            "models": [
              "INT"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "rel",
                "x": 1,
                "y": 1.51,
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
          "KID": {
            "enabled": true,
            "label": "KID",
            "models": [
              "KID"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "rel",
                "x": 0.9967491610738254,
                "y": 1.6601067300521999,
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
          "LS": {
            "enabled": true,
            "label": "LS",
            "models": [
              "LS"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "rel",
                "x": 1,
                "y": 1.35,
                "dgs": 1.06
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
          "BR": {
            "enabled": true,
            "label": "BR",
            "models": [
              "BR"
            ],
            "compType": "BloodCompartment",
            "compPicto": "container.png",
            "layout": {
              "pos": {
                "type": "rel",
                "x": 1,
                "y": 0.98,
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
          "RUB": {
            "enabled": true,
            "label": "RUB",
            "models": [
              "RUB"
            ],
            "compType": "BloodCompartment",
            "layout": {
              "pos": {
                "type": "rel",
                "x": 1,
                "y": 1.14,
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
          "AD_RLB": {
            "enabled": true,
            "label": "AD_RLB",
            "models": [
              "AD_RLB"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "AD",
            "dbcTo": "RLB"
          },
          "AD_KID": {
            "enabled": true,
            "label": "AD_KID",
            "models": [
              "AD_KID"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "AD",
            "dbcTo": "KID"
          },
          "AD_INT": {
            "enabled": true,
            "label": "AD_INT",
            "models": [
              "AD_INT"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "AD",
            "dbcTo": "INT"
          },
          "AD_LS": {
            "enabled": true,
            "label": "AD_LS",
            "models": [
              "AD_LS"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "AD",
            "dbcTo": "LS"
          },
          "LS_IVCE": {
            "enabled": true,
            "label": "LS_IVCE",
            "models": [
              "LS_IVCE"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "LS",
            "dbcTo": "IVCE"
          },
          "INT_IVCE": {
            "enabled": true,
            "label": "INT_IVCE",
            "models": [
              "INT_IVCE"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "INT",
            "dbcTo": "IVCE"
          },
          "KID_IVCE": {
            "enabled": true,
            "label": "KID_IVCE",
            "models": [
              "KID_IVCE"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "KID",
            "dbcTo": "IVCE"
          },
          "RLB_IVCE": {
            "enabled": true,
            "label": "RLB_IVCE",
            "models": [
              "RLB_IVCE"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "RLB",
            "dbcTo": "IVCE"
          },
          "IVCE_IVCI": {
            "enabled": true,
            "label": "IVCE_IVCE",
            "models": [
              "IVCE_IVCI"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "IVCE",
            "dbcTo": "IVCI"
          },
          "IVCI_RA": {
            "enabled": true,
            "label": "IVCI_RA",
            "models": [
              "IVCI_RA"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "IVCI",
            "dbcTo": "RA"
          },
          "SVC_RA": {
            "enabled": true,
            "label": "SVC_RA",
            "models": [
              "SVC_RA"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "SVC",
            "dbcTo": "RA"
          },
          "BR_SVC": {
            "enabled": true,
            "label": "BR_SVC",
            "models": [
              "BR_SVC"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "BR",
            "dbcTo": "SVC"
          },
          "RUB_SVC": {
            "enabled": true,
            "label": "RUB_SVC",
            "models": [
              "RUB_SVC"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "RUB",
            "dbcTo": "SVC"
          },
          "AAR_RUB": {
            "enabled": true,
            "label": "AAR_RUB",
            "models": [
              "AAR_RUB"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "AAR",
            "dbcTo": "RUB"
          },
          "AAR_BR": {
            "enabled": true,
            "label": "AAR_BR",
            "models": [
              "AAR_BR"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "AAR",
            "dbcTo": "BR"
          },
          "LV_AA": {
            "enabled": true,
            "label": "LV_AA",
            "models": [
              "LV_AA"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "LV",
            "dbcTo": "AA"
          },
          "AA_AAR": {
            "enabled": true,
            "label": "AA_AAR",
            "models": [
              "AA_AAR"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "AA",
            "dbcTo": "AAR"
          },
          "AAR_AD": {
            "enabled": true,
            "label": "AAR_AD",
            "models": [
              "AAR_AD"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "AAR",
            "dbcTo": "AD"
          },
          "AA_COR": {
            "enabled": true,
            "label": "AA_COR",
            "models": [
              "AA_COR"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "AA",
            "dbcTo": "COR"
          },
          "COR_RA": {
            "enabled": true,
            "label": "COR_RA",
            "models": [
              "COR_RA"
            ],
            "compType": "BloodConnector",
            "dbcFrom": "COR",
            "dbcTo": "RA"
          },
          "IPS": {
            "enabled": true,
            "label": "IPS",
            "models": [
              "IPS"
            ],
            "compType": "Shunt",
            "dbcFrom": "PA",
            "dbcTo": "PV"
          },
          "DA_OUT": {
            "enabled": true,
            "label": "DA",
            "models": [
              "DA_OUT"
            ],
            "compType": "Shunt",
            "dbcFrom": "AAR",
            "dbcTo": "PA"
          },
          "FO": {
            "enabled": true,
            "label": "FO",
            "models": [
              "FO"
            ],
            "compType": "Shunt",
            "dbcFrom": "RA",
            "dbcTo": "LA"
          },
          "VSD": {
            "enabled": true,
            "label": "VSD",
            "models": [
              "VSD"
            ],
            "compType": "Shunt",
            "dbcFrom": "LV",
            "dbcTo": "RV"
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
    //this.$bus.on("state", this.processModelState)
    this.initDiagram()

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
