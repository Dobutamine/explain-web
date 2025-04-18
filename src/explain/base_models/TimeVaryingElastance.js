import { BaseModelClass } from "./BaseModelClass";

export class TimeVaryingElastance extends BaseModelClass {
  // static properties
  static model_type = "TimeVaryingElastance";
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
    this.u_vol = 0.0; // unstressed volume UV of the capacitance in (L)
    this.el_min = 0.0; // minimal elastance Emin in (mmHg/L)
    this.el_max = 0.0; // maximal elastance emax(n) in (mmHg/L)
    this.el_k = 0.0; // non-linear elastance factor K2 of the capacitance (unitless)
    this.pres_ext = 0.0; // external pressure p2(t) in mmHg

    // general factors
    this.act_factor = 0.0; // activation factor from the heart model (unitless)

    // unstressed volume factors
    this.u_vol_factor = 1.0;

    // elastance factors
    this.el_min_factor = 1.0;
    this.el_max_factor = 1.0;


    // non-linear elastance factors
    this.el_k_factor = 1.0;

    // initialize dependent properties
    this.vol = 0.0; // volume v(t) (L)
    this.pres = 0.0; // pressure p1(t) (mmHg)
    this.pres_in = 0.0; // pressure compared to atmospheric pressure

    // local properties
    this._u_vol = 0.0; // unstressed volume (L)
    this._el_min = 0.0; // minimal elastance (mmHg/L)
    this._el_max = 0.0; // maximal elastance (mmHg/L)
    this._el_k = 0.0; // non-linear elastance factor (unitless)
  }

  calc_model() {
    // calculate the elastances
    this.calc_elastances();
    // calculate the volumes
    this.calc_volumes();
    // calculate the pressure
    this.calc_pressure();
  }

  // override the elastance calculation
  calc_elastances() {    
    // Incorporate the other factors
    this._el_min = this.el_min + (this.el_min_factor - 1) * this.el_min
    this._el_max = this.el_max + (this.el_max_factor - 1) * this.el_max
    this._el_k = this.el_k + (this.el_k_factor - 1) * this.el_k
  }

  // override the unstressed volume calculation
  calc_volumes() {
    this._u_vol = this.u_vol + (this.u_vol_factor - 1) * this.u_vol
  }

  // override the pressure calculation
  calc_pressure() {
    // calculate the recoil pressure of the time-varying elastance
    let p_ms = (this.vol - this._u_vol) * this._el_max;
    let p_ed = this._el_k * Math.pow(this.vol - this._u_vol, 2) + this._el_min * (this.vol - this._u_vol);

    // calculate the current recoil pressure
    this.pres_in = (p_ms - p_ed) * this.act_factor + p_ed;

    // calculate the total pressure by incorporating the external pressures
    this.pres = this.pres_in + this.pres_ext

    // reset the external pressure
    this.pres_ext = 0.0;
  }

  // override the volume_in method
  volume_in(dvol, comp_from) {
    // add volume to the capacitance
    this.vol += dvol;

    // return if the volume is zero or lower
    if (this.vol <= 0.0) return;
  }

  volume_out(dvol) {
    // remove volume from capacitance
    this.vol -= dvol;

    // return if the volume is zero or lower
    if (this.vol < 0.0) {
      let _vol_not_removed = -this.vol;
      this.vol = 0.0;
      return _vol_not_removed;
    }

    // return zero as all volume is removed
    return 0.0;
  }
}
