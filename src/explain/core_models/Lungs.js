export class Lungs {
  static model_type = "Lungs";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "change_atelectasis",
      caption: "change atelectasis",
      type: "function",
      optional: false,
      args: [
        {
          target: "atelectasis_change",
          caption: "",
          type: "number",
          default: 1,
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 300,
          ll: 0.01,
        },
      ],
    },
    {
      target: "change_dead_space",
      caption: "change dead space",
      type: "function",
      optional: false,
      args: [
        {
          target: "dead_space_change",
          caption: "",
          type: "number",
          default: 1,
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 300,
          ll: 0.01,
        },
      ],
    },
    {
      target: "change_dif_o2",
      caption: "change dif o2",
      type: "function",
      optional: false,
      args: [
        {
          target: "dif_o2_change",
          caption: "",
          type: "number",
          default: 1,
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 300,
          ll: 0.01,
        },
      ],
    },
    {
      target: "change_dif_co2",
      caption: "change dif co2",
      type: "function",
      optional: false,
      args: [
        {
          target: "dif_co2_change",
          caption: "",
          type: "number",
          default: 1,
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 300,
          ll: 0.01,
        },
      ],
    },
    {
      target: "change_thorax_compliance",
      caption: "change thorax compliance",
      type: "function",
      optional: false,
      args: [
        {
          target: "thorax_comp_change",
          caption: "",
          type: "number",
          default: 1,
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 300,
        },
      ],
    },
    {
      target: "change_lung_compliance",
      caption: "change lung compliance",
      type: "function",
      optional: false,
      args: [
        {
          target: "lung_comp_change",
          caption: "",
          type: "number",
          default: 1,
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 300,
        },
      ],
    },
    {
      target: "change_chestwall_compliance",
      caption: "change chestwall compliance",
      type: "function",
      optional: false,
      args: [
        {
          target: "chestwall_comp_change",
          caption: "",
          type: "number",
          default: 1,
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 300,
        },
      ],
    },
    {
      target: "change_upper_airway_resistance",
      caption: "change upper airway resistance",
      type: "function",
      optional: false,
      args: [
        {
          target: "upper_aw_res_change",
          caption: "",
          type: "number",
          default: 1,
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 300,
        },
      ],
    },
    {
      target: "change_lower_airway_resistance",
      caption: "change lower airway resistance",
      type: "function",
      optional: false,
      args: [
        {
          target: "lower_aw_res_change",
          caption: "",
          type: "number",
          default: 1,
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 300,
        },
      ],
    },
    {
      target: "upper_airways",
      caption: "upper airways",
      type: "multiple-list",
      optional: false,
      options: ["GasResistor"],
    },
    {
      target: "dead_space",
      caption: "dead space",
      type: "multiple-list",
      optional: false,
      options: ["GasCapacitance"],
    },
    {
      target: "thorax",
      caption: "thorax",
      type: "single-list",
      optional: false,
      options: ["Container"],
    },
    {
      target: "chestwall",
      caption: "chestwall",
      type: "multiple-list",
      optional: false,
      options: ["Container"],
    },
    {
      target: "alveolar_spaces",
      caption: "alveolar spaces",
      type: "multiple-list",
      optional: false,
      options: ["GasCapacitance"],
    },
    {
      target: "lower_airways",
      caption: "lower airways",
      type: "multiple-list",
      optional: false,
      options: ["GasResistor"],
    },
    {
      target: "gas_exchangers",
      caption: "gas exchangers",
      type: "multiple-list",
      optional: false,
      options: ["GasExchanger"],
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
  lung_shunts = ["IPS"];

  // dependent parameters
  dif_o2_change = 1.0;
  dif_co2_change = 1.0;
  dead_space_change = 1.0;
  lung_comp_change = 1.0;
  chestwall_comp_change = 1.0;
  thorax_comp_change = 1.0;
  upper_aw_res_change = 1.0;
  lower_aw_res_change = 1.0;
  lung_shunt_change = 1.0;
  atelectasis_change = 1.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _upper_airways = [];
  _lung_shunts = [];
  _dead_space = [];
  _lower_airways = [];
  _alveolar_spaces = [];
  _thorax = [];
  _chestwall = [];
  _gas_exchangers = [];
  _lung_shunts = [];

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

    this.lung_shunts.forEach((target) => {
      this._lung_shunts.push(this._model_engine.models[target]);
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

  change_lung_shunt(change_forward, change_backward = -1) {
    console.log(change_forward, change_backward);
    if (change_forward > 0.0) {
      this.lung_shunt_change = change_forward;
      this._lung_shunts.forEach((target) => {
        target.r_for_factor = change_forward;
        target.r_back_factor = change_forward;
        if (change_backward >= 0.0) {
          target.r_back_factor = change_backward;
        }
      });
    }
  }
  change_atelectasis(change) {
    if (change > 0.0) {
      this.atelectasis_change = change;
    }
  }

  change_dead_space(change) {
    if (change > 0.0) {
      this.dead_space_change = change;
      this._dead_space.forEach((target) => {
        target.u_vol_factor = change;
      });
    }
  }

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
