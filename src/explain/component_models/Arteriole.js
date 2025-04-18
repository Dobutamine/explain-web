import { BloodVessel } from "../component_models/BloodVessel";

export class Arteriole extends BloodVessel {
  // static properties
  static model_type = "Arteriole";
  model_interface = [
    {
      caption: "model is enabled",
      target: "is_enabled",
      type: "boolean"
    },
    {
      caption: "unstressed volume (mL)",
      target: "u_vol",
      type: "number",
      factor: 1000.0,
      delta: 0.1,
      rounding: 1,
    },
    {
      caption: "elastance baseline (mmHg/mL)",
      target: "el_base",
      type: "number",
      factor: 0.001,
      delta: 0.1,
      rounding: 1,
    },
    {
      caption: "elastance non linear k",
      target: "el_k",
      type: "number",
      factor: 1,
      delta: 1,
      rounding: 0,
    },
    {
      caption: "resistance elastance coupling factor",
      target: "alpha",
      type: "number",
      factor: 1,
      delta: 0.1,
      rounding: 0.1,
    },
    {
      caption: "ans sensitivity (0-1)",
      target: "ans_sensitivity",
      type: "number",
      factor: 1,
      delta: 0.1,
      rounding: 0.1,
    },
    {
      caption: "temperature (C)",
      target: "temp",
      type: "number",
      factor: 1,
      delta: 0.1,
      rounding: 0.1,
    },
    {
      caption: "viscosity (cP)",
      target: "viscosity",
      type: "number",
      factor: 1,
      delta: 0.1,
      rounding: 0.1,
    },
    {
      caption: "ans resistance factor",
      target: "r_ans_factor",
      type: "factor"
    },
    {
      caption: "circulation resistance factor",
      target: "r_circ_factor",
      type: "factor"
    },
    {
      caption: "unstressed volume factor",
      target: "u_vol_factor",
      type: "factor"
    },
    {
      caption: "elastance baseline factor",
      target: "el_base_factor",
      type: "factor"
    },
    {
      caption: "elastance non linear  factor",
      target: "el_k_factor",
      type: "factor"
    },
  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize addtional independent properties
    this.alpha = 1.0                        // determines relation between resistance change and elastance change
    this.ans_sensitivity = 1.0;             // sensitivity for autonomic control (vasoconstriction/vasodilatation)
  }
}
