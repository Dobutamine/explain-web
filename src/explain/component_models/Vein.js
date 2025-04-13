import { BloodCapacitance } from "../base_models/BloodCapacitance";

/*
Veins:

Have the same three layers as arteries:

Tunica intima: Inner endothelial layer
Tunica media: Middle smooth muscle layer
Tunica adventitia: Outer connective tissue layer


However, their muscle layer (tunica media) is much thinner than in arteries
Have a larger lumen relative to their wall thickness
The adventitia is often the thickest layer in veins
Many veins, especially in the limbs, contain valves to prevent backflow of blood
Their walls are more distensible and can stretch to accommodate large volumes of blood

Larger vessels (0.1-30mm diameter)
Carry blood toward the heart
Thin walls relative to lumen size
Contain valves to prevent backflow (especially in limbs)
Main function: Blood reservoir (capacitance vessels)
Hold 60-70% of total blood volume
Collapse when empty due to thinner walls

Various receptors on blood vessels regulate vascular resistance and elastance changes
When a blood vessel constricts it's elastic properties also change.

Adrenergic Receptors:
- Alpha-1 receptors: When activated by norepinephrine or epinephrine, cause vasoconstriction. These are predominant in arterioles.
- Alpha-2 receptors: Present on presynaptic nerve terminals and some vascular smooth muscle. Can cause vasoconstriction when stimulated.
- Beta-2 receptors: Cause vasodilation when activated, particularly in skeletal muscle, liver, and coronary vessels.

Cholinergic Receptors:
- Muscarinic receptors: Stimulated by acetylcholine, causing vasodilation through nitric oxide release from endothelial cells.

Other Vascular Receptors:
- Angiotensin II receptors (AT1): Promote powerful vasoconstriction when activated.
- Endothelin receptors (ETA): Mediate vasoconstriction when bound by endothelin-1.
- Vasopressin (V1) receptors: Cause vasoconstriction in response to vasopressin/ADH.
- Serotonin receptors: Can cause either vasoconstriction or vasodilation depending on the specific receptor subtype.
- Histamine receptors: H1 receptors mediate vasodilation, especially in postcapillary venules.
- Purinergic receptors: Respond to ATP and adenosine, generally causing vasodilation.
- Prostaglandin receptors: Various subtypes can cause either vasodilation or vasoconstriction.
- Bradykinin receptors: Promote vasodilation when activated.
- VEGF receptors: Primarily involved in angiogenesis but also cause vasodilation.
- Thromboxane receptors: Promote vasoconstriction when activated.

The distribution and density of these receptors vary across different vascular beds, allowing for specialized control of blood flow to different organs based on their specific needs.
*/

export class Vein extends BloodCapacitance {
  // static properties
  static model_type = "Vein";
  static model_interface = [
    {
      caption: "current volume (mL)",
      target: "vol",
      type: "number",
      delta: 0.1,
      factor: 1000.0,
      rounding: 3,
    },
    {
      caption: "unstressed volume (mL)",
      target: "u_vol",
      type: "number",
      delta: 0.1,
      factor: 1000.0,
      rounding: 3,
    },
    {
      caption: "elastance (mmHg/mL)",
      target: "el_base",
      delta: 0.1,
      factor: 0.001,
      rounding: 3,
      type: "number",
    },
    {
      caption: "non linear elastace factor",
      target: "el_k",
      delta: 0.1,
      factor: 0.001,
      rounding: 3,
      type: "number",
    },
  ];
}
