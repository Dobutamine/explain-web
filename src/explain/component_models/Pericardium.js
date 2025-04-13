import { Container } from "../base_models/Container";

export class Pericardium extends Container {
  // static properties
  static model_type = "Pericardium";
  static model_interface = [];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.pres_cc = 0.0; // external pressure from chest compressions (mmHg)
    this.pres_mus = 0.0; // external pressure from outside muscles (mmHg)    
  }

  calc_pressure() {
    // calculate the current pressure of the container
    this.pres_in = this._el_k * Math.pow(this.vol - this._u_vol, 2) + this._el * (this.vol - this._u_vol);

    // calculate the total pressure
    this.pres = this.pres_in + this.pres_ext + this.pres_cc + this.pres_mus;

    // transfer the container pressure to the contained components
    this.contained_components.forEach((c) => {
      this._model_engine.models[c].pres_ext += this.pres;
    });

    // reset the external pressure
    this.pres_ext = 0.0;
    this.pres_cc = 0.0;
    this.pres_mus = 0.0;
  }
}
