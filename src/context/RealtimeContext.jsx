import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { session, apiRequest } from '../api/client';
import { useAuth } from './AuthContext';

const RealtimeContext = createContext(null);

const SOCKET_URL = (import.meta.env.VITE_API_BASE || 'http://localhost:5000/api').replace(/\/api\/?$/, '');

// Live push over the backend's existing Socket.IO server (src/realtime/socket.js) — every
// notify() call server-side now also emits 'notification:new' to the recipient's own room, and
// role-request approval emits 'dashboard:update'. This just wires a client to receive them, so
// the bell badge and dashboard-sensitive screens update instantly instead of waiting for the
// next manual refresh/poll.
export function RealtimeProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);
  const [dashboardUpdateSignal, setDashboardUpdateSignal] = useState(0);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user) return undefined;

    apiRequest('/notifications/mine').then((list) => {
      setUnreadCount((list || []).filter((n) => !n.read).length);
    }).catch(() => {});

    const socket = io(SOCKET_URL, {
      // Socket.IO invokes this for every connection/reconnection, so an access token
      // refreshed by the REST client is picked up without rebuilding the provider.
      auth: (callback) => callback({ accessToken: session.getAccessToken() }),
      transports: ['websocket', 'polling']
    });
    socketRef.current = socket;
    setSocket(socket);

    socket.on('notification:new', (notification) => {
      setUnreadCount((c) => c + 1);
      setLatestNotification(notification);
    });
    socket.on('dashboard:update', () => {
      setDashboardUpdateSignal((s) => s + 1);
    });
    socket.on('connect_error', () => {});

    return () => { socket.disconnect(); socketRef.current = null; setSocket(null); };
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  function clearUnread() { setUnreadCount(0); }

  return (
    <RealtimeContext.Provider value={{ unreadCount, latestNotification, dashboardUpdateSignal, clearUnread, socket }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  // Components can render outside the provider (e.g. in isolated tests) — return safe no-op defaults.
  return ctx || { unreadCount: 0, latestNotification: null, dashboardUpdateSignal: 0, clearUnread: () => {}, socket: null };
}
