export class Circulation {
  static model_type = "Circulation";
  static model_interface = [
    {
      name: "change_svr",
      caption: "systemic vascular resistance factor",
      type: "function",
      target: "svr_change",
      optionals: false,
      args: [
        {
          name: "change_svr",
          caption: "",
          type: "number",
          required: true,
          value: 1.0,
          factor: 1.0,
          delta: 0.01,
          rounding: 2,
          ul: 100.0,
          ll: 0.01,
          is_target: true,
        },
      ],
    },
    {
      name: "change_pvr",
      caption: "pulmonary vascular resistance factor",
      type: "function",
      target: "pvr_change",
      optionals: false,
      args: [
        {
          name: "change_pvr",
          caption: "",
          type: "number",
          required: true,
          value: 1.0,
          factor: 1.0,
          delta: 0.01,
          rounding: 2,
          ul: 100.0,
          ll: 0.01,
          is_target: true,
        },
      ],
    },
    {
      name: "change_venpool",
      caption: "venous pool factor",
      type: "function",
      target: "venpool_change",
      optionals: false,
      args: [
        {
          name: "change_venpool",
          caption: "",
          type: "number",
          required: true,
          value: 1.0,
          factor: 1.0,
          delta: 0.01,
          rounding: 2,
          ul: 100.0,
          ll: 0.01,
          is_target: true,
        },
      ],
    },
    {
      name: "change_syst_arterial_compliance",
      caption: "systemic arterial compliance factor",
      type: "function",
      target: "systartcomp_change",
      optionals: false,
      args: [
        {
          name: "change_syst_arterial_compliance",
          caption: "",
          type: "number",
          required: true,
          value: 1.0,
          factor: 1.0,
          delta: 0.01,
          rounding: 2,
          ul: 100.0,
          ll: 0.01,
          is_target: true,
        },
      ],
    },
    {
      name: "change_pulm_arterial_compliance",
      caption: "pulmonary arterial compliance factor",
      type: "function",
      target: "pulmartcomp_change",
      optionals: false,
      args: [
        {
          name: "change_pulm_arterial_compliance",
          caption: "",
          type: "number",
          required: true,
          value: 1.0,
          factor: 1.0,
          delta: 0.01,
          rounding: 2,
          ul: 100.0,
          ll: 0.01,
          is_target: true,
        },
      ],
    },
  ];

  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  pulmonary_arteries = [];
  pulmonary_veins = [];
  systemic_arteries = [];
  systemic_veins = [];
  svr_targets = [];
  pvr_targets = [];
  ofo_targets = [];
  vsd_targets = [];
  ips_targets = [];
  venpool_targets = [];
  heart_aorta = [];
  heart_inferior_vena_cava = [];
  heart_superior_vena_cava = [];
  heart_pulmonary_artery = [];
  heart_pulmonary_veins = [];

  // dependent parameters
  fo_change = 1.0;
  vsd_change = 1.0;
  lungshunt_change = 1.0;
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
  _systemic_arteries = [];
  _systemic_veins = [];
  _svr_targets = [];
  _pulmonary_arteries = [];
  _pulmonary_veins = [];
  _pvr_targets = [];
  _venpool_targets = [];
  _heart_inferior_vena_cava = [];
  _heart_superior_vena_cava = [];
  _heart_aorta = [];
  _heart_pulmonary_artery = [];
  _heart_pulmonary_veins = [];
  _ofo_targets = [];
  _vsd_targets = [];
  _ips_targets = [];

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
    this.systemic_arteries.forEach((sa) => {
      this._systemic_arteries.push(this._model_engine.models[sa]);
    });

    this.systemic_veins.forEach((sv) => {
      this._systemic_veins.push(this._model_engine.models[sv]);
    });

    this.svr_targets.forEach((svrt) => {
      this._svr_targets.push(this._model_engine.models[svrt]);
    });

    this.pvr_targets.forEach((pvrt) => {
      this._pvr_targets.push(this._model_engine.models[pvrt]);
    });

    this.venpool_targets.forEach((vpt) => {
      this._venpool_targets.push(this._model_engine.models[vpt]);
    });

    this.heart_aorta.forEach((res) => {
      this._heart_aorta.push(this._model_engine.models[res]);
    });

    this.heart_inferior_vena_cava.forEach((res) => {
      this._heart_inferior_vena_cava.push(this._model_engine.models[res]);
    });

    this.heart_superior_vena_cava.forEach((res) => {
      this._heart_superior_vena_cava.push(this._model_engine.models[res]);
    });

    this.heart_pulmonary_artery.forEach((res) => {
      this._heart_pulmonary_artery.push(this._model_engine.models[res]);
    });

    this.heart_pulmonary_veins.forEach((res) => {
      this._heart_pulmonary_veins.push(this._model_engine.models[res]);
    });

    this.ofo_targets.forEach((res) => {
      this._ofo_targets.push(this._model_engine.models[res]);
    });

    this.vsd_targets.forEach((res) => {
      this._vsd_targets.push(this._model_engine.models[res]);
    });

    this.ips_targets.forEach((res) => {
      this._ips_targets.push(this._model_engine.models[res]);
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

  change_ofo(change_forward, change_backward = -1) {
    if (change_forward >= 0.0) {
      this.fo_change = change_forward;
      this._ofo_targets.forEach((target) => {
        target.r_for_factor = change_forward;
        target.r_back_factor = change_forward;
        if (change_backward >= 0.0) {
          target.r_back_factor = change_backward;
        }
      });
    }
  }

  change_vsd(change_forward, change_backward = -1) {
    if (change_forward >= 0.0) {
      this.vsd_change = change_forward;
      this._vsd_targets.forEach((target) => {
        target.r_for_factor = change_forward;
        target.r_back_factor = change_forward;
        if (change_backward >= 0.0) {
          target.r_back_factor = change_backward;
        }
      });
    }
  }

  change_lungshunt(change_forward, change_backward = -1) {
    if (change_forward > 0.0) {
      this.lungshunt_change = change_forward;
      this._ips_targets.forEach((target) => {
        target.r_for_factor = change_forward;
        target.r_back_factor = change_forward;
        if (change_backward >= 0.0) {
          target.r_back_factor = change_backward;
        }
      });
    }
  }

  change_pvr(change_forward, change_backward = -1) {
    if (change_forward > 0.0) {
      this.pvr_change = change_forward;
      this._pvr_targets.forEach((target) => {
        target.r_for_factor = change_forward;
        target.r_back_factor = change_forward;
        if (change_backward >= 0.0) {
          target.r_back_factor = change_backward;
        }
      });
    }
  }

  change_svr(change_forward, change_backward = -1) {
    if (change_forward > 0.0) {
      this.svr_change = change_forward;
      this._svr_targets.forEach((target) => {
        target.r_for_factor = change_forward;
        target.r_back_factor = change_forward;
        if (change_backward >= 0.0) {
          target.r_back_factor = change_backward;
        }
      });
    }
  }

  change_venpool(change) {
    if (change > 0.0) {
      this.venpool_change = change;
      this._venpool_targets.forEach((target) => {
        target.u_vol_factor = change;
      });
    }
  }

  change_syst_arterial_compliance(change) {
    if (change > 0.0) {
      this.systartcomp_change = change;
      this._systemic_arteries.forEach((target) => {
        target.el_base_factor = 1.0 / change;
      });
    }
  }

  change_pulm_arterial_compliance(change) {
    if (change > 0.0) {
      this.pulmartcomp_change = change;
      this._pulmonary_arteries.forEach((target) => {
        target.el_base_factor = 1.0 / change;
      });
    }
  }

  change_venous_compliance(change) {
    if (change > 0.0) {
      this.vencomp_change = change;
      this._systemic_veins.forEach((target) => {
        target.el_base_factor = 1.0 / change;
      });
    }
  }
}
