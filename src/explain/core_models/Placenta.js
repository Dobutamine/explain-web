export class Placenta {
  static model_type = "Placenta";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      optional: true,
    },
  ];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  pl_circ_enabled = false;
  umb_art_diameter = 1.0;
  umb_art_length = 1.0;
  umb_ven_diameter = 1.0;
  umb_ven_length = 1.0;
  umb_art_res = 30000;
  umb_art_res_factor = 1.0;
  umb_ven_res = 30000;
  umb_ven_res_factor = 1.0;
  plf_el_base = 5000.0;
  plf_el_base_factor = 5000.0;
  plf_u_vol = 0.15;
  plf_u_vol_factor = 0.15;
  plm_el_base = 5000.0;
  plm_el_base_factor = 5000.0;
  plm_u_vol = 0.5;
  plm_u_vol_factor = 0.5;

  // dependent parameters
  umb_art_flow = 0.0;
  umb_art_flow_lmin = 0.0;
  umb_art_velocity = 0.0;
  mat_po2 = 0.0;
  mat_to2 = 0.0;
  mat_pco2 = 0.0;
  mat_tco2 = 0.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _umb_art = {};
  _umb_ven = {};
  _plm = {};
  _plf = {};
  _pl_gasex = {};

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

    // UMB_ART, UMB_VEN, PLF, PLM, PL_GASEX
    this._umb_art = this._model_engine.models["UMB_ART"];
    this._umb_ven = this._model_engine.models["UMB_VEN"];
    this._plf = this._model_engine.models["PLF"];
    this._plm = this._model_engine.models["PLM"];
    this._pl_gasex = this._model_engine.models["PL_GASEX"];

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  switch_placenta(state) {
    this.pl_circ_enabled = state;
    this._umb_art.is_enabled = state;
    this._umb_ven.is_enabled = state;
    this._plf.is_enabled = state;
    this._plm.is_enabled = state;
    //this._pl_gasex.is_enabled = state;
  }

  calc_model() {
    if (this.pl_circ_enabled) {
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

      this._plm.aboxy["to2"] = 6.5;
      this._plm.aboxy["tco2"] = 23.0;

      this.mat_po2 = this._plm.aboxy["po2"];
      this.mat_pco2 = this._plm.aboxy["pco2"];
      this.mat_to2 = this._plm.aboxy["to2"];
      this.mat_tco2 = this._plm.aboxy["tco2"];

      this.umb_art_flow = this._umb_art.flow;
      this.umb_art_flow_lmin = this._umb_art.umb_art_flow_lmin;
    } else {
      this.umb_art_flow = 0.0;
      this.umb_art_flow_lmin = 0.0;
      this.umb_art_velocity = 0.0;
    }
  }
}
