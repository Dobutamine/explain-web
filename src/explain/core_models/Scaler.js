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
  weight = 3.5;
  age = 0.0;
  gestational_age = 40.0;
  map_ref = 40.0;
  hr_ref = 140.0;
  heart = ["Heart"];
  left_atrium = [];
  right_atrium = [];
  left_ventricle = [];
  right_ventricle = [];
  coronaries = [];
  arteries = [];
  pulmonary_arteries = [];
  pulmonary_veins = [];
  systemic_arteries = [];
  systemic_veins = [];
  capillaries = [];
  heart_valves = [];
  shunts = [];
  syst_blood_connectors = [];
  pulm_blood_connectors = [];
  pericardium = [];
  lungs = [];
  airways = [];
  thorax = [];
  ans_active = false;
  mob_active = false;
  live_update = true;

  // preprogrammed scaling factors
  patients = {};

  // general scaler
  global_scale_factor = 1.0;

  // blood volume in mL/kg
  blood_volume_kg = 0.08;

  // lung volume in mL/kg
  gas_volume_kg = 0.03;

  // reference heartrate in bpm (-1 = no change) neonate = 110.0
  hr_ref = 1.0;

  // reference mean arterial pressure in mmHg (-1 = no change) neonate = 51.26
  map_ref = 1.0;

  // reference minute volume in bpm (-1 = no change) neonate = 40
  minute_volume_ref_scaling_factor = 1.0;

  // vt/rr ratio in L/bpm/kg (-1 = no change) neonate = 0.0001212
  vt_rr_ratio_scaling_factor = 1.0;

  // oxygen consumption in ml/min/kg (-1 = no change)
  vo2_scaling_factor = 1.0;

  // respiratory quotient  (-1 = no change)
  resp_q_scaling_factor = 1.0;

  // heart chamber scalers
  el_min_atrial_factor = 1.0;
  el_max_atrial_factor = 1.0;

  el_min_ventricular_factor = 1.0;
  el_max_ventricular_factor = 1.0;

  u_vol_atrial_factor = 1.0;
  u_vol_ventricular_factor = 1.0;

  // coronary scalers
  el_min_cor_factor = 1.0;
  el_max_cor_factor = 1.0;
  u_vol_cor_factor = 1.0;

  // heart valve scalers
  res_valve_factor = 1.0;

  // pericardium scalers
  el_base_pericardium_factor = 1.0;
  u_vol_pericardium_factor = 1.0;

  // systemic arteries
  el_base_syst_art_factor = 1.0;
  u_vol_syst_art_factor = 1.0;

  // pulmonary arteries
  el_base_pulm_art_factor = 1.0;
  u_vol_pulm_art_factor = 1.0;

  // systemic veins
  el_base_syst_ven_factor = 1.0;
  u_vol_syst_ven_factor = 1.0;

  // pulmonary veins
  el_base_pulm_ven_factor = 1.0;
  u_vol_pulm_ven_factor = 1.0;

  // capillaries
  el_base_cap_factor = 1.0;
  u_vol_cap_factor = 1.0;

  // systemic blood connectors
  res_syst_blood_connectors_factor = 1.0;

  // pulmonary blood connectors
  res_pulm_blood_connectors_factor = 1.0;

  // shunts
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
  _debug = false;
  _update_counter = 0.0;
  _update_window = 1.0;

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

    // get the current settings
    this.weight = this._model_engine.weight;
    this.age = this._model_engine.age;
    this.gestational_age = this._model_engine.gestational_age;
    this.map_ref = this._model_engine.models["Ans"].set_map;
    this.hr_ref = this._model_engine.models["Heart"].heart_rate_ref;
    this.vo2_scaling_factor =
      this._model_engine.models["Metabolism"].vo2_scaling_factor;
    this.resp_q_scaling_factor =
      this._model_engine.models["Metabolism"].resp_q_scaling_factor;
    this.ans_active = this._model_engine.models["Ans"].ans_active;
    this.mob_active = this._model_engine.models["Mob"].mob_active;
    this.minute_volume_ref_scaling_factor =
      this._model_engine.models["Breathing"].minute_volume_ref_scaling_factor;
    this.vt_rr_ratio_scaling_factor =
      this._model_engine.models["Breathing"].vt_rr_ratio_scaling_factor;

    // get the current total blood volume
    this.blood_volume_kg =
      this.get_total_blood_volume() / this._model_engine.weight;
    this.gas_volume_kg =
      this.get_total_gas_volume() / this._model_engine.weight;

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized && this.live_update) {
      this.calc_model();
    }
  }

  toggle_ans(ans_active) {
    this.ans_active = ans_active;
    // update the activity of the ans
    this._model_engine.models["Ans"].ans_active = this.ans_active;
  }

  toggle_mob(mob_active) {
    this.mob_active = mob_active;
    // update the activity of the ans
    this._model_engine.models["Mob"].mob_active = this.mob_active;
  }

  calc_model() {
    if (this._update_counter > this._update_window) {
      this._update_counter = 0.0;

      // scale pericardium
      this.scale_pericardium();

      // scale the thorax
      this.scale_thorax();

      // scale the control of breathing model
      this.scale_cob();

      // scale the metabolism
      this.scale_metabolism();

      // scale mob
      this.scale_mob();

      // scale the heart
      this.scale_heart();

      // scale the systemic arteries
      this.scale_systemic_arteries();

      // scale the pulmonary arteries
      this.scale_pulmonary_arteries();

      // scale the capillaries
      this.scale_capillaries();

      // scale the systemic veins
      this.scale_systemic_veins();

      // scale the pulmonary veins
      this.scale_pulmonary_veins();

      // scale the systemic blood connectors
      this.scale_syst_blood_connectors();

      // scale the pulmonary blood connectors
      this.scale_pulm_blood_connectors();

      // scale the shunts
      this.scale_shunts();

      // scale the valves
      this.scale_heart_valves();

      // scale the lung
      this.scale_lungs();

      // scale the airways
      this.scale_airways();
    }
    this._update_counter += this._t;
  }

  freeze_scaling() {}

  freeze_factors() {}

  // scale by weight function where the global scaler is dependent on the weight change
  scale_weight(new_weight) {
    if (this._debug) {
      console.log(
        `Scaling weight from ${(this.weight * 1000).toFixed(0)} grams to ${(
          new_weight * 1000
        ).toFixed(0)} grams`
      );
    }

    // calculate the scaling factor based on the weight. This factor is relative to the baseline neonate
    this.global_scale_factor = new_weight / this.reference_weight;

    // set the new weight
    this.weight = new_weight;
    this._model_engine.weight = new_weight;

    // scale whole patient
    this.scale_patient();
  }

  scale_ans_hr(hr_ref) {
    this.scale_ans(hr_ref, this.map_ref);
  }

  scale_ans_map(map_ref) {
    this.scale_ans(this.hr_ref, map_ref);
  }

  scale_ans(hr_ref, map_ref) {
    // store the new values
    this.hr_ref = hr_ref;
    this.map_ref = map_ref;

    // set the reference heart rate
    if (this._debug) {
      console.log(
        `Setting reference heartrate from ${this._model_engine.models["Heart"].heart_rate_ref} bpm to ${this.hr_ref} bpm`
      );
    }
    this._model_engine.models["Heart"].heart_rate_ref = this.hr_ref;
    this._model_engine.models["Heart"].heart_rate_forced = this.hr_ref;
    console.log(this.ans_active);
    this._model_engine.models["Heart"].heart_rate_override = !this.ans_active;

    // adjust the baroreceptor
    if (this._debug) {
      console.log(
        `Setting mean arterial pressure setpoint from ${this._model_engine.models["Ans"].set_map} mmHg to ${this.map_ref} mmHg`
      );
    }
    this._model_engine.models["Ans"].min_map = this.map_ref / 2.0;
    this._model_engine.models["Ans"].set_map = this.map_ref;
    this._model_engine.models["Ans"].max_map = this.map_ref * 2.0;
    this._model_engine.models["Ans"].init_effectors();

    this._model_engine.models["Ans"].ans_active = this.ans_active;
  }

  scale_cob() {
    this._model_engine.models["Breathing"].minute_volume_ref_scaling_factor =
      this.minute_volume_ref_scaling_factor;

    this._model_engine.models["Breathing"].vt_rr_ratio_scaling_factor =
      this.vt_rr_ratio_scaling_factor;
  }

  scale_heart() {
    // right atrium
    this.right_atrium.forEach((ra) => {
      // change the unstressed volume
      this._model_engine.models[ra].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_atrial_factor;

      // change the minimal and maximal elastance
      this._model_engine.models[ra].el_min_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_min_atrial_factor;

      this._model_engine.models[ra].el_max_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_max_atrial_factor;
    });

    // right ventricle
    this.right_ventricle.forEach((rv) => {
      // change the unstressed volume
      this._model_engine.models[rv].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_ventricular_factor;

      // change the minimal and maximal elastance
      this._model_engine.models[rv].el_min_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_min_ventricular_factor;

      this._model_engine.models[rv].el_max_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_max_ventricular_factor;
    });

    // left atrium
    this.left_atrium.forEach((la) => {
      // change the unstressed volume
      this._model_engine.models[la].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_atrial_factor;

      // change the minimal and maximal elastance
      this._model_engine.models[la].el_min_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_min_atrial_factor;

      this._model_engine.models[la].el_max_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_max_atrial_factor;
    });

    // left ventricle
    this.left_ventricle.forEach((lv) => {
      // change the unstressed volume
      this._model_engine.models[lv].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_ventricular_factor;

      // change the minimal and maximal elastance
      this._model_engine.models[lv].el_min_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_min_ventricular_factor;

      this._model_engine.models[lv].el_max_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_max_ventricular_factor;
    });

    // coronaries
    this.coronaries.forEach((cor) => {
      // change the unstressed volume
      this._model_engine.models[cor].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_cor_factor;

      // change the minimal and maximal elastance
      this._model_engine.models[cor].el_min_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_min_cor_factor;

      this._model_engine.models[cor].el_max_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_max_cor_factor;
    });
  }

  scale_total_blood_volume(new_blood_volume_kg) {
    // determine the new absolute blood volume in liters
    this.blood_volume_kg = new_blood_volume_kg;

    let target_blood_volume = new_blood_volume_kg * this.weight;

    // get the current total blood volume
    let current_volume = this.get_total_blood_volume();

    // calculate the change of the total volume
    let scale_factor = target_blood_volume / current_volume;

    this.right_atrium.forEach((c) => {
      // change the current volume
      this._model_engine.models[c].vol =
        this._model_engine.models[c].vol * scale_factor;
    });
    this.left_atrium.forEach((c) => {
      // change the current volume
      this._model_engine.models[c].vol =
        this._model_engine.models[c].vol * scale_factor;
    });
    this.right_ventricle.forEach((c) => {
      // change the current volume
      this._model_engine.models[c].vol =
        this._model_engine.models[c].vol * scale_factor;
    });
    this.left_ventricle.forEach((c) => {
      // change the current volume
      this._model_engine.models[c].vol =
        this._model_engine.models[c].vol * scale_factor;
    });
    this.coronaries.forEach((c) => {
      // change the current volume
      this._model_engine.models[c].vol =
        this._model_engine.models[c].vol * scale_factor;
    });
    this.systemic_arteries.forEach((c) => {
      // change the current volume
      this._model_engine.models[c].vol =
        this._model_engine.models[c].vol * scale_factor;
    });
    this.pulmonary_arteries.forEach((c) => {
      // change the current volume
      this._model_engine.models[c].vol =
        this._model_engine.models[c].vol * scale_factor;
    });
    this.capillaries.forEach((c) => {
      // change the current volume
      this._model_engine.models[c].vol =
        this._model_engine.models[c].vol * scale_factor;
    });
    this.systemic_veins.forEach((c) => {
      // change the current volume
      this._model_engine.models[c].vol =
        this._model_engine.models[c].vol * scale_factor;
    });
    this.pulmonary_veins.forEach((c) => {
      // change the current volume
      this._model_engine.models[c].vol =
        this._model_engine.models[c].vol * scale_factor;
    });
    this.pericardium.forEach((c) => {
      // change the current volume
      this._model_engine.models[c].vol =
        this._model_engine.models[c].vol * scale_factor;
    });
  }

  scale_total_lung_volume(new_gas_volume_kg) {
    this.gas_volume_kg = new_gas_volume_kg;

    // determine the new absolute lung volume in liters
    let target_gas_volume = this.gas_volume_kg * this.weight;

    // get the current total blood volume
    let current_volume = this.get_total_gas_volume();

    // calculate the change of the total volume
    let scale_factor = target_gas_volume / current_volume;

    this.lungs.forEach((c) => {
      // change the current volume
      this._model_engine.models[c].vol =
        this._model_engine.models[c].vol * scale_factor;
    });
    this.thorax.forEach((c) => {
      // change the current volume
      this._model_engine.models[c].vol =
        this._model_engine.models[c].vol * scale_factor;
    });
  }

  scale_systemic_arteries() {
    this.systemic_arteries.forEach((art) => {
      // change the unstressed volume
      this._model_engine.models[art].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_syst_art_factor;

      // change baseline elastance
      this._model_engine.models[art].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_syst_art_factor;
    });
  }

  scale_pulmonary_arteries() {
    this.pulmonary_arteries.forEach((art) => {
      // change the unstressed volume
      this._model_engine.models[art].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_pulm_art_factor;

      // change baseline elastance
      this._model_engine.models[art].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_pulm_art_factor;
    });
  }

  scale_capillaries() {
    this.capillaries.forEach((cap) => {
      // change the unstressed volume
      this._model_engine.models[cap].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_cap_factor;

      // change baseline elastance
      this._model_engine.models[cap].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_cap_factor;
    });
  }

  scale_systemic_veins() {
    this.systemic_veins.forEach((ven) => {
      // change the unstressed volume
      this._model_engine.models[ven].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_syst_ven_factor;

      // change baseline elastance
      this._model_engine.models[ven].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_syst_ven_factor;
    });
  }

  scale_pulmonary_veins() {
    this.pulmonary_veins.forEach((ven) => {
      // change the unstressed volume
      this._model_engine.models[ven].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_pulm_ven_factor;

      // change baseline elastance
      this._model_engine.models[ven].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_pulm_ven_factor;
    });
  }

  scale_syst_blood_connectors() {
    this.syst_blood_connectors.forEach((con) => {
      this._model_engine.models[con].r_scaling_factor =
        (1.0 / this.global_scale_factor) *
        this.res_syst_blood_connectors_factor;
    });
  }

  scale_pulm_blood_connectors() {
    this.pulm_blood_connectors.forEach((con) => {
      this._model_engine.models[con].r_scaling_factor =
        (1.0 / this.global_scale_factor) *
        this.res_pulm_blood_connectors_factor;
    });
  }

  scale_shunts() {
    this.shunts.forEach((con) => {
      this._model_engine.models[con].r_scaling_factor =
        (1.0 / this.global_scale_factor) * this.res_shunts_factor;
    });
  }

  scale_heart_valves() {
    this.heart_valves.forEach((valve) => {
      this._model_engine.models[valve].r_scaling_factor =
        (1.0 / this.global_scale_factor) * this.res_valve_factor;
    });
  }

  scale_pericardium() {
    this.pericardium.forEach((pc) => {
      // change the unstressed volume
      this._model_engine.models[pc].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_pericardium_factor;

      // change baseline elastance
      this._model_engine.models[pc].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_pericardium_factor;
    });
  }

  scale_lungs() {
    this.lungs.forEach((lung) => {
      // change the unstressed volume
      this._model_engine.models[lung].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_lungs_factor;

      // change baseline elastance
      this._model_engine.models[lung].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_lungs_factor;
    });
  }

  scale_airways() {
    this.airways.forEach((aw) => {
      this._model_engine.models[aw].r_scaling_factor =
        (1.0 / this.global_scale_factor) * this.res_airway_factor;
    });
  }

  scale_thorax() {
    this.thorax.forEach((th) => {
      // change the unstressed volume
      this._model_engine.models[th].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_thorax_factor;

      // change baseline elastance
      this._model_engine.models[th].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_thorax_factor;
    });
  }

  scale_metabolism() {
    // scale the vo2
    this._model_engine.models["Metabolism"].vo2_scaling_factor =
      this.vo2_scaling_factor;
    this._model_engine.models["Metabolism"].resp_q_scaling_factor =
      this.resp_q_scaling_factor;
  }

  scale_mob() {}

  scale_patient() {
    // scale total blood volume
    this.scale_total_blood_volume(this.blood_volume_kg);

    // scale total lung volume
    this.scale_total_lung_volume(this.gas_volume_kg);

    // scale pericardium
    this.scale_pericardium();

    // scale the thorax
    this.scale_thorax();

    // scale the baroreflex of the autonomous nervous system
    this.scale_ans(this.hr_ref, this.map_ref);

    // scale the control of breathing model
    this.scale_cob();

    // scale the metabolism
    this.scale_metabolism();

    // scale mob
    this.scale_mob();

    // scale the heart
    this.scale_heart();

    // scale the systemic arteries
    this.scale_systemic_arteries();

    // scale the pulmonary arteries
    this.scale_pulmonary_arteries();

    // scale the capillaries
    this.scale_capillaries();

    // scale the systemic veins
    this.scale_systemic_veins();

    // scale the pulmonary veins
    this.scale_pulmonary_veins();

    // scale the systemic blood connectors
    this.scale_syst_blood_connectors();

    // scale the pulmonary blood connectors
    this.scale_pulm_blood_connectors();

    // scale the shunts
    this.scale_shunts();

    // scale the valves
    this.scale_heart_valves();

    // scale the lung
    this.scale_lungs();

    // scale the airways
    this.scale_airways();

    // get the current total blood and gas volume in l/kg
    this.blood_volume_kg =
      this.get_total_blood_volume() / this._model_engine.weight;

    this.gas_volume_kg =
      this.get_total_gas_volume() / this._model_engine.weight;
  }

  get_total_blood_volume() {
    let total_volume = 0.0;
    for (let [_, model] of Object.entries(this._model_engine.models)) {
      if (
        model.model_type === "BloodCapacitance" ||
        model.model_type === "BloodTimeVaryingElastance"
      ) {
        if (model.is_enabled && model.scalable) {
          total_volume += model.vol;
        }
      }
    }

    return total_volume;
  }

  get_total_gas_volume() {
    let total_volume = 0.0;
    for (let [_, model] of Object.entries(this._model_engine.models)) {
      if (model.model_type === "GasCapacitance") {
        if (model.is_enabled && !model.fixed_composition && model.scalable) {
          total_volume += model.vol;
        }
      }
    }

    return total_volume;
  }
}
