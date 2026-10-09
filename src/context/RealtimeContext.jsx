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
  const { user, refreshAccountStatus } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);
  const [dashboardUpdateSignal, setDashboardUpdateSignal] = useState(0);
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  // Sums the per-conversation `unread` counts from /messages/conversations — one real request
  // instead of trying to hand-track increments/decrements across message:new/message:read events,
  // which is easy to get subtly wrong (e.g. a message arriving in a thread you're not viewing).
  function refreshUnreadMessages() {
    if (!user) return;
    apiRequest('/messages/conversations').then((list) => {
      setUnreadMessageCount((list || []).reduce((sum, c) => sum + (c.unread || 0), 0));
    }).catch(() => {});
  }

  function refreshUnreadNotifications() {
    if (!user) return Promise.resolve();
    return apiRequest('/notifications/mine/unread-count').then((result) => {
      setUnreadCount(Number(result?.count) || 0);
    }).catch(() => {});
  }

  async function markAllNotificationsRead() {
    if (!user) return;
    await apiRequest('/notifications/mine/read-all', { method: 'PATCH' });
    setUnreadCount(0);
  }

  useEffect(() => {
    if (!user) return undefined;

    refreshUnreadNotifications();
    refreshUnreadMessages();

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
    socket.on('connect', refreshUnreadNotifications);
    socket.on('dashboard:update', (payload) => {
      setDashboardUpdateSignal((s) => s + 1);
      // Approve/suspend/re-verification changes what this account may open.
      if (payload?.reason === 'verification') refreshAccountStatus();
    });
    // A new message bumps the header badge for the recipient; markThreadRead (opening that
    // thread) emits this same event back to the sender, so both sides stay in sync live.
    socket.on('message:new', refreshUnreadMessages);
    socket.on('message:read', refreshUnreadMessages);
    socket.on('connect_error', () => {});

    return () => { socket.disconnect(); socketRef.current = null; setSocket(null); };
  }, [user?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <RealtimeContext.Provider value={{ unreadCount, latestNotification, dashboardUpdateSignal, markAllNotificationsRead, refreshUnreadNotifications, socket, unreadMessageCount, refreshUnreadMessages }}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  // Components can render outside the provider (e.g. in isolated tests) — return safe no-op defaults.
  return ctx || { unreadCount: 0, latestNotification: null, dashboardUpdateSignal: 0, markAllNotificationsRead: async () => {}, refreshUnreadNotifications: () => {}, socket: null, unreadMessageCount: 0, refreshUnreadMessages: () => {} };
}
