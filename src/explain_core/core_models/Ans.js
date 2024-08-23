export class Ans {
  // static properties
  static model_type = "Ans";
  static model_interface = [];

  constructor(model_ref, name = "") {
    // independent properties
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.ans_active = true;

    // sensory inputs
    this.sensors = [
      { name: "cr pco2", input: "CR_PCO2", effector: "mv", weight: 1.0 }
    ];

    // effectors
    this.effectors = {
      mv: {
        target: "Breathing.mv_ans_factor",
        cum_mxe_high: 10.0,
        cum_mxe_low: 0.1,
        tc: 5.0,
        effector_change: 0.0
      }
    };

    // dependent properties

    // local properties
    this._model_engine = model_ref;
    this._t = model_ref.modeling_stepsize;
    this._is_initialized = false;
    this._sensors = {};
    this._effectors = {};
    this._update_window = 0.015;
    this._update_counter = 0.0;
  }

  init_model(args) {
    // set the values of the properties as passed in the arguments
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });
    
    // initialize the effectors with references to the necessary models
    for (let [effector_name, effector] of Object.entries(this.effectors)) {
      const target = effector.target.split(".");
      
      this._effectors[effector_name] = {
        target_model: this._model_engine.models[target[0]],
        target_prop: target[1],
        cum_mxe_high: effector.cum_mxe_high,
        cum_mxe_low: effector.cum_mxe_low,
        cum_firing_rate: effector.cum_firing_rate || 0.0,
        cum_weight: effector.cum_weight || 0.0,
        tc: effector.tc,
        effector_change: effector.effector_change
      };
    }

    // initialize the sensors with references to the necessary models
    for (let sensor of this.sensors) {
      this._sensors[sensor.name] = {
        input: this._model_engine.models[sensor.input],
        effector: sensor.effector,
        weight: sensor.weight,
        sensor_activity: 0.0
      };
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
    }

    // Get the sensor values into the effectors
    for (let _sensor_name in this._sensors) {
      const _sensor = this._sensors[_sensor_name];

      // Get the firing rate
      const _firing_rate = _sensor.input.firing_rate;

      // Fetch the effector name and its weight once
      const effector_name = _sensor.effector;
      const sensor_weight = _sensor.weight;

      // Access the effector dictionary once
      const _effector = this._effectors[effector_name];

      // Add the firing rate to the effector
      _effector.cum_firing_rate += _firing_rate * sensor_weight;
      _effector.cum_weight += sensor_weight;
    }

    // calculate the effectors
    for (let _effector_name in this._effectors) {
      const _effector = this._effectors[_effector_name];
      const cum_weight = _effector.cum_weight;
      const cum_firing_rate = _effector.cum_firing_rate;
      const cum_mxe_high = _effector.cum_mxe_high;
      const cum_mxe_low = _effector.cum_mxe_low;
      const effector_change_current = _effector.effector_change;
      const tc = _effector.tc;

      // Determine the total average firing rate
      const _firing_rate_avg = cum_weight === 0.0 ? 50.0 : cum_firing_rate / cum_weight;

      // Translate the average firing rate to the effect factor
      let _effector_change;
      if (_firing_rate_avg >= 50.0) {
        _effector_change = 1.0 + ((cum_mxe_high - 1.0) / 50.0) * (_firing_rate_avg - 50.0);
      } else {
        _effector_change = cum_mxe_low + (1.0 - cum_mxe_low) / 50.0 * _firing_rate_avg;
      }

      // Incorporate the time constant for the effector change
      const new_effector_change = this._update_window * ((1.0 / tc) * (-effector_change_current + _effector_change)) + effector_change_current;

      _effector.effector_change = new_effector_change;

      // Transfer the effect factor to the target model
      _effector.target_model[_effector.target_prop] = new_effector_change;

      // Reset the effect factor and number of effectors
      _effector.cum_firing_rate = 0.0;
      _effector.cum_weight = 0.0;
    }
  }
}
