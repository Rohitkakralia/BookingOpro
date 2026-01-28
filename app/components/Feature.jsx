function Feature() {
  return (
    <div className="max-w-7xl mx-auto mt-20 grid grid-cols-1 min-[700px]:grid-cols-2 md:grid-cols-4 gap-10 text-center px-6">
      {[
        ["💲", "Price Match Promise"],
        ["🎧", "24/7 Customer Support"],
        ["🏅", "TravelMiles Rewards"],
        ["❌", "Easy Cancellations"],
      ].map(([icon, title], i) => (
        <div
          key={i}
          className="p-8 rounded-3xl w-full h-[250px] hover:border-2 hover:shadow-2xl hover:translate-y-2 border-[#e93d18] transition"
        >
          <div className="text-4xl w-16 h-16 mx-auto rounded-full bg-gray-200 flex items-center justify-center">
            {icon}
          </div>
          <h3 className="font-bold text-lg mt-4">{title}</h3>
          <p className="text-gray-600 text-sm mt-2">
            Trusted travel benefits for all customers
          </p>
        </div>
      ))}
    </div>
  );
}

export default Feature;
