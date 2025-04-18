import { BloodCapacitance } from "../base_models/BloodCapacitance";

export class BloodVessel extends BloodCapacitance {
  // static properties
  static model_type = "BloodVessel";

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
