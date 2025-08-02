import { motion } from 'framer-motion'

export default function WardrobeStats({ stats }) {
  const statCards = [
    {
      label: 'Total Items',
      value: stats.totalItems,
      icon: '👕',
      color: 'bg-blue-50 text-blue-700'
    },
    {
      label: 'Categories',
      value: Object.keys(stats.categories).length,
      icon: '📂',
      color: 'bg-green-50 text-green-700'
    },
    {
      label: 'Brands',
      value: Object.keys(stats.brands).length,
      icon: '🏷️',
      color: 'bg-purple-50 text-purple-700'
    },
    {
      label: 'Colors',
      value: Object.keys(stats.colors).length,
      icon: '🎨',
      color: 'bg-pink-50 text-pink-700'
    }
  ]

  const topCategories = Object.entries(stats.categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  const topColors = Object.entries(stats.colors)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stats Cards */}
      <div className="lg:col-span-2">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-4 shadow-soft"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${stat.color}`}>
                  {stat.label}
                </span>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {stat.value}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Top Categories & Colors */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Wardrobe Breakdown
        </h3>
        
        {/* Top Categories */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Top Categories
          </h4>
          <div className="space-y-2">
            {topCategories.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-neutral-600">{category}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 bg-neutral-100 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{
                        width: `${(count / stats.totalItems) * 100}%`
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-neutral-900 w-6 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Colors */}
        <div>
          <h4 className="text-sm font-medium text-neutral-700 mb-3">
            Popular Colors
          </h4>
          <div className="space-y-2">
            {topColors.map(([color, count]) => (
              <div key={color} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border border-neutral-200"
                    style={{ backgroundColor: color.toLowerCase() }}
                  />
                  <span className="text-sm text-neutral-600">{color}</span>
                </div>
                <span className="text-sm font-medium text-neutral-900">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

