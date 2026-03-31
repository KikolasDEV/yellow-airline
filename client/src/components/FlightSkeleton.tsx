export const FlightSkeleton = () => (
  // La clase 'animate-pulse' es la que hace que el div aparezca y desaparezca suavemente
  <div className="border border-gray-100 rounded-4xl p-6 bg-white animate-pulse shadow-sm">
    <div className="flex justify-between items-center mb-8">
      <div className="h-10 w-20 bg-gray-200 rounded-xl"></div>
      <div className="h-4 w-10 bg-gray-100 rounded-full"></div>
      <div className="h-10 w-20 bg-gray-200 rounded-xl"></div>
    </div>
    
    <div className="space-y-3">
      <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
      <div className="flex justify-between items-end mt-6">
        <div className="h-8 w-24 bg-gray-200 rounded-lg"></div>
        <div className="h-12 w-32 bg-yellow-100 rounded-2xl"></div>
      </div>
    </div>
  </div>
);