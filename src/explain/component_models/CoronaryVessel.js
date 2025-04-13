import { BloodTimeVaryingElastance } from "../base_models/BloodTimeVaryingElastance";

export class CoronaryVessel extends BloodTimeVaryingElastance {
  // static properties
  static model_type = "CoronaryVessel";
  static model_interface = [
    {
      caption: "current volume (mL)",
      target: "vol",
      type: "number",
      delta: 0.1,
      factor: 1000.0,
      rounding: 3
    },
    {
      caption: "unstressed volume (mL)",
      target: "u_vol",
      type: "number",
      delta: 0.1,
      factor: 1000.0,
      rounding: 3
    },
    {
      caption: "minimal elastance (mmHg/mL)",
      target: "el_min",
      delta: 0.1,
      factor: 0.001,
      rounding: 3,
      type: "number"
    },
    {
      caption: "maximal elastance (mmHg/mL)",
      target: "el_max",
      delta: 0.1,
      factor: 0.001,
      rounding: 3,
      type: "number"
    },
    {
      caption: "non linear elastace factor",
      target: "el_k",
      delta: 0.1,
      factor: 0.001,
      rounding: 3,
      type: "number"
    }, 
  ];
}
