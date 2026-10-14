import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { formatDistance } from '../../utils/formatters';

export const NetworkMap = ({
  center = [28.6139, 77.209], // Default: Hospital lat/lon
  zoom = 13,
  hospital,
  donors = [],
  bloodBanks = [],
  searchRadiusKm = 25,
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Check if map already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center,
        zoom,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup on unmount handled gracefully
    };
  }, []);

  // Update Markers and Search Radius Circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const bounds = [];

    // 1. Hospital Marker
    if (hospital && hospital.location) {
      const hLat = hospital.location.latitude;
      const hLon = hospital.location.longitude;
      bounds.push([hLat, hLon]);

      const hospitalIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="
            background: #dc2626;
            color: #fff;
            width: 38px;
            height: 38px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 18px;
            box-shadow: 0 0 15px rgba(220, 38, 38, 0.6);
            border: 3px solid #fff;
          ">🏥</div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([hLat, hLon], { icon: hospitalIcon });
      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <h4 style="margin: 0 0 4px 0; color: #0f1e36; font-size: 14px;">${hospital.hospitalName || 'Hospital'}</h4>
          <p style="margin: 0; font-size: 12px; color: #64748b;">${hospital.address || ''}</p>
          <div style="margin-top: 6px; font-size: 11px; font-weight: 700; color: #dc2626;">Request Origin</div>
        </div>
      `);
      layerGroup.addLayer(marker);

      // Search Radius Circle
      if (searchRadiusKm) {
        const radiusMeters = searchRadiusKm * 1000;
        const circle = L.circle([hLat, hLon], {
          radius: radiusMeters,
          color: '#3b82f6',
          fillColor: '#3b82f6',
          fillOpacity: 0.07,
          weight: 1.5,
          dashArray: '5, 5',
        });
        layerGroup.addLayer(circle);
      }
    }

    // 2. Donor Markers (Approximate locations)
    donors.forEach((donor) => {
      const coords = donor.displayCoords || donor.location;
      if (!coords || !coords.latitude || !coords.longitude) return;

      bounds.push([coords.latitude, coords.longitude]);

      const isEligible = donor.screening?.isScreeningEligible;
      const donorColor = isEligible ? '#10b981' : '#f59e0b';

      const donorIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="
            background: #fff;
            color: #dc2626;
            border: 2px solid ${donorColor};
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 11px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.25);
          ">${donor.bloodGroup}</div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([coords.latitude, coords.longitude], {
        icon: donorIcon,
      });

      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 170px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <strong style="color: #0f1e36; font-size: 13px;">${donor.name}</strong>
            <span style="background: #fee2e2; color: #991b1b; padding: 1px 6px; border-radius: 10px; font-weight: 700; font-size: 11px;">${donor.bloodGroup}</span>
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 4px;">Area: ${donor.currentArea}</div>
          <div style="font-size: 11px; color: #0284c7; font-weight: 600;">Distance: ~${formatDistance(donor.distanceKm)}</div>
          <div style="font-size: 11px; color: ${isEligible ? '#059669' : '#d97706'}; margin-top: 4px;">
            ${isEligible ? '✓ Screen Eligible' : '⚠ Interval Pending'}
          </div>
        </div>
      `);

      layerGroup.addLayer(marker);
    });

    // 3. Blood Bank Markers
    bloodBanks.forEach((bank) => {
      if (!bank.location || !bank.location.latitude) return;

      bounds.push([bank.location.latitude, bank.location.longitude]);

      const bankIcon = L.divIcon({
        className: 'custom-map-icon',
        html: `
          <div style="
            background: #0b1a30;
            color: #38bdf8;
            border: 2px solid #38bdf8;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 16px;
            box-shadow: 0 2px 10px rgba(11, 26, 48, 0.4);
          ">🏦</div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([bank.location.latitude, bank.location.longitude], {
        icon: bankIcon,
      });

      marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 200px;">
          <h4 style="margin: 0 0 2px 0; color: #0f1e36; font-size: 13px;">${bank.bloodBankName}</h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b;">${bank.address}</p>
          <div style="font-size: 12px; font-weight: 700; color: #059669; margin-bottom: 4px;">
            ${bank.totalCompatibleUnits !== undefined ? `${bank.totalCompatibleUnits} Compatible Units Available` : 'Registered Blood Bank'}
          </div>
          <div style="font-size: 11px; color: #0284c7;">Distance: ~${formatDistance(bank.distanceKm)}</div>
          <div style="font-size: 11px; color: #475569; margin-top: 4px;">Contact: ${bank.contactPhone}</div>
        </div>
      `);

      layerGroup.addLayer(marker);
    });

    // Adjust view bounds to fit all markers if present
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [hospital, donors, bloodBanks, searchRadiusKm]);

  return (
    <div style={{ position: 'relative' }}>
      <div ref={mapContainerRef} className="map-frame" />
      {/* Map Legend */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 12,
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '6px 12px',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          fontSize: '11px',
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          zIndex: 400,
          border: '1px solid #e2e8f0',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#dc2626' }} />
          Hospital
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
          Eligible Donor
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
          Interval Pending
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: '2px', background: '#0b1a30' }} />
          Blood Bank
        </span>
      </div>
    </div>
  );
};

export default NetworkMap;
