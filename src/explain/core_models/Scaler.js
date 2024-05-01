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
          type: "number",
          factor: 1000,
          delta: 10,
          rounding: 0,
          ul: 100000.0,
          ll: 10.0,
        },
        {
          target: "hr_ref",
          type: "number",
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 300.0,
          ll: 10.0,
        },
        {
          target: "map_ref",
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

    // get the current settings
    this.weight = this._model_engine.weight;
    this.age = this._model_engine.age;
    this.gestational_age = this._model_engine.gestational_age;
    this.map_ref = this._model_engine.models["Ans"].set_map;
    this.hr_ref = this._model_engine.models["Heart"].heart_rate_ref;

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
  scale_patient_by_weight(new_weight, hr_ref, map_ref) {
    // get the current settings
    this.weight = this._model_engine.weight;
    this.age = this._model_engine.age;
    this.gestational_age = this._model_engine.gestational_age;
    this.map_ref = this._model_engine.models["Ans"].set_map;
    this.hr_ref = this._model_engine.models["Heart"].heart_rate_ref;

    // calculate the weight scale factor and set the new weight
    this.scale_factor = 1.0;
    if (new_weight > 0.0) {
      this.scale_factor = new_weight / this._model_engine.weight;
      // set the new weight
      this._model_engine.weight = new_weight;
      this.weight = this._model_engine.weight;
    }

    // scale the blood volume
    this.scale_total_blood_volume(this.scale_factor);

    // scale the gas volume
    this.scale_total_gas_volume(this.scale_factor);

    // set the reference heartrate which is not weight based
    this._model_engine.models["Heart"].heart_rate_ref = hr_ref;

    // scale the baroreflex of the autonomous nervous system
    this._model_engine.models["Ans"].min_map = map_ref / 2.0;
    this._model_engine.models["Ans"].set_map = map_ref;
    this._model_engine.models["Ans"].max_map = map_ref * 2.0;
    this._model_engine.models["Ans"].init_effectors();

    // // set the scaling factors for the heart chambers (el_max, el_min, u_vol)
    // this.left_atrium.forEach((la) => {
    //   this._model_engine.models[la].el_min_scaling_factor =
    //     this.scale_factor * this.el_min_la_factor;
    //   this._model_engine.models[la].el_max_scaling_factor =
    //     this.scale_factor * this.el_max_la_factor;
    // });

    // this.left_ventricle.forEach((lv) => {
    //   this._model_engine.models[lv].el_min_scaling_factor =
    //     this.scale_factor * this.el_min_lv_factor;
    //   this._model_engine.models[lv].el_max_scaling_factor =
    //     this.scale_factor * this.el_max_lv_factor;
    // });

    // this.right_atrium.forEach((ra) => {
    //   this._model_engine.models[ra].el_min_scaling_factor =
    //     this.scale_factor * this.el_min_ra_factor;
    //   this._model_engine.models[ra].el_max_scaling_factor =
    //     this.scale_factor * this.el_max_ra_factor;
    // });

    // this.right_ventricle.forEach((rv) => {
    //   this._model_engine.models[rv].el_min_scaling_factor =
    //     this.scale_factor * this.el_min_rv_factor;
    //   this._model_engine.models[rv].el_max_scaling_factor =
    //     this.scale_factor * this.el_max_rv_factor;
    // });

    // // set the scaling factors for the coronaries (el_max, el_min, u_vol)
    // this.coronaries.forEach((cor) => {
    //   this._model_engine.models[cor].el_min_scaling_factor =
    //     this.scale_factor * this.el_min_cor_factor;
    //   this._model_engine.models[cor].el_max_scaling_factor =
    //     this.scale_factor * this.el_max_cor_factor;
    // });

    // // set the scaling factors for the arteries (el_base, u_vol)
    // this.arteries.forEach((artery) => {
    //   this._model_engine.models[artery].el_base_scaling_factor =
    //     this.scale_factor * this.el_base_art_factor;
    // });

    // // set the scaling factors for the pericardium (el_base, u_vol)
    // this.pericardium.forEach((pc) => {
    //   this._model_engine.models[pc].el_base_scaling_factor =
    //     this.scale_factor * this.el_base_pericardium_factor;
    // });

    // // set the scaling factors for the veins (el_base, u_vol)
    // this.veins.forEach((vein) => {
    //   this._model_engine.models[vein].el_base_scaling_factor =
    //     this.scale_factor * this.el_base_ven_factor;
    // });

    // // set the scaling factors for the capillaries (el_base, u_vol)
    // this.capillaries.forEach((cap) => {
    //   this._model_engine.models[cap].el_base_scaling_factor =
    //     this.scale_factor * this.el_base_cap_factor;
    // });

    // // set the scaling factors for the blood connectors (r_for, r_back, r_k)
    // this.blood_connectors.forEach((bc) => {
    //   this._model_engine.models[bc].r_scaling_factor =
    //     this.scale_factor * this.res_blood_connectors_factor;
    // });

    // // set the scaling factors for the heart valves (r_for, r_back, r_k)
    // this.heart_valves.forEach((valve) => {
    //   this._model_engine.models[valve].r_scaling_factor =
    //     this.scale_factor * this.res_valve_factor;
    // });

    // // set the scaling factors for the shunts (r_for, r_back, r_k)
    // this.shunts.forEach((shunt) => {
    //   this._model_engine.models[shunt].r_scaling_factor =
    //     this.scale_factor * this.res_shunts_factor;
    // });

    // // set the scaling factors for the lungs (el_base, u_vol)
    // this.lungs.forEach((lung) => {
    //   this._model_engine.models[lung].el_base_scaling_factor =
    //     this.scale_factor * this.el_base_lungs_factor;
    // });

    // // set the scaling factors for the thorax (el_base, u_vol)
    // this.thorax.forEach((thorax) => {
    //   this._model_engine.models[thorax].el_base_scaling_factor =
    //     this.scale_factor * this.el_base_thorax_factor;
    // });

    // // set the scaling factors for the airways (r_for, r_back, r_k)
    // this.airways.forEach((airway) => {
    //   this._model_engine.models[airway].r_scaling_factor =
    //     this.scale_factor * this.res_airway_factor;
    // });
  }

  scale_total_blood_volume(scale_factor) {
    // get the current blood volume
    let current_blood_volume = this.get_total_blood_volume();

    // scale to a new blood volume
    let new_blood_volume = current_blood_volume * scale_factor;

    // scale all enabled blood containing circulation components
    for (let [_, model] of Object.entries(this._model_engine.models)) {
      if (
        model.model_type === "BloodCapacitance" ||
        model.model_type === "BloodTimeVaryingElastance"
      ) {
        if (model.is_enabled) {
          // calculate the current fraction of the blood volume in this blood containing capacitance
          let current_fraction = model.vol / current_blood_volume;
          let vol_now = model.vol;
          let uvol_now = model.u_vol;
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

          console.log(
            `Scaled ${model.name}: volume to: {${model.vol} from ${vol_now}`
          );
          console.log(
            `Scaled ${model.name}: u_vol to: {${model.u_vol} from ${uvol_now}`
          );
        }
      }
    }
    // recalculate the current blood volume
    this.total_blood_volume = this.get_total_blood_volume();
  }

  scale_total_gas_volume(scale_factor) {
    // get the current blood volume
    let current_gas_volume = this.get_total_gas_volume();

    // scale to a new blood volume
    let new_gas_volume = current_gas_volume * scale_factor;

    // scale all enabled blood containing circulation components
    for (let [_, model] of Object.entries(this._model_engine.models)) {
      if (model.model_type === "GasCapacitance") {
        if (model.is_enabled) {
          // calculate the current fraction of the blood volume in this blood containing capacitance
          let current_fraction = model.vol / current_gas_volume;
          // calculate the current uvol/vol fraction
          let f = 0.0;
          if (model.vol > 0.0) {
            f = model.u_vol / model.vol;
          }
          // add the same fraction of the desired volume change to the blood containing capacitance
          model.vol += current_fraction * (new_gas_volume - current_gas_volume);

          // change the unstressed volume
          model.u_vol = model.vol * f;

          // guard for negative volumes
          if (model.vol < 0.0) {
            model.vol = 0.0;
          }
        }
      }
    }
    // recalculate the current blood volume
    this.total_gas_volume = this.get_total_gas_volume();
  }

  get_total_blood_volume() {
    let total_volume = 0.0;
    for (let [_, model] of Object.entries(this._model_engine.models)) {
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
    for (let [_, model] of Object.entries(this._model_engine.models)) {
      if (model.model_type === "GasCapacitance") {
        if (model.is_enabled && !model.fixed_composition) {
          total_volume += model.vol;
        }
      }
    }

    return total_volume;
  }
}
