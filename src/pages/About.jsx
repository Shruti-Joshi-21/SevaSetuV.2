import React from 'react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">About Us</h1>
      <p className="text-lg text-gray-700 mb-6">
        We are a company dedicated to providing excellent services and solutions to our customers.
        Our team is passionate about innovation and delivering high-quality products.
      </p>
      <p className="text-lg text-gray-700 mb-8">
        Founded in 2020, we've grown rapidly and now serve thousands of satisfied customers worldwide.
      </p>

      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
        <p className="text-gray-700">
          To empower businesses and individuals with cutting-edge technology solutions that drive growth and success.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          to="/services"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Our Services
        </Link>
        <Link
          to="/contact"
          className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Contact Us
        </Link>
      </div>
    </div>
  );
}
