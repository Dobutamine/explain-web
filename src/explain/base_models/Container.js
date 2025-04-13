import { BaseModelClass } from "../base_models/BaseModelClass";

export class Container extends BaseModelClass {
  // static properties
  static model_type = "Container";
  static model_interface = [];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.u_vol = 0.0; // unstressed volume UV of the capacitance in (L)
    this.el_base = 0.0; // baseline elastance E of the capacitance in (mmHg/L)
    this.el_k = 0.0; // non-linear elastance factor K2 of the capacitance (unitless)
    this.pres_ext = 0.0; // external pressure p2(t) (mmHg)
    this.vol_extra = 0.0; // additional volume of the container (L)
    this.contained_components = []; // list of names of models this Container contains

    // unstressed volume factors
    this.u_vol_factor = 1.0;

    // elastance factors
    this.el_base_factor = 1.0;

    // non-linear elastance factors
    this.el_k_factor = 1.0;

    // dependent properties
    this.vol = 0.0; // volume v(t) (L)
    this.pres = 0.0; // pressure p1(t) (mmHg)
    this.pres_in = 0.0; // recoil pressure of the elastance (mmHg)

    // local properties
    this._el = 0.0;
    this._u_vol = 0.0;
    this._el_k = 0.0;

  }

  calc_model() {
    this.calc_volumes();
    this.calc_elastances();
    this.calc_pressure();
  }

  calc_elastances() {
    // incorporate other factors
    this._el = this.el_base + (this.el_base_factor - 1) * this.el_base;
    this._el_k = this.el_k + (this.el_k_factor - 1) * this.el_k;
  }

  calc_volumes() {
    // reset the starting volume to the additional volume of the container
    this.vol = this.vol_extra;

    // get the cumulative volume from all contained models and add it to the volume of the container
    this.contained_components.forEach((c) => {
      this.vol += this._model_engine.models[c].vol;
    });
    this._u_vol = this.u_vol + (this.u_vol_factor - 1) * this.u_vol ;
  }

  calc_pressure() {
    // calculate the current pressure of the container
    this.pres_in = this._el_k * Math.pow(this.vol - this._u_vol, 2) + this._el * (this.vol - this._u_vol);

    // calculate the total pressure
    this.pres = this.pres_in + this.pres_ext

    // transfer the container pressure to the contained components
    this.contained_components.forEach((c) => {
      this._model_engine.models[c].pres_ext += this.pres;
    });

    // reset the external pressure
    this.pres_ext = 0.0;
  }
}
