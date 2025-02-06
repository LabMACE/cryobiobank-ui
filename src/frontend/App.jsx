import React, { useState, useRef, useEffect } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { BaseLayers } from '../maps/Layers';
import  FrontendMap  from '../maps/FrontendMap';

const FrontendApp = () => {
    const [dataDropdownOpen, setDataDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDataDropdown = (e) => {
        e.preventDefault();
        setDataDropdownOpen((prev) => !prev);
    };

    // Close dropdown if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDataDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="frontend-app">
            <header className="top-bar">
                <div className="logo">
                    <img src="/favicon.ico" alt="CryoBioBank favicon" className="logo-icon" />
                    CryoBioBank
                </div>
                <nav>
                    <ul className="nav-links">
                        <li><a href="#home">Home</a></li>
                        <li><a href="#map">Map</a></li>
                        <li className="dropdown" ref={dropdownRef}>
                            <a href="#data" onClick={toggleDataDropdown}>Data</a>
                            {dataDropdownOpen && (
                                <ul className="dropdown-menu">
                                    <li>
                                        <a href="#isolates" onClick={() => setDataDropdownOpen(false)}>
                                            Isolates
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#samples" onClick={() => setDataDropdownOpen(false)}>
                                            Samples
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#sites" onClick={() => setDataDropdownOpen(false)}>
                                            Sites
                                        </a>
                                    </li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </nav>
            </header>

            <section className="hero-section" id="home">
                <div className="hero-content">
                    <h1>Welcome to CryoBioBank</h1>
                    <p>
                        Explore detailed information about isolates, samples, and sites from our fieldwork collection.
                    </p>
                    <a href="#map" className="cta-button">Explore map</a>
                </div>
            </section>

            <section className="map-section" id="map">
                <h2>Explore Our Map</h2>
                <div className="map-wrapper">
                    {/* <MapContainer
                        center={[46.2333, 7.3667]}
                        zoom={8}
                        scrollWheelZoom={true}
                        style={{ height: '400px', width: '100%' }}
                        maxBounds={[
                            [45.398181, 5.140242],
                            [47.808455, 10.492294]
                        ]}
                        minZoom={8}
                    >
                        <BaseLayers />
                        <Marker position={[46.2333, 7.3667]}>
                            <Popup>Sion, Switzerland</Popup>
                        </Marker>
                    </MapContainer> */}
                    <FrontendMap/>
                </div>
            </section>

            <footer className="footer">
                <p className="footer-attribution">
                    &copy; {new Date().getFullYear()} CryoBioBank.{' '}
                    <a
                        href="https://www.epfl.ch/labs/mace/"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        MACE EPFL
                    </a>
                </p>
                <a href="/admin" className="footer-lemon" title="Go to Admin">
                    <i className="fa-regular fa-lemon"></i>
                </a>
            </footer>
        </div>
    );
};

export default FrontendApp;
