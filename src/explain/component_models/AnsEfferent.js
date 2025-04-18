import { BaseModelClass } from "../base_models/BaseModelClass";

export class AnsEfferent extends BaseModelClass {
  // static properties
  static model_type = "AnsEfferent";
  model_interface = [
    {
      caption: "minimum of the input (firing rate is 0.0)",
      target: "min_value",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 3,
    },
    {
      caption: "maximum of the input (firing rate is 1.0)",
      target: "max_value",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 3,
    },
    {
      caption: "setpoint of the input (firing rate is 0.5)",
      target: "set_value",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 3,
    },
    {
      caption: "timeconstant (s)",
      target: "time_constant",
      type: "number",
      delta: 0.1,
      factor: 1.0,
      rounding: 1,
    },
  ];

  /*
    The Efferent class models an autonomic nervous system efferent (effect) pathway.
    It calculates the average firing rate and translates it into an effect size on the target.
    */
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // Initialize independent parameters
    this.target_model = ""; // name of the target using dot notation (e.g. Heart.hr_ans_factor)
    this.target_prop = ""; // name of the target using dot notation (e.g. Heart.hr_ans_factor)
    this.effect_at_max_firing_rate = 0.0; // effect size at average input firing rate of 1.0
    this.effect_at_min_firing_rate = 0.0; // effect size at average input firing rate of 0.0
    this.tc = 0.0; // time constant of the effect change (s)

    // Initialize dependent parameters
    this.firing_rate = 0.0; // firing rate (unitless)
    this.effector = 1.0; // current effector size

    // Initialize local parameters
    this._update_interval = 0.015; // update interval of the effector (s)
    this._update_counter = 0.0; // update counter (s)
    this._cum_firing_rate = 0.0; // cumulative firing rate of the model step
    this._cum_firing_rate_counter = 1.0; // counter for number of inputs
  }


  calc_model() {
    // Update every 15 ms instead of every step for performance reasons
    this._update_counter += this._t;
    if (this._update_counter >= this._update_interval) {
      this._update_counter = 0.0;

      // Determine the total average firing rate
      this.firing_rate = 0.5;
      if (this._cum_firing_rate_counter > 0.0) {
        this.firing_rate =  this._cum_firing_rate / this._cum_firing_rate_counter;
      }

      // Translate the average firing rate to the effect factor
      let effector;
      if (this.firing_rate >= 0.5) {
        effector = 1.0 + ((this.effect_at_max_firing_rate - 1.0) / 0.5) * (this.firing_rate - 0.5);
      } else {
        effector = this.effect_at_min_firing_rate + ((1.0 - this.effect_at_min_firing_rate) / 0.5) * this.firing_rate;
      }

      // Incorporate the time constant for the effector change
      this.effector = this._update_interval * ((1.0 / this.tc) * (-this.effector + effector)) + this.effector;
      
      // Transfer the effect factor to the target model
      this._model_engine.models[this.target_model][this.target_prop] = this.effector

      // Reset the effect factor and number of effectors
      this._cum_firing_rate = 0.5;
      this._cum_firing_rate_counter = 0.0;
    }
  }

  // Update effector firing rate
  update_effector(new_firing_rate, weight) {
    // Increase the firing rate depending on the input and weight
    this._cum_firing_rate += (new_firing_rate - 0.5) * weight;
    this._cum_firing_rate_counter += 1.0;
  }
}