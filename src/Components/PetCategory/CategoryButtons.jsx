import React from "react";

function CategoryButtons({ selectedCategory, onSelectCategory, isLoading }) {
  const categories = [
    { id: "All", label: "All Pets", icon: "🐾" },
    { id: "Dog", label: "Dogs", icon: "🐕" },
    { id: "Cat", label: "Cats", icon: "🐱" },
  ];

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-6 sm:mb-8">
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          disabled={isLoading}
          className={`group relative px-4 py-2 sm:px-6 sm:py-3 text-sm sm:text-base font-semibold rounded-full border-2 transition-all duration-300 ease-in-out transform ${
            selectedCategory === category.id
              ? "bg-[#a16f4a] text-white border-[#a16f4a] shadow-lg scale-105"
              : "bg-white text-gray-700 border-gray-300 hover:border-[#a16f4a] hover:text-[#a16f4a] shadow-md hover:scale-105"
          } ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
        >
          {/* Background animation */}
          <div
            className={`absolute inset-0 rounded-full transition-all duration-300 ${
              selectedCategory === category.id
                ? "bg-[#a16f4a]"
                : "bg-gradient-to-r from-[#a16f4a]/0 to-[#a16f4a]/0 group-hover:from-[#a16f4a]/5 group-hover:to-[#a16f4a]/10"
            }`}
          ></div>

          {/* Content */}
          <div className="relative flex items-center space-x-2">
            <span className="text-lg">{category.icon}</span>
            <span>{category.label}</span>
            {/* Loading indicator for active category */}
            {selectedCategory === category.id && isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
          </div>

          {/* Active indicator */}
          {selectedCategory === category.id && !isLoading && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-[#a16f4a] rounded-full animate-pulse"></div>
          )}
        </button>
      ))}
    </div>
  );
}

export default CategoryButtons;
