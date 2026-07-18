import type { TargetAndTransition, VariantLabels } from 'framer-motion';

export type MotionInteraction = VariantLabels | TargetAndTransition | undefined;

export const motionWhile = <T,>(
  condition: T,
  values: TargetAndTransition,
): MotionInteraction => (condition ? values : undefined);