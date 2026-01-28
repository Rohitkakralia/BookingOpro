function Footer() {
  return (
    <footer className="bg-[#063f3f] text-white">
      {/* Newsletter */}
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          Subscribe to Our Newsletter
        </h2>
        <p className="text-gray-200 mb-10">
          Get exclusive discounts on luxury hotels worldwide.
        </p>

        <div className="flex flex-col sm:flex-row rounded-2xl bg-white justify-center items-center max-w-xl mx-auto">
          <input
            type="email"
            placeholder="Enter Your Email"
            className="w-full sm:flex-1 px-5 py-4 text-gray-700 rounded-l-md sm:rounded-none sm:rounded-l-md focus:outline-none"
          />
          <button className="w-full sm:w-auto bg-linear-to-l cursor-pointer from-[#db6c53] to-[#e93d18] text-black font-semibold px-8 py-4 rounded-r-md sm:rounded-none sm:rounded-r-md hover:bg-yellow-500 transition">
            Subscribe →
          </button>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          {/* Column 1 */}
          <div>
            <h4 className="font-semibold text-lg mb-4">
              Top Hotel Destinations
            </h4>
            <ul className="space-y-2 text-gray-200">
              <li>Philippines</li>
              <li>Italy</li>
              <li>United Kingdom</li>
              <li>Spain</li>
              <li>Nigeria</li>
              <li>France</li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="font-semibold text-lg mb-4">
              Hotel Partners
            </h4>
            <ul className="space-y-2 text-gray-200">
              <li>Hilton</li>
              <li>Marriott</li>
              <li>Taj</li>
              <li>Hyatt</li>
              <li>Accor</li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="font-semibold text-lg mb-4">
              Help
            </h4>
            <ul className="space-y-2 text-gray-200">
              <li>FAQs</li>
              <li>Baggage Fees</li>
              <li>Airline Contact</li>
              <li>Travel Blog</li>
              <li>Contact Us</li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="font-semibold text-lg mb-4">
              Company
            </h4>
            <ul className="space-y-2 text-gray-200">
              <li>About Us</li>
              <li>Reviews</li>
              <li>Privacy Policy</li>
              <li>Terms and Conditions</li>
              <li>Customer Service</li>
              <li>Cookies Policy</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className=" py-8 -mt-20 text-center">
        {/* Social Icons */}
        <div className="flex justify-center gap-6 text-xl mb-4">
          <span>f</span>
          <span>𝕏</span>
          <span>in</span>
          <span>I</span>
        </div>

        <p className="text-xs text-gray-300 mx-auto px-4">
          Savings are calculated from an unrestricted "Y" class published airfare
          of major scheduled airlines commonly known as refundable tickets.
          © 2026 BookingOpro.com. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
