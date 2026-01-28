export default function TopDeals() {
  return (
    <section className="max-w-6xl mx-auto mt-14 px-4 py-16">

      {/* Heading */}
      <h2 className="text-3xl font-bold mb-10 text-black">
        Top Deals
      </h2>

      {/* Top Cards */}
      <div className="grid md:grid-cols-3 gap-8">

        {/* Card 1 */}
        <DealCard
          image="https://images.unsplash.com/photo-1626120639806-1237f30e6576?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          title="Beachfront Resort in Fiji"
          price="$199/night"
        />

        {/* Card 2 */}
        <DealCard
          image="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
          title="Luxury Suites – Saudi Arabia"
          price="$250/night*"
        />

        {/* Card 3 */}
        <DealCard
          image="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
          title="Safari Resort – South Africa"
          price="$179/night*"
        />

      </div>

      {/* Big Banner */}
      <div
        className="relative mt-12 h-[320px] rounded-2xl overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://wallpapers.com/images/featured-full/winter-laptop-w0otzv7u2h307p5i.jpg)",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 h-full flex flex-col justify-end p-8 text-white">
          <h3 className="text-2xl md:text-3xl font-bold">
            Exclusive Winter Getaway
          </h3>
          <p className="mt-1 text-lg">Up to 40% OFF</p>

          <button className="mt-4 w-fit px-6 py-2 border border-white rounded-lg hover:bg-white hover:text-black transition">
            Explore Now
          </button>
        </div>
      </div>
    </section>
  );
}

/* SMALL CARD COMPONENT */
function DealCard({ image, title, price }) {
  return (
    <div
      className="relative h-[260px] rounded-2xl overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${image})` }}
    >
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 h-full flex flex-col justify-end p-6 text-white">
        <h3 className="font-semibold text-lg leading-snug">
          {title}
        </h3>
        <p className="font-bold mt-1">{price}</p>

        <button className="mt-3 w-fit px-4 py-1.5 border border-white rounded-lg text-sm hover:bg-white hover:text-black transition">
          View Details
        </button>
      </div>
    </div>
  );
}
