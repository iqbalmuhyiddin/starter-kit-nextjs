/**
 * Feature Component Template
 * 
 * Copy this file when creating new features:
 * 1. Replace "Feature" with your feature name
 * 2. Add your props interface  
 * 3. Implement your component logic
 */

interface FeatureProps {
  // Add your props here
  id?: string
  data?: any[]
}

export function Feature({ id, data }: FeatureProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Feature</h2>
      {/* Add your component content here */}
    </div>
  )
}

// Client component version (add 'use client' at top)
// export function FeatureClient({ id, data }: FeatureProps) {
//   return (
//     <div className="space-y-4">
//       <h2 className="text-2xl font-bold">Your Client Feature</h2>
//     </div>
//   )
// }