import React from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App.jsx";
import { SmpProvider } from "./app/SmpProvider.jsx";
import "./styles.css";
import "./workspace.css";

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const app = (
  <Auth0Provider
    domain={domain || "example.auth0.com"}
    clientId={clientId || "auth0-not-configured"}
    cacheLocation="localstorage"
    authorizationParams={{
      redirect_uri: window.location.origin,
      audience: import.meta.env.VITE_AUTH0_AUDIENCE,
    }}
  >
    <SmpProvider>
      <App />
    </SmpProvider>
  </Auth0Provider>
);

createRoot(document.getElementById("root")).render(app);
