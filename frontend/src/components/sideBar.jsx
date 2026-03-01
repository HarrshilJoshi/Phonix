import React from 'react';
import { Home as HomeIcon, Heart, Plus, X } from 'lucide-react';
import './sideBar.css';

const SideBar = ({ setActiveTab, closeSidebar, isOpen }) => {
  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Close button only on mobile */}





      <div className="sidebar-title-container" style={{ padding: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
  <img src="/icons/phonix-horizontal.png" alt="PhoniX Symbol" style={{ height: '80px', width: 'auto' }} />
  
</div>

      <ul className="sidebar-list">
        <li>
          <button
            className="sidebar-btn"
            onClick={() => {
              setActiveTab("home");
              closeSidebar();
            }}
          >
            <HomeIcon size={20} /> Home
          </button>
        </li>

        <li>
          <button
            className="sidebar-btn"
            onClick={() => {
              setActiveTab("favourites");
              closeSidebar();
            }}
          >
            <Heart size={20} /> Favourites
          </button>
        </li>

        <li>
          <button
            className="sidebar-btn"
            onClick={() => {
              setActiveTab("playlists");
              closeSidebar();
            }}
          >
            <Plus size={20} /> Your Playlist
          </button>
        </li>
      </ul>
    </div>
  );
};

export default SideBar;
