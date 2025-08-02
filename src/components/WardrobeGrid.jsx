import { motion } from 'framer-motion'
import WardrobeItem from './WardrobeItem'

export default function WardrobeGrid({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <WardrobeItem item={item} />
        </motion.div>
      ))}
    </div>
  )
}

