import { set_blood_composition } from "../helpers/BloodComposition";

export class BloodDiffusor {
  static class_type = "BloodDiffusor";
  static indepent_parameters = [];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  comp_blood1 = {};
  comp_blood2 = {};
  dif_o2 = 0.01;
  dif_o2_factor = 1.0;
  dif_o2_scaling_factor = 1.0;
  dif_co2 = 0.01;
  dif_co2_factor = 1.0;
  dif_co2_scaling_factor = 1.0;

  // dependent parameters

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _comp_blood1 = {};
  _comp_blood2 = {};
  _flux_o2 = 0;
  _flux_co2 = 0;

  // the constructor builds a bare bone modelobject of the correct type and with the correct name and stores a reference to the modelengine object
  constructor(model_ref, name = "", type = "") {
    // name of the model
    this.name = name;

    // model type
    this.model_type = type;

    // reference to the model engine
    this._model_engine = model_ref;
  }

  init_model(args) {
    // process the parameters
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // set the modeling step size
    this._t = this._model_engine.modeling_stepsize;

    // get a reference to the models
    this._comp_blood1 = this._model_engine.models[this.comp_blood1];
    this._comp_blood2 = this._model_engine.models[this.comp_blood2];

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    // we need to po2 and pco2 so we need to calculate the blood composition
    set_blood_composition(this._comp_blood1);
    set_blood_composition(this._comp_blood2);

    // get the partial pressures and gas concentrations from the components
    let po2_comp_blood1 = this._comp_blood1.aboxy.po2;
    let to2_comp_blood1 = this._comp_blood1.aboxy.to2;

    let pco2_comp_blood1 = this._comp_blood1.aboxy.pco2;
    let tco2_comp_blood1 = this._comp_blood1.aboxy.tco2;

    let po2_comp_blood2 = this._comp_blood2.aboxy.po2;
    let to2_comp_blood2 = this._comp_blood2.aboxy.to2;

    let pco2_comp_blood2 = this._comp_blood2.aboxy.pco2;
    let tco2_comp_blood2 = this._comp_blood2.aboxy.tco2;

    // calculate the O2 and CO2 flux
    this._flux_o2 =
      (po2_comp_blood1 - po2_comp_blood2) *
      this.dif_o2 *
      this.dif_o2_factor *
      this.dif_o2_scaling_factor *
      this._t;
    this._flux_co2 =
      (pco2_comp_blood1 - pco2_comp_blood2) *
      this.dif_co2 *
      this.dif_co2_factor *
      this.dif_co2_scaling_factor *
      this._t;

    // calculate the new O2 and CO2 concentrations
    let new_to2_comp_blood1 =
      (to2_comp_blood1 * this._comp_blood1.vol - this._flux_o2) /
      this._comp_blood1.vol;
    if (new_to2_comp_blood1 < 0) {
      new_to2_comp_blood1 = 0;
    }

    let new_to2_comp_blood2 =
      (to2_comp_blood2 * this._comp_blood2.vol + this._flux_o2) /
      this._comp_blood2.vol;
    if (new_to2_comp_blood2 < 0) {
      new_to2_comp_blood2 = 0;
    }

    let new_tco2_comp_blood1 =
      (tco2_comp_blood1 * this._comp_blood1.vol - this._flux_co2) /
      this._comp_blood1.vol;
    if (new_tco2_comp_blood1 < 0) {
      new_tco2_comp_blood1 = 0;
    }

    let new_tco2_comp_blood2 =
      (tco2_comp_blood2 * this._comp_blood2.vol + this._flux_co2) /
      this._comp_blood2.vol;
    if (new_tco2_comp_blood2 < 0) {
      new_tco2_comp_blood2 = 0;
    }

    // set the new concentrations
    this._comp_blood1.aboxy.to2 = new_to2_comp_blood1;
    this._comp_blood1.aboxy.tco2 = new_tco2_comp_blood1;

    this._comp_blood2.aboxy.to2 = new_to2_comp_blood2;
    this._comp_blood2.aboxy.tco2 = new_tco2_comp_blood2;
  }
}
