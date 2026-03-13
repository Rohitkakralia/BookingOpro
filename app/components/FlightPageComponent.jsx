"use client";
import React from "react";

const FlightPageComponent = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-row mt-40 justify-center gap-6 px-6">
        {/* LEFT COLUMN – 4 DIVS */}
        <div className="flex flex-col justify-start w-[50%] gap-6">
          {/* 1️⃣ Booking Flights Made Simple */}
          <div className="h-[300px] bg-white rounded-2xl hover:border-amber-500 hover:bg-red-50 shadow-xl relative overflow-hidden transition-all duration-300">
            {/* Top gradient border */}
            <div className="absolute top-0 left-0 w-full h-[5px] bg-gradient-to-r from-emerald-800 to-yellow-400"></div>

            <div className="p-8">
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-emerald-900 flex items-center justify-center mb-6 shadow">
                <span className="text-yellow-400 text-2xl">✈️</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-extrabold text-emerald-900 mb-4">
                Booking Flights Made Simple
              </h2>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Need to find a cheap ticket without wasting hours on the web?
                BookingOPro enables you to compare and book tickets from all
                domestic and international airlines.
              </p>

              {/* Feature list */}
              <ul className="text-sm text-gray-800 mb-6">
                {[
                  "One way, return & multi city flights",
                  "Tickets for domestic and foreign airlines",
                  "Honest pricing with no hidden fees",
                  "Quick and secure book flights process",
                  "Instant flight confirmation",
                ].map((item, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-3 py-2 border-t first:border-t-0"
                  >
                    <span className="text-green-500 font-bold">✔</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              {/* Highlight note */}
              <div className="bg-gray-50 border-l-4 border-yellow-400 rounded-md p-4 text-sm text-gray-600 italic h-70px">
                Whether you are booking in advance or looking for a last minute
                flight, we have the perfect deals for everything from business
                trips to beach getaways.
              </div>
            </div>
          </div>

          {/* 2️⃣ 24/7 Customer Assistance */}
          <div className="h-[300px] bg-white rounded-2xl border border-yellow-400 p-6 shadow-sm hover:shadow-lg hover:border-amber-500 transition-all duration-300">
            <h2 className="text-xl font-bold text-teal-900 mb-4">
              Book Flight Tickets with 24/7 Customer Assistance
            </h2>

            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex gap-2">✅ 24/7 customer service</li>
              <li className="flex gap-2">✅ Booking & ticket changes</li>
              <li className="flex gap-2">✅ Cancellation & refund support</li>
              <li className="flex gap-2">✅ Friendly travel experts</li>
            </ul>
          </div>

          {/* 3️⃣ Booking Hotels */}
          <div className="h-[300px] bg-white rounded-2xl border border-yellow-400 p-6 shadow-sm hover:shadow-lg hover:border-amber-500 transition-all duration-300">
            <h2 className="text-xl font-bold text-teal-900 mb-4">
              Booking Hotels For The Best Price
            </h2>

            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">✅ Budget & luxury hotels</li>
              <li className="flex gap-2">✅ Verified properties & reviews</li>
              <li className="flex gap-2">✅ Flexible booking options</li>
              <li className="flex gap-2">✅ Instant hotel confirmation</li>
            </ul>
          </div>

          {/* 4️⃣ Info Box */}
          <div className="h-[300px] bg-white rounded-2xl border border-yellow-400 p-6 shadow-sm flex items-center hover:shadow-lg hover:border-amber-500 transition-all duration-300">
            <p className="text-sm text-gray-600">
              Whether you&apos;re booking in advance or looking for a last-minute
              deal, BookingOPro helps you travel the way that works best for
              you.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN – 3 DIVS */}
        <div className="flex flex-col w-[50%] gap-6">
          {/* 1️⃣ Why Choose */}
          <div className="h-[300px] bg-yellow-50 border border-yellow-400 rounded-2xl p-6 hover:shadow-lg hover:border-amber-500 transition-all duration-300">
            <h3 className="font-bold text-teal-900 mb-4 text-xl">
              Why Choose BookingOPro?
            </h3>
            <p className="text-base text-gray-700 leading-relaxed">
              Cheap flights • Secure booking • Global partners • 24/7 Support •
              Instant confirmation
            </p>
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm text-gray-600">
                  Best price guarantee
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm text-gray-600">No hidden fees</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span className="text-sm text-gray-600">Secure payment</span>
              </div>
            </div>
          </div>

          {/* 2️⃣ One Stop Platform */}
          <div className="h-[300px] bg-white border border-yellow-400 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-amber-500 transition-all duration-300">
            <h3 className="font-bold text-teal-900 mb-4 text-xl">
              One-Stop Travel Platform
            </h3>
            <p className="text-base text-gray-600 mb-6 leading-relaxed">
              Flights, hotels, and car rentals all in one convenient platform.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600">✈️</span>
                </div>
                <span className="text-sm text-gray-700">Flight bookings</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600">🏨</span>
                </div>
                <span className="text-sm text-gray-700">
                  Hotel reservations
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600">🚗</span>
                </div>
                <span className="text-sm text-gray-700">Car rentals</span>
              </div>
            </div>
          </div>

          {/* 3️⃣ CTA */}
          <div className="h-[300px] bg-teal-900 rounded-2xl p-6 flex flex-col justify-between hover:bg-teal-800 transition-all duration-300">
            <div>
              <h3 className="text-xl font-bold text-white mb-4">
                Ready to Travel?
              </h3>
              <p className="text-base text-white mb-6">
                Search • Compare • Book
              </p>
              <div className="space-y-2 text-sm text-gray-200">
                <p>• Compare prices from 500+ airlines</p>
                <p>• Book hotels at the best rates</p>
                <p>• Rent cars worldwide</p>
              </div>
            </div>

            <button className="bg-yellow-400 text-black py-3 px-6 rounded-lg font-semibold hover:bg-yellow-500 transition-colors duration-200 text-base">
              BOOK FLIGHTS & HOTELS NOW
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightPageComponent;
