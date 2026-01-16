import React from 'react';
import { Link } from 'react-router-dom';

export default function Services() {
  const services = [
    {
      title: 'Web Development',
      description: 'Custom web applications built with modern technologies.',
      price: '$2,999'
    },
    {
      title: 'Mobile Apps',
      description: 'Native and cross-platform mobile applications.',
      price: '$4,999'
    },
    {
      title: 'Consulting',
      description: 'Expert advice and strategic planning for your projects.',
      price: '$999'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Our Services</h1>
      <p className="text-lg text-gray-700 mb-8">
        We offer a wide range of services to help your business grow and succeed.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {services.map((service, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
            <p className="text-gray-600 mb-4">{service.description}</p>
            <p className="text-2xl font-bold text-blue-600">{service.price}</p>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link
          to="/contact"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block"
        >
          Get a Quote
        </Link>
      </div>
    </div>
  );
}
