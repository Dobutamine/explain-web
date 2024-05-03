export class Scaler {
  static model_type = "Scaler";
  static model_interface = [
    {
      target: "scale_patient_by_weight",
      caption: "scale by weight",
      type: "function",
      optional: false,
      args: [
        {
          target: "weight",
          caption: "weight (grams)",
          type: "number",
          factor: 1000,
          delta: 10,
          rounding: 0,
          ul: 100000.0,
          ll: 10.0,
        },
        {
          target: "blood_volume_ml_kg",
          caption: "blood volume (ml/kg)",
          type: "number",
          factor: 1000,
          delta: 1,
          rounding: 0,
          ul: 300.0,
          ll: 10.0,
        },
        {
          target: "gas_volume_ml_kg",
          caption: "lung volume (ml/kg)",
          type: "number",
          factor: 1000,
          delta: 1,
          rounding: 0,
          ul: 300.0,
          ll: 10.0,
        },
        {
          target: "hr_ref",
          caption: "ref heartrate (bpm)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 300.0,
          ll: 10.0,
        },
        {
          target: "map_ref",
          caption: "ref mean arterial pressure (mmHg)",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 300.0,
          ll: 10.0,
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
  reference_weight = 3.545;
  reference_gestational_age = 40.0;
  reference_age = 0.0;
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
  global_scale_factor = 1.0;

  // blood volume in mL/kg
  blood_volume_ml_kg = 0.08;

  // lung volume in mL/kg
  gas_volume_ml_kg = 0.03;

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
  _debug = true;

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

    // get the current total blood volume
    this.blood_volume_ml_kg =
      this.get_total_blood_volume() / this._model_engine.weight;
    this.gas_volume_ml_kg =
      this.get_total_gas_volume() / this._model_engine.weight;

    // set the flag to model is initialized
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {}

  // scale by weight function where the global scaler is dependent on the weight change
  scale_patient_by_weight(
    new_weight,
    target_blood_volume_kg,
    target_gas_volume_kg,
    hr_ref,
    map_ref
  ) {
    // calculate the scaling factor based on the weight. This factor is relative to the baseline neonate
    let global_scale_factor = new_weight / this.reference_weight;

    // calculate the weight dependent target blood volume
    let current_blood_volume = this.get_total_blood_volume();
    let target_blood_volume = target_blood_volume_kg * new_weight;

    // calculate the weight dependent target gas volume
    let current_gas_volume = this.get_total_gas_volume();
    let target_gas_volume = target_gas_volume_kg * new_weight;

    if (this._debug) {
      console.log(
        `Scaling weight from ${(this.weight * 1000).toFixed(0)} grams to ${(
          new_weight * 1000
        ).toFixed(0)} grams`
      );
      console.log(
        `Scaling blood volume from ${(current_blood_volume * 1000).toFixed(
          0
        )} ml to ${(target_blood_volume * 1000).toFixed(1)} ml`
      );
      console.log(
        `Scaling gas volume from ${(current_gas_volume * 1000).toFixed(
          0
        )} ml to ${(target_gas_volume * 1000).toFixed(1)} ml`
      );
    }

    // set the new weight
    this._model_engine.weight = new_weight;

    // scale the patient
    this.scale_patient(
      global_scale_factor,
      target_blood_volume,
      target_gas_volume,
      hr_ref,
      map_ref
    );
  }

  scale_patient(
    global_scale_factor,
    target_blood_volume,
    target_gas_volume,
    hr_ref,
    map_ref
  ) {
    // scale the baroreflex of the autonomous nervous system
    this.scale_ans(hr_ref, map_ref);

    // scale total blood volume
    this.scale_total_blood_volume(target_blood_volume);

    // scale total lung volume
    this.scale_total_lung_volume(target_gas_volume);

    // scale pericardium
    this.scale_pericardium(global_scale_factor);

    // scale the thorax
    this.scale_thorax(global_scale_factor);

    // scale the control of breathing model
    this.scale_cob(global_scale_factor);

    // scale the metabolism
    this.scale_metabolism(global_scale_factor);

    // scale mob
    this.scale_mob(global_scale_factor);

    // scale the heart
    this.scale_heart(global_scale_factor);

    // scale the arteries
    this.scale_arteries(global_scale_factor);

    // scale the capillaries
    this.scale_capillaries(global_scale_factor);

    // scale the veins
    this.scale_veins(global_scale_factor);

    // scale the blood connectors
    this.scale_blood_connectors(global_scale_factor);

    // scale the shunts
    this.scale_shunts(global_scale_factor);

    // scale the valves
    this.scale_heart_valves(global_scale_factor);

    // scale the lung
    this.scale_lungs(global_scale_factor);

    // scale the airways
    this.scale_airways(global_scale_factor);

    // store the global scale factor
    this.global_scale_factor = global_scale_factor;

    // store the reference heart rate and map reference as they are not weight based
    this.hr_ref = hr_ref;
    this.map_ref = map_ref;

    // get the current total blood and gas volume in ml/kg
    this.blood_volume_ml_kg =
      this.get_total_blood_volume() / this._model_engine.weight;
    this.gas_volume_ml_kg =
      this.get_total_gas_volume() / this._model_engine.weight;
  }

  scale_ans(hr_ref, map_ref) {
    // set the reference heart rate
    if (this._debug) {
      console.log(
        `Setting reference heartrate from ${this._model_engine.models["Heart"].heart_rate_ref} bpm to ${hr_ref} bpm`
      );
    }
    this._model_engine.models["Heart"].heart_rate_ref = hr_ref;

    // adjust the baroreceptor
    if (this._debug) {
      console.log(
        `Setting mean arterial pressure setpoint from ${this._model_engine.models["Ans"].set_map} mmHg to ${map_ref} mmHg`
      );
    }
    this._model_engine.models["Ans"].min_map = map_ref / 2.0;
    this._model_engine.models["Ans"].set_map = map_ref;
    this._model_engine.models["Ans"].max_map = map_ref * 2.0;
    this._model_engine.models["Ans"].init_effectors();
  }

  scale_cob() {
    // as the reference minute volume and reference vt_rr ratio are already weight based we don't need to change these
  }

  scale_heart(scale_factor) {
    // right atrium
    this.right_atrium.forEach((ra) => {
      // change the unstressed volume
      this._model_engine.models[ra].u_vol_scaling_factor =
        scale_factor * this.u_vol_ra_factor;

      // change the minimal and maximal elastance
      this._model_engine.models[ra].el_min_scaling_factor =
        (1.0 / scale_factor) * this.el_min_ra_factor;

      this._model_engine.models[ra].el_max_scaling_factor =
        (1.0 / scale_factor) * this.el_max_ra_factor;
    });

    // right ventricle
    this.right_ventricle.forEach((rv) => {
      // change the unstressed volume
      this._model_engine.models[rv].u_vol_scaling_factor =
        scale_factor * this.u_vol_rv_factor;

      // change the minimal and maximal elastance
      this._model_engine.models[rv].el_min_scaling_factor =
        (1.0 / scale_factor) * this.el_min_rv_factor;

      this._model_engine.models[rv].el_max_scaling_factor =
        (1.0 / scale_factor) * this.el_max_rv_factor;
    });

    // left atrium
    this.left_atrium.forEach((la) => {
      // change the unstressed volume
      this._model_engine.models[la].u_vol_scaling_factor =
        scale_factor * this.u_vol_la_factor;

      // change the minimal and maximal elastance
      this._model_engine.models[la].el_min_scaling_factor =
        (1.0 / scale_factor) * this.el_min_la_factor;

      this._model_engine.models[la].el_max_scaling_factor =
        (1.0 / scale_factor) * this.el_max_la_factor;
    });

    // left ventricle
    this.left_ventricle.forEach((lv) => {
      // change the unstressed volume
      this._model_engine.models[lv].u_vol_scaling_factor =
        scale_factor * this.u_vol_lv_factor;

      // change the minimal and maximal elastance
      this._model_engine.models[lv].el_min_scaling_factor =
        (1.0 / scale_factor) * this.el_min_lv_factor;

      this._model_engine.models[lv].el_max_scaling_factor =
        (1.0 / scale_factor) * this.el_max_lv_factor;
    });

    // coronaries
    this.coronaries.forEach((cor) => {
      // change the unstressed volume
      this._model_engine.models[cor].u_vol_scaling_factor =
        scale_factor * this.u_vol_cor_factor;

      // change the minimal and maximal elastance
      this._model_engine.models[cor].el_min_scaling_factor =
        (1.0 / scale_factor) * this.el_min_cor_factor;

      this._model_engine.models[cor].el_max_scaling_factor =
        (1.0 / scale_factor) * this.el_max_cor_factor;
    });
  }

  scale_total_blood_volume(target_blood_volume) {
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
    this.arteries.forEach((c) => {
      // change the current volume
      this._model_engine.models[c].vol =
        this._model_engine.models[c].vol * scale_factor;
    });
    this.capillaries.forEach((c) => {
      // change the current volume
      this._model_engine.models[c].vol =
        this._model_engine.models[c].vol * scale_factor;
    });
    this.veins.forEach((c) => {
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

  scale_total_lung_volume(target_gas_volume) {
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

  scale_arteries(scale_factor) {
    this.arteries.forEach((art) => {
      // change the unstressed volume
      this._model_engine.models[art].u_vol_scaling_factor =
        scale_factor * this.u_vol_art_factor;

      // change baseline elastance
      this._model_engine.models[art].el_base_scaling_factor =
        (1.0 / scale_factor) * this.el_base_art_factor;
    });
  }

  scale_capillaries(scale_factor) {
    this.capillaries.forEach((cap) => {
      // change the unstressed volume
      this._model_engine.models[cap].u_vol_scaling_factor =
        scale_factor * this.u_vol_cap_factor;

      // change baseline elastance
      this._model_engine.models[cap].el_base_scaling_factor =
        (1.0 / scale_factor) * this.el_base_cap_factor;
    });
  }

  scale_veins(scale_factor) {
    this.veins.forEach((ven) => {
      // change the unstressed volume
      this._model_engine.models[ven].u_vol_scaling_factor =
        scale_factor * this.u_vol_ven_factor;

      // change baseline elastance
      this._model_engine.models[ven].el_base_scaling_factor =
        (1.0 / scale_factor) * this.el_base_ven_factor;
    });
  }

  scale_blood_connectors(scale_factor) {
    this.blood_connectors.forEach((con) => {
      this._model_engine.models[con].r_scaling_factor =
        (1.0 / scale_factor) * this.res_valve_factor;
    });
  }

  scale_shunts(scale_factor) {
    this.shunts.forEach((con) => {
      this._model_engine.models[con].r_scaling_factor =
        (1.0 / scale_factor) * this.res_valve_factor;
    });
  }

  scale_heart_valves(scale_factor) {
    this.heart_valves.forEach((valve) => {
      this._model_engine.models[valve].r_scaling_factor =
        (1.0 / scale_factor) * this.res_valve_factor;
    });
  }

  scale_pericardium(scale_factor) {
    this.pericardium.forEach((pc) => {
      // change the unstressed volume
      this._model_engine.models[pc].u_vol_scaling_factor =
        scale_factor * this.u_vol_pericardium_factor;

      // change baseline elastance
      this._model_engine.models[pc].el_base_scaling_factor =
        (1.0 / scale_factor) * this.el_base_pericardium_factor;
    });
  }

  scale_lungs(scale_factor) {
    this.lungs.forEach((lung) => {
      // change the unstressed volume
      this._model_engine.models[lung].u_vol_scaling_factor =
        scale_factor * this.u_vol_lungs_factor;

      // change baseline elastance
      this._model_engine.models[lung].el_base_scaling_factor =
        (1.0 / scale_factor) * this.el_base_lungs_factor;
    });
  }

  scale_airways(scale_factor) {
    this.airways.forEach((aw) => {
      this._model_engine.models[aw].r_scaling_factor =
        (1.0 / scale_factor) * this.res_airway_factor;
    });
  }

  scale_thorax(scale_factor) {
    this.thorax.forEach((th) => {
      // change the unstressed volume
      this._model_engine.models[th].u_vol_scaling_factor =
        scale_factor * this.u_vol_thorax_factor;

      // change baseline elastance
      this._model_engine.models[th].el_base_scaling_factor =
        (1.0 / scale_factor) * this.el_base_thorax_factor;
    });
  }

  scale_metabolism(scale_factor) {}

  scale_mob(scale_factor) {}

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
