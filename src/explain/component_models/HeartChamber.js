import { BloodTimeVaryingElastance } from "../base_models/BloodTimeVaryingElastance";

export class HeartChamber extends BloodTimeVaryingElastance {
  // static properties
  static model_type = "HeartChamber";
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
      caption: "elastance minimum (mmHg/mL)",
      target: "el_min",
      type: "number",
      factor: 0.001,
      delta: 0.1,
      rounding: 1,
    },
    {
      caption: "elastance maximum (mmHg/mL)",
      target: "el_max",
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
      caption: "unstressed volume factor",
      target: "u_vol_factor",
      type: "factor"
    },
    {
      caption: "elastance minimum baseline factor",
      target: "el_min_factor",
      type: "factor"
    },
    {
      caption: "elastance maximum baseline factor",
      target: "el_max_factor",
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

    // initialize independent properties
    this.pres_cc = 0.0; // external pressure from chest compressions (mmHg)
    this.pres_mus = 0.0; // external pressure from outside muscles (mmHg)

    // general factors
    this.ans_activity_factor = 1.0;

    // unstressed volume factors
    this.u_vol_circ_factor = 1.0;
    this.u_vol_ans_factor = 1.0;

    // elastance factors
    this.el_min_circ_factor = 1.0;
    this.el_min_ans_factor = 1.0;
    this.el_min_mob_factor = 1.0;
    this.el_max_circ_factor = 1.0;
    this.el_max_ans_factor = 1.0;
    this.el_max_mob_factor = 1.0;

    // non-linear elastance factors
    this.el_k_circ_factor = 1.0;
    this.el_k_ans_factor = 1.0;
  }

  // override the elastance calculation
  calc_elastances() {    
        // Incorporate the other factors
        this._el_min =
          this.el_min +
          (this.el_min_factor - 1) * this.el_min +
          (this.el_min_circ_factor - 1) * this.el_min +
          (this.el_min_ans_factor - 1) * this.el_min * this.ans_activity_factor +
          (this.el_min_mob_factor - 1) * this.el_min
    
          this._el_max =
          this.el_max +
          (this.el_max_factor - 1) * this.el_max +
          (this.el_max_circ_factor - 1) * this.el_max +
          (this.el_max_ans_factor - 1) * this.el_max * this.ans_activity_factor +
          (this.el_max_mob_factor - 1) * this.el_max
    
          this._el_k =
          this.el_k +
          (this.el_k_factor - 1) * this.el_k +
          (this.el_k_circ_factor - 1) * this.el_k +
          (this.el_k_ans_factor - 1) * this.el_k * this.ans_activity_factor
  }

  // override the unstressed volume calculation
  calc_volumes() {
    this._u_vol =
      this.u_vol +
      (this.u_vol_factor - 1) * this.u_vol +
      (this.u_vol_circ_factor - 1) * this.u_vol +
      (this.u_vol_ans_factor - 1) * this.u_vol * this.ans_activity_factor
  }

  // override the pressure calculation
  calc_pressure() {
    // calculate the recoil pressure of the time-varying elastance
    let p_ms = (this.vol - this._u_vol) * this._el_max;
    let p_ed = this._el_k * Math.pow(this.vol - this._u_vol, 2) + this._el_min * (this.vol - this._u_vol);

    // calculate the current recoil pressure
    this.pres_in = (p_ms - p_ed) * this.act_factor + p_ed;

    // calculate the total pressure by incorporating the external pressures
    this.pres = this.pres_in + this.pres_ext + this.pres_cc + this.pres_mus;

    // reset the external pressure
    this.pres_ext = 0.0;
    this.pres_cc = 0.0;
    this.pres_mus = 0.0;
  }
}

