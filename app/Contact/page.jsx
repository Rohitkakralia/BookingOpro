"use client";
import React from 'react';
import ContactForm from '../components/ContactForm';
import FAQ from '../components/FAQ';            
import { Phone, Mail, MapPin } from 'lucide-react';


const Contact = () => {
  return (
    <div className="relative w-full px-4 pb-40">
      {/* Background Image Section */}
      <div 
        className="absolute top-0 left-0 right-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop)",
          height: "300px", // Adjust this value to control where the background stops
        }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-[#1a3a5c]/90" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto pt-12">
        {/* Heading */}
        <div className="text-center text-white mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get in Touch With Us
          </h2>
          <p className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto">
            Have questions about your booking? Need help planning your trip? Our team
            is here to assist you 24/7
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Call Us Card */}
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="w-20 h-20 bg-[#1a3a5c] rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="w-10 h-10 text-yellow-400" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-[#1a3a5c] mb-3">Call Us</h3>
            <p className="text-gray-600 mb-4">Speak directly with our travel experts</p>
            <p className="text-xl font-semibold text-gray-800 mb-2">(855) 568-3704</p>
            <p className="text-sm text-gray-400">24/7 Support Available</p>
          </div>

          {/* Email Us Card */}
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="w-20 h-20 bg-[#1a3a5c] rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10 text-yellow-400" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-[#1a3a5c] mb-3">Email Us</h3>
            <p className="text-gray-600 mb-4">Send us your queries anytime</p>
            <p className="text-xl font-semibold text-gray-800 mb-2">support@bookingopro.com</p>
            <p className="text-sm text-gray-400">Response within 24 hours</p>
          </div>

          {/* Visit Us Card */}
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="w-20 h-20 bg-[#1a3a5c] rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-yellow-400" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-[#1a3a5c] mb-3">Visit Us</h3>
            <p className="text-gray-600 mb-4">Our office location</p>
            <p className="text-lg font-semibold text-gray-800 mb-1">30 N Gould St # 50963</p>
            <p className="text-lg font-semibold text-gray-800 mb-2">Sheridan, WY 82801</p>
            <p className="text-sm text-gray-400">United States</p>
          </div>
        </div>
      </div>

      <ContactForm />
      <FAQ/>

       <div className="px-4 py-10 -mb-28">
      <div className="max-w-7xl mx-auto bg-[#1a3a5c] rounded-3xl py-12 px-8 text-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-[#e93d18] mb-4">
          Customer Support Hours
        </h2>
        
        {/* Days */}
        <p className="text-white text-lg md:text-xl mb-2">
          Monday - Sunday
        </p>
        
        {/* 24/7 Support */}
        <p className="text-[#e93d18] text-xl md:text-2xl font-bold mb-6">
          24/7 Support Available
        </p>
        
        {/* Description */}
        <p className="text-white text-base md:text-lg max-w-4xl mx-auto leading-relaxed">
          Our dedicated team is always ready to help you with your travel needs, any time of the day or night.
        </p>
      </div>
    </div>
    </div>
  );
};

export default Contact;