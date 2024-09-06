export class Effector {
  // static properties
  static model_type = "Effector";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      default: true,
    },
  ];

  constructor(model_ref, name = "") {
    // independent properties
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.target_model = {};
    this.target_prop = "";
    this.cum_mxe_high = 0.0;
    this.cum_mxe_low = 0.0;
    this.tc = 0.0;

    // dependent properties
    this.cum_firing_rate = 0.0;
    this.cum_weight = 1.0;
    this.effector_change = 0.0;

    // local properties
    this._model_engine = model_ref;
    this._is_initialized = false;
    this._t = model_ref.modeling_stepsize;
    this._update_window = 0.015;
    this._update_counter = 0.0;
  }

  init_model(args) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

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

      // Determine the total average firing rate
      const _firing_rate_avg =
        this.cum_weight === 0.0 ? 50.0 : this.cum_firing_rate / this.cum_weight;

      // Translate the average firing rate to the effect factor
      let _effector_change;
      if (_firing_rate_avg >= 50.0) {
        _effector_change =
          1.0 + ((this.cum_mxe_high - 1.0) / 50.0) * (_firing_rate_avg - 50.0);
      } else {
        _effector_change =
          this.cum_mxe_low + ((1.0 - cum_mxe_low) / 50.0) * _firing_rate_avg;
      }

      // Incorporate the time constant for the effector change
      const new_effector_change =
        this._update_window *
          ((1.0 / tc) * (-this.effector_change + _effector_change)) +
        this.effector_change;

      this.effector_change = new_effector_change;

      // Transfer the effect factor to the target model
      this.target_model[this.target_prop] = new_effector_change;

      // Reset the effect factor and number of effectors
      this.cum_firing_rate = 0.0;
      this.cum_weight = 0.0;
    }
  }

  // set effector firing rate
  update_effector(_firing_rate, _weight) {
    this.cum_firing_rate += _firing_rate * _weight;
    this.cum_weight += _weight;
  }
}
