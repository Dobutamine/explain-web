import { set_blood_composition } from "../helpers/BloodComposition";

export class GasExchanger {
  static model_type = "GasExchanger";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "dif_o2",
      caption: "oxygen diffusion constant (mmol/mmHg*sec) ",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.0001,
      rounding: 4,
      ul: 100000000.0,
      ll: 0.0,
    },
    {
      target: "dif_co2",
      caption: "carbon dioxide diffusion constant (mmol/mmHg*sec) ",
      type: "number",
      optional: false,
      factor: 1,
      delta: 0.0001,
      rounding: 4,
      ul: 100000000.0,
      ll: 0.0,
    },
  ];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  scalable = true;
  dif_o2 = 0.01;
  dif_o2_factor = 1.0;
  dif_o2_scaling_factor = 1.0;
  dif_co2 = 0.01;
  dif_co2_factor = 1.0;
  dif_co2_scaling_factor = 1.0;
  comp_blood = "";
  comp_gas = "";

  // dependent parameters
  _blood = {};
  _gas = {};
  flux_o2 = 0;
  flux_co2 = 0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;

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

    // get a reference to the blood and gas capacitances
    if (typeof this.comp_blood == "string") {
      this._blood = this._model_engine.models[this.comp_blood];
    } else {
      this._blood = this.comp_blood;
    }

    if (typeof this.comp_gas == "string") {
      this._gas = this._model_engine.models[this.comp_gas];
    } else {
      this._gas = this.comp_gas;
    }

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    // set the blood composition
    set_blood_composition(this._blood);

    // get the partial pressures and gas concentrations from the components
    let po2_blood = this._blood.aboxy["po2"];
    let pco2_blood = this._blood.aboxy["pco2"];
    let to2_blood = this._blood.aboxy["to2"];
    let tco2_blood = this._blood.aboxy["tco2"];

    let co2_gas = this._gas.co2;
    let cco2_gas = this._gas.cco2;
    let po2_gas = this._gas.po2;
    let pco2_gas = this._gas.pco2;

    // calculate the O2 flux from the blood to the gas compartment
    this.flux_o2 =
      (po2_blood - po2_gas) *
      this.dif_o2 *
      this.dif_o2_factor *
      this.dif_o2_scaling_factor *
      this._t;

    // calculate the new O2 concentrations of the gas and blood compartments
    let new_to2_blood =
      (to2_blood * this._blood.vol - this.flux_o2) / this._blood.vol;
    if (new_to2_blood < 0) {
      new_to2_blood = 0;
    }

    let new_co2_gas = (co2_gas * this._gas.vol + this.flux_o2) / this._gas.vol;
    if (new_co2_gas < 0) {
      new_co2_gas = 0;
    }

    // calculate the CO2 flux from the blood to the gas compartment
    this.flux_co2 =
      (pco2_blood - pco2_gas) *
      this.dif_co2 *
      this.dif_co2_factor *
      this.dif_co2_scaling_factor *
      this._t;

    // calculate the new CO2 concentrations of the gas and blood compartments
    let new_tco2_blood =
      (tco2_blood * this._blood.vol - this.flux_co2) / this._blood.vol;
    if (new_tco2_blood < 0) {
      new_tco2_blood = 0;
    }

    let new_cco2_gas =
      (cco2_gas * this._gas.vol + this.flux_co2) / this._gas.vol;
    if (new_cco2_gas < 0) {
      new_cco2_gas = 0;
    }

    // transfer the new concentrations
    this._blood.aboxy.to2 = new_to2_blood;
    this._blood.aboxy.tco2 = new_tco2_blood;
    this._gas.co2 = new_co2_gas;
    this._gas.cco2 = new_cco2_gas;
  }
}
