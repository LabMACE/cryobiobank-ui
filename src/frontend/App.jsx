import './App.css';
import FrontendMap from '../maps/FrontendMap';
import Isolates from './Isolates';

const FrontendApp = () => {

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
                        <li><a href="#isolates">Data</a></li>
                        <li><a href="#map">Map</a></li>
                    </ul>
                </nav>
            </header>

            <section className="hero-section" id="home">
                <div className="hero-content">
                    <h1>Welcome to CryoBioBank</h1>
                    <p>
                        Explore detailed information about isolates, samples, and sites from our fieldwork collection.
                    </p>
                    <div className="cta-buttons">
                        <a href="#isolates" className="cta-button">
                            <i className="fa-solid fa-database"></i>
                            View data
                        </a>
                        <a href="#map" className="cta-button">
                            <i className="fa-solid fa-map"></i>
                            Explore map
                        </a>
                    </div>
                </div>
            </section>

           <section className="isolates-section" id="isolates">
               <Isolates />
           </section>
            {/* Full viewport map section */}
            <section className="map-section" id="map">
                <div className="map-container">
                    <FrontendMap height="100%" width="100%"/>
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
