
function MostSearchedDestinations() {
  const destinations = [
    {
      name: "Thailand",
      hotels: "400+ Hotels",
      img: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4",
    },
    {
      name: "New Zealand",
      hotels: "350+ Hotels",
      img: "https://images.unsplash.com/photo-1502784444187-359ac186c5bb",
    },
    {
      name: "Australia",
      hotels: "600+ Hotels",
      img: "https://images.unsplash.com/photo-1506973035872-a4f23efee28f",
    },
    {
      name: "France",
      hotels: "230+ Hotels",
      img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    },
    {
      name: "Norway",
      hotels: "520+ Hotels",
      img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470",
    },
    {
      name: "Maldives",
      hotels: "780+ Hotels",
      img: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21",
    },
    {
      name: "Canada",
      hotels: "675+ Hotels",
      img: "https://images.unsplash.com/photo-1508264165352-258db2ebd59b",
    },
    {
      name: "Italy",
      hotels: "900+ Hotels",
      img: "https://images.unsplash.com/photo-1526481280691-9062a7f29b87",
    },
  ];

  
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 text-center">
      {/* Heading */}
      <h2 className="text-4xl font-bold text-slate-900">
        Most Searched Destinations
      </h2>
      <p className="text-gray-500 mt-4 max-w-2xl mx-auto">
        Discover amazing places around the world that travelers love to explore.
      </p>

      {/* Cards */}
      <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left">
        {destinations.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-white rounded-2xl shadow-sm hover:shadow-md transition p-6 cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.img}
                alt={item.name}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-lg text-slate-900">
                  {item.name}
                </h3>
                <p className="text-gray-500 text-sm">{item.hotels}</p>
              </div>
            </div>

            <span className="text-2xl text-gray-400">→</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default MostSearchedDestinations;