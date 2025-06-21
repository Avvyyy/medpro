import React from 'react';
import { TrendingUp, Users, Clock, Shield } from 'lucide-react';

const StatsSection: React.FC = () => {
  const stats = [
    {
      icon: Users,
      number: '10,000+',
      label: 'Patients Monitored',
      description: 'Active patients across 500+ healthcare facilities',
      color: 'bg-blue-500'
    },
    {
      icon: Clock,
      number: '2.3 min',
      label: 'Average Response Time',
      description: 'From alert detection to healthcare provider notification',
      color: 'bg-green-500'
    },
    {
      icon: TrendingUp,
      number: '99.9%',
      label: 'System Uptime',
      description: 'Reliable monitoring with redundant infrastructure',
      color: 'bg-purple-500'
    },
    {
      icon: Shield,
      number: '100%',
      label: 'HIPAA Compliant',
      description: 'Full compliance with healthcare data protection standards',
      color: 'bg-orange-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted by Healthcare Leaders
          </h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Our platform has proven its effectiveness across thousands of patients 
            and hundreds of healthcare facilities worldwide.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              
              <div className="text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                {stat.number}
              </div>
              
              <h3 className="text-xl font-semibold mb-2 text-white">
                {stat.label}
              </h3>
              
              <p className="text-blue-100 text-sm leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        {/* Additional Metrics */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold mb-2">Lives Saved</h4>
            <div className="text-3xl font-bold text-green-400 mb-2">2,847</div>
            <p className="text-blue-100 text-sm">Emergency interventions that prevented critical outcomes</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold mb-2">False Alerts</h4>
            <div className="text-3xl font-bold text-yellow-400 mb-2">&lt;0.1%</div>
            <p className="text-blue-100 text-sm">Industry-leading accuracy in emergency detection</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <h4 className="text-lg font-semibold mb-2">Cost Reduction</h4>
            <div className="text-3xl font-bold text-purple-400 mb-2">35%</div>
            <p className="text-blue-100 text-sm">Average reduction in emergency response costs</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;