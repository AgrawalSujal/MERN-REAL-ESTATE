import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaSearch } from "react-icons/fa";
import { BsFillBuildingsFill } from "react-icons/bs";
const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [searchTerm, setSeachTerm] = useState(" ");
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set("searchTerm", searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermfromUrl = urlParams.get("searchTerm");
    if (searchTermfromUrl) {
      setSeachTerm(searchTermfromUrl);
    }
  }, [location.search]);

  return (
    <header className="bg-slate-200 shadow-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <Link to="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="h-auto  mx-auto bg-slate-200">
              <BsFillBuildingsFill />
            </span>
            <span className="text-slate-500">Darshanam</span>
            <span className="text-slate-700">Estates</span>
          </h1>
        </Link>
        <form
          onSubmit={handleSubmit}
          className="bg-slate-100 p-3 rounded-lg flex items-center"
        >
          <input
            type="text"
            placeholder="Search...."
            className="bg-transparent focus:outline-none w-24 sm:w-64"
            value={searchTerm}
            onChange={(e) => setSeachTerm(e.target.value)}
          />
          <button>
            <FaSearch className="text-slate-600" />
          </button>
        </form>
        <ul className="flex gap-4">
          <Link to="/">
            <li className="hidden sm:inline text-slate-700 hover:underline">
              Home
            </li>
          </Link>
          <Link to="/about">
            <li className="hidden sm:inline text-slate-700 hover:underline">
              About
            </li>
          </Link>
          {currentUser ? (
            <li>
              <Link to="/profile">
                <img
                  className="rounded-full h-7 w-7 hover:underline"
                  src={currentUser.avatar}
                  alt="profile"
                />
              </Link>
            </li>
          ) : (
            <li className="text-slate-700 hover:underline">
              <Link to="/sign-in">Sign in</Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;
