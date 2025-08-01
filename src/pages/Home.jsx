import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  CameraIcon, 
  SparklesIcon, 
  CubeIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Virtual Try-On',
    description: 'Upload a selfie and see how clothes look on your body in real-time with our advanced 3D modeling.',
    icon: CameraIcon,
  },
  {
    name: 'Personalized Recommendations',
    description: 'Get tailored product suggestions based on your body shape, size, and style preferences.',
    icon: SparklesIcon,
  },
  {
    name: 'Plug-and-Play Integration',
    description: 'Easy integration for retailers with our simple JavaScript snippet or API.',
    icon: CubeIcon,
  },
  {
    name: 'Return Rate Optimization',
    description: 'Data-driven insights to help minimize returns and increase customer satisfaction.',
    icon: ChartBarIcon,
  },
]

export default function Home() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-white pb-16 pt-16 sm:pb-24 sm:pt-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
            >
              Accurate virtual clothing
              <span className="text-primary-600"> try-ons</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-6 text-lg leading-8 text-gray-600"
            >
              The virtual fitting room platform that helps online shoppers visualize how clothes will look on their bodies and receive personalized recommendations to reduce returns.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-10 flex items-center justify-center gap-x-6"
            >
              <Link to="/try-on" className="btn-primary text-lg px-8 py-3">
                Try Virtual Fitting
              </Link>
              <Link to="/pricing" className="text-sm font-semibold leading-6 text-gray-900">
                View Pricing <span aria-hidden="true">→</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">Complete Solution</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for virtual try-ons
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our platform combines cutting-edge AI technology with user-friendly features to revolutionize online shopping.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              {features.map((feature) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative pl-16"
                >
                  <dt className="text-base font-semibold leading-7 text-gray-900">
                    <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600">
                      <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform your shopping experience?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              Join thousands of shoppers who are already using our virtual try-on technology to shop with confidence.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Get started
              </Link>
              <Link to="/pricing" className="text-sm font-semibold leading-6 text-white">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}