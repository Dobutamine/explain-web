import { BaseModelClass } from "./BaseModelClass";

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
    this.pres_cc = 0.0; // external pressure from chest compressions (mmHg)
    this.pres_mus = 0.0; // external pressure from outside muscles (mmHg)
    this.vol_extra = 0.0; // additional volume of the container (L)
    this.contained_components = []; // list of names of models this Container contains
    this.act_factor = 0.0; // activation factor modifying the elastance of the container

    // unstressed volume factors
    this.u_vol_factor = 1.0;
    this.u_vol_scaling_factor = 1.0;

    // elastance factors
    this.el_base_factor = 1.0;
    this.el_base_scaling_factor = 1.0;

    // non-linear elastance factors
    this.el_k_factor = 1.0;
    this.el_k_scaling_factor = 1.0;

    // dependent properties
    this.vol = 0.0; // volume v(t) (L)
    this.pres = 0.0; // pressure p1(t) (mmHg)
    this.pres_in = 0.0; // recoil pressure of the elastance (mmHg)

    // local properties
    this._contained_components = null; // references to the contained models
  }

  init_model(args = {}) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // store the references to the contained models
    this._contained_components = [];
    this.contained_components.forEach((c) => {
      this._contained_components.push(this._model_engine.models[c]);
    });

    // flag that the model is initialized
    this._is_initialized = true;
  }

  calc_model() {
    // reset the starting volume to the additional volume of the container
    this.vol = this.vol_extra;

    // get the cumulative volume from all contained models and add it to the volume of the container
    this._contained_components.forEach((c) => {
      this.vol += c.vol;
    });

    // incorporate scaling factors
    let _el_base = this.el_base * this.el_base_scaling_factor;
    let _el_k_base = this.el_k * this.el_k_scaling_factor;
    let _u_vol_base = this.u_vol * this.u_vol_scaling_factor;

    // incorporate other factors
    let _el = _el_base + this.act_factor + (this.el_base_factor - 1) * _el_base;

    let _el_k = _el_k_base + (this.el_k_factor - 1) * _el_k_base;

    let _u_vol = _u_vol_base + (this.u_vol_factor - 1) * _u_vol_base;

    // calculate the current pressure of the container
    this.pres_in =
      _el_k * Math.pow(this.vol - _u_vol, 2) + _el * (this.vol - _u_vol);

    // calculate the total pressure
    this.pres = this.pres_in + this.pres_ext + this.pres_cc + this.pres_mus;

    // transfer the container pressure to the contained components
    this._contained_components.forEach((c) => {
      c.pres_ext += this.pres;
    });

    // reset the external pressure
    this.pres_ext = 0.0;
    this.act_factor = 0.0;
  }
}
