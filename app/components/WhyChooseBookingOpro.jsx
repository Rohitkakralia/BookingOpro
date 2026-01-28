
function WhyChooseBookingOpro() {
  return (
    <section
      className="relative h-[450px] mt-14 flex items-center justify-center"
      style={{
        backgroundImage:
          "url(https://images.unsplash.com/photo-1626120639806-1237f30e6576?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center text-white px-4">
        {/* Heading */}
        <h2 className="text-4xl font-bold mb-2">
          Why Choose <span className="text-[#e93d18]">BookingOpro?</span>
        </h2>
        <p className="text-lg mb-14">Your trusted travel partner</p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Card 1 */}
          <div className="flex flex-col items-center">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mb-5">
              <span className="text-3xl">🏅</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Best Price Guarantee</h3>
            <p className="text-sm max-w-xs">
              We offer the most competitive prices on hotels and flights
              worldwide.
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col items-center">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mb-5">
              <span className="text-3xl">📞</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              24/7 Customer Support
            </h3>
            <p className="text-sm max-w-xs">
              Our dedicated team is always here to help you with your travel
              needs.
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col items-center">
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mb-5">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Booking</h3>
            <p className="text-sm max-w-xs">
              Your payment and personal information are always safe and secure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyChooseBookingOpro;