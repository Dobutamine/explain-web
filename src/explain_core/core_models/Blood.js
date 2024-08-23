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
    this.solutes = null;
    this.aboxy = null;
    this.viscosity = 6.0;

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
    

    // set the aboxy and solutes if not set by the state which is loaded
    for (let model of this.blood_containing_components) {
      const modelInstance = this._model_engine.models[model];
      
      if (!modelInstance.hasOwnProperty('aboxy')) {
        modelInstance.aboxy = { ...this.aboxy };
      }
      if (!modelInstance.hasOwnProperty('solutes')) {
        modelInstance.solutes = { ...this.solutes };
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
    }
  }
}
