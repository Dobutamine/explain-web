import { BaseModelClass } from "./BaseModelClass";

export class Afferent extends BaseModelClass {
  constructor(model_ref, name = "") {
    super(model_ref, name);

    // Initialize independent properties
    this.input = ""; // name of the input using dot notation (e.g. AA.po2)
    this.min_value = 0.0; // minimum of the input (firing rate is 0.0)
    this.set_value = 0.0; // setpoint of the input (firing rate is 0.5)
    this.max_value = 0.0; // maximum of the input (firing rate is 1.0)
    this.time_constant = 1.0; // time constant of the firing rate change (s)

    // Initialize dependent properties
    this.input_value = 0.0; // input value
    this.firing_rate = 0.0; // normalized receptor firing rate (0 - 1)

    // Initialize local properties
    this._update_interval = 0.015; // update interval of the receptor (s)
    this._update_counter = 0.0; // counter of the update interval (s)
    this._max_firing_rate = 1.0; // maximum normalized firing rate 1.0
    this._set_firing_rate = 0.5; // setpoint normalized firing rate 0.5
    this._min_firing_rate = 0.0; // minimum normalized firing rate 0.0
    this._input_site = null; // reference to the input model
    this._input_prop = ""; // reference to the input property
    this._gain = 0.0; // gain of the firing rate
  }

  init_model(args) {
    // Set the properties of this model
    for (let key in args) {
      if (args.hasOwnProperty(key)) {
        this[key] = args[key];
      }
    }

    // Get a reference to the input site
    const [model, prop] = this.input.split(".");
    this._input_site = this._model_engine.models[model];
    this._input_prop = prop;

    // Set the initial values
    this.current_value = this._input_site[this._input_prop];
    this.firing_rate = this._set_firing_rate;

    // Flag that the model is initialized
    this._is_initialized = true;
  }

  calc_model() {
    // Update every 15 ms instead of every step for performance reasons
    this._update_counter += this._t;
    if (this._update_counter >= this._update_interval) {
      this._update_counter = 0.0;

      // Get the input value
      this.input_value = this._input_site[this._input_prop];

      // Calculate the activation value
      let _activation = 0;
      if (this.input_value > this.max_value) {
        _activation = this.max_value - this.set_value;
      } else if (this.input_value < this.min_value) {
        _activation = this.min_value - this.set_value;
      } else {
        _activation = this.input_value - this.set_value;
      }

      // Calculate the gain
      if (_activation > 0) {
        // Gain for positive activation
        this._gain =
          (this._max_firing_rate - this._set_firing_rate) /
          (this.max_value - this.set_value);
      } else {
        // Gain for negative activation
        this._gain =
          (this._set_firing_rate - this._min_firing_rate) /
          (this.set_value - this.min_value);
      }

      // Calculate the new firing rate
      const _new_firing_rate = this._set_firing_rate + this._gain * _activation;

      // Incorporate the time constant to calculate the firing rate
      this.firing_rate =
        this._update_interval *
          ((1.0 / this.time_constant) *
            (-this.firing_rate + _new_firing_rate)) +
        this.firing_rate;
    }
  }
}
