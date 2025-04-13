import { BaseModelClass } from "../base_models/BaseModelClass";
import { calc_blood_composition } from "../helpers/BloodComposition";
import { AnsAfferent } from "../component_models/AnsAfferent";
import { AnsEfferent } from "../component_models/AnsEfferent";

export class Ans extends BaseModelClass {
  // static properties
  static model_type = "Ans";
  static model_interface = [
    {
      caption: "ANS active",
      target: "ans_active",
      type: "boolean",
    },
  ];

  constructor(model_ref, name = "") {
    super(model_ref, name);

    // initialize independent properties
    this.ans_active = true; // flag whether the ANS is active
    this.pathways = {}; // list of pathways the ANS model uses
    this.components = {}

    // initialize local properties
    this._update_interval = 0.015; // update interval of the ANS (seconds)
    this._update_counter = 0.0; // update counter (seconds)
    this._ascending_aorta = null; // reference to the ascending aorta
    
  }

  calc_model() {
    // Return if the ANS is not active
    if (!this.ans_active) return;

    // Reference the ascending aorta
    this._ascending_aorta = this._model_engine.models["AA"];

    // Increase the update counter
    this._update_counter += this._t;

    // Check if it's time to run the calculations
    if (this._update_counter >= this._update_interval) {
      // Reset the update counter
      this._update_counter = 0.0;

      // Calculate necessary blood gases for the ANS
      calc_blood_composition(this._ascending_aorta);

      // Connect the afferent (sensor) with the efferent (effector)
      Object.values(this.pathways).forEach((pathway) => {
        if (pathway.active) {
          // Get the firing rate from the Afferent pathway
          let _firing_rate_afferent = this._model_engine.models[pathway.sensor].firing_rate;

          // Get the effect size
          let _effect_size = pathway.effect_weight;

          // Transfer the receptor firing rate and effect size to the effector
          this._model_engine.models[pathway.effector].update_effector(_firing_rate_afferent, _effect_size);
        }
      });
    }
  }
}
