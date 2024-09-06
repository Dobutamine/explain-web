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

  constructor(model_ref, name = "") {
    // Independent properties
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.dif_o2 = 0.01;
    this.dif_o2_factor = 1.0;
    this.dif_o2_scaling_factor = 1.0;
    this.dif_co2 = 0.01;
    this.dif_co2_factor = 1.0;
    this.dif_co2_scaling_factor = 1.0;
    this.comp_blood = "";
    this.comp_gas = "";

    // Dependent properties
    this.flux_o2 = 0;
    this.flux_co2 = 0;

    // Local properties
    this._model_engine = model_ref;
    this._is_initialized = false;
    this._t = model_ref.modeling_stepsize;
    this._blood = null;
    this._gas = null;
  }

  init_model(args) {
    // set the values of the properties as passed in the arguments
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // Get a reference to the blood and gas capacitances
    if (typeof this.comp_blood === "string") {
      this._blood = this._model_engine.models[this.comp_blood];
    } else {
      this._blood = this.comp_blood;
    }

    if (typeof this.comp_gas === "string") {
      this._gas = this._model_engine.models[this.comp_gas];
    } else {
      this._gas = this.comp_gas;
    }

    // Flag that the model is initialized
    this._is_initialized = true;
  }

  // This method is called during every model step by the model engine
  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  // Actual model calculations are done here
  calc_model() {
    // Set the blood composition
    set_blood_composition(this._blood);

    // Get the partial pressures and gas concentrations from the components
    const po2_blood = this._blood.aboxy["po2"];
    const pco2_blood = this._blood.aboxy["pco2"];
    const to2_blood = this._blood.aboxy["to2"];
    const tco2_blood = this._blood.aboxy["tco2"];

    const co2_gas = this._gas.co2;
    const cco2_gas = this._gas.cco2;
    const po2_gas = this._gas.po2;
    const pco2_gas = this._gas.pco2;

    // Calculate the O2 flux from the blood to the gas compartment
    this.flux_o2 =
      (po2_blood - po2_gas) *
      this.dif_o2 *
      this.dif_o2_factor *
      this.dif_o2_scaling_factor *
      this._t;

    // Calculate the new O2 concentrations of the gas and blood compartments
    let new_to2_blood =
      (to2_blood * this._blood.vol - this.flux_o2) / this._blood.vol;
    if (new_to2_blood < 0) {
      new_to2_blood = 0.0;
    }

    let new_co2_gas = (co2_gas * this._gas.vol + this.flux_o2) / this._gas.vol;
    if (new_co2_gas < 0) {
      new_co2_gas = 0.0;
    }

    // Calculate the CO2 flux from the blood to the gas compartment
    this.flux_co2 =
      (pco2_blood - pco2_gas) *
      this.dif_co2 *
      this.dif_co2_factor *
      this.dif_co2_scaling_factor *
      this._t;

    // Calculate the new CO2 concentrations of the gas and blood compartments
    let new_tco2_blood =
      (tco2_blood * this._blood.vol - this.flux_co2) / this._blood.vol;
    if (new_tco2_blood < 0) {
      new_tco2_blood = 0.0;
    }

    let new_cco2_gas =
      (cco2_gas * this._gas.vol + this.flux_co2) / this._gas.vol;
    if (new_cco2_gas < 0) {
      new_cco2_gas = 0.0;
    }

    // Transfer the new concentrations
    this._blood.aboxy["to2"] = new_to2_blood;
    this._blood.aboxy["tco2"] = new_tco2_blood;
    this._gas.co2 = new_co2_gas;
    this._gas.cco2 = new_cco2_gas;
  }
}
