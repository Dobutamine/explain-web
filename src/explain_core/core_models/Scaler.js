export class Scaler {
  static model_type = "Scaler";
  static model_interface = [
    {
      target: "scale_weight",
      caption: "weight",
      type: "function",
      optional: false,
      args: [
        {
          target: "weight",
          caption: "",
          type: "number",
          default: 3.545,
          factor: 1,
          delta: 0.1,
          rounding: 3,
          ul: 10.0,
          ll: 0.5,
        },
      ],
    },
    {
      target: "scale_total_blood_volume",
      caption: "blood volume per kg",
      type: "function",
      optional: false,
      args: [
        {
          target: "blood_volume_kg",
          caption: "",
          type: "number",
          default: 0.08,
          factor: 1,
          delta: 0.001,
          rounding: 3,
          ul: 1.0,
          ll: 0.01,
        },
      ],
    },
    {
      target: "scale_total_lung_volume",
      caption: "lung volume per kg",
      type: "function",
      optional: false,
      args: [
        {
          target: "gas_volume_kg",
          caption: "",
          type: "number",
          default: 0.03,
          factor: 1,
          delta: 0.001,
          rounding: 3,
          ul: 1.0,
          ll: 0.01,
        },
      ],
    },
    {
      target: "toggle_ans",
      caption: "autonomic nervous system",
      type: "function",
      optional: false,
      args: [
        {
          target: "ans_active",
          caption: "",
          type: "boolean",
        },
      ],
    },
    {
      target: "scale_ans_hr",
      caption: "ans ref heartrate",
      type: "function",
      optional: false,
      args: [
        {
          target: "hr_ref",
          caption: "",
          type: "number",
          default: 120,
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 300,
          ll: 1,
        },
      ],
    },
    {
      target: "scale_ans_map",
      caption: "ans ref mean arterial pressure",
      type: "function",
      optional: false,
      args: [
        {
          target: "map_ref",
          caption: "",
          type: "number",
          default: 57,
          factor: 1,
          delta: 1,
          rounding: 0,
          ul: 300,
          ll: 1,
        },
      ],
    },
    {
      target: "toggle_mob",
      caption: "myocardial oxygen balance",
      type: "function",
      optional: false,
      args: [
        {
          target: "mob_active",
          caption: "",
          type: "boolean",
        },
      ],
    },
    {
      target: "minute_volume_ref_scaling_factor",
      caption: "minute volume scaling factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "vt_rr_ratio_scaling_factor",
      caption: "vt/rr ratio scaling factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "vo2_scaling_factor",
      caption: "vo2 scaling factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "resp_q_scaling_factor",
      caption: "respiratory quotient scaling factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "el_min_atrial_factor",
      caption: "el min atrial factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "el_max_atrial_factor",
      caption: "el max atrial factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "el_min_ventricular_factor",
      caption: "el min ventricular factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "el_max_ventricular_factor",
      caption: "el max ventricular factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "u_vol_atrial_factor",
      caption: "u vol atrial factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "u_vol_ventricular_factor",
      caption: "u vol ventricular factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "el_min_cor_factor",
      caption: "el min coronary factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "el_max_cor_factor",
      caption: "el max coronary factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "u_vol_cor_factor",
      caption: "u vol coronary factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "res_valve_factor",
      caption: "res valve factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "el_base_pericardium_factor",
      caption: "el base pericardium factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "u_vol_pericardium_factor",
      caption: "u vol pericardium factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "el_base_syst_art_factor",
      caption: "el base syst art factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "u_vol_syst_art_factor",
      caption: "u vol syst art factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "el_base_pulm_art_factor",
      caption: "el base pulm art factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "u_vol_pulm_art_factor",
      caption: "u vol pulm art factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "el_base_syst_ven_factor",
      caption: "el base syst ven factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "u_vol_syst_ven_factor",
      caption: "u vol syst ven factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "el_base_pulm_ven_factor",
      caption: "el base pulm ven factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "u_vol_pulm_ven_factor",
      caption: "u vol pulm ven factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "el_base_cap_factor",
      caption: "el base cap factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "u_vol_cap_factor",
      caption: "u vol cap factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "res_syst_blood_connectors_factor",
      caption: "res syst blood connectors factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "res_pulm_blood_connectors_factor",
      caption: "res pulm blood connectors factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "res_shunts_factor",
      caption: "res shunts factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "el_base_lungs_factor",
      caption: "el base lungs factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "u_vol_lungs_factor",
      caption: "u vol lungs factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "res_airway_factor",
      caption: "res airway factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "el_base_thorax_factor",
      caption: "el base thorax factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
    {
      target: "u_vol_thorax_factor",
      caption: "u vol thorax factor",
      type: "number",
      default: 1.0,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: 0.01,
    },
  ];

  constructor(model_ref, name = "") {
    // Independent properties
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.reference_weight = 3.545;
    this.weight = 3.5;
    this.age = 0.0;
    this.gestational_age = 40.0;
    this.map_ref = 40.0;
    this.hr_ref = 140.0;
    this.heart = [];
    this.baroreceptor = [];
    this.metabolism = [];
    this.breathing = [];
    this.left_atrium = [];
    this.right_atrium = [];
    this.left_ventricle = [];
    this.right_ventricle = [];
    this.coronaries = [];
    this.arteries = [];
    this.pulmonary_arteries = [];
    this.pulmonary_veins = [];
    this.systemic_arteries = [];
    this.systemic_veins = [];
    this.capillaries = [];
    this.heart_valves = [];
    this.shunts = [];
    this.syst_blood_connectors = [];
    this.pulm_blood_connectors = [];
    this.pericardium = [];
    this.lungs = [];
    this.airways = [];
    this.thorax = [];
    this.blood_containing_components = [];
    this.gas_containing_components = [];

    // General scaler
    this.global_scale_factor = 1.0;
    this.blood_volume_kg = 0.08;
    this.lung_volume_kg = 0.03;

    // Reference heartrate and pressures
    this.hr_ref = 1.0;
    this.map_ref = 1.0;

    // Scaling factors for breathing, metabolism, and cardiovascular system
    this.minute_volume_ref_scaling_factor = 1.0;
    this.vt_rr_ratio_scaling_factor = 1.0;
    this.vo2_scaling_factor = 1.0;
    this.resp_q_scaling_factor = 1.0;

    // Heart chamber scalers
    this.el_min_atrial_factor = 1.0;
    this.el_max_atrial_factor = 1.0;
    this.el_min_ventricular_factor = 1.0;
    this.el_max_ventricular_factor = 1.0;
    this.u_vol_atrial_factor = 1.0;
    this.u_vol_ventricular_factor = 1.0;

    // Coronary, valve, and other scalers
    this.el_min_cor_factor = 1.0;
    this.el_max_cor_factor = 1.0;
    this.u_vol_cor_factor = 1.0;
    this.res_valve_factor = 1.0;
    this.el_base_pericardium_factor = 1.0;
    this.u_vol_pericardium_factor = 1.0;
    this.el_base_syst_art_factor = 1.0;
    this.u_vol_syst_art_factor = 1.0;
    this.el_base_pulm_art_factor = 1.0;
    this.u_vol_pulm_art_factor = 1.0;
    this.el_base_syst_ven_factor = 1.0;
    this.u_vol_syst_ven_factor = 1.0;
    this.el_base_pulm_ven_factor = 1.0;
    this.u_vol_pulm_ven_factor = 1.0;
    this.el_base_cap_factor = 1.0;
    this.u_vol_cap_factor = 1.0;
    this.res_syst_blood_connectors_factor = 1.0;
    this.res_pulm_blood_connectors_factor = 1.0;
    this.res_shunts_factor = 1.0;
    this.el_base_lungs_factor = 1.0;
    this.u_vol_lungs_factor = 1.0;
    this.res_airway_factor = 1.0;
    this.el_base_thorax_factor = 1.0;
    this.u_vol_thorax_factor = 1.0;

    // Dependent parameters
    this.total_blood_volume = 0.0;
    this.total_gas_volume = 0.0;

    // Local properties
    this._model_engine = model_ref;
    this._is_initialized = false;
    this._t = model_ref.modeling_stepsize;
  }

  init_model(args) {
    // set the values of the properties as passed in the arguments
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    this.weight = this._model_engine.weight;
    this.age = this._model_engine.age;
    this.gestational_age = this._model_engine.gestational_age;
    this._is_initialized = true;
  }

  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    // Placeholder for actual model calculations
  }

  scale_patient() {
    this.scale_total_blood_volume(this.blood_volume_kg);
    this.scale_total_lung_volume(this.lung_volume_kg);
    this.scale_pericardium();
    this.scale_thorax();
    this.scale_ans(this.hr_ref, this.map_ref);
    this.scale_cob();
    this.scale_metabolism();
    this.scale_mob();
    this.scale_heart();
    this.scale_systemic_arteries();
    this.scale_pulmonary_arteries();
    this.scale_capillaries();
    this.scale_systemic_veins();
    this.scale_pulmonary_veins();
    this.scale_syst_blood_connectors();
    this.scale_pulm_blood_connectors();
    this.scale_shunts();
    this.scale_heart_valves();
    this.scale_lungs();
    this.scale_airways();
    this.blood_volume_kg =
      this.get_total_blood_volume() / this._model_engine.weight;
    this.lung_volume_kg =
      this.get_total_lung_volume() / this._model_engine.weight;
  }

  scale_weight(new_weight) {
    this.global_scale_factor = new_weight / this.reference_weight;
    this.weight = new_weight;
    this._model_engine.weight = new_weight;
    this.scale_patient();
  }

  scale_total_blood_volume(new_blood_volume_kg) {
    this.blood_volume_kg = new_blood_volume_kg;
    const target_blood_volume = new_blood_volume_kg * this.weight;
    const current_blood_volume = this.get_total_blood_volume();
    const scale_factor = target_blood_volume / current_blood_volume;

    for (let bc of this.blood_containing_components) {
      this._model_engine.models[bc].vol *= scale_factor;
    }
  }

  scale_total_lung_volume(new_lung_volume_kg) {
    this.lung_volume_kg = new_lung_volume_kg;
    const target_lung_volume = new_lung_volume_kg * this.weight;
    const current_volume = this.get_total_lung_volume();
    const scale_factor = target_lung_volume / current_volume;

    for (let lu of this.lungs) {
      this._model_engine.models[lu].vol *= scale_factor;
    }

    for (let th of this.thorax) {
      this._model_engine.models[th].vol *= scale_factor;
    }
  }

  scale_ans(hr_ref, map_ref) {
    this.hr_ref = hr_ref;
    this.map_ref = map_ref;

    for (let he of this.heart) {
      this._model_engine.models[he].heart_rate_ref = this.hr_ref;
      this._model_engine.models[he].heart_rate_forced = this.hr_ref;
    }

    for (let br of this.baroreceptor) {
      this._model_engine.models[br].min_value = this.map_ref / 2.0;
      this._model_engine.models[br].set_value = this.map_ref;
      this._model_engine.models[br].max_value = this.map_ref * 2.0;
    }
  }

  scale_cob() {
    for (let br of this.breathing) {
      this._model_engine.models[br].minute_volume_ref_scaling_factor =
        this.minute_volume_ref_scaling_factor;
      this._model_engine.models[br].vt_rr_ratio_scaling_factor =
        this.vt_rr_ratio_scaling_factor;
    }
  }

  scale_metabolism() {
    for (let me of this.metabolism) {
      this._model_engine.models[me].vo2_scaling_factor =
        this.vo2_scaling_factor;
      this._model_engine.models[me].resp_q_scaling_factor =
        this.resp_q_scaling_factor;
    }
  }

  scale_mob() {
    // Weight-based scaling for MOB model (implementation depends on model specifics)
  }

  scale_heart() {
    const heartModels = [
      {
        components: this.right_atrium,
        volFactor: this.u_vol_atrial_factor,
        elMinFactor: this.el_min_atrial_factor,
        elMaxFactor: this.el_max_atrial_factor,
      },
      {
        components: this.left_atrium,
        volFactor: this.u_vol_atrial_factor,
        elMinFactor: this.el_min_atrial_factor,
        elMaxFactor: this.el_max_atrial_factor,
      },
      {
        components: this.right_ventricle,
        volFactor: this.u_vol_ventricular_factor,
        elMinFactor: this.el_min_ventricular_factor,
        elMaxFactor: this.el_max_ventricular_factor,
      },
      {
        components: this.left_ventricle,
        volFactor: this.u_vol_ventricular_factor,
        elMinFactor: this.el_min_ventricular_factor,
        elMaxFactor: this.el_max_ventricular_factor,
      },
    ];

    for (let model of heartModels) {
      for (let component of model.components) {
        const modelComponent = this._model_engine.models[component];
        modelComponent.u_vol_scaling_factor =
          this.global_scale_factor * model.volFactor;
        modelComponent.el_min_scaling_factor =
          (1.0 / this.global_scale_factor) * model.elMinFactor;
        modelComponent.el_max_scaling_factor =
          (1.0 / this.global_scale_factor) * model.elMaxFactor;
      }
    }

    for (let cor of this.coronaries) {
      this._model_engine.models[cor].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_cor_factor;
      this._model_engine.models[cor].el_min_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_min_cor_factor;
      this._model_engine.models[cor].el_max_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_max_cor_factor;
    }
  }

  scale_heart_valves() {
    for (let hv of this.heart_valves) {
      this._model_engine.models[hv].r_scaling_factor =
        (1.0 / this.global_scale_factor) * this.res_valve_factor;
    }
  }

  scale_pericardium() {
    for (let pc of this.pericardium) {
      this._model_engine.models[pc].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_pericardium_factor;
      this._model_engine.models[pc].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_pericardium_factor;
    }
  }

  scale_systemic_arteries() {
    for (let sa of this.systemic_arteries) {
      this._model_engine.models[sa].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_syst_art_factor;
      this._model_engine.models[sa].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_syst_art_factor;
    }
  }

  scale_systemic_veins() {
    for (let sv of this.systemic_veins) {
      this._model_engine.models[sv].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_syst_ven_factor;
      this._model_engine.models[sv].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_syst_ven_factor;
    }
  }

  scale_syst_blood_connectors() {
    for (let sbc of this.syst_blood_connectors) {
      this._model_engine.models[sbc].r_scaling_factor =
        (1.0 / this.global_scale_factor) *
        this.res_syst_blood_connectors_factor;
    }
  }

  scale_pulmonary_arteries() {
    for (let pa of this.pulmonary_arteries) {
      this._model_engine.models[pa].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_pulm_art_factor;
      this._model_engine.models[pa].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_pulm_art_factor;
    }
  }

  scale_pulmonary_veins() {
    for (let pv of this.pulmonary_veins) {
      this._model_engine.models[pv].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_pulm_ven_factor;
      this._model_engine.models[pv].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_pulm_ven_factor;
    }
  }

  scale_pulm_blood_connectors() {
    for (let pbc of this.pulm_blood_connectors) {
      this._model_engine.models[pbc].r_scaling_factor =
        (1.0 / this.global_scale_factor) *
        this.res_pulm_blood_connectors_factor;
    }
  }

  scale_capillaries() {
    for (let cap of this.capillaries) {
      this._model_engine.models[cap].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_cap_factor;
      this._model_engine.models[cap].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_cap_factor;
    }
  }

  scale_shunts() {
    for (let sh of this.shunts) {
      this._model_engine.models[sh].r_scaling_factor =
        (1.0 / this.global_scale_factor) * this.res_shunts_factor;
    }
  }

  scale_lungs() {
    for (let lu of this.lungs) {
      this._model_engine.models[lu].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_lungs_factor;
      this._model_engine.models[lu].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_lungs_factor;
    }
  }

  scale_airways() {
    for (let aw of this.airways) {
      this._model_engine.models[aw].r_scaling_factor =
        (1.0 / this.global_scale_factor) * this.res_airway_factor;
    }
  }

  scale_thorax() {
    for (let th of this.thorax) {
      this._model_engine.models[th].u_vol_scaling_factor =
        this.global_scale_factor * this.u_vol_thorax_factor;
      this._model_engine.models[th].el_base_scaling_factor =
        (1.0 / this.global_scale_factor) * this.el_base_thorax_factor;
    }
  }

  get_total_blood_volume() {
    let total_volume = 0.0;
    for (let target of this.blood_containing_components) {
      if (this._model_engine.models[target].is_enabled) {
        total_volume += this._model_engine.models[target].vol;
      }
    }
    this.total_blood_volume = total_volume;
    return total_volume;
  }

  get_total_lung_volume() {
    let total_volume = 0.0;
    for (let target of this.gas_containing_components) {
      if (this._model_engine.models[target].is_enabled) {
        total_volume += this._model_engine.models[target].vol;
      }
    }
    this.total_gas_volume = total_volume;
    return total_volume;
  }
}
