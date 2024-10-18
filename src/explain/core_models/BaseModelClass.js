export class BaseModelClass {
  // This base model class is the blueprint for all the model objects (classes).
  // It incorporates the properties and methods which all model objects implement
  constructor(model_ref, name = "") {
    // initialize independent properties which all models implement
    this.name = name; // name of the model object
    this.description = ""; // description for documentation purposes
    this.is_enabled = false; // flag whether the model is enabled or not
    this.model_type = ""; // holds the model type e.g. BloodCapacitance

    // initialize local properties
    this._model_engine = model_ref; // object holding a reference to the model engine
    this._t = model_ref.modeling_stepsize; // setting the modeling stepsize
    this._is_initialized = false; // flag whether the model is initialized or not
  }

  init_model(args = {}) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // flag that the model is initialized
    this._is_initialized = true;
  }

  step_model() {
    // this method is called by the model engine and if the model is enabled and initialized it will do the model calculations
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    // this method is overridden by almost all model classes as this is the place where model calculations take place
    // Override this method in subclasses
  }
}
