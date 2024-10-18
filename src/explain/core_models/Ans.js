import { BaseModelClass } from "./BaseModelClass";

export class Ans extends BaseModelClass {
  // static properties
  static model_type = "Ans";
  static model_interface = [];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.ans_active = true; // flag whether the ANS is active
    this.pathways = []; // list of pathways the ANS model uses

    // initialize local properties
    this._update_interval = 0.015; // update interval of the ANS (seconds)
    this._update_counter = 0.0; // update counter (seconds)
    this._pathways = {}; // pathways storing references to Afferent (sensor) and Efferent (effector)
    this._calc_blood_composition = null; // reference to blood composition calculation method
    this._ascending_aorta = null; // reference to the ascending aorta
  }

  init_model(args) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // Initialize the pathways with references to the necessary models
    this.pathways.forEach((pathway) => {
      this._pathways[pathway["name"]] = {
        sensor: this._model_engine.models[pathway["sensor"]], // store reference to Afferent (sensor)
        effector: this._model_engine.models[pathway["effector"]], // store reference to Efferent (effector)
        active: pathway["active"], // store pathway activity state
        effect_weight: pathway["effect_weight"], // store the effect weight
        pathway_activity: 0.0, // initialize the pathway activity state
      };
    });

    // Reference the blood composition calculation method
    this._calc_blood_composition =
      this._model_engine.models["Blood"].calc_blood_composition;

    // Reference the ascending aorta
    this._ascending_aorta = this._model_engine.models["AA"];

    // flag that the model is initialized
    this._is_initialized = true;
  }

  calc_model() {
    // Return if the ANS is not active
    if (!this.ans_active) return;

    // Increase the update counter
    this._update_counter += this._t;

    // Check if it's time to run the calculations
    if (this._update_counter >= this._update_interval) {
      // Reset the update counter
      this._update_counter = 0.0;

      // Calculate necessary blood gases for the ANS
      this._calc_blood_composition(this._ascending_aorta);

      // Connect the afferent (sensor) with the efferent (effector)
      Object.keys(this._pathways).forEach((key) => {
        let pathway = this._pathways[key];
        if (pathway.active) {
          // Get the firing rate from the Afferent pathway
          let _firing_rate_afferent = pathway.sensor.firing_rate;

          // Get the effect size
          let _effect_size = pathway.effect_weight;

          // Transfer the receptor firing rate and effect size to the effector
          pathway.effector.update_effector(_firing_rate_afferent, _effect_size);
        }
      });
    }
  }
}
