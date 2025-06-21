import React from 'react';
import { ArrowRight, CheckCircle, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const CTASection: React.FC = () => {
  const benefits = [
    'Free 30-day trial with full features',
    'Dedicated implementation support',
    'HIPAA-compliant data migration',
    '24/7 technical support included',
    'No setup fees or hidden costs'
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Ready to Save Lives with
              <span className="text-yellow-300"> Advanced Monitoring?</span>
            </h2>
            
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">
              Join thousands of healthcare providers who trust MedAlert Pro to monitor 
              their patients and respond to emergencies faster than ever before.
            </p>

            {/* Benefits List */}
            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  <span className="text-blue-100">{benefit}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                to="/register"
                className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              
              <button className="inline-flex items-center justify-center bg-transparent text-white px-8 py-4 rounded-xl font-semibold border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300">
                Schedule Demo
              </button>
            </div>

            {/* Contact Options */}
            <div className="flex flex-col sm:flex-row gap-6 text-sm">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-300" />
                <span className="text-blue-100">Call: 1-800-MEDALERT</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-300" />
                <span className="text-blue-100">Email: sales@medalertpro.com</span>
              </div>
            </div>
          </div>

          {/* Right Content - Feature Highlights */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-3">Enterprise Ready</h3>
              <p className="text-blue-100 text-sm">
                Scalable infrastructure supporting hospitals of all sizes, from small clinics to major medical centers.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-3">Proven ROI</h3>
              <p className="text-blue-100 text-sm">
                Average 35% reduction in emergency response costs and 40% improvement in patient outcomes.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-semibold mb-3">Seamless Integration</h3>
              <p className="text-blue-100 text-sm">
                Works with existing EMR systems, medical devices, and hospital infrastructure with minimal disruption.
              </p>
            </div>

            {/* Urgency Element */}
            <div className="bg-yellow-400 text-gray-900 rounded-xl p-4 text-center">
              <div className="font-bold text-lg">Limited Time Offer</div>
              <div className="text-sm">Get 3 months free with annual subscription</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;