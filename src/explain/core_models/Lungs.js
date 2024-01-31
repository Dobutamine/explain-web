export class Lungs {
  static class_type = "Lungs";
  static indepent_parameters = [
    {
      name: "change_thorax_compliance",
      unit: "",
      type: "function",
      factor: "",
      rounding: 1,
      local_value: "thorax_comp_change",
    },
    {
      name: "change_chestwall_compliance",
      unit: "",
      type: "function",
      factor: "",
      rounding: 1,
      local_value: "chestwall_comp_change",
    },
    {
      name: "change_lung_compliance",
      unit: "",
      type: "function",
      factor: "",
      rounding: 1,
      local_value: "lung_comp_change",
    },
    {
      name: "change_upper_airway_resistance",
      unit: "",
      type: "function",
      factor: "",
      rounding: 1,
      local_value: "upper_aw_res_change",
    },
    {
      name: "change_lower_airway_resistance",
      unit: "",
      type: "function",
      factor: "",
      rounding: 1,
      local_value: "lower_aw_res_change",
    },
    {
      name: "change_dif_o2",
      unit: "",
      type: "function",
      factor: "",
      rounding: 1,
      local_value: "dif_o2_change",
    },
    {
      name: "change_dif_co2",
      unit: "",
      type: "function",
      factor: "",
      rounding: 1,
      local_value: "dif_co2_change",
    },
  ];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  upper_airways = ["MOUTH_DS"];
  dead_space = ["DS"];
  thorax = "THORAX";
  chestwall = ["CHEST_L", "CHEST_R"];
  alveolar_spaces = ["ALL", "ALR"];
  lower_airways = ["DS_ALL", "DS_ALR"];
  gas_exchangers = ["GASEX_LL", "GASEX_RL"];

  // dependent parameters
  dif_o2_change = 1.0;
  dif_co2_change = 1.0;
  lung_comp_change = 1.0;
  chestwall_comp_change = 1.0;
  thorax_comp_change = 1.0;
  upper_aw_res_change = 1.0;
  lower_aw_res_change = 1.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _upper_airways = [];
  _dead_space = [];
  _lower_airways = [];
  _alveolar_spaces = [];
  _thorax = [];
  _chestwall = [];
  _gas_exchangers = [];

  // the constructor builds a bare bone modelobject of the correct type and with the correct name and stores a reference to the modelengine object
  constructor(model_ref, name = "", type = "") {
    // name of the model
    this.name = name;

    // model type
    this.model_type = type;

    // reference to the model engine
    this._model_engine = model_ref;
  }

  init_model(args) {
    // process the parameters
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // set the modeling step size
    this._t = this._model_engine.modeling_stepsize;

    // store a reference to the necessary models
    this.upper_airways.forEach((target) => {
      this._upper_airways.push(this._model_engine.models[target]);
    });

    this.lower_airways.forEach((target) => {
      this._lower_airways.push(this._model_engine.models[target]);
    });

    this.dead_space.forEach((target) => {
      this._dead_space.push(this._model_engine.models[target]);
    });

    this.alveolar_spaces.forEach((target) => {
      this._alveolar_spaces.push(this._model_engine.models[target]);
    });

    this.thorax.forEach((target) => {
      this._thorax.push(this._model_engine.models[target]);
    });

    this.chestwall.forEach((target) => {
      this._chestwall.push(this._model_engine.models[target]);
    });

    this.gas_exchangers.forEach((target) => {
      this._gas_exchangers.push(this._model_engine.models[target]);
    });

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {}

  change_dif_o2(change) {
    if (change > 0.0) {
      this.dif_o2_change = change;
      this._gas_exchangers.forEach((target) => {
        target.dif_o2_factor = change;
      });
    }
  }

  change_dif_co2(change) {
    if (change > 0.0) {
      this.dif_co2_change = change;
      this._gas_exchangers.forEach((target) => {
        target.dif_co2_factor = change;
      });
    }
  }
  change_thorax_compliance(change) {
    if (change > 0.0) {
      this.thorax_comp_change = change;
      this._thorax.forEach((target) => {
        target.el_base_factor = 1.0 / change;
      });
    }
  }

  change_lung_compliance(change) {
    if (change > 0.0) {
      this.lung_comp_change = change;
      this._alveolar_spaces.forEach((target) => {
        target.el_base_factor = 1.0 / change;
      });
    }
  }

  change_chestwall_compliance(change) {
    if (change > 0.0) {
      this.chestwall_comp_change = change;
      this._chestwall.forEach((target) => {
        target.el_base_factor = 1.0 / change;
      });
    }
  }

  change_upper_airway_resistance(change_forward, change_backward = -1) {
    if (change_forward > 0.0) {
      this.upper_aw_res_change = change_forward;
      this._upper_airways.forEach((target) => {
        target.r_for_factor = change_forward;
        target.r_back_factor = change_forward;
        if (change_backward >= 0.0) {
          target.r_back_factor = change_backward;
        }
      });
    }
  }

  change_lower_airway_resistance(change_forward, change_backward = -1) {
    if (change_forward > 0.0) {
      this.lower_aw_res_change = change_forward;
      this._lower_airways.forEach((target) => {
        target.r_for_factor = change_forward;
        target.r_back_factor = change_forward;
        if (change_backward >= 0.0) {
          target.r_back_factor = change_backward;
        }
      });
    }
  }
}
