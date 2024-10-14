export class Placenta {
  static model_type = "Placenta";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "pl_circ_enabled",
      caption: "placenta circulation enabled",
      type: "boolean",
      optional: false,
    },
    {
      target: "umb_art_diameter",
      caption: "umbilical artery diameter (mm)",
      type: "number",
      optional: false,
      default: 1.0,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 10.0,
      ll: 0.1,
    },
    {
      target: "umb_art_length",
      caption: "umbilical artery length (cm)",
      type: "number",
      optional: false,
      default: 1.0,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 1000.0,
      ll: 0.1,
    },
    {
      target: "umb_ven_diameter",
      caption: "umbilical vein diameter (mm)",
      type: "number",
      optional: false,
      default: 1.0,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 10.0,
      ll: 0.1,
    },
    {
      target: "umb_ven_length",
      caption: "umbilical vein length (cm)",
      type: "number",
      optional: false,
      default: 1.0,
      factor: 1,
      delta: 0.1,
      rounding: 1,
      ul: 1000.0,
      ll: 0.1,
    },
    {
      target: "umb_art_res",
      caption: "umbilical artery resistance (dynes s/cm5)",
      type: "number",
      optional: false,
      default: 30000,
      factor: 1,
      delta: 10,
      rounding: 0,
      ul: 1000000,
      ll: 100,
    },
    {
      target: "umb_ven_res",
      caption: "umbilical vein resistance",
      type: "number",
      optional: false,
      default: 30000,
      factor: 1,
      delta: 10,
      rounding: 0,
      ul: 10000000,
      ll: 100,
    },
    {
      target: "plf_el_base",
      caption: "fetal placenta elastance",
      type: "number",
      optional: false,
      default: 5000.0,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 1000000,
      ll: 100,
    },
    {
      target: "plf_u_vol",
      caption: "fetal placenta unstressed volume (l)",
      type: "number",
      optional: false,
      default: 0.15,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 1.0,
      ll: 0.0,
    },
    {
      target: "plm_el_base",
      caption: "material placenta elastance",
      type: "number",
      optional: false,
      default: 5000.0,
      factor: 1,
      delta: 1,
      rounding: 0,
      ul: 1000000,
      ll: 100,
    },
    {
      target: "plm_u_vol",
      caption: "maternal placenta unstressed volume (l)",
      type: "number",
      optional: false,
      default: 0.5,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 5.0,
      ll: 0.0,
    },
    {
      target: "dif_o2",
      caption: "oxygen diffusion coefficient",
      type: "number",
      optional: false,
      default: 0.01,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 1.0,
      ll: 0.0,
    },
    {
      target: "dif_co2",
      caption: "carbon dioxide diffusion coefficient",
      type: "number",
      optional: false,
      default: 0.01,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 1.0,
      ll: 0.0,
    },
    {
      target: "mat_to2",
      caption: "maternal oxygen content (mmol/l)",
      type: "number",
      optional: false,
      default: 0.01,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100.0,
      ll: 0.0,
    },
    {
      target: "mat_tco2",
      caption: "maternal carbon dioxide content (mmol/l)",
      type: "number",
      optional: false,
      default: 0.01,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100.0,
      ll: 0.0,
    },
  ];

  constructor(model_ref, name = "") {
    // Independent properties
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.pl_circ_enabled = false;
    this.umb_art_diameter = 1.0;
    this.umb_art_length = 1.0;
    this.umb_ven_diameter = 1.0;
    this.umb_ven_length = 1.0;
    this.umb_art_res = 30000;
    this.umb_art_res_factor = 1.0;
    this.umb_ven_res = 30000;
    this.umb_ven_res_factor = 1.0;
    this.plf_el_base = 5000.0;
    this.plf_el_base_factor = 5000.0;
    this.plf_u_vol = 0.15;
    this.plf_u_vol_factor = 0.15;
    this.plm_el_base = 5000.0;
    this.plm_el_base_factor = 5000.0;
    this.plm_u_vol = 0.5;
    this.plm_u_vol_factor = 0.5;
    this.diff = 0.01;
    this.diff_factor = 1.0;
    this.dif_o2 = 0.01;
    this.dif_o2_factor = 1.0;
    this.dif_co2 = 0.01;
    this.dif_co2_factor = 1.0;
    this.mat_to2 = 6.5;
    this.mat_tco2 = 23.0;

    // Dependent properties
    this.umb_art_flow = 0.0;
    this.umb_art_flow_lmin = 0.0;
    this.umb_art_velocity = 0.0;
    this.mat_po2 = 0.0;
    this.mat_pco2 = 0.0;

    // Local properties
    this._model_engine = model_ref;
    this._is_initialized = false;
    this._t = model_ref.modeling_stepsize;
    this._umb_art = null;
    this._umb_ven = null;
    this._plm = null;
    this._plf = null;
    this._pl_gasex = null;
  }

  init_model(args) {
    // set the values of the properties as passed in the arguments
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // Initialize references to the models
    this._umb_art = this._model_engine.models["UMB_ART"];
    this._umb_ven = this._model_engine.models["UMB_VEN"];
    this._plf = this._model_engine.models["PLF"];
    this._plm = this._model_engine.models["PLM"];
    this._pl_gasex = this._model_engine.models["PL_GASEX"];

    // Flag that the model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    if (this.pl_circ_enabled) {
      this._umb_art.no_flow = false;
      this._umb_ven.no_flow = false;

      this._umb_art.r_for = this.umb_art_res;
      this._umb_art.r_for_factor = this.umb_art_res_factor;

      this._umb_art.r_back = this.umb_art_res;
      this._umb_art.r_back_factor = this.umb_art_res_factor;

      this._umb_ven.r_for = this.umb_ven_res;
      this._umb_ven.r_for_factor = this.umb_ven_res_factor;

      this._umb_ven.r_back = this.umb_ven_res;
      this._umb_ven.r_back_factor = this.umb_ven_res_factor;

      this._plf.el_base = this.plf_el_base;
      this._plf.el_base_factor = this.plf_el_base_factor;

      this._plf.u_vol = this.plf_u_vol;
      this._plf.u_vol_factor = this.plf_u_vol_factor;

      this._plm.to2 = this.mat_to2;
      this._plm.tco2 = this.mat_tco2;

      this._pl_gasex.dif_co2 = this.dif_co2;
      this._pl_gasex.dif_o2 = this.dif_o2;
      this._pl_gasex.dif_co2_factor = this.dif_co2_factor;
      this._pl_gasex.dif_o2_factor = this.dif_o2_factor;

      this.mat_po2 = this._plm.po2;
      this.mat_pco2 = this._plm.pco2;

      this.umb_art_flow = this._umb_art.flow;
      this.umb_art_flow_lmin = this._umb_art.umb_art_flow_lmin;
    } else {
      this.disable_placental_flow();
    }
  }

  disable_placental_flow() {
    this._umb_art.no_flow = true;
    this._umb_ven.no_flow = true;

    this.umb_art_flow = 0.0;
    this.umb_art_flow_lmin = 0.0;
    this.umb_art_velocity = 0.0;

    this._umb_art.flow = 0.0;
    this._umb_art.flow_lmin = 0.0;

    this._umb_ven.flow = 0.0;
    this._umb_ven.flow_lmin = 0.0;
  }

  switch_placenta(state) {
    this.pl_circ_enabled = state;
    this._umb_art.is_enabled = state;
    this._umb_ven.is_enabled = state;
    this._plf.is_enabled = state;
    this._plm.is_enabled = state;
    this._pl_gasex.is_enabled = state;
    this._umb_art.no_flow = !state;
    this._umb_ven.no_flow = !state;

    if (!state) {
      this.disable_placental_flow();
    }
  }
}
