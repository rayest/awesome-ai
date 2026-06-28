export interface NodeProgress {
  visited?: boolean
  completed?: boolean
  answer?: number
}

export type LearningProgress = Record<string, NodeProgress>

export const progressStorageKey = 'smarthub-learning-progress-v1'

export function getNodeStars(progress: NodeProgress | undefined) {
  if (progress?.completed) return 3
  if (progress?.visited) return 2
  return 1
}
