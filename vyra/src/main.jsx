import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/base.css";
import "./styles/layout.css";
import "./styles/home.css";
import "./styles/player.css";
import "./styles/spotify.css";
import "./styles/discovery.css";
import "./styles/search.css";
import "./styles/detail.css";
import "./styles/library.css";
import "./styles/embed.css";
import "./styles/home-extra.css";
import { SpotifyProvider } from "./context/SpotifyContext";
import { PlayerProvider } from "./context/PlayerContext";
import { LibraryProvider } from "./context/LibraryContext";
import App from "./App.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SpotifyProvider>
      <PlayerProvider>
        <LibraryProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </LibraryProvider>
      </PlayerProvider>
    </SpotifyProvider>
  </React.StrictMode>
);
