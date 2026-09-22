export type DTFStep = {
  title: string;
  description: string;
  startTime: number; // Video timestamp in seconds
};

export const DTF_STEPS: DTFStep[] = [
  {
    title: "Prep the Garment",
    description: "Pre-press your shirt for 5-10 seconds to remove any moisture and wrinkles from the fabric.",
    startTime: 0, 
  },
  {
    title: "Place the Transfer",
    description: "Align your DTF design face up on the fabric. Ensure it is centered and exactly where you want it.",
    startTime: 1.5, 
  },
  {
    title: "First Press",
    description: "Press at 320°F (160°C) for 15 seconds with medium-heavy pressure.",
    startTime: 4.5, 
  },
  {
    title: "Peel the Film",
    description: "Wait until the transfer is completely cool to the touch (Cold Peel), then peel the film away in one smooth, continuous motion.",
    startTime: 8,
  },
  {
    title: "Second Press (Finishing)",
    description: "Cover the design with parchment paper or a Teflon sheet and press again for 5 seconds to lock the ink into the fibers.",
    startTime: 10,
  }
];

export const DTF_STEP_COUNT = DTF_STEPS.length;