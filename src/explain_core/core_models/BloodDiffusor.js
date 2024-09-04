export class BloodDiffusor {
  // static properties
  static model_type = "BloodDiffusor";
  static model_interface = [
    {
      target: "is_enabled",
      caption: "is enabled",
      type: "boolean",
      default: true,
    },
    {
      target: "dif_o2",
      caption: "oxygen diffusion constant (mmol/mmHg*sec) ",
      type: "number",
      default: 0.01,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: -10000000.0,
    },
    {
      target: "dif_co2",
      caption: "carbon dioxide diffusion constant (mmol/mmHg*sec) ",
      type: "number",
      default: 0.01,
      factor: 1,
      delta: 0.01,
      rounding: 2,
      ul: 100000000.0,
      ll: -10000000.0,
    },
    {
      target: "comp_blood1",
      caption: "blood compartment 1",
      type: "list",
      options: ["BloodCapacitance", "BloodTimeVaryingElastance"],
    },
    {
      target: "comp_blood2",
      caption: "blood compartment 2",
      type: "list",
      options: ["BloodCapacitance", "BloodTimeVaryingElastance"],
    },

    {
      target: "reconnect",
      caption: "reconnect diffusor",
      type: "function",
      optional: true,
      args: [
        {
          target: "comp_blood1",
          type: "list",
          options: ["BloodCapacitance", "BloodTimeVaryingElastance"],
        },
        {
          target: "comp_blood2",
          type: "list",
          options: ["BloodCapacitance", "BloodTimeVaryingElastance"],
        },
      ],
    },
  ];

  constructor(model_ref, name = "") {
    // independent properties
    this.name = name;
    this.description = "";
    this.is_enabled = false;
    this.dependencies = [];
    this.solutes = [];
    this.drugs = [];
    this.aboxy = [];
    this.comp_blood1 = null;
    this.comp_blood2 = null;
    this.dif_cap = 0.01;
    this.dif_cap_factor = 1.0;
    this.dif_cap_scaling_factor = 1.0;

    // dependent properties
    this.flux_o2 = 0.0;
    this.flux_co2 = 0.0;

    // local properties
    this._model_engine = model_ref;
    this._t = model_ref.modeling_stepsize;
    this._is_initialized = false;
    this._comp_blood1 = null;
    this._comp_blood2 = null;
    this._flux_o2 = 0;
    this._flux_co2 = 0;
  }

  init_model(args) {
    // set the values of the properties as passed in the arguments
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // get a reference to the models
    if (typeof this.comp_blood1 === "string") {
      this._comp_blood1 = this._model_engine.models[this.comp_blood1];
    } else {
      this._comp_blood1 = this.comp_blood1;
    }

    if (typeof this.comp_blood2 === "string") {
      this._comp_blood2 = this._model_engine.models[this.comp_blood2];
    } else {
      this._comp_blood2 = this.comp_blood2;
    }

    // flag that the model is initialized
    this._is_initialized = true;
  }

  // this method is called during every model step by the model engine
  step_model() {
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  // actual model calculations are done here
  calc_model() {
    // diffuse the solutes
    for (let solute of this.solutes) {
      let d_sol =
        (this._comp_blood1.solutes[solute] -
          this._comp_blood2.solutes[solute]) *
        this.dif_cap *
        this.dif_cap_factor *
        this.dif_cap_scaling_factor;

      this._comp_blood2.solutes[solute] =
        (this._comp_blood2.solutes[solute] * this._comp_blood2.vol + d_sol) /
        this._comp_blood2.vol;

      this._comp_blood1.solutes[solute] =
        (this._comp_blood1.solutes[solute] * this._comp_blood1.vol - d_sol) /
        this._comp_blood1.vol;
    }

    // diffuse the drugs
    for (let drug of this.drugs) {
      let d_drug =
        (this._comp_blood1.drugs[drug] - this._comp_blood2.drugs[drug]) *
        this.dif_cap *
        this.dif_cap_factor *
        this.dif_cap_scaling_factor;

      this._comp_blood2.drugs[drug] =
        (this._comp_blood2.drugs[drug] * this._comp_blood2.vol + d_drug) /
        this._comp_blood2.vol;

      this._comp_blood1.drugs[drug] =
        (this._comp_blood1.drugs[drug] * this._comp_blood1.vol - d_drug) /
        this._comp_blood1.vol;
    }

    // diffuse the aboxy
    for (let abox of this.aboxy) {
      let d_abox =
        (this._comp_blood1.aboxy[abox] - this._comp_blood2.aboxy[abox]) *
        this.dif_cap *
        this.dif_cap_factor *
        this.dif_cap_scaling_factor;

      this._comp_blood2.aboxy[abox] =
        (this._comp_blood2.aboxy[abox] * this._comp_blood2.vol + d_abox) /
        this._comp_blood2.vol;

      this._comp_blood1.aboxy[abox] =
        (this._comp_blood1.aboxy[abox] * this._comp_blood1.vol - d_abox) /
        this._comp_blood1.vol;
    }
  }

  reconnect(comp_blood1, comp_blood2) {
    // store the new components
    this.comp_blood1 = comp_blood1;
    this.comp_blood2 = comp_blood2;

    // get a reference to the models
    if (typeof this.comp_blood1 === "string") {
      this._comp_blood1 = this._model_engine.models[this.comp_blood1];
    } else {
      this._comp_blood1 = this.comp_blood1;
    }

    if (typeof this.comp_blood2 === "string") {
      this._comp_blood2 = this._model_engine.models[this.comp_blood2];
    } else {
      this._comp_blood2 = this.comp_blood2;
    }
  }
}
