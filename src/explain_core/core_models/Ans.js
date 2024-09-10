export class Ans {
  // static properties
  static model_type = "Ans";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      default: true,
    },
    {
      target: "ans_active",
      caption: "ans active",
      type: "boolean",
      default: true,
    },
    {
      target: "sensors",
      caption: "sensors",
      type: "ans_sensor_list",
      optional: false,
      args: [],
    },
    {
      target: "effectors",
      caption: "effectors",
      type: "ans_effector_list",
      optional: false,
      args: [],
    },
  ];

  constructor(model_ref, name = "") {
    // independent properties
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.ans_active = true;

    // sensory inputs
    this.pathways = [];

    // dependent properties

    // local properties
    this._model_engine = model_ref;
    this._t = model_ref.modeling_stepsize;
    this._is_initialized = false;
    this._pathways = {};
    this._update_window = 0.015;
    this._update_counter = 0.0;
  }

  init_model(args) {
    // set the values of the properties as passed in the arguments
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // initialize the pathways with references to the necessary models
    for (let pathway of this.pathways) {
      this._pathways[pathway.name] = {
        sensor: this._model_engine.models[pathway.sensor],
        effector: this._model_engine.models[pathway.effector],
        weight: pathway.weight,
        pathway_activity: 0.0,
      };
    }

    console.log(this._pathways);

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

      // Connect the sensor with the effector
      for (let t in this._pathways) {
        console.log(this._pathways[t]);
        _pathway.effector.update_effector(
          _pathway.sensor.firing_rate * _pathway.sensor.weight,
          _pathway.sensor.weight
        );

        // // Get the firing rate
        // const _firing_rate = _sensor.input.firing_rate;

        // // Fetch the effector name and its weight once
        // const effector_name = _sensor.effector;
        // const sensor_weight = _sensor.weight;

        // // Access the effector dictionary once
        // const _effector = this._model_engine.models[effector_name];

        // // Add the firing rate to the effector
        // if (_effector) {
        //   _effector.update_effector(
        //     _firing_rate * sensor_weight,
        //     sensor_weight
        //   );
        // }
      }
    }
  }

  set_sensor_properties(new_props) {
    // re-initialize the sensors with references to the necessary models
    this.sensors = [...new_props];

    for (let sensor of this.sensors) {
      if (this._model_engine.models[sensor.input]) {
        this._sensors[sensor.name].input =
          this._model_engine.models[sensor.input];
        this._sensors[sensor.name].effector = sensor.effector;
        this._sensors[sensor.name].weight = parseFloat(sensor.weight);
      } else {
        console.log("Ans sensor not found!");
      }
    }

    console.log(this._sensors);
  }
}
