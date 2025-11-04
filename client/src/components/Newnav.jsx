import React from 'react'

const Newnav = () => {
  return (
    <div className='w-full h-10 bg-indigo-800 text-white relative'>
      <div className="flex justify-between items-center h-full">
        <div className="hidden md:flex flex-1 justify-start items-center h-full space-x-4 pl-4">
          <p className="hover:text-indigo-200 cursor-pointer px-1 py-1 transition-colors duration-200 text-sm">All</p>
          <p className="hover:text-indigo-200 cursor-pointer px-1 py-1 transition-colors duration-200 text-sm">Mobile</p>
          <p className="hover:text-indigo-200 cursor-pointer px-1 py-1 transition-colors duration-200 text-sm">Bestseller</p>
          <p className="hover:text-indigo-200 cursor-pointer px-1 py-1 transition-colors duration-200 text-sm">Fashion</p>
          <p className="hover:text-indigo-200 cursor-pointer px-1 py-1 transition-colors duration-200 text-sm">Customer Services</p>
          <p className="hover:text-indigo-200 cursor-pointer px-1 py-1 transition-colors duration-200 text-sm">Electronics</p>
          <p className="hover:text-indigo-200 cursor-pointer px-1 py-1 transition-colors duration-200 text-sm">Prime</p>
          <p className="hover:text-indigo-200 cursor-pointer px-1 py-1 transition-colors duration-200 text-sm">Today's deal</p>
          <p className="hover:text-indigo-200 cursor-pointer px-1 py-1 transition-colors duration-200 text-sm">Nexus Pay</p>
        </div>

        <div className="flex md:hidden flex-1 justify-center items-center h-full">
          <p className="text-sm">Shop Categories</p>
        </div>

        <div className="flex absolute right-0 top-0 h-full items-center">
          <img src="./nav.png" alt="Navigation data" className="h-full object-contain" />
        </div>
      </div>
    </div>
  )
}

export default Newnav