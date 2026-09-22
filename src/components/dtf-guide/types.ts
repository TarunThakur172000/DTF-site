import type { ReactNode } from "react";

export interface DtfStep {
  id: number;
  key: string;
  title: string;
  shortTitle: string;
  description: string;
}

export interface StepAnimationProps {
  /** 0 = not yet reached, 1 = fully active/settled, values in between during transition */
  progress: number;
  isActive: boolean;
}

export interface DtfStepDefinition extends DtfStep {
  renderScene: (props: StepAnimationProps) => ReactNode;
}
