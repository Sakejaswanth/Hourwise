import { useContext } from 'react'
import { TimeTrackerContext } from './timeTrackerContextDef'

export function useTimeTracker() {
  const context = useContext(TimeTrackerContext)
  if (!context) {
    throw new Error('useTimeTracker must be used within a TimeTrackerProvider')
  }
  return context
}
