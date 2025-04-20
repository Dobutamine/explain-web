import * as Models from "../ModelIndex.js"

// This base model class is the blueprint for all the model objects (classes).
// It incorporates the properties and methods which all model objects implement 
export class BaseModelClass {

  /*
  The model interface list determines how the properties of the model are shaped. The GUI takes this lists to build the property editor
      {
            type: "number",
            caption: <string> caption,
            target: <number> target property
            factor: <number> value factor,
            delta: <number> delta,
            rounding: <number> number of decimals,
      ul: <number> upper limit
      ll: <number> lower limit
    }

    {
            type: “boolean”,
            caption: <string> caption,
            target: <number> target property
    }

    {
            type: “string”,
            caption: <string> caption,
            target: <number> target property
    }
    {
            type: “list”,
            caption: <string> caption,
            target: <number> target property,
      choices: <list> model types
    }
    {
            type: “multiple-list”,
            caption: <string> caption,
            target: <number> target property,
      choices: <list> model types
    }
    {
            type: “function”,
            caption: <string> caption,
            target: <number> target property,
      args: <list> a list of arguments as above
    }
  */
  model_interface = []        // model interface list as described above

  constructor(model_ref, name = "") {
    // initialize independent properties which all models implement
    this.name = name; // name of the model object
    this.description = ""; // description for documentation purposes
    this.is_enabled = false; // flag whether the model is enabled or not
    this.model_type = ""; // holds the model type e.g. BloodCapacitance
    this.components = {}; // holds a dictionary 

    // initialize local properties
    this._model_engine = model_ref; // object holding a reference to the model engine
    this._t = model_ref.modeling_stepsize; // setting the modeling stepsize
    this._is_initialized = false; // flag whether the model is initialized or not
  }

  init_model(args = {}) {
    // set the values of the independent properties
    args.forEach((arg) => {
      this[arg["key"]] = arg["value"];
    });

    // build all the sub models of this model
    Object.keys(this.components).forEach(component_name => {
      this._model_engine.models[component_name] = new Models[this.components[component_name].model_type](this._model_engine, component_name)
    })
  
    // initialize all model sub models with the arguments
    Object.keys(this.components).forEach(component_name => {
      let args = [];
      for (const [key, value] of Object.entries(this.components[component_name])) {
        args.push({ key, value });
      }
      this._model_engine.models[component_name].init_model(args)
    })
    

    // flag that the model is initialized
    this._is_initialized = true;
  }

  step_model() {
    // this method is called by the model engine and if the model is enabled and initialized it will do the model calculations
    if (this.is_enabled && this._is_initialized) {
      this.calc_model();
    }
  }

  calc_model() {
    // this method is overridden by almost all model classes as this is the place where model calculations take place
    // Override this method in subclasses
  }
}
