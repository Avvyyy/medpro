import React from 'react';
import { Smartphone, Cloud, AlertTriangle, Users } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: 1,
      icon: Smartphone,
      title: 'Connect IoT Devices',
      description: 'Patients wear smart devices that continuously monitor vital signs including heart rate, blood pressure, temperature, and oxygen levels.',
      color: 'bg-blue-500'
    },
    {
      step: 2,
      icon: Cloud,
      title: 'Real-Time Data Processing',
      description: 'Data is securely transmitted to our cloud platform where AI algorithms analyze patterns and detect anomalies in real-time.',
      color: 'bg-green-500'
    },
    {
      step: 3,
      icon: AlertTriangle,
      title: 'Intelligent Alert System',
      description: 'When critical thresholds are exceeded, the system instantly generates alerts and determines the appropriate response level.',
      color: 'bg-orange-500'
    },
    {
      step: 4,
      icon: Users,
      title: 'Emergency Response',
      description: 'Healthcare providers receive immediate notifications and can dispatch emergency services or provide remote guidance.',
      color: 'bg-red-500'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How MedAlert Pro Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our seamless four-step process ensures continuous monitoring and rapid response 
            to keep patients safe and healthcare providers informed.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="text-center relative">
                {/* Step Number */}
                <div className="relative mb-6">
                  <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto shadow-lg relative z-10`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-700 shadow-md">
                    {step.step}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-8 mb-4">
                    <div className="w-0.5 h-8 bg-gray-200"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Process Flow Visualization */}
        <div className="mt-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Real-Time Monitoring Flow
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Patient Devices</h4>
                <p className="text-sm text-gray-600">Wearables & sensors collect vital signs every 30 seconds</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cloud className="w-6 h-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">AI Analysis</h4>
                <p className="text-sm text-gray-600">Machine learning algorithms process data in under 5 seconds</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Instant Alerts</h4>
                <p className="text-sm text-gray-600">Healthcare providers notified within 10 seconds of anomaly</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;