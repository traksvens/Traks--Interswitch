import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// --- ICON FIX ---
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- NEW COMPONENT: AUTO-ZOOM CONTROLLER ---
// This invisible component watches your posts and moves the camera
const MapController = ({ posts, activeAlerts }) => {
  const map = useMap();

  useEffect(() => {
    // If we have posts or alerts, calculate their boundaries
    const points = [
      ...posts.map((p) => [p.location.lat, p.location.lng]),
      ...activeAlerts.map((a) => [a.location.lat, a.location.lng]),
    ];

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      // Pad the view so pins aren't stuck to the very edge
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [posts, activeAlerts, map]);

  return null;
};

const SecurityMap = ({ posts, activeAlerts }) => {
  // Fallback center (Ado-Ekiti) if map is empty
  const defaultCenter = [7.619, 5.221];

  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden shadow-lg border z-0 relative">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* AUTO-ZOOM CONTROLLER */}
        <MapController posts={posts} activeAlerts={activeAlerts} />

        {/* SOS ALERTS */}
        {activeAlerts.map((alert) => (
          <CircleMarker
            key={alert.id}
            center={[alert.location.lat, alert.location.lng]}
            pathOptions={{ color: "red", fillColor: "red", fillOpacity: 0.5 }}
            radius={20}
          >
            <Popup>SOS: {alert.reporterName}</Popup>
          </CircleMarker>
        ))}

        {/* POST MARKERS */}
        {posts.map((post) => (
          <Marker
            key={post.id}
            position={[post.location.lat, post.location.lng]}
          >
            <Popup>
              <div className="min-w-[150px]">
                <strong>{post.incidentType}</strong>
                <p className="text-xs">{post.content}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SecurityMap;
