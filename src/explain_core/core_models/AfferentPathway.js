export class AfferentPathway {
  // static properties
  static model_type = "AfferentPathway";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      default: true,
    },
    {
      target: "min_value",
      caption: "minimal value",
      type: "number",
      default: 0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: -10000000.0,
    },
    {
      target: "set_value",
      caption: "setpoint value",
      type: "number",
      default: 0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: -10000000.0,
    },
    {
      target: "max_value",
      caption: "maximal value",
      type: "number",
      default: 0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: -10000000.0,
    },
    {
      target: "time_constant",
      caption: "time_constant (s)",
      type: "number",
      default: 1,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 100000000.0,
      ll: 0.0,
    },
    {
      target: "set_input_site",
      caption: "input site",
      type: "function",
      optional: true,
      args: [
        {
          target: "input_site",
          type: "list",
          options: [
            "BloodCapacitance",
            "BloodTimeVaryingElastance",
            "BloodResistor",
            "BloodValve",
            "Container",
            "GasCapacitance",
            "GasResistor",
          ],
        },
      ],
    },
    {
      target: "input_parameter",
      caption: "input parameter",
      type: "string",
      default: "",
    },
  ];

  constructor(model_ref, name = "") {
    // independent properties
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.receptor_type = "";

    this.input_parameter = "";
    this.input_site = "";
    this.min_value = 0.0;
    this.set_value = 0.0;
    this.max_value = 0.0;
    this.max_firing_rate = 100.0;
    this.set_firing_rate = 50.0;
    this.min_firing_rate = 0.0;
    this.time_constant = 1.0;

    // dependent properties
    this.input_value = 0.0;
    this.firing_rate = 0.0;

    // local properties
    this._model_engine = model_ref;
    this._is_initialized = false;
    this._update_window = 0.015;
    this._update_counter = 0.0;
    this._t = model_ref.modeling_stepsize;
    this._input_site = null;
    this._gain = 0.0;
  }

  init_model(args) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // get a reference to the input site
    this._input_site = this._model_engine.models[this.input_site];

    // set the initial values
    this.current_value = this._input_site[this.input_parameter];
    this.firing_rate = this.set_firing_rate;

    // flag that the model is initialized
    this._is_initialized = true;
  }

  // this method is called during every model step by the model engine
  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  set_input_site(new_site) {
    // get a reference to the input site
    this._input_site = this._model_engine.models[new_site];
  }

  // actual model calculations are done here
  calc_model() {
    // for performance reasons the update is done only every 15 ms instead of every step
    this._update_counter += this._t;
    if (this._update_counter >= this._update_window) {
      this._update_counter = 0.0;

      // get the input value
      this.input_value = this._input_site[this.input_parameter];

      // calculate the activation value
      let _activation = 0.0;
      if (this.input_value > this.max_value) {
        _activation = this.max_value - this.set_value;
      } else if (this.input_value < this.min_value) {
        _activation = this.min_value - this.set_value;
      } else {
        _activation = this.input_value - this.set_value;
      }

      // calculate the gain
      if (_activation > 0) {
        // calculate the gain for positive activation
        this._gain =
          (this.max_firing_rate - this.set_firing_rate) /
          (this.max_value - this.set_value);
      } else {
        // calculate the gain for negative activation
        this._gain =
          (this.set_firing_rate - this.min_firing_rate) /
          (this.set_value - this.min_value);
      }

      // calculate the firing rate of the receptor
      const _new_firing_rate = this.set_firing_rate + this._gain * _activation;

      // incorporate the time constant to calculate the firing rate
      this.firing_rate =
        this._update_window *
          ((1.0 / this.time_constant) *
            (-this.firing_rate + _new_firing_rate)) +
        this.firing_rate;
    }
  }
}
