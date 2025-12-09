import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavigationBar.css';

function NavigationBar() {
    return (
        <div className="navigation-bar">
            <nav>
                <ul>
                    <li><NavLink to="/">Dashboard</NavLink></li>
                    <li><NavLink to="/node-details">Node Details</NavLink></li>
                    <li><NavLink to="/alerts">Alerts</NavLink></li>
                </ul>
            </nav>
        </div>
    )
}

export default NavigationBar;