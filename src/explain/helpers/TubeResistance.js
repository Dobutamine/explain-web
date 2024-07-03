export function calc_resistance_tube(diameter, length, viscosity) {
  // resistance is calculated using Poiseuille's Law : R = (8 * n * L) / (PI * r^4)

  // we have to watch the units carefully where we have to make sure that the units in the formula are
  // resistance is in mmHg * s / l
  // L = length in meters from millimeters
  // r = radius in meters from millimeters
  // n = viscosity in centiPoise

  // convert viscosity from centiPoise to Pa * s
  let n_pas = viscosity / 1000.0;

  // convert the length to meters
  let length_meters = length / 1000.0;

  // calculate radius in meters
  let radius_meters = diameter / 2 / 1000.0;

  // calculate the resistance    Pa *  / m3
  let res =
    (8.0 * n_pas * length_meters) / (Math.PI * Math.pow(radius_meters, 4));

  // convert resistance of Pa/m3 to mmHg/l
  res = res * 0.00000750062;
  return res;
}
