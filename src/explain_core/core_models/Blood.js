// Import the necessary helper function (adapt this to your module system)
import { set_blood_composition } from "../helpers/BloodComposition";

export class Blood {
  // static properties
  static model_type = "Blood";
  static model_interface = [];

  constructor(model_ref, name = "") {
    // independent properties
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.blood_containing_components = [];
    this.acidbase_components = [];
    this.to2 = 0.0;
    this.tco2 = 0.0;
    this.viscosity = 6.0;
    this.temp = 0.0;
    this.solutes = null;

    // dependent properties
    this.ph_art = 0.0;
    this.pco2_art = 0.0;
    this.po2_art = 0.0;
    this.hco3_art = 0.0;
    this.be_art = 0.0;
    this.ph_ven = 0.0;
    this.pco2_ven = 0.0;
    this.po2_ven = 0.0;
    this.hco3_ven = 0.0;
    this.be_ven = 0.0;
    this.so2_art = 0.0;
    this.so2_ven = 0.0;

    // local properties
    this._model_engine = model_ref;
    this._t = model_ref.modeling_stepsize;
    this._is_initialized = false;
    this._update_window = 0.015;
    this._update_counter = 0.0;
  }

  init_model(args) {
    // set the values of the properties as passed in the arguments
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // set the solutes if not set by the state which is loaded
    for (let model of this.blood_containing_components) {
      const modelInstance = this._model_engine.models[model];
      if (!modelInstance.hasOwnProperty("solutes")) {
        modelInstance.solutes = { ...this.solutes };
      } else {
        if (Object.keys(modelInstance.solutes).length === 0) {
          modelInstance.solutes = { ...this.solutes };
        }
      }

      // set the to2, tco2, viscosity and temp if not already set
      if (modelInstance.to2 === 0.0) {
        modelInstance.to2 = this.to2;
      }
      if (modelInstance.tco2 === 0.0) {
        modelInstance.tco2 = this.tco2;
      }
      if (modelInstance.viscosity === 0.0) {
        modelInstance.viscosity = this.viscosity;
      }
      if (modelInstance.temp === 0.0) {
        modelInstance.temp = this.temp;
      }
    }

    // flag that the model is initialized
    this._is_initialized = true;
  }

  // this method is called during every model step by the model engine
  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  // actual model calculations are done here
  calc_model() {
    this._update_counter += this._t;
    if (this._update_counter >= this._update_window) {
      this._update_counter = 0.0;

      for (let m of this.acidbase_components) {
        // update the blood composition
        set_blood_composition(this._model_engine.models[m]);
      }

      // set the arterial en venous blood gasses on the blood model
      this.ph_art = this._model_engine.models["AD"].ph;
      this.ph_ven = this._model_engine.models["RA"].ph;

      this.po2_art = this._model_engine.models["AD"].po2;
      this.po2_ven = this._model_engine.models["RA"].po2;

      this.pco2_art = this._model_engine.models["AD"].pco2;
      this.pco2_ven = this._model_engine.models["RA"].pco2;

      this.hco3_art = this._model_engine.models["AD"].hco3;
      this.hco3_ven = this._model_engine.models["RA"].hco3;

      this.be_art = this._model_engine.models["AD"].be;
      this.be_ven = this._model_engine.models["RA"].be;

      this.so2_art = this._model_engine.models["AD"].so2;
      this.so2_ven = this._model_engine.models["RA"].so2;
    }
  }
}
