export class Circulation {
  static model_type = "Circulation";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "set_total_blood_volume",
      caption: "set total blood volume (ml)",
      type: "function",
      optional: false,
      args: [
        {
          target: "current_blood_volume",
          type: "number",
          factor: 1000,
          delta: 1,
          rounding: 0,
          ul: 100000.0,
          ll: 10.0,
        },
      ],
    },
    {
      target: "change_syst_arterial_elastance",
      caption: "systemic arterial elastance factor",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "systartcomp_change",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 1000.0,
          ll: 0.01,
        },
      ],
    },
    {
      target: "change_svr",
      caption: "systemic arteries resistance factor",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "svr_change",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 1000.0,
          ll: 0.01,
        },
      ],
    },
    {
      target: "change_pulm_arterial_elastance",
      caption: "pulmonary arterial elastance factor",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "pulmartcomp_change",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 1000.0,
          ll: 0.01,
        },
      ],
    },
    {
      target: "change_pvr",
      caption: "pulmonary artery resistance factor",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "pvr_change",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 1000.0,
          ll: 0.01,
        },
      ],
    },
    {
      target: "change_coarc",
      caption: "coarctatio aortae severity",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "coarc_change",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 1000.0,
          ll: 1.0,
        },
      ],
    },
    {
      target: "change_venpool",
      caption: "venous pool volume factor",
      type: "function",
      optional: false,
      relative: false,
      args: [
        {
          target: "venpool_change",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 1000.0,
          ll: 0.01,
        },
      ],
    },
    {
      target: "change_venous_elastance",
      caption: "venous elastance factor",
      type: "function",
      optional: true,
      relative: true,
      args: [
        {
          target: "vencomp_change",
          type: "number",
          factor: 1,
          delta: 0.01,
          rounding: 2,
          ul: 1000.0,
          ll: 0.01,
        },
      ],
    },
    {
      target: "pulmonary_arteries",
      caption: "pulmonary arteries",
      type: "multiple-list",
      optional: false,
      options: ["BloodCapacitance"],
    },
    {
      target: "pulmonary_veins",
      caption: "pulmonary veins",
      type: "multiple-list",
      optional: false,
      options: ["BloodCapacitance"],
    },
    {
      target: "systemic_arteries",
      caption: "systemic arteries",
      type: "multiple-list",
      optional: false,
      options: ["BloodCapacitance"],
    },
    {
      target: "systemic_veins",
      caption: "systemic veins",
      type: "multiple-list",
      optional: false,
      options: ["BloodCapacitance"],
    },
    {
      target: "svr_targets",
      caption: "systemic vascular resistance targets",
      type: "multiple-list",
      optional: false,
      options: ["BloodResistor"],
    },
    {
      target: "pvr_targets",
      caption: "pulmonary vascular resistance targets",
      type: "multiple-list",
      optional: false,
      options: ["BloodResistor"],
    },
    {
      target: "venpool_targets",
      caption: "venous pool targets",
      type: "multiple-list",
      optional: false,
      options: ["BloodCapacitance"],
    },
  ];

  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  blood_containing_components = [];
  pulmonary_arteries = [];
  pulmonary_veins = [];
  systemic_arteries = [];
  systemic_veins = [];
  svr_targets = [];
  pvr_targets = [];
  venpool_targets = [];
  current_blood_volume = 0.0;

  // dependent parameters
  coarc_change = 1.0;
  pvr_change = 1.0;
  svr_change = 1.0;
  venpool_change = 1.0;
  pulmartcomp_change = 1.0;
  systartcomp_change = 1.0;
  vencomp_change = 1.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _update_interval = 2.0;
  _update_counter = 0.0;

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

    // get current blood volume
    this.current_blood_volume = this.get_total_blood_volume();

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    if (this._update_counter >= this._update_interval) {
      this._update_counter = 0.0;
      this.total_blood_volume = this.get_total_blood_volume();
    }
    this._update_counter += this._t;
  }

  change_coarc(change_forward, change_backward = -1) {
    console.log("Change coarctatio with factor: ", change_forward);
    if (change_forward > 0.0) {
      this.coarc_change = change_forward;
      this._model_engine.models["AA_AAR"].r_for_factor = change_forward;
      this._model_engine.models["AA_AAR"].r_back_factor = change_forward;
      if (change_backward >= 0.0) {
        this._model_engine.models["AA_AAR"].r_back_factor = change_backward;
      }
    }
  }

  change_pvr(change_forward, change_backward = -1) {
    console.log("Change pvr with factor: ", change_forward);
    if (change_forward > 0.0) {
      this.pvr_change = change_forward;
      this.pvr_targets.forEach((target) => {
        this._model_engine.models[target].r_for_factor = change_forward;
        this._model_engine.models[target].r_back_factor = change_forward;
        if (change_backward >= 0.0) {
          this._model_engine.models[target].r_back_factor = change_backward;
        }
      });
    }
  }

  change_svr(change_forward, change_backward = -1) {
    // the systemic vascular resistance is a result of the resistance and the elastance of the arterial tree. So when the arteries contract they will get less compliant
    // so decreasing svr means decreasing elastance (increased compliance) and decreasing resistance
    console.log("Change svr with factor: ", change_forward);
    if (change_forward > 0.0) {
      this.svr_change = change_forward;
      this.svr_targets.forEach((target) => {
        this._model_engine.models[target].r_for_factor = change_forward;
        this._model_engine.models[target].r_back_factor = change_forward;
        if (change_backward >= 0.0) {
          this._model_engine.models[target].r_back_factor = change_backward;
        }
      });
    }
  }

  change_venpool(change) {
    console.log("Change venous pool with factor: ", change);
    if (change > 0.0) {
      this.venpool_change = change;
      this.venpool_targets.forEach((target) => {
        this._model_engine.models[target].u_vol_factor = change;
      });
    }
  }

  change_syst_arterial_elastance(change) {
    console.log("Change syst art elastance with factor: ", change);
    if (change > 0.0) {
      this.systartcomp_change = change;
      this.systemic_arteries.forEach((target) => {
        this._model_engine.models[target].el_base_factor = change;
      });
    }
  }

  change_pulm_arterial_elastance(change) {
    console.log("Change pulm art elastance with factor: ", change);
    if (change > 0.0) {
      this.pulmartcomp_change = change;
      this.pulmonary_arteries.forEach((target) => {
        this._model_engine.models[target].el_base_factor = change;
      });
    }
  }

  change_venous_elastance(change) {
    console.log("Change venous elastance with factor: ", change);
    if (change > 0.0) {
      this.vencomp_change = change;
      this.systemic_veins.forEach((target) => {
        this._model_engine.models[target].el_base_factor = change;
      });
    }
  }

  set_total_blood_volume(new_blood_volume) {
    console.log("Set new blood volume to: ", volume);
    let current_blood_volume = this.get_total_blood_volume();
    let blood_volume_change = new_blood_volume / current_blood_volume;

    this.blood_containing_components.forEach((c) => {
      if (this._model_engine.models[c].is_enabled) {
        this._model_engine.models[c].vol =
          this._model_engine.models[c].vol * blood_volume_change;
        this._model_engine.models[c].u_vol =
          this._model_engine.models[c].u_vol * blood_volume_change;
      }
    });
    this.current_blood_volume = this.get_total_blood_volume();
  }

  get_total_blood_volume() {
    let total_volume = 0.0;
    this.blood_containing_components.forEach((c) => {
      if (this._model_engine.models[c].is_enabled) {
        total_volume += this._model_engine.models[c].vol;
      }
    });
    this.total_blood_volume = total_volume;
    return total_volume;
  }
}
