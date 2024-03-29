export class Fluids {
  static model_type = "Fluids";
  static model_interface = [];
  // independent parameters
  name = "";
  model_type = "";
  description = "";
  is_enabled = false;
  dependencies = [];
  fluid_types = {};
  // dependent parameters

  // local parameters
  _model_engine = {};
  _is_initialized = false;
  _t = 0.0005;
  _infusions = [];

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
    let infusions_finished = true;

    for (let iv of this._infusions) {
      const finished = iv.calc_iv();
      if (!finished) {
        infusions_finished = false;
      }
    }

    if (infusions_finished) {
      this._infusions = [];
    }
  }

  add_volume(
    vol = 10.0,
    in_time = 5.0,
    at_time = 0.0,
    site = "IVCE",
    fluid_type = null
  ) {
    if (vol > 0) {
      if (fluid_type in this.fluid_types) {
        const new_fluid = new Fluid(
          vol,
          this.fluid_types[fluid_type],
          in_time,
          at_time,
          this._model_engine.models[site],
          this._t
        );
        this._infusions.push(new_fluid);
      } else {
        const new_fluid = new Fluid(
          vol,
          null,
          in_time,
          at_time,
          this._model_engine.models[site],
          this._t
        );
        this._infusions.push(new_fluid);
      }
      return true;
    } else {
      console.log(
        "Zero or negative volume changes are not allowed. Use the remove_volume method to remove volume!"
      );
      return false;
    }
  }

  remove_volume(vol = 10.0, in_time = 5.0, at_time = 0.0, site = "IVCE") {
    if (vol > 0) {
      const new_fluid = new Fluid(
        -vol,
        null,
        in_time,
        at_time,
        this._model_engine.models[site],
        this._t
      );
      this._infusions.push(new_fluid);
      return true;
    } else {
      console.log(
        "Zero or negative volume changes are not allowed. Use the add_volume method to add volume!"
      );
      return false;
    }
  }

  set_total_blood_volume(new_blood_volume) {
    const current_blood_volume = this.get_total_blood_volume(false);
    new_blood_volume = new_blood_volume;

    for (const model of Object.values(this._model_engine.models)) {
      if (model.model_type.includes("Blood") && model.is_enabled) {
        try {
          const current_fraction = model.vol / current_blood_volume;
          model.vol +=
            current_fraction * (new_blood_volume - current_blood_volume);

          if (model.vol < 0.0) {
            model.vol = 0.0;
          }
        } catch {
          const current_fraction = 0;
        }
      }
    }
  }

  get_total_blood_volume(output = true) {
    let total_blood_volume = 0.0;

    for (const model of Object.values(this._model_engine.models)) {
      if (model.model_type.includes("Blood") && model.is_enabled) {
        try {
          total_blood_volume += model.vol;
        } catch {
          total_blood_volume += 0.0;
        }
      }
    }

    if (output) {
      console.log(
        `Total blood volume = ${total_blood_volume * 1000.0} ml (${
          (total_blood_volume * 1000.0) / this._model_engine.weight
        } ml/kg)`
      );
    }

    return total_blood_volume;
  }
}

export class Fluid {
  site = {};
  volume = 0.0;
  in_time = 5.0;
  at_time = 0.0;
  infusing = false;
  completed = false;
  delta_vol = 0.0;

  fluid_comp = {};
  solutes = {};
  aboxy = {};

  _t = 0.0005;
  _addition = true;

  constructor(volume, fluid_comp, in_time, at_time, site, t) {
    this._t = t;
    if (volume < 0) {
      this._addition = false;
      volume = -volume;
    }

    if (fluid_comp) {
      this.fluid_comp = fluid_comp;
      this.solutes = { ...fluid_comp["solutes"] };
      this.aboxy = { ...fluid_comp["aboxy"] };
    } else {
      this.solutes = {};
      this.aboxy = {};
    }

    this.site = site;
    this.volume = volume / 1000.0;
    this.in_time = in_time;
    this.at_time = at_time;
    this.delta_vol = (this.volume / this.in_time) * this._t;
  }

  calc_iv() {
    if (this.at_time > 0) {
      this.at_time -= self._t;
      return this.completed;
    }

    this.in_time -= this._t;
    this.volume -= this.delta_vol;

    if (this.volume < 0) {
      this.volume = 0;
      this.completed = true;
      return this.completed;
    }

    // substract the volume and return
    if (!this._addition) {
      this.site.vol -= this.delta_vol;
      if (this.site.vol < 0) {
        this.site.vol = 0;
      }
      return this.completed;
    }

    // add  the volume and return
    this.site.vol += this.delta_vol;

    // process the aboxy and solutes if the fluid_composition is not none
    if (this.fluid_comp) {
      for (let [solute, conc] of Object.entries(this.aboxy)) {
        let d_solute = (conc - this.site.aboxy[solute]) * this.delta_vol;
        this.site.aboxy[solute] += d_solute / this.site.vol;
      }
      for (let [solute, conc] of Object.entries(this.solutes)) {
        let d_solute = (conc - this.site.aboxy[solute]) * this.delta_vol;
        this.site.aboxy[solute] += d_solute / this.site.vol;
      }
    }

    return this.completed;
  }
}
