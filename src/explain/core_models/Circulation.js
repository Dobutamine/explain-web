export class Circulation {
  static model_type = "Circulation";
  static model_interface = [
    {
      target: "change_svr",
      caption: "systemic arteries outflow resistance factor",
      type: "function",
      optional: false,
      args: [
        {
          target: "svr_change",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 0,
          ul: 10.0,
          ll: 0.1,
        },
      ],
    },
    {
      target: "change_pvr",
      caption: "pulmonary artery outflow resistance factor",
      type: "function",
      optional: false,
      args: [
        {
          target: "pvr_change",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 2,
          ul: 10.0,
          ll: 0.1,
        },
      ],
    },
    {
      target: "change_venpool",
      caption: "venous pool factor",
      type: "function",
      optional: false,
      args: [
        {
          target: "venpool_change",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 0,
          ul: 10.0,
          ll: 0.1,
        },
      ],
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
      optional: true,
      args: [
        {
          target: "systartcomp_change",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 2,
          ul: 10.0,
          ll: 0.1,
        },
      ],
    },
    {
      target: "change_pulm_arterial_elastance",
      caption: "pulmonary arterial elastance factor",
      type: "function",
      optional: true,
      args: [
        {
          target: "pulmartcomp_change",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 2,
          ul: 10.0,
          ll: 0.1,
        },
      ],
    },
    {
      target: "change_venous_elastance",
      caption: "venous elastance factor",
      type: "function",
      optional: true,
      args: [
        {
          target: "vencomp_change",
          type: "number",
          factor: 1,
          delta: 0.1,
          rounding: 2,
          ul: 10.0,
          ll: 0.1,
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
  ips_targets = [];
  venpool_targets = [];
  heart_aorta = [];
  heart_inferior_vena_cava = [];
  heart_superior_vena_cava = [];
  heart_pulmonary_artery = [];
  heart_pulmonary_veins = [];
  current_blood_volume = 0.0;

  // dependent parameters
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

    this.pulmonary_arteries.forEach((pa) => {
      this._pulmonary_arteries.push(this._model_engine.models[pa]);
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

    this.current_blood_volume = this.get_total_blood_volume();

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {}

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

  change_syst_arterial_elastance(change) {
    if (change > 0.0) {
      this.systartcomp_change = change;
      this._systemic_arteries.forEach((target) => {
        target.el_base_factor = change;
      });
    }
  }

  change_pulm_arterial_elastance(change) {
    if (change > 0.0) {
      this.pulmartcomp_change = change;
      this._pulmonary_arteries.forEach((target) => {
        target.el_base_factor = change;
      });
    }
  }

  change_venous_elastance(change) {
    if (change > 0.0) {
      this.vencomp_change = change;
      this._systemic_veins.forEach((target) => {
        target.el_base_factor = change;
      });
    }
  }

  set_total_blood_volume(new_blood_volume) {
    let current_blood_volume = this.get_total_blood_volume();
    for (let [model_name, model] of Object.entries(this._model_engine.models)) {
      if (
        model.model_type === "BloodCapacitance" ||
        model.model_type === "BloodTimeVaryingElastance"
      ) {
        if (model.is_enabled) {
          // calculate the current fraction of the blood volume in this blood containing capacitance
          let current_fraction = model.vol / current_blood_volume;
          let v = model.vol;
          let vu = model.u_vol;
          // calculate the current uvol/vol fraction
          let f = 0.0;
          if (model.vol > 0.0) {
            f = model.u_vol / model.vol;
          }
          // add the same fraction of the desired volume change to the blood containing capacitance
          model.vol +=
            current_fraction * (new_blood_volume - current_blood_volume);

          // change the unstressed volume
          model.u_vol = model.vol * f;

          // guard for negative volumes
          if (model.vol < 0.0) {
            model.vol = 0.0;
          }
        }
      }
    }
    this.current_blood_volume = this.get_total_blood_volume();
  }

  get_total_blood_volume() {
    let total_volume = 0.0;
    for (let [model_name, model] of Object.entries(this._model_engine.models)) {
      if (
        model.model_type === "BloodCapacitance" ||
        model.model_type === "BloodTimeVaryingElastance"
      ) {
        if (model.is_enabled) {
          total_volume += model.vol;
        }
      }
    }
    return total_volume;
  }
}
