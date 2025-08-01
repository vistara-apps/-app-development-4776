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
      <div className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 pb-16 pt-16 sm:pb-24 sm:pt-24">
        <div className="absolute inset-0 bg-hero-pattern opacity-50"></div>
        <div className="container-custom relative">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <span className="badge-primary text-sm font-medium">
                ✨ AI-Powered Virtual Try-On Technology
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl font-bold tracking-tight text-neutral-900 sm:text-7xl lg:text-8xl"
            >
              Accurate virtual clothing
              <span className="text-gradient block mt-2"> try-ons</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-8 text-xl leading-8 text-neutral-600 max-w-3xl mx-auto"
            >
              The virtual fitting room platform that helps online shoppers visualize how clothes will look on their bodies and receive personalized recommendations to reduce returns.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
            >
              <Link to="/try-on" className="btn-primary btn-xl group">
                <span>Try Virtual Fitting</span>
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link to="/pricing" className="btn-secondary btn-lg group">
                <span>View Pricing</span>
                <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>
            
            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-neutral-500"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary-400 to-primary-600 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-secondary-400 to-secondary-600 border-2 border-white"></div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-accent-400 to-accent-600 border-2 border-white"></div>
                </div>
                <span className="ml-2 font-medium">Trusted by 10,000+ shoppers</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-warning-500">★★★★★</span>
                <span className="font-medium">4.9/5 rating</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="section-padding bg-white">
        <div className="container-custom">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-4"
            >
              <span className="badge-secondary text-sm font-medium">Complete Solution</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl"
            >
              Everything you need for 
              <span className="text-gradient-accent block mt-2">virtual try-ons</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 text-xl leading-8 text-neutral-600"
            >
              Our platform combines cutting-edge AI technology with user-friendly features to revolutionize online shopping.
            </motion.p>
          </div>
          <div className="mx-auto mt-20 max-w-6xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card-hover p-8 group"
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-primary-500 to-primary-600 shadow-soft group-hover:shadow-colored transition-all duration-200">
                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-neutral-900 mb-3">
                        {feature.name}
                      </h3>
                      <p className="text-neutral-600 leading-7">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-secondary-600/90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-400/20 rounded-full blur-3xl"></div>
        </div>
        <div className="relative section-padding">
          <div className="container-custom">
            <div className="mx-auto max-w-4xl text-center">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
              >
                Ready to transform your 
                <span className="block mt-2">shopping experience?</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mx-auto mt-8 max-w-2xl text-xl leading-8 text-primary-100"
              >
                Join thousands of shoppers who are already using our virtual try-on technology to shop with confidence and reduce returns.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6"
              >
                <Link
                  to="/register"
                  className="btn-xl bg-white text-primary-600 hover:bg-primary-50 shadow-large hover:shadow-xl hover:scale-105 transition-all duration-200 group"
                >
                  <span>Get Started Free</span>
                  <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link to="/pricing" className="btn-ghost text-white border-white/20 hover:bg-white/10 btn-lg group">
                  <span>Learn More</span>
                  <svg className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </motion.div>
              
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center"
              >
                <div>
                  <div className="text-3xl font-bold text-white">95%</div>
                  <div className="text-primary-200 text-sm">Accuracy Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">50%</div>
                  <div className="text-primary-200 text-sm">Return Reduction</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">10k+</div>
                  <div className="text-primary-200 text-sm">Happy Customers</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
