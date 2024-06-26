import { set_blood_composition } from "../helpers/BloodComposition";

export class Blood {
  static model_type = "Blood";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "set_temp",
      caption: "temperature (°C)",
      type: "function",
      optional: false,
      args: [
        {
          target: "temp",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 43.0,
          ll: 20.0,
        },
      ],
    },
    {
      target: "set_pres_cor_factor",
      caption: "cor factor",
      type: "function",
      optional: false,
      args: [
        {
          target: "pres_cor_factor",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 10.0,
          ll: 0.1,
        },
      ],
    },
    {
      target: "set_na_conc",
      caption: "sodium concentration (mmol/l)",
      type: "function",
      optional: false,
      args: [
        {
          target: "na",
          type: "number",
          optional: false,
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 150.0,
          ll: 100.0,
        },
      ],
    },
    {
      target: "set_k_conc",
      caption: "potassium concentration (mmol/l)",
      type: "function",
      optional: false,
      args: [
        {
          target: "k",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 0.5,
          ll: 10.0,
        },
      ],
    },
    {
      target: "set_ca_conc",
      caption: "calcium concentration (mmol/l)",
      type: "function",
      optional: false,
      args: [
        {
          target: "ca",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 0.1,
          ll: 5.0,
        },
      ],
    },
    {
      target: "set_mg_conc",
      caption: "magnesium concentration (mmol/l)",
      type: "function",
      optional: false,
      args: [
        {
          target: "mg",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 0.1,
          ll: 5.0,
        },
      ],
    },
    {
      target: "set_cl_conc",
      caption: "chloride concentration (mmol/l)",
      type: "function",
      optional: false,
      args: [
        {
          target: "cl",
          type: "number",
          optional: false,
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 70.0,
          ll: 150.0,
        },
      ],
    },
    {
      target: "set_lact_conc",
      caption: "lactate concentration (mmol/l)",
      type: "function",
      optional: false,
      args: [
        {
          target: "lact",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 30.0,
          ll: 0.1,
        },
      ],
    },
    {
      target: "set_albumin_conc",
      caption: "albumin concentration (g/l)",
      type: "function",
      optional: false,
      args: [
        {
          target: "albumin",
          type: "number",
          optional: false,
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 50.0,
          ll: 1.0,
        },
      ],
    },
    {
      target: "set_phosphates_conc",
      caption: "phosphates concentration (g/l)",
      type: "function",
      optional: false,
      args: [
        {
          target: "phosphates",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 5.0,
          ll: 0.1,
        },
      ],
    },
    {
      target: "set_uma_conc",
      caption: "unmeasured anions concentration (g/l)",
      type: "function",
      optional: false,
      args: [
        {
          target: "uma",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100.0,
          ll: 0.0,
        },
      ],
    },
    {
      target: "set_hemoglobin_conc",
      caption: "hemoglobin concentration (g/l)",
      type: "function",
      optional: false,
      args: [
        {
          target: "hemoglobin",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 15.0,
          ll: 1.0,
        },
      ],
    },
    {
      target: "set_dpg_conc",
      caption: "dpg concentration (g/l)",
      type: "function",
      optional: false,
      args: [
        {
          target: "dpg",
          type: "number",
          optional: false,
          factor: 1,
          delta: 0.1,
          rounding: 1,
          ul: 100.0,
          ll: 0.0,
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
  ascending_aorta = "AA";
  descending_aorta = "AD";
  inferior_vena_cava = "IVCI";
  superior_vena_cava = "SVC";
  right_atrium = "RA";
  viscosity = 6.0;
  blood_containing_components = [];
  pres_cor_factor = 1.0;

  // dependent parameters
  ph = 0.0;
  pco2 = 0.0;
  po2 = 0.0;
  hco3 = 0.0;
  be = 0.0;
  so2 = 0.0;
  na = 138;
  k = 3.5;
  ca = 1;
  cl = 108;
  lact = 1;
  mg = 0.75;
  albumin = 25;
  phosphates = 1.64;
  uma = 3.8;
  dpg = 5;
  hemoglobin = 8;
  temp = 37;

  ph_pre = 0.0;
  po2_pre = 0.0;
  pco2_pre = 0.0;
  hco3_pre = 0.0;
  be_pre = 0.0;
  so2_pre = 0.0;

  ph_post = 0.0;
  po2_post = 0.0;
  pco2_post = 0.0;
  hco3_post = 0.0;
  be_post = 0.0;
  so2_post = 0.0;

  ph_ven = 0.0;
  po2_ven = 0.0;
  pco2_ven = 0.0;
  hco3_ven = 0.0;
  be_ven = 0.0;
  so2_ven = 0.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _update_interval = 2.0;
  _update_counter = 0.0;
  _aa = {};
  _ad = {};
  _ivci = {};
  _svc = {};
  _ra = {};

  to2 = 0.0;
  tco2 = 0.0;

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

    // set the aboxy and solutes if not set by the state which is loaded
    for (let [model_name, model] of Object.entries(this._model_engine.models)) {
      if (
        model.model_type === "BloodCapacitance" ||
        model.model_type === "BloodTimeVaryingElastance"
      ) {
        // set the correction factor
        this.set_pres_cor_factor(this.pres_cor_factor);
        if (Object.keys(model.aboxy).length === 0) {
          console.log("setting blood composition");
          model.aboxy = { ...this.aboxy };
          model.solutes = { ...this.solutes };
        }
      }
    }

    // get references
    this._aa = this._model_engine.models[this.ascending_aorta];
    this._ad = this._model_engine.models[this.descending_aorta];
    this._ivci = this._model_engine.models[this.inferior_vena_cava];
    this._svc = this._model_engine.models[this.superior_vena_cava];
    this._ra = this._model_engine.models[this.right_atrium];

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  set_pres_cor_factor(new_factor) {
    console.log(new_factor);
    this.pres_cor_factor = parseFloat(new_factor);
    for (let [_, model] of Object.entries(this._model_engine.models)) {
      if (
        (model.model_type === "BloodCapacitance" ||
          model.model_type === "BloodTimeVaryingElastance") &&
        !model.fixed_composition
      ) {
        if (model.is_enabled) {
          model.pres_cor_factor = parseFloat(new_factor);
        }
      }
    }
  }

  set_blood_properties(model_name) {
    // set the aboxy and solutes if not set by the state which is loaded
    if (
      this._model_engine.models[model_name].model_type === "BloodCapacitance" ||
      this._model_engine.models[model_name].model_type ===
        "BloodTimeVaryingElastance"
    ) {
      if (
        Object.keys(this._model_engine.models[model_name].aboxy).length === 0
      ) {
        console.log("setting blood composition on " + model_name);
        this._model_engine.models[model_name].aboxy = { ...this.aboxy };
        this._model_engine.models[model_name].solutes = { ...this.solutes };
      }
    }
  }

  set_na_conc(new_conc) {
    this.na = parseFloat(new_conc);
    this.set_solute_concentration("na", new_conc);
  }
  set_k_conc(new_conc) {
    this.k = parseFloat(new_conc);
    this.set_solute_concentration("k", new_conc);
  }

  set_ca_conc(new_conc) {
    this.ca = parseFloat(new_conc);
    this.set_solute_concentration("ca", new_conc);
  }

  set_mg_conc(new_conc) {
    this.mg = parseFloat(new_conc);
    this.set_solute_concentration("mg", new_conc);
  }

  set_cl_conc(new_conc) {
    this.cl = parseFloat(new_conc);
    this.set_solute_concentration("cl", new_conc);
  }

  set_lact_conc(new_conc) {
    this.lact = parseFloat(new_conc);
    this.set_solute_concentration("lact", new_conc);
  }

  set_albumin_conc(new_conc) {
    this.albumin = parseFloat(new_conc);
    this.set_aboxy_concentration("albumin", new_conc);
  }

  set_phosphates_conc(new_conc) {
    this.phosphates = parseFloat(new_conc);
    this.set_aboxy_concentration("phosphates", new_conc);
  }

  set_uma_conc(new_conc) {
    this.uma = parseFloat(new_conc);
    this.set_aboxy_concentration("uma", new_conc);
  }

  set_dpg_conc(new_conc) {
    this.dpg = parseFloat(new_conc);
    this.set_aboxy_concentration("dpg", new_conc);
  }

  set_hemoglobin_conc(new_conc) {
    this.hemoglobin = parseFloat(new_conc);
    this.set_aboxy_concentration("hemoglobin", new_conc);
  }

  set_temp(new_temp) {
    this.temp = parseFloat(new_temp);
    this.set_aboxy_concentration("temp", new_temp);
  }

  set_solute_concentration(solute_name, solute_conc, targets = []) {
    if (targets.length > 0) {
      targets.forEach((target) => {
        this._model_engine.models[target].solutes[solute_name] =
          parseFloat(solute_conc);
      });
      return;
    }
    for (let [_, model] of Object.entries(this._model_engine.models)) {
      if (
        (model.model_type === "BloodCapacitance" ||
          model.model_type === "BloodTimeVaryingElastance") &&
        !model.fixed_composition
      ) {
        if (model.is_enabled) {
          model.solutes[solute_name] = parseFloat(solute_conc);
        }
      }
    }
  }

  set_aboxy_concentration(aboxy_name, aboxy_conc, targets = []) {
    if (targets.length > 0) {
      targets.forEach((target) => {
        this._model_engine.models[target].aboxy[aboxy_name] =
          parseFloat(aboxy_conc);
      });
      return;
    }
    for (let [_, model] of Object.entries(this._model_engine.models)) {
      if (
        model.model_type === "BloodCapacitance" ||
        model.model_type === "BloodTimeVaryingElastance"
      ) {
        if (model.is_enabled) {
          model.aboxy[aboxy_name] = parseFloat(aboxy_conc);
        }
      }
    }
  }

  calc_model() {
    if (this._update_counter > this._update_interval) {
      this._update_counter = 0;

      set_blood_composition(this._aa);
      set_blood_composition(this._ad);
      set_blood_composition(this._ra);

      this.ph_pre = this._aa.aboxy.ph;
      this.po2_pre = this._aa.aboxy.po2;
      this.pco2_pre = this._aa.aboxy.pco2;
      this.hco3_pre = this._aa.aboxy.hco3;
      this.be_pre = this._aa.aboxy.be;
      this.so2_pre = this._aa.aboxy.so2;

      this.na = this._aa.solutes.na;
      this.k = this._aa.solutes.k;
      this.cl = this._aa.solutes.cl;
      this.ca = this._aa.solutes.ca;
      this.mg = this._aa.solutes.mg;
      this.lact = this._aa.solutes.lact;
      this.temp = this._aa.aboxy.temp;
      this.albumin = this._aa.aboxy.albumin;
      this.phosphates = this._aa.aboxy.phosphates;
      this.dpg = this._aa.aboxy.dpg;
      this.uma = this._aa.aboxy.uma;
      this.hemoglobin = this._aa.aboxy.hemoglobin;

      this.ph_post = this._ad.aboxy.ph;
      this.po2_post = this._ad.aboxy.po2;
      this.pco2_post = this._ad.aboxy.pco2;
      this.hco3_post = this._ad.aboxy.hco3;
      this.be_post = this._ad.aboxy.be;
      this.so2_post = this._ad.aboxy.so2;

      this.ph = this.ph_post;
      this.po2 = this.po2_post;
      this.to2 = this._aa.aboxy.to2;
      this.pco2 = this.pco2_post;
      this.tco2 = this._aa.aboxy.tco2;
      this.hco3 = this.hco3_post;
      this.be = this.be_post;
      this.so2 = this.so2_post;

      this.ph_ven = this._ra.aboxy.ph;
      this.po2_ven = this._ra.aboxy.po2;
      this.pco2_ven = this._ra.aboxy.pco2;
      this.hco3_ven = this._ra.aboxy.hco3;
      this.be_ven = this._ra.aboxy.be;
      this.so2_ven = this._ra.aboxy.so2;
    }
    this._update_counter += this._t;
  }
}
