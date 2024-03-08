import { set_blood_composition } from "../helpers/BloodComposition";

export class Blood {
  static model_type = "Blood";
  static model_interface = [];
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

  // dependent parameters
  ph = 0.0;
  pco2 = 0.0;
  po2 = 0.0;
  hco3 = 0.0;
  be = 0.0;
  so2 = 0.0;
  na = 0.0;
  k = 0.0;
  cl = 0.0;

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
  _update_interval = 1.0;
  _update_counter = 0.0;
  _aa = {};
  _ad = {};
  _ivci = {};
  _svc = {};
  _ra = {};

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

    // set the aboxy and solutes
    //  we need a pressure to calculate the composition of the gas in the gas capacitances
    for (let [model_name, model] of Object.entries(this._model_engine.models)) {
      if (
        model.model_type === "BloodCapacitance" ||
        model.model_type === "BloodTimeVaryingElastance"
      ) {
        model.aboxy = { ...this.aboxy };
        model.solutes = { ...this.solutes };
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

  set_solute_concentration(solute_name, solute_conc, targets = []) {
    if (targets.length > 0) {
      targets.forEach((target) => {
        this._model_engine.models[target].solutes[solute_name] =
          parseFloat(solute_conc);
      });
      return;
    }
    for (let [model_name, model] of Object.entries(this._model_engine.models)) {
      if (
        model.model_type === "BloodCapacitance" ||
        model.model_type === "BloodTimeVaryingElastance"
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
    for (let [model_name, model] of Object.entries(this._model_engine.models)) {
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

      this.ph_post = this._ad.aboxy.ph;
      this.po2_post = this._ad.aboxy.po2;
      this.pco2_post = this._ad.aboxy.pco2;
      this.hco3_post = this._ad.aboxy.hco3;
      this.be_post = this._ad.aboxy.be;
      this.so2_post = this._ad.aboxy.so2;

      this.ph = this.ph_post;
      this.po2 = this.po2_post;
      this.pco2 = this.pco2_post;
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
