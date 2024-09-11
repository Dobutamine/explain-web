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
        active: pathway.active,
        effect_weight: pathway.effect_weight,
        pathway_activity: 0.0,
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

      // Connect the sensor with the effector
      if (this.ans_active) {
        for (let t in this._pathways) {
          let _pathway = this._pathways[t];
          if (_pathway.active) {
            _pathway.effector.update_effector(
              _pathway.sensor.firing_rate,
              _pathway.effect_weight
            );
          }
        }
      }
    }
  }
}
