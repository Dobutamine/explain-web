export function set_gas_composition(
  gas_capacitance,
  fio2,
  temp,
  humidity,
  fico2 = 0.000392
) {
  let result = calc_gas_composition(
    gas_capacitance,
    fio2,
    temp,
    humidity,
    fico2
  );

  // process the result
  gas_capacitance.po2 = result["po2"];
  gas_capacitance.pco2 = result["pco2"];
  gas_capacitance.pn2 = result["pn2"];
  gas_capacitance.ph2o = result["ph2o"];
  gas_capacitance.pother = result["pother"];

  gas_capacitance.fo2 = result["fo2"];
  gas_capacitance.fco2 = result["fco2"];
  gas_capacitance.fn2 = result["fn2"];
  gas_capacitance.fh2o = result["fh2o"];
  gas_capacitance.fother = result["fother"];

  gas_capacitance.co2 = result["co2"];
  gas_capacitance.cco2 = result["cco2"];
  gas_capacitance.cn2 = result["cn2"];
  gas_capacitance.ch2o = result["ch2o"];
  gas_capacitance.cother = result["cother"];
}

export function calc_gas_composition(
  gas_capacitance,
  fio2 = 0.205,
  temp = 37,
  humidity = 1.0,
  fico2 = 0.000392
) {
  let result = {};

  // define the dry air
  let fo2_dry = 0.205;
  let fco2_dry = 0.000392;
  let fn2_dry = 0.794608;
  let fother_dry = 0.0;

  // make sure the latest pressure is available
  gas_capacitance.calc_model();

  // calculate the dry gas composition depending on the supplied fio2
  let new_fo2_dry = fio2;
  let new_fco2_dry = fico2;
  let new_fn2_dry =
    (fn2_dry * (1.0 - (fio2 + fico2))) / (1.0 - (fo2_dry + fco2_dry));
  let new_fother_dry =
    (fother_dry * (1.0 - (fio2 + fico2))) / (1.0 - (fo2_dry + fco2_dry));
  // if temp is set then transfer that temp to the gascomp
  if (!isNaN(temp)) {
    gas_capacitance.target_temp = temp;
    gas_capacitance.temp = temp;
  }
  //if humidity is set then transfer that humidity to the gascomp
  if (!isNaN(humidity)) {
    gas_capacitance.humidity = humidity;
  }
  // calculate the gas composition
  result = gas_composition(
    gas_capacitance.pres,
    new_fo2_dry,
    new_fco2_dry,
    new_fn2_dry,
    new_fother_dry,
    gas_capacitance.temp,
    gas_capacitance.humidity
  );

  return result;
}

function gas_composition(
  pressure,
  new_fo2_dry,
  new_fco2_dry,
  new_fn2_dry,
  new_fother_dry,
  temp,
  humidity
) {
  // local constant
  let _gas_constant = 62.36367;

  // calculate the concentration at this pressure and temperature in mmol/l using the gas law
  let ctotal = (pressure / (_gas_constant * (273.15 + temp))) * 1000.0;

  // calculate the water vapour pressure, concentration and fraction for this temperature and humidity (0 - 1)
  let ph2o = Math.pow(Math.E, 20.386 - 5132 / (temp + 273)) * humidity;
  let fh2o = ph2o / pressure;
  let ch2o = fh2o * ctotal;

  // calculate the o2 partial pressure, fraction and concentration
  let po2 = new_fo2_dry * (pressure - ph2o);
  let fo2 = po2 / pressure;
  let co2 = fo2 * ctotal;

  // calculate the co2 partial pressure, fraction and concentration
  let pco2 = new_fco2_dry * (pressure - ph2o);
  let fco2 = pco2 / pressure;
  let cco2 = fco2 * ctotal;

  // calculate the n2 partial pressure, fraction and concentration
  let pn2 = new_fn2_dry * (pressure - ph2o);
  let fn2 = pn2 / pressure;
  let cn2 = fn2 * ctotal;

  // calculate the other gas partial pressure, fraction and concentration
  let pother = new_fother_dry * (pressure - ph2o);
  let fother = pother / pressure;
  let cother = fother * ctotal;

  return {
    po2: po2,
    pco2: pco2,
    pn2: pn2,
    pother: pother,
    ph2o: ph2o,
    fo2: fo2,
    fco2: fco2,
    fn2: fn2,
    fother: fother,
    fh2o: fh2o,
    co2: co2,
    cco2: cco2,
    cn2: cn2,
    cother: cother,
    ch2o: ch2o,
  };
}
