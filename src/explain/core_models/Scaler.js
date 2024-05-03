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
    // calculate the weight factor
    this.scale_factor_weight = new_weight / this.weight;

    if (this._debug) {
      console.log(
        `Scaling weight from {${this.weight} to ${new_weight} => factor: ${this.scale_factor_weight} `
      );
    }
    // set the new properties
    this.weight = new_weight;
    this.hr_ref = hr_ref;
    this.map_ref = map_ref;

    // set the new weight
    this._model_engine.weight = new_weight;

    // scale the patient
    this.scale_patient();
  }

  scale_patient_by_gestational_age(new_gestational_age, hr_ref, map_ref) {
    // calculate the gestational age factor
    this.scale_factor_gestational_age =
      new_gestational_age / this.reference_gestational_age;

    // set the new properties
    this.hr_ref = hr_ref;
    this.map_ref = map_ref;

    // scale the patient
    this.scale_patient();
  }

  scale_patient_by_age(new_age, hr_ref, map_ref) {
    // calculate the gestational age factor
    this.scale_factor_age = new_age / this.reference_age;

    // set the new properties
    this.hr_ref = hr_ref;
    this.map_ref = map_ref;

    // scale the patient
    this.scale_patient();
  }

  scale_patient() {
    console.log(this.total_blood_volume);
    console.log(this.total_gas_volume);
    // determine the current scaling factor
    this.scale_factor =
      1.0 *
      this.scale_factor_weight *
      this.scale_factor_gestational_age *
      this.scale_factor_age;

    // scale the blood volume
    //this.scale_blood_volume(this.scale_factor);

    // scale the lung volume
    //this.scale_lung_volume(this.scale_factor);

    // scale the baroreflex of the autonomous nervous system
    this.scale_ans(this.hr_ref, this.map_ref);

    // scale pericardium
    this.scale_pericardium(this.scale_factor);

    // scale the thorax
    this.scale_thorax(this.scale_factor);

    // scale the control of breathing model
    //this.scale_cob();

    // scale the metabolism
    //this.scale_metabolism();

    // scale mob
    //this.scale_mob();

    // scale the heart
    this.scale_heart(this.scale_factor);

    // scale the arteries
    this.scale_arteries(this.scale_factor);

    // scale the capillaries
    this.scale_capillaries(this.scale_factor);

    // scale the veins
    this.scale_veins(this.scale_factor);

    // scale the blood connectors
    this.scale_blood_connectors(this.scale_factor);

    // scale the valves
    this.scale_heart_valves(this.scale_factor);

    // scale the lung
    this.scale_lungs(this.scale_factor);

    // scale the airways
    this.scale_airways(this.scale_factor);

    // find blood volume
    this.total_blood_volume = this.get_total_blood_volume();
    this.total_gas_volume = this.get_total_gas_volume();

    console.log(this.total_blood_volume);
    console.log(this.total_gas_volume);
  }

  scale_blood_volume(scale_factor) {
    // get the current blood volume
    let current_blood_volume = this.get_total_blood_volume();

    // calculate the new blood volume
    let new_blood_volume = current_blood_volume * scale_factor;

    if (this._debug) {
      console.log(
        `Scale current blood volume from {${current_blood_volume} to ${new_blood_volume}`
      );
    }

    // build a list containing all blood containing model components
    let blood_containing_capacitances = [
      ...this.left_atrium,
      ...this.right_atrium,
      ...this.left_atrium,
      ...this.left_ventricle,
      ...this.arteries,
      ...this.veins,
      ...this.capillaries,
      ...this.coronaries,
    ];

    // define an output message for debugging purposes
    let output_message = "";

    // scale all blood containing capacitances
    blood_containing_capacitances.forEach((model_name) => {
      let model = this._model_engine.models[model_name];
      if (model.is_enabled) {
        let current_fraction = model.vol / current_blood_volume;
        output_message = `${model.name} volume = ${model.vol * 1000.0} ml ->`;

        // calculate the fraction of the unstressed volume of the current volume
        let fraction_unstressed = 0.0;
        if (model.vol > 0.0) {
          fraction_unstressed = model.u_vol / model.vol;
        }

        // now change the total volume by adding the same fraction of the desired volume change to the blood containing capacitance
        model.vol +=
          current_fraction * (new_blood_volume - current_blood_volume);

        // determine how much of this total volume is unstressed volume
        model.u_vol = model.vol * fraction_unstressed;

        // guard for negative volumes
        if (model.vol < 0.0) {
          model.vol = 0.0;
        }

        // construct output message
        output_message += `${model.vol * 1000.0} ml = (${
          current_fraction * 100
        }% of total blood volume)`;
        if (this._debug) {
          console.log(output_message);
        }
      }
    });

    // recalculate the current blood volume
    this.total_blood_volume = this.get_total_blood_volume();
  }

  scale_lung_volume(scale_factor) {
    // get the current gas volume
    let current_gas_volume = this.get_total_gas_volume();

    // calculate the new gas volume
    let new_gas_volume = current_gas_volume * scale_factor;

    if (this._debug) {
      console.log(
        `Scale current lung volume from {${current_gas_volume} to ${new_gas_volume}`
      );
    }

    // build a list containing all blood containing model components
    let gas_containing_capacitances = [...this.lungs];

    // define an output message for debugging purposes
    let output_message = "";

    // scale all gas containing capacitances
    gas_containing_capacitances.forEach((model_name) => {
      let model = this._model_engine.models[model_name];
      if (model.is_enabled) {
        let current_fraction = model.vol / current_gas_volume;
        output_message = `${model.name} volume = ${model.vol * 1000.0} ml ->`;

        // calculate the fraction of the unstressed volume of the current volume
        let fraction_unstressed = 0.0;
        if (model.vol > 0.0) {
          fraction_unstressed = model.u_vol / model.vol;
        }

        // now change the total volume by adding the same fraction of the desired volume change to the blood containing capacitance
        model.vol += current_fraction * (new_gas_volume - current_gas_volume);

        // determine how much of this total volume is unstressed volume
        model.u_vol = model.vol * fraction_unstressed;

        // guard for negative volumes
        if (model.vol < 0.0) {
          model.vol = 0.0;
        }

        // construct output message
        output_message += `${model.vol * 1000.0} ml = (${
          current_fraction * 100
        }% of total gas volume)`;
        if (this._debug) {
          console.log(output_message);
        }
      }
    });

    // recalculate the current gas volume
    this.total_gas_volume = this.get_total_gas_volume();
  }

  scale_ans(hr_ref, map_ref) {
    // set the reference heart rate
    if (this._debug) {
      console.log(
        `Setting reference heartrate from ${this._model_engine.models["Heart"].heart_rate_ref} to ${hr_ref}`
      );
    }
    this._model_engine.models["Heart"].heart_rate_ref = hr_ref;

    // adjust the baroreceptor
    if (this._debug) {
      console.log(
        `Setting mean arterial pressure setpoint from ${this._model_engine.models["Ans"].set_map} to ${map_ref}`
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
      // change the current volume
      this._model_engine.models[ra].vol =
        this._model_engine.models[ra].vol * scale_factor;

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
      // change the current volume
      this._model_engine.models[rv].vol =
        this._model_engine.models[rv].vol * scale_factor;

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
      // change the current volume
      this._model_engine.models[la].vol =
        this._model_engine.models[la].vol * scale_factor;

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
      // change the current volume
      this._model_engine.models[lv].vol =
        this._model_engine.models[lv].vol * scale_factor;

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
      // change the current volume
      this._model_engine.models[cor].vol =
        this._model_engine.models[cor].vol * scale_factor;

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

  scale_arteries(scale_factor) {
    this.arteries.forEach((art) => {
      // change the current volume
      this._model_engine.models[art].vol =
        this._model_engine.models[art].vol * scale_factor;

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
      // change the current volume
      this._model_engine.models[cap].vol =
        this._model_engine.models[cap].vol * scale_factor;

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
      // change the current volume
      this._model_engine.models[ven].vol =
        this._model_engine.models[ven].vol * scale_factor;

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

  scale_heart_valves(scale_factor) {
    this.heart_valves.forEach((valve) => {
      this._model_engine.models[valve].r_scaling_factor =
        (1.0 / scale_factor) * this.res_valve_factor;
    });
  }

  scale_pericardium(scale_factor) {
    this.pericardium.forEach((pc) => {
      // change the current volume
      this._model_engine.models[pc].vol =
        this._model_engine.models[pc].vol * scale_factor;

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
      // change the current volume
      this._model_engine.models[lung].vol =
        this._model_engine.models[lung].vol * scale_factor;

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
      // change the current volume
      this._model_engine.models[th].vol =
        this._model_engine.models[th].vol * scale_factor;

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
