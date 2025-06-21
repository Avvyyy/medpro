import React from 'react';
import { 
  Heart, 
  Smartphone, 
  Shield, 
  Zap, 
  Users, 
  AlertTriangle,
  Activity,
  Clock,
  MapPin
} from 'lucide-react';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Heart,
      title: 'Real-Time Vital Monitoring',
      description: 'Continuous monitoring of heart rate, blood pressure, temperature, and oxygen levels with instant alerts.',
      color: 'bg-red-500'
    },
    {
      icon: Smartphone,
      title: 'IoT Device Integration',
      description: 'Seamlessly connects with wearable devices, smart sensors, and medical equipment for comprehensive monitoring.',
      color: 'bg-blue-500'
    },
    {
      icon: AlertTriangle,
      title: 'Intelligent Emergency Alerts',
      description: 'AI-powered alert system that distinguishes between normal variations and critical emergencies.',
      color: 'bg-orange-500'
    },
    {
      icon: Users,
      title: 'Multi-Role Dashboard',
      description: 'Customized interfaces for doctors, nurses, patients, and administrators with role-based access control.',
      color: 'bg-green-500'
    },
    {
      icon: Shield,
      title: 'HIPAA Compliant Security',
      description: 'Enterprise-grade security with end-to-end encryption and compliance with healthcare regulations.',
      color: 'bg-purple-500'
    },
    {
      icon: Zap,
      title: 'Instant Response System',
      description: 'Automated EMS dispatch and healthcare provider notifications with GPS location tracking.',
      color: 'bg-yellow-500'
    },
    {
      icon: Activity,
      title: 'Advanced Analytics',
      description: 'Predictive analytics and trend analysis to identify potential health issues before they become critical.',
      color: 'bg-indigo-500'
    },
    {
      icon: Clock,
      title: '24/7 Monitoring',
      description: 'Round-the-clock monitoring with redundant systems ensuring no critical moment is missed.',
      color: 'bg-pink-500'
    },
    {
      icon: MapPin,
      title: 'Location Services',
      description: 'GPS tracking and geofencing capabilities for immediate location identification during emergencies.',
      color: 'bg-teal-500'
    }
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Healthcare Monitoring
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our advanced platform combines cutting-edge IoT technology with intelligent analytics 
            to provide unparalleled patient care and emergency response capabilities.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 group hover:-translate-y-2"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Transform Patient Care?
            </h3>
            <p className="text-gray-600 mb-6">
              Join hundreds of healthcare providers who trust MedAlert Pro for critical patient monitoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg">
                Schedule Demo
              </button>
              <button className="bg-gray-100 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;