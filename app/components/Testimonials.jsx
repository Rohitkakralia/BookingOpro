
"use client";


function Testimonials() {
    const testimonials = [
  {
    text: "All the Lorem Ipsum generators on the Internet to repeat predefined chunks as necessary, making this the first true generator on the Inter.",
    name: "John Smith",
  },
  {
    text: "All the Lorem Ipsum generators on the Internet to repeat predefined chunks as necessary, making this the first true generator on the Inter.",
    name: "Susan Hill",
  },
  {
    text: "All the Lorem Ipsum generators on the Internet to repeat predefined chunks as necessary, making this the first true generator on the Inter.",
    name: "David Williams",
  },
];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 text-center">
        {/* Heading */}
        <h2 className="text-4xl font-bold mb-2">What Our Customers Say</h2>
        <p className="text-gray-500 uppercase tracking-wider mb-16">
          Real reviews from real travelers
        </p>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {testimonials.map((item, index) => (
            <div key={index} className="relative px-6">
              {/* Quote Icon */}
              <span className="text-gray-300 text-6xl block mb-6">“</span>

              {/* Text */}
              <p className="text-gray-700 leading-relaxed mb-6">{item.text}</p>

              {/* Name */}
              <h4 className="text-orange-500 font-semibold uppercase">
                {item.name}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export default Testimonials;