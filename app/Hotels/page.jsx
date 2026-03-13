"use client";
import HotelLocationSearch from '../components/HotelLocationSearch';

export default function HotelsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <HotelLocationSearch />
      </div>
    </div>
  );
}