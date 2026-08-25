import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Clock,
  Car,
  Footprints,
  Bus,
  Sparkles,
  Phone,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Printer,
  FileText,
  UserCheck,
  Zap,
  Route as RouteIcon
} from 'lucide-react';
import L from 'leaflet';
import { ClientProfile, RiskLevel, VisitRouteItem, VisitRoutePlan } from '../types';

interface VisitRoutePlannerProps {
  clients: ClientProfile[];
  onSelectClientForConsultation?: (client: ClientProfile) => void;
  onSelectDocument?: (docId: string) => void;
}

export const VisitRoutePlanner: React.FC<VisitRoutePlannerProps> = ({
  clients,
  onSelectClientForConsultation,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const polylineRef = useRef<L.Polyline | null>(null);

  const [transportMode, setTransportMode] = useState<'도보' | '차량' | '대중교통'>('차량');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clients[0]?.id || null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routePlan, setRoutePlan] = useState<VisitRoutePlan | null>(null);
  const [completedStops, setCompletedStops] = useState<Record<string, boolean>>({});

  // Center coordinate (Default: Gangbuk Senior Welfare Center area)
  const centerLat = 37.6320;
  const centerLng = 127.0150;

  // Initialize Route Stops from clients
  useEffect(() => {
    if (clients.length > 0 && !routePlan) {
      generateInitialPlan();
    }
  }, [clients]);

  const generateInitialPlan = () => {
    const defaultStops: VisitRouteItem[] = clients.map((c, idx) => ({
      clientId: c.id,
      clientName: c.name,
      address: c.address,
      age: c.age,
      gender: c.gender,
      riskLevel: c.riskLevel,
      priority: c.visitPriority || (c.riskLevel === '고위험' ? '긴급' : c.riskLevel === '중위험' ? '우선' : '일반'),
      order: idx + 1,
      lat: c.latitude || centerLat + (idx * 0.006 - 0.012),
      lng: c.longitude || centerLng + (idx * 0.005 - 0.010),
      estimatedArrival: `${10 + idx}:00`,
      durationMinutes: c.riskLevel === '고위험' ? 45 : 30,
      purpose: c.riskLevel === '고위험' ? '긴급 안전 점검 및 밑반찬 지원' : '정기 안부 확인 및 건강 사정',
      phone: c.phone,
      completed: false,
    }));

    setRoutePlan({
      id: 'route-today',
      title: '오늘의 재가노인지원서비스 가정방문 동선 계획',
      date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }),
      totalClients: defaultStops.length,
      totalDistanceKm: 5.8,
      estimatedTotalMinutes: defaultStops.length * 40 + 45,
      items: defaultStops,
      workerName: '이현정 사회복지사',
      transportMode,
      startLocation: {
        name: '케어브릿지 재가노인지원센터',
        address: '서울특별시 강북구 삼양로 114길 1',
        lat: centerLat,
        lng: centerLng,
      },
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      // Keep map alive across tab switching or clean up
    };
  }, []);

  // Update Markers & Polyline when routePlan or selectedClientId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !routePlan) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    const latlngs: [number, number][] = [];

    // Center marker (Start point)
    latlngs.push([routePlan.startLocation.lat, routePlan.startLocation.lng]);
    const startIcon = L.divIcon({
      className: 'custom-start-marker',
      html: `<div style="background:#2A231F; color:#FDE68A; border:2px solid #F59E0B; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; box-shadow:0 4px 8px rgba(0,0,0,0.3);">출발</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const startMarker = L.marker([routePlan.startLocation.lat, routePlan.startLocation.lng], { icon: startIcon })
      .bindPopup(`<b>${routePlan.startLocation.name}</b><br/>출발/복귀 거점`)
      .addTo(map);
    markersRef.current.push(startMarker);

    // Client markers
    routePlan.items.forEach((item) => {
      latlngs.push([item.lat, item.lng]);

      const isHighRisk = item.riskLevel === '고위험';
      const isSelected = item.clientId === selectedClientId;
      const isDone = completedStops[item.clientId];

      const bgColor = isDone ? '#10B981' : isHighRisk ? '#EF4444' : item.riskLevel === '중위험' ? '#F59E0B' : '#3B82F6';
      const border = isSelected ? '3px solid #FFFFFF' : '2px solid rgba(255,255,255,0.8)';
      const scale = isSelected ? 'transform:scale(1.2);' : '';

      const markerIcon = L.divIcon({
        className: 'custom-stop-marker',
        html: `<div style="background:${bgColor}; color:white; border:${border}; ${scale} border-radius:50%; width:30px; height:30px; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:12px; box-shadow:0 3px 6px rgba(0,0,0,0.25);">
          ${isDone ? '✓' : item.order}
        </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([item.lat, item.lng], { icon: markerIcon })
        .bindPopup(`
          <div style="font-family:sans-serif; min-width:160px;">
            <div style="font-weight:bold; font-size:13px; color:#1F2937;">${item.order}. ${item.clientName} 어르신 (${item.age}세)</div>
            <div style="font-size:11px; color:#4B5563; margin-top:2px;">${item.address}</div>
            <div style="margin-top:4px; font-size:11px; font-weight:bold; color:${bgColor};">
              예상: ${item.estimatedArrival} (${item.durationMinutes}분 상담)
            </div>
            <div style="margin-top:2px; font-size:10px; color:#6B7280;">${item.purpose}</div>
          </div>
        `)
        .addTo(map);

      marker.on('click', () => {
        setSelectedClientId(item.clientId);
      });

      markersRef.current.push(marker);
    });

    // Draw route path line
    const polyline = L.polyline(latlngs, {
      color: '#D97706',
      weight: 4,
      opacity: 0.85,
      dashArray: '8, 8',
    }).addTo(map);

    polylineRef.current = polyline;

    // Fit bounds
    if (latlngs.length > 0) {
      map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    }
  }, [routePlan, selectedClientId, completedStops]);

  // AI Route Optimization Call
  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    try {
      const response = await fetch('/api/ai/optimize-route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clients: routePlan?.items || clients,
          transportMode,
          startAddress: routePlan?.startLocation.address,
        }),
      });

      const data = await response.json();
      if (data.success && data.plan && routePlan) {
        const optimizedStopsMap = new Map(
          data.plan.optimizedStops.map((s: any) => [s.clientId, s])
        );

        const newItems = [...routePlan.items].sort((a, b) => {
          const orderA = (optimizedStopsMap.get(a.clientId) as any)?.order ?? a.order;
          const orderB = (optimizedStopsMap.get(b.clientId) as any)?.order ?? b.order;
          return orderA - orderB;
        }).map((item, idx) => {
          const aiStop: any = optimizedStopsMap.get(item.clientId);
          return {
            ...item,
            order: idx + 1,
            estimatedArrival: aiStop?.estimatedArrival || `${10 + idx}:00`,
            durationMinutes: aiStop?.durationMinutes || item.durationMinutes,
            purpose: aiStop?.purpose || item.purpose,
          };
        });

        setRoutePlan({
          ...routePlan,
          title: data.plan.title || routePlan.title,
          totalDistanceKm: data.plan.totalDistanceKm || routePlan.totalDistanceKm,
          totalEstimatedMinutes: data.plan.totalEstimatedMinutes || routePlan.totalEstimatedMinutes,
          items: newItems,
        });
      }
    } catch (err) {
      console.error('Route optimization error:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleToggleComplete = (clientId: string) => {
    setCompletedStops((prev) => ({
      ...prev,
      [clientId]: !prev[clientId],
    }));
  };

  const selectedClient = clients.find((c) => c.id === selectedClientId) || clients[0];
  const selectedStop = routePlan?.items.find((item) => item.clientId === selectedClientId);

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Card */}
      <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-5 shadow-xs transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Title & Metadata */}
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
              <RouteIcon className="w-6 h-6 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  어르신 댁 방문 상담 동선 최적화 & 스마트 지도 뷰
                </h2>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  실시간 위치 연동
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                위기도(고위험 긴급 우선)와 지리적 인접성, 복약/식사 시간을 고려한 스마트 방문 스케줄러입니다.
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Transport Mode Switcher */}
            <div className="flex items-center p-1 bg-stone-100 dark:bg-[#251F1C] rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTransportMode('도보')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  transportMode === '도보'
                    ? 'bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Footprints className="w-3.5 h-3.5" />
                <span>도보</span>
              </button>
              <button
                type="button"
                onClick={() => setTransportMode('차량')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  transportMode === '차량'
                    ? 'bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>복지차량</span>
              </button>
              <button
                type="button"
                onClick={() => setTransportMode('대중교통')}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  transportMode === '대중교통'
                    ? 'bg-white dark:bg-stone-800 text-amber-800 dark:text-amber-300 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <Bus className="w-3.5 h-3.5" />
                <span>대중교통</span>
              </button>
            </div>

            {/* AI Optimize Button */}
            <button
              type="button"
              onClick={handleOptimizeRoute}
              disabled={isOptimizing}
              className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Sparkles className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
              <span>{isOptimizing ? 'AI 최적 동선 계산 중...' : 'AI 최적 방문 동선 수립'}</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        {routePlan && (
          <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block">오늘 방문 일정</span>
              <strong className="text-sm text-stone-900 dark:text-stone-100">{routePlan.items.length}가구 예정</strong>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5">
                완료: {Object.values(completedStops).filter(Boolean).length}가구
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block">총 이동 예상 거리</span>
              <strong className="text-sm text-stone-900 dark:text-stone-100">{routePlan.totalDistanceKm} km</strong>
              <span className="text-[10px] text-stone-400 block mt-0.5">출발 거점 기준 왕복</span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block">총 예상 소요 시간</span>
              <strong className="text-sm text-stone-900 dark:text-stone-100">
                약 {Math.floor(routePlan.estimatedTotalMinutes / 60)}시간 {routePlan.estimatedTotalMinutes % 60}분
              </strong>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 block mt-0.5">상담 및 이동 포함</span>
            </div>

            <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-[#251F1C] border border-stone-200 dark:border-stone-800">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 block">고위험 긴급 가구</span>
              <strong className="text-sm text-rose-600 dark:text-rose-400">
                {routePlan.items.filter((i) => i.riskLevel === '고위험').length}명
              </strong>
              <span className="text-[10px] text-rose-500 block mt-0.5">오전 시간대 우선 배정</span>
            </div>
          </div>
        )}
      </div>

      {/* Main Map & Route Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Interactive Map Container (7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-3 shadow-xs transition-colors">
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800 dark:text-stone-200">
                <MapPin className="w-4 h-4 text-amber-600" />
                <span>현장 위치 & 이동 경로 맵</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> 고위험(긴급)
                </span>
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> 중위험
                </span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> 방문완료
                </span>
              </div>
            </div>

            {/* Map Canvas */}
            <div
              ref={mapContainerRef}
              className="w-full h-[460px] rounded-xl overflow-hidden shadow-inner border border-stone-200 dark:border-stone-800"
            />
          </div>

          {/* Quick Navigation Links for Field Social Worker */}
          {selectedStop && (
            <div className="bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-semibold">
                <Navigation className="w-4 h-4 text-amber-700" />
                <span>선택 어르신: <strong>{selectedStop.clientName} ({selectedStop.address})</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://map.kakao.com/link/search/${encodeURIComponent(selectedStop.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-stone-900 text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>카카오맵</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href={`https://map.naver.com/v5/search/${encodeURIComponent(selectedStop.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>네이버 지도</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Right: Route Stops Sequence & Action List (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#1E1916] rounded-2xl border border-stone-200/90 dark:border-stone-800 p-4 shadow-xs flex flex-col h-full transition-colors">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100">
                  순차 방문 일정표
                </h3>
              </div>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">
                {routePlan?.date || '오늘'}
              </span>
            </div>

            {/* List of Stops */}
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {routePlan?.items.map((stop) => {
                const isSelected = stop.clientId === selectedClientId;
                const isDone = completedStops[stop.clientId];
                const isHigh = stop.riskLevel === '고위험';

                return (
                  <div
                    key={stop.clientId}
                    onClick={() => setSelectedClientId(stop.clientId)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 shadow-xs'
                        : isDone
                        ? 'bg-stone-50 dark:bg-[#251F1C] opacity-75 border-stone-200 dark:border-stone-800'
                        : 'bg-white dark:bg-[#251F1C] hover:bg-stone-50 dark:hover:bg-stone-800/60 border-stone-200 dark:border-stone-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      {/* Left Badge & Info */}
                      <div className="flex items-start gap-2.5 flex-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isHigh
                            ? 'bg-rose-600 text-white'
                            : 'bg-[#38302B] text-amber-100'
                        }`}>
                          {isDone ? '✓' : stop.order}
                        </div>

                        <div className="space-y-0.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-900 dark:text-stone-100">
                              {stop.clientName} 어르신 ({stop.age}세)
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              isHigh
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                                : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                            }`}>
                              {stop.riskLevel}
                            </span>
                          </div>

                          <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-1">
                            {stop.address}
                          </p>

                          <div className="flex items-center gap-2 text-[10px] text-stone-600 dark:text-stone-400 font-medium pt-1">
                            <span className="text-amber-700 dark:text-amber-400 font-bold">
                              ⏰ {stop.estimatedArrival} ({stop.durationMinutes}분 상담)
                            </span>
                            <span>•</span>
                            <span className="truncate">{stop.purpose}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Checkbox / Actions */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleComplete(stop.clientId);
                          }}
                          className={`p-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-stone-900'
                          }`}
                          title="방문 완료 체크"
                        >
                          <CheckCircle2 className={`w-4 h-4 ${isDone ? 'text-emerald-600' : 'text-stone-400'}`} />
                        </button>

                        <a
                          href={`tel:${stop.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1 rounded-lg bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 transition-colors"
                          title="전화 걸기"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* Action buttons if selected */}
                    {isSelected && (
                      <div className="mt-3 pt-2.5 border-t border-amber-200/80 dark:border-stone-700 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-stone-500 dark:text-stone-400">
                          연락처: {stop.phone}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSelectClientForConsultation) {
                              const targetClient = clients.find((c) => c.id === stop.clientId);
                              if (targetClient) onSelectClientForConsultation(targetClient);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-600 text-white text-[11px] font-bold shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3 text-amber-300" />
                          <span>상담 녹취 시작</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
