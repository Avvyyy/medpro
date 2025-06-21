import React from 'react';
import { Star, Quote } from 'lucide-react';

const TestimonialsSection: React.FC = () => {
  const testimonials = [
    {
      name: 'Dr. Sarah Mitchell',
      role: 'Chief Cardiologist',
      hospital: 'Metropolitan General Hospital',
      image: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      quote: 'MedAlert Pro has revolutionized how we monitor our cardiac patients. The early warning system has helped us prevent numerous emergency situations.',
      rating: 5
    },
    {
      name: 'Nurse Manager Lisa Chen',
      role: 'ICU Nurse Manager',
      hospital: 'St. Mary\'s Medical Center',
      image: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      quote: 'The real-time monitoring capabilities have significantly improved our response times. Our nursing staff feels more confident knowing they have this technology backing them up.',
      rating: 5
    },
    {
      name: 'Dr. Michael Rodriguez',
      role: 'Emergency Medicine Director',
      hospital: 'City Emergency Medical Services',
      image: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      quote: 'The integration with our EMS dispatch system is seamless. We\'re reaching patients faster than ever before, and the pre-arrival data helps us prepare better.',
      rating: 5
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Healthcare Professionals Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from the doctors, nurses, and healthcare administrators who rely on 
            MedAlert Pro to provide exceptional patient care every day.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 relative"
            >
              {/* Quote Icon */}
              <div className="absolute -top-4 left-6">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <Quote className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center mb-4 pt-2">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed italic">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-xs text-gray-500">{testimonial.hospital}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Trusted by Leading Healthcare Organizations
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">Mayo Clinic</div>
              <div className="text-sm text-gray-500">Partner Hospital</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">Johns Hopkins</div>
              <div className="text-sm text-gray-500">Research Partner</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">Cleveland Clinic</div>
              <div className="text-sm text-gray-500">Implementation Partner</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">Kaiser Permanente</div>
              <div className="text-sm text-gray-500">Strategic Partner</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;