import { BaseModelClass } from "../core_models/BaseModelClass";

export class ExampleCustomModel extends BaseModelClass {
  // static properties
  static model_type = "ExampleCustomModel";
  static model_interface = [];

  /*
    The BloodResistor model is an extension of the Resistor model as described in the paper.
    A BloodResistor model is a connector between two blood-containing models (e.g., BloodCapacitance or BloodTimeVaryingElastance), 
    and the model determines the flow between the two models it connects.
    */
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // -----------------------------------------------
    // initialize independent properties

    // -----------------------------------------------
    // initialize dependent properties

    // -----------------------------------------------
    // local variables
  }

  init_model(args = {}) {
    // set the properties of this model
    Object.keys(args).forEach((key) => {
      this[key] = args[key];
    });

    // flag that the model is initialized
    this._is_initialized = true;
  }

  calc_model() {
    // Placeholder for model calculations
  }
}
