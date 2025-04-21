import { BloodCapacitance } from "../base_models/BloodCapacitance";

export class BloodVessel extends BloodCapacitance {
  // static properties
  static model_type = "BloodVessel";
  model_interface = [
    {
      caption: "model is enabled",
      target: "is_enabled",
      type: "boolean"
    },
    {
      caption: "unstressed volume",
      target: "u_vol",
      unit: "mL",
      type: "number",
      range:[0, 100],
      factor: 1000.0,
      delta: 0.1,
      rounding: 1
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
      type: "factor",
      range: [-1, 1],
      delta: 0.01,
      hidden: true
    },
    {
      caption: "circulation resistance factor",
      target: "r_circ_factor",
      type: "factor",
      range: [-1, 1],
      delta: 0.01,
      hidden: true
    },
    {
      caption: "unstressed volume factor",
      target: "u_vol_factor",
      type: "factor",
      range: [-1, 1],
      delta: 0.01,
      hidden: true
    },
    {
      caption: "elastance baseline factor",
      target: "el_base_factor",
      type: "factor",
      range: [-1, 1],
      delta: 0.01,
      hidden: true
    },
    {
      caption: "elastance non linear  factor",
      target: "el_k_factor",
      type: "factor",
      range: [-1, 1],
      delta: 0.01,
      hidden: true
    },
  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize addtional independent properties
    this.alpha = 1.0                        // determines relation between resistance change and elastance change
    this.ans_sensitivity = 0.0;             // sensitivity for autonomic control (vasoconstriction/vasodilatation)

    // resistance factors
    this.r_ans_factor = 1.0;                // resistance change due to the autonomic nervous system
    this.r_circ_factor = 1.0;               // resistance change due by the circulatory model
  }

  calc_model() {
    this.calc_resistances();
    this.calc_elastances();
    this.calc_volumes();
    this.calc_pressure();
  }

  calc_resistances() {
    // update the resistances of the associated bloodvesselresistances
    Object.keys(this.components).forEach(res => {
      this._model_engine.models[res].ans_sensitivity = this.ans_sensitivity
      this._model_engine.models[res].r_ans_factor = this.r_ans_factor
      this._model_engine.models[res].r_circ_factor = this.r_circ_factor
    })
  }

  calc_elastances() {
    // change in elastance due to ans influence (vasoconstriction/vasodilatation)
    let _ans_factor = Math.pow(this.r_ans_factor, 0.25 * this.alpha)
    let _r_circ_factor = Math.pow(this.r_circ_factor, 0.25 * this.alpha)


    this._el = this.el_base + 
        (this.el_base_factor - 1) * this.el_base +
        (_ans_factor - 1) * this.el_base * this.ans_sensitivity +
        (_r_circ_factor - 1) * this.el_base * this.ans_sensitivity

    this._el_k = this.el_k + 
        (this.el_k_factor - 1) * this.el_k
  }
}
