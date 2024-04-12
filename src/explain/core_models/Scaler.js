export class Scaler {
  static model_type = "Scaler";
  static model_interface = [];

  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  reference_weight = 3.545;
  reference_gestational_age = 40.0;
  reference_age = 0.0;

  left_atrium = [];
  right_atrium = [];
  left_ventricle = [];
  right_ventricle = [];
  coronaries = [];
  arteries = [];
  veins = [];
  capillaries = [];
  heart_valves = [];
  shunts = [];
  blood_connectors = [];
  pericardium = [];
  lungs = [];
  airways = [];
  thorax = [];

  // preprogrammed scaling factors
  patients = {};

  // general scaler
  scale_factor = 1.0;

  // scaler based on weight
  scale_factor_weight = 1.0;

  // scaler based on gestational age
  scale_factor_gestational_age = 1.0;

  // scaler based on age
  scale_factor_age = 1.0;

  // blood volume in L/kg
  blood_volume = 0.08;

  // lung volume in L/kg
  lung_volume = 0.03;

  // reference heartrate in bpm (-1 = no change) neonate = 110.0
  hr_ref = -1.0;

  // reference mean arterial pressure in mmHg (-1 = no change) neonate = 51.26
  map_ref = -1.0;

  // reference respiratory rate in bpm (-1 = no change) neonate = 40
  resp_rate_ref = -1.0;

  // vt/rr ratio in L/bpm/kg (-1 = no change) neonate = 0.0001212
  vt_rr_ratio = -1.0;

  // reference minute volume in L/min (-1 = no change) neonate = 0.2
  mv_ref = -1.0;

  // oxygen consumption in ml/min/kg (-1 = no change)
  vo2 = -1.0;

  // respiratory quotient  (-1 = no change)
  resp_q = -1.0;

  // heart chamber scalers
  el_min_ra_factor = 1.0;
  el_max_ra_factor = 1.0;
  u_vol_ra_factor = 1.0;

  el_min_rv_factor = 1.0;
  el_max_rv_factor = 1.0;
  u_vol_rv_factor = 1.0;

  el_min_la_factor = 1.0;
  el_min_lv_factor = 1.0;
  u_vol_la_factor = 1.0;

  el_max_la_factor = 1.0;
  el_max_lv_factor = 1.0;
  u_vol_lv_factor = 1.0;

  // coronary scalers
  el_min_cor_factor = 1.0;
  el_max_cor_factor = 1.0;
  u_vol_cor_factor = 1.0;

  // heart valve scalers
  res_valve_factor = 1.0;

  // pericardium scalers
  el_base_pericardium_factor = 1.0;
  u_vol_pericardium_factor = 1.0;

  // arteries
  el_base_art_factor = 1.0;
  u_vol_art_factor = 1.0;

  // veins
  el_base_ven_factor = 1.0;
  u_vol_ven_factor = 1.0;

  // capillaries
  el_base_cap_factor = 1.0;
  u_vol_cap_factor = 1.0;

  // blood connectors
  res_blood_connectors_factor = 1.0;
  res_shunts_factor = 1.0;

  // lungs
  el_base_lungs_factor = 1.0;
  u_vol_lungs_factor = 1.0;

  // airways
  res_airway_factor = 1.0;

  // thorax
  el_base_thorax_factor = 1.0;
  u_vol_thorax_factor = 1.0;

  // dependent parameters
  total_blood_volume = 0.0;
  total_gas_volume = 0.0;

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

    // set the reference weight
    this.reference_weight = this._model_engine.weight;
    this.reference_age = this._model_engine.age;
    this.reference_gestational_age = this._model_engine.gestational_age;

    // get the current total blood volume
    this.total_blood_volume = this.get_total_blood_volume();
    this.total_gas_volume = this.get_total_gas_volume();

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {}

  // general scaling function
  scale_patient_by_weight(
    new_weight,
    hr_ref,
    map_ref,
    resp_rate,
    mv_ref,
    vt_rr_ratio,
    vo2,
    resp_q
  ) {
    // calculate the weight scale factor and set the new weight
    this.scale_factor = 1.0;
    if (new_weight > 0.0) {
      this.scale_factor = new_weight / this._model_engine.weight;
      // set the new weight
      this._model_engine.set_weight(new_weight);
    }

    // get the current blood volume
    let total_blood_volume = this.get_total_blood_volume();

    // set the new blood volume
    this.set_total_blood_volume(total_blood_volume * this.scale_factor);

    // get the current gas volume
    let total_gas_volume = this.get_total_gas_volume();

    // set the new gas volume
    this.set_total_gas_volume(total_gas_volume * this.scale_factor);

    // scale the baroreflex of the autonomous nervous system

    // set the reference heartrate

    // set the reference respiratory rate

    // set the reference vt/rr ratio

    // set the reference minute volume

    // set the scaling factors for the heart chambers (el_max, el_min, u_vol)

    // set the scaling factors for the coronaries (el_max, el_min, u_vol)

    // set the scaling factors for the arteries (el_base, u_vol)

    // set the scaling factors for the pericardium (el_base, u_vol)

    // set the scaling factors for the veins (el_base, u_vol)

    // set the scaling factors for the capillaries (el_base, u_vol)

    // set the scaling factors for the blood connectors (r_for, r_back, r_k)

    // set the scaling factors for the heart valves (r_for, r_back, r_k)

    // set the scaling factors for the shunts (r_for, r_back, r_k)

    // set the scaling factors for the lungs (el_base, u_vol)

    // set the scaling factors for the thorax (el_base, u_vol)

    // set the scaling factors for the airways (r_for, r_back, r_k)

    // scale the metabolism

    // scale the myocardial oxygen balance model
  }

  set_total_blood_volume(new_blood_volume) {}

  set_total_gas_volume(new_gas_volume) {}

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

  get_total_gas_volume() {
    let total_volume = 0.0;
    for (let [model_name, model] of Object.entries(this._model_engine.models)) {
      if (model.model_type === "GasCapacitance") {
        if (model.is_enabled && !model.fixed_composition) {
          total_volume += model.vol;
        }
      }
    }

    return total_volume;
  }
}
