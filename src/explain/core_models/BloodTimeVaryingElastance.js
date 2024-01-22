export class BloodTimeVaryingElastance {
  static class_type = "BloodTimeVaryingElastance";
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  fixed_composition = false;
  u_vol = 0.0;
  el_min = 0.0;
  el_max = 0.0;
  el_k = 0.0;
  solutes = {};
  aboxy = {};
  drugs = {};

  pres_ext = 0.0;
  pres_cc = 0.0;
  pres_atm = 0.0;
  pres_mus = 0.0;

  act_factor = 0.0;
  ans_activity_factor = 1.0;

  u_vol_factor = 1.0;
  u_vol_ans_factor = 1.0;
  u_vol_drug_factor = 1.0;
  u_vol_scaling_factor = 1.0;

  el_min_factor = 1.0;
  el_min_ans_factor = 1.0;
  el_min_drug_factor = 1.0;
  el_min_scaling_factor = 1.0;

  el_max_factor = 1.0;
  el_max_ans_factor = 1.0;
  el_max_drug_factor = 1.0;
  el_max_scaling_factor = 1.0;
  el_max_mob_factor = 1.0;

  el_k_factor = 1.0;
  el_k_ans_factor = 1.0;
  el_k_drug_factor = 1.0;
  el_k_scaling_factor = 1.0;

  // dependent parameters
  vol = 0.0;
  pres = 0.0;
  pres_in = 0.0;
  pres_out = 0.0;
  pres_tm = 0.0;
  pres_ed = 0.0;
  pres_ms = 0.0;
  el = 0.0;

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;

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

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    // calculate the minimal elastance depending on the scaling factor
    let _e_min_base = this.el_min * this.el_min_scaling_factor;

    // adjust the elastance depending on the activity of the external factor, autonomic nervous system and the drug model
    let _e_min =
      _e_min_base +
      (this.el_min_factor * _e_min_base - _e_min_base) +
      (this.el_min_ans_factor * _e_min_base - _e_min_base) *
        this.ans_activity_factor +
      (this.el_min_drug_factor * _e_min_base - _e_min_base);

    // calculate the maximal elastance depending on the scaling factor
    let _e_max_base = this.el_max * this.el_max_scaling_factor;
    // adjust the elastance depending on the activity of the external factor, autonomic nervous system, the drug model and mob model
    let _e_max =
      _e_max_base +
      (this.el_max_factor * _e_max_base - _e_max_base) +
      (this.el_max_ans_factor * _e_max_base - _e_max_base) *
        this.ans_activity_factor +
      (this.el_max_drug_factor * _e_max_base - _e_max_base) +
      (this.el_max_mob_factor * _e_max_base - _e_max_base);

    // calculate the non-linear elastance factor depending on the scaling factor
    let _el_k_base = this.el_k * this.el_k_scaling_factor;

    // adjust the non-linear elastance depending on the activity of the external factor, autonomic nervous system and the drug model
    let _el_k =
      _el_k_base +
      (this.el_k_factor * _el_k_base - _el_k_base) +
      (this.el_k_ans_factor * _el_k_base - _el_k_base) *
        this.ans_activity_factor +
      (this.el_k_drug_factor * _el_k_base - _el_k_base);

    // calculate the unstressed volume depending on the scaling factor
    let _u_vol_base = this.u_vol * this.u_vol_scaling_factor;

    // adjust the unstressed volume depending on the activity of the external factor, autonomic nervous system and the drug model
    let _u_vol =
      _u_vol_base +
      (_u_vol_base * this.u_vol_factor - _u_vol_base) +
      (_u_vol_base * this.u_vol_ans_factor - _u_vol_base) *
        this.ans_activity_factor +
      (_u_vol_base * this.u_vol_drug_factor - _u_vol_base);

    // calculate the volume difference
    let vol_diff = this.vol - _u_vol;

    // calculate the end diastolic pressure
    this.pres_ed =
      _e_min * vol_diff +
      this.el_k *
        this.el_k_factor *
        this.el_k_scaling_factor *
        Math.pow(vol_diff, 2);

    this.el = ((_e_max - _e_min) * this.act_factor) / 1000.0;

    // calculate the maximal systolic pressure
    this.pres_ms = _e_max * vol_diff;
    if (this.pres_ms < this.pres_ed) {
      this.pres_ms = this.pres_ed;
    }

    // calculate the recoil pressure
    this.pres_in =
      this.act_factor * (this.pres_ms - this.pres_ed) +
      this.pres_ed +
      this.pres_atm;

    // calculate the pressures exerted by the surrounding tissues or other forces
    this.pres_out = this.pres_ext + this.pres_cc + this.pres_mus;

    // calculate the transmural pressure
    this.pres_tm = this.pres_in - this.pres_out;

    // calculate the total pressure
    this.pres = this.pres_in + this.pres_out;

    // reset the pressure which are recalculated every model iterattion
    this.pres_ext = 0.0;
    this.pres_cc = 0.0;
    this.pres_mus = 0.0;
  }

  volume_in(dvol, comp_from) {
    // increase the volume
    this.vol += dvol;
  }

  volume_out(dvol) {
    // do not change the volume if the composition is fixed
    if (this.fixed_composition) {
      return 0;
    }

    // assume all dvol can be removed
    let vol_not_removed = 0.0;

    // decrease the volume
    this.vol -= dvol;

    // guard against negative volumes
    if (this.vol < 0) {
      // so we need to remove more volume then we have which is not possible. Calculate how much volume can be removed
      // this is an undesirable situation and it means that the modeling stepsize is too large
      vol_not_removed = -this.vol;
      // reset the volume to zero
      this.vol = 0.0;
    }

    // return the amount of volume that could not be removed
    return vol_not_removed;
  }
}
