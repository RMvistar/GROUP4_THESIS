import React from 'react';
import './NavigationBar.css';

function NavigationBar() {
    return (
        <div className="navigation-bar">
            <nav>
                <ul>
                    <li>Dashboard</li>
                    <li>Node Details</li>
                    <li>Alerts</li>
                </ul>
            </nav>
        </div>
    )
}

export default NavigationBar;