export const Navbar = () => {
  return (
    <nav className="bg-yellow-airline p-4 shadow-md flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-black tracking-tighter">
          YELLOW AIRLINE ✈️
        </span>
      </div>
      
      <div className="flex gap-6 items-center">
        <a href="#" className="font-medium hover:underline text-black">Vuelos</a>
        <a href="#" className="font-medium hover:underline text-black">Ofertas</a>
        <button className="bg-black text-white px-4 py-2 rounded-full font-bold hover:bg-gray-800 transition-colors">
          Área VIP ⭐
        </button>
      </div>
    </nav>
  );
};