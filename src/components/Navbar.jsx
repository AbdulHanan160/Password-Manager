import React from 'react'

const Navbar = () => {
  return (
    <div>
      <nav className="navbar flex justify-between items-center p-4 bg-[#0a0025] text-white">
        <div className="logo">
            <img className="logo-img w-40" src="logo.jpg" alt="Logo" />
        </div>
        <ul className="nav-links flex gap-4">
            <li><a to="/">Home</a></li>
            <li><a to="/about">About</a></li>
            <li><a to="/contact">Contact</a></li>    
        </ul>
      </nav>
    </div>
  )
}

export default Navbar
