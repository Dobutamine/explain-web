import { BaseModelClass } from "./BaseModelClass";

export class Capacitance extends BaseModelClass {
  // static properties
  static model_type = "Capacitance";
  model_interface = [];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.u_vol = 0.0; // unstressed volume UV of the capacitance in (L)
    this.el_base = 0.0; // baseline elastance E of the capacitance in (mmHg/L)
    this.el_k = 0.0; // non-linear elastance factor K2 of the capacitance (unitless)
    this.pres_ext = 0.0; // external pressure p2(t) (mmHg)

    // unstressed volume factors
    this.u_vol_factor = 1.0;

    // elastance factors
    this.el_base_factor = 1.0;

    // non-linear elastance factors
    this.el_k_factor = 1.0;

    // initialize dependent properties
    this.vol = 0.0; // volume v(t) (L)
    this.pres = 0.0; // pressure p1(t) (mmHg)
    this.pres_in = 0.0; // recoil pressure of the elastance (mmHg)

    // local variables
    this._el = 0.0
    this._u_vol = 0.0
    this._el_k = 0.0
  }

  calc_model() {
    this.calc_elastances();
    this.calc_volumes();
    this.calc_pressure();
  }

  calc_elastances() {
    this._el = this.el_base + (this.el_base_factor - 1) * this.el_base
    this._el_k = this.el_k + (this.el_k_factor - 1) * this.el_k
  }

  calc_volumes() {
    this._u_vol = this.u_vol + (this.u_vol_factor - 1) * this.u_vol
  }
  
  calc_pressure() {
    // calculate the recoil pressure
    this.pres_in = this._el_k * Math.pow(this.vol - this._u_vol, 2) + this._el * (this.vol - this._u_vol);

    // calculate the total pressure by incorporating the external pressures
    this.pres = this.pres_in + this.pres_ext;

    // reset the external pressures
    this.pres_ext = 0.0;
  }

  volume_in(dvol) {
    // add volume to the capacitance
    this.vol += dvol;

    // return if the volume is zero or lower
    if (this.vol <= 0.0) return;
  }

  volume_out(dvol) {
    // remove volume from capacitance
    this.vol -= dvol;

    // if the volume is zero or lower, handle it
    if (this.vol < 0.0 && this.vol < this.u_vol) {
      let _vol_not_removed = -this.vol;
      this.vol = 0.0;
      return _vol_not_removed;
    }

    // return zero as all volume is removed
    return 0.0;
  }
}
