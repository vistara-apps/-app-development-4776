import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckIcon } from '@heroicons/react/20/solid'
import useAuthStore from '../store/authStore'

const plans = [
  {
    name: 'Free Trial',
    id: 'free',
    price: 0,
    description: 'Perfect for trying out our platform',
    features: [
      '3 virtual try-ons per month',
      'Basic recommendations',
      'Standard photo quality',
      'Email support'
    ],
    limitations: [
      'Limited to 3 try-ons',
      'Basic features only'
    ],
    cta: 'Start Free Trial',
    popular: false
  },
  {
    name: 'Basic',
    id: 'basic',
    price: 9.99,
    description: 'Great for individual shoppers',
    features: [
      '50 virtual try-ons per month',
      'Personalized recommendations',
      'HD photo quality',
      'Style analysis',
      'Email support',
      'Save favorite outfits'
    ],
    limitations: [],
    cta: 'Get Basic',
    popular: true
  },
  {
    name: 'Pro',
    id: 'pro',
    price: 19.99,
    description: 'Best for fashion enthusiasts',
    features: [
      'Unlimited virtual try-ons',
      'Advanced AI recommendations',
      '4K photo quality',
      'Detailed style analysis',
      'Priority support',
      'Save & share outfits',
      'Early access to new features',
      'Advanced body measurements',
      'Style consultation calls'
    ],
    limitations: [],
    cta: 'Get Pro',
    popular: false
  }
]

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly')
  const { isAuthenticated, subscription, setSubscription } = useAuthStore()

  const handleSubscribe = (planId) => {
    // In a real app, this would integrate with Stripe
    setSubscription({ plan: planId, active: true })
  }

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-primary-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose the perfect plan for you
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-600">
          Start with a free trial and upgrade as you need more features. No hidden fees or long-term contracts.
        </p>

        {/* Billing Toggle */}
        <div className="mt-16 flex justify-center">
          <fieldset className="grid grid-cols-2 gap-x-1 rounded-full p-1 text-center text-xs font-semibold leading-5 ring-1 ring-inset ring-gray-200">
            <legend className="sr-only">Payment frequency</legend>
            <label
              className={`cursor-pointer rounded-full px-2.5 py-1 ${
                billingCycle === 'monthly' ? 'bg-primary-600 text-white' : 'text-gray-500'
              }`}
            >
              <input
                type="radio"
                name="frequency"
                value="monthly"
                checked={billingCycle === 'monthly'}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="sr-only"
              />
              Monthly
            </label>
            <label
              className={`cursor-pointer rounded-full px-2.5 py-1 ${
                billingCycle === 'yearly' ? 'bg-primary-600 text-white' : 'text-gray-500'
              }`}
            >
              <input
                type="radio"
                name="frequency"
                value="yearly"
                checked={billingCycle === 'yearly'}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="sr-only"
              />
              Yearly
            </label>
          </fieldset>
        </div>

        {/* Pricing Cards */}
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`rounded-3xl p-8 ring-1 ${
                plan.popular
                  ? 'ring-2 ring-primary-600 lg:z-10 lg:rounded-3xl'
                  : 'ring-gray-200 lg:mt-8'
              } ${plan.popular ? 'bg-white' : 'bg-white'}`}
            >
              {plan.popular && (
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900">{plan.name}</h3>
                  <p className="rounded-full bg-primary-600/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary-600">
                    Most popular
                  </p>
                </div>
              )}
              {!plan.popular && (
                <h3 className="text-lg font-semibold leading-8 text-gray-900">{plan.name}</h3>
              )}
              <p className="mt-4 text-sm leading-6 text-gray-600">{plan.description}</p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-gray-900">
                  ${billingCycle === 'yearly' ? (plan.price * 10).toFixed(2) : plan.price}
                </span>
                <span className="text-sm font-semibold leading-6 text-gray-600">
                  /{billingCycle === 'yearly' ? 'year' : 'month'}
                </span>
              </p>
              {billingCycle === 'yearly' && plan.price > 0 && (
                <p className="text-sm text-green-600 mt-1">Save 2 months!</p>
              )}
              
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={subscription?.plan === plan.id}
                className={`mt-8 block w-full rounded-md px-3.5 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  plan.popular
                    ? 'bg-primary-600 text-white shadow-sm hover:bg-primary-500 focus-visible:outline-primary-600'
                    : 'ring-1 ring-inset ring-primary-200 text-primary-600 hover:ring-primary-300'
                } ${subscription?.plan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {subscription?.plan === plan.id ? 'Current Plan' : plan.cta}
              </button>
              
              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <CheckIcon className="h-6 w-5 flex-none text-primary-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              
              {plan.limitations.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">Limitations:</p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {plan.limitations.map((limitation) => (
                      <li key={limitation}>• {limitation}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <h3 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h3>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                q: 'Can I cancel my subscription at any time?',
                a: 'Yes, you can cancel your subscription at any time. Your access will continue until the end of your current billing period.'
              },
              {
                q: 'Do you offer refunds?',
                a: 'We offer a 30-day money-back guarantee for all paid subscriptions if you\'re not satisfied with our service.'
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.'
              },
              {
                q: 'Is my data secure?',
                a: 'Yes, we use enterprise-grade security and never share your personal information or photos with third parties.'
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}