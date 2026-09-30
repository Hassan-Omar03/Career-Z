import { useEffect, useRef, useState } from 'react';
import { useRealtime } from '../context/RealtimeContext';

const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

function VideoTile({ stream, name, muted = false }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.srcObject = stream || null; }, [stream]);
  return (
    <div style={{ position: 'relative', minHeight: 220, borderRadius: 16, overflow: 'hidden', background: '#16221f' }}>
      <video ref={ref} autoPlay playsInline muted={muted} style={{ width: '100%', height: '100%', minHeight: 220, objectFit: 'cover' }} />
      <span style={{ position: 'absolute', left: 12, bottom: 10, color: '#fff', background: 'rgba(0,0,0,.58)', padding: '4px 9px', borderRadius: 20 }}>{name}</span>
    </div>
  );
}

export default function CareerZLiveClassroom({ session, user, role, onJoined, onLeave, onError }) {
  const { socket } = useRealtime();
  const localStreamRef = useRef(null);
  const peersRef = useRef(new Map());
  const pendingIceRef = useRef(new Map());
  const pollIdRef = useRef(null);
  const joinedRef = useRef(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('Connecting camera and microphone…');
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [poll, setPoll] = useState(null);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [myVote, setMyVote] = useState(null);
  const [energyOn, setEnergyOn] = useState(false);
  const [myEnergy, setMyEnergy] = useState(null);
  const [classEnergy, setClassEnergy] = useState(null);

  function sendSignal(targetUserId, signal) {
    socket?.emit('live-video:signal', { sessionId: session._id, targetUserId, signal });
  }

  async function flushIce(userId, peer) {
    const list = pendingIceRef.current.get(userId) || [];
    for (const candidate of list) await peer.addIceCandidate(candidate);
    pendingIceRef.current.delete(userId);
  }

  function makePeer(member) {
    if (peersRef.current.has(member.userId)) return peersRef.current.get(member.userId);
    const peer = new RTCPeerConnection(rtcConfig);
    localStreamRef.current?.getTracks().forEach((track) => peer.addTrack(track, localStreamRef.current));
    peer.onicecandidate = ({ candidate }) => candidate && sendSignal(member.userId, { candidate });
    peer.ontrack = ({ streams }) => setRemoteStreams((current) => ({ ...current, [member.userId]: streams[0] }));
    peer.onconnectionstatechange = () => {
      if (['failed', 'closed'].includes(peer.connectionState)) {
        setRemoteStreams((current) => { const next = { ...current }; delete next[member.userId]; return next; });
      }
    };
    peersRef.current.set(member.userId, peer);
    return peer;
  }

  async function createOffer(member) {
    const peer = makePeer(member);
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    sendSignal(member.userId, { description: peer.localDescription });
  }

  useEffect(() => {
    if (!socket) return undefined;
    let disposed = false;

    const participantJoined = async (member) => {
      setParticipants((current) => current.some((p) => p.userId === member.userId) ? current : [...current, member]);
      if (role === 'teacher') try { await createOffer(member); } catch (error) { onError?.(error); }
    };
    const participantLeft = (member) => {
      peersRef.current.get(member.userId)?.close();
      peersRef.current.delete(member.userId);
      setParticipants((current) => current.filter((p) => p.userId !== member.userId));
      setRemoteStreams((current) => { const next = { ...current }; delete next[member.userId]; return next; });
    };
    const receiveSignal = async ({ sessionId, fromUserId, signal }) => {
      if (sessionId !== session._id) return;
      try {
        const member = participants.find((p) => p.userId === fromUserId) || { userId: fromUserId, name: 'Class participant', role: 'student' };
        const peer = makePeer(member);
        if (signal.description) {
          await peer.setRemoteDescription(signal.description);
          await flushIce(fromUserId, peer);
          if (signal.description.type === 'offer') {
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            sendSignal(fromUserId, { description: peer.localDescription });
          }
        } else if (signal.candidate) {
          if (peer.remoteDescription) await peer.addIceCandidate(signal.candidate);
          else pendingIceRef.current.set(fromUserId, [...(pendingIceRef.current.get(fromUserId) || []), signal.candidate]);
        }
      } catch (error) { onError?.(error); }
    };
    const receiveMessage = (item) => setMessages((current) => [...current, item]);
    const receiveHand = (member) => setParticipants((current) => current.map((p) => p.userId === member.userId ? { ...p, raised: member.raised } : p));
    const receivePoll = (nextPoll) => { if (nextPoll?.id !== pollIdRef.current) { pollIdRef.current = nextPoll?.id || null; setMyVote(null); } setPoll(nextPoll); };
    const receiveEnergy = (value) => setClassEnergy(value);
    const receiveEnergyDetail = (value) => role === 'teacher' && setClassEnergy(value);
    const classEnded = ({ sessionId }) => {
      if (sessionId !== session._id) return;
      setStatus('Class ended');
      onLeave?.();
    };

    socket.on('live-video:participant-joined', participantJoined);
    socket.on('live-video:participant-left', participantLeft);
    socket.on('live-video:signal', receiveSignal);
    socket.on('live-video:message', receiveMessage);
    socket.on('live-video:hand', receiveHand);
    socket.on('live-video:poll', receivePoll);
    socket.on('live-video:energy', receiveEnergy);
    socket.on('live-video:energy-detail', receiveEnergyDetail);
    socket.on('live-video:ended', classEnded);

    (async () => {
      try {
        let stream;
        try { stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true }); }
        catch {
          try { stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); setCameraOn(false); }
          catch { stream = new MediaStream(); setCameraOn(false); setMicOn(false); }
        }
        if (disposed) return stream.getTracks().forEach((track) => track.stop());
        localStreamRef.current = stream;
        setLocalStream(stream);
        socket.emit('live-video:join', { sessionId: session._id }, (reply) => {
          if (!reply?.ok) return onError?.(new Error(reply?.message || 'Could not join the classroom.'));
          joinedRef.current = true;
          setParticipants(reply.participants || []);
          pollIdRef.current = reply.poll?.id || null; setPoll(reply.poll || null);
          setStatus('Live');
          if (role === 'teacher') (reply.participants || []).forEach((member) => createOffer(member).catch((error) => onError?.(error)));
          onJoined?.();
        });
      } catch (error) { setStatus('Could not connect'); onError?.(error); }
    })();

    return () => {
      disposed = true;
      if (joinedRef.current) socket.emit('live-video:leave', { sessionId: session._id });
      socket.off('live-video:participant-joined', participantJoined);
      socket.off('live-video:participant-left', participantLeft);
      socket.off('live-video:signal', receiveSignal);
      socket.off('live-video:message', receiveMessage);
      socket.off('live-video:hand', receiveHand);
      socket.off('live-video:poll', receivePoll);
      socket.off('live-video:energy', receiveEnergy);
      socket.off('live-video:energy-detail', receiveEnergyDetail);
      socket.off('live-video:ended', classEnded);
      peersRef.current.forEach((peer) => peer.close()); peersRef.current.clear();
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, [socket, session._id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (role === 'teacher' || !energyOn || !localStream || !socket) { if (!energyOn) setMyEnergy(null); return undefined; }
    let cancelled = false; let timer;
    const video = document.createElement('video'); video.muted = true; video.playsInline = true; video.srcObject = localStream;
    (async () => {
      try {
        await video.play(); const { loadFaceModels, faceapi } = await import('../utils/faceApi'); await loadFaceModels();
        const tick = async () => {
          if (cancelled) return;
          const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).catch(() => null);
          const attentive = Boolean(detection); const score = attentive ? 85 : 15;
          setMyEnergy({ attentive, score }); socket.emit('live-video:energy-report', { sessionId: session._id, attentive, score });
          timer = setTimeout(tick, 6000);
        }; tick();
      } catch (error) { onError?.(error); setEnergyOn(false); }
    })();
    return () => { cancelled = true; clearTimeout(timer); video.srcObject = null; };
  }, [energyOn, localStream, role, session._id, socket]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggleTrack(kind, setter) {
    const track = localStreamRef.current?.getTracks().find((item) => item.kind === kind);
    if (!track) return;
    track.enabled = !track.enabled; setter(track.enabled);
  }

  async function toggleScreen() {
    if (sharing) return;
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = display.getVideoTracks()[0];
      peersRef.current.forEach((peer) => peer.getSenders().find((sender) => sender.track?.kind === 'video')?.replaceTrack(screenTrack));
      setLocalStream(new MediaStream([screenTrack, ...(localStreamRef.current?.getAudioTracks() || [])]));
      setSharing(true);
      screenTrack.onended = () => {
        const camera = localStreamRef.current?.getVideoTracks()[0];
        peersRef.current.forEach((peer) => peer.getSenders().find((sender) => sender.track?.kind === 'video')?.replaceTrack(camera));
        setLocalStream(localStreamRef.current); setSharing(false);
      };
    } catch (error) { if (error.name !== 'NotAllowedError') onError?.(error); }
  }

  function sendMessage(e) {
    e.preventDefault();
    if (!message.trim()) return;
    socket?.emit('live-video:message', { sessionId: session._id, text: message }, (reply) => !reply?.ok && onError?.(new Error(reply?.message)));
    setMessage('');
  }

  function toggleHand() {
    const raised = !handRaised; setHandRaised(raised);
    socket?.emit('live-video:hand', { sessionId: session._id, raised });
  }

  function createPoll(e) {
    e.preventDefault(); const options = pollOptions.map((item) => item.trim()).filter(Boolean);
    socket?.emit('live-video:poll-create', { sessionId: session._id, question: pollQuestion.trim(), options }, (reply) => {
      if (!reply?.ok) return onError?.(new Error(reply?.message || 'Could not create poll.'));
      setPollQuestion(''); setPollOptions(['', '']);
    });
  }
  function votePoll(index) { socket?.emit('live-video:poll-vote', { sessionId: session._id, optionIndex: index }, (reply) => reply?.ok ? setMyVote(index) : onError?.(new Error(reply?.message || 'Vote failed.'))); }
  function closePoll() { socket?.emit('live-video:poll-close', { sessionId: session._id }); }

  return (
    <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
      <div className="flex items-center justify-between" style={{ padding: 16, borderBottom: '1px solid var(--sand-line)', gap: 12 }}>
        <div><strong>{session.title}</strong><p className="text-xs" style={{ color: 'var(--ink-soft)' }}>{session.course?.title} · {status} · {participants.length + 1} connected</p></div>
        <button type="button" className="btn" onClick={onLeave} style={{ color: 'var(--rose)' }}>Leave Classroom</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 3fr) minmax(260px, 1fr)', gap: 14, padding: 14, background: '#0d1715' }}>
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: Object.keys(remoteStreams).length ? 'repeat(auto-fit,minmax(280px,1fr))' : '1fr', gap: 12 }}>
            <VideoTile stream={localStream} name={`${user?.fullName || 'You'} (You${role === 'teacher' ? ', Teacher' : ''})`} muted />
            {Object.entries(remoteStreams).map(([id, stream]) => <VideoTile key={id} stream={stream} name={participants.find((p) => p.userId === id)?.name || 'Participant'} />)}
          </div>
          <div className="flex flex-wrap justify-center gap-2" style={{ paddingTop: 14 }}>
            <button type="button" className="btn" onClick={() => toggleTrack('audio', setMicOn)}>{micOn ? 'Mute mic' : 'Unmute mic'}</button>
            <button type="button" className="btn" onClick={() => toggleTrack('video', setCameraOn)}>{cameraOn ? 'Stop camera' : 'Start camera'}</button>
            <button type="button" className="btn" onClick={toggleScreen}>{sharing ? 'Sharing screen' : 'Share screen'}</button>
            {role !== 'teacher' && <button type="button" className="btn" onClick={toggleHand}>{handRaised ? 'Lower hand' : 'Raise hand'}</button>}
            {role !== 'teacher' && <label className="btn"><input type="checkbox" checked={energyOn} onChange={(e) => setEnergyOn(e.target.checked)} /> Energy Meter</label>}
            {myEnergy && <span style={{ color: myEnergy.attentive ? 'var(--emerald)' : 'var(--rose)' }}>{myEnergy.attentive ? 'Focused' : 'Distracted'}</span>}
          </div>
        </div>
        <aside style={{ background: '#fff', borderRadius: 14, padding: 12, display: 'flex', flexDirection: 'column', minHeight: 430 }}>
          <strong>Class chat</strong>
          {classEnergy?.total > 0 && <div className="text-xs" style={{ marginTop: 8, padding: 8, borderRadius: 8, background: 'var(--sand)' }}><strong>Energy: {classEnergy.average}%</strong> · {classEnergy.attentiveCount}/{classEnergy.total} focused{role === 'teacher' && classEnergy.roster?.length > 0 && <div>{classEnergy.roster.map((row) => <span key={row.userId} style={{ display: 'block', color: row.attentive ? 'var(--emerald)' : 'var(--rose)' }}>{row.name}: {row.attentive ? 'Focused' : 'Distracted'}</span>)}</div>}</div>}
          {poll ? <div style={{ marginTop: 8, padding: 8, borderRadius: 8, background: 'var(--sand)' }}><strong className="text-xs">{poll.question}</strong>{poll.options.map((option) => <button key={option.index} type="button" className={myVote === option.index ? 'btn btn-primary' : 'btn'} disabled={role === 'teacher' || poll.status === 'closed' || myVote !== null} onClick={() => votePoll(option.index)} style={{ display: 'block', width: '100%', marginTop: 5 }}>{option.text} · {option.votes}</button>)}{role === 'teacher' && poll.status === 'open' && <button type="button" className="btn" onClick={closePoll} style={{ marginTop: 6 }}>Close Poll</button>}</div> : role === 'teacher' && <form onSubmit={createPoll} style={{ marginTop: 8 }}><input className="form-input" required placeholder="Live poll question" value={pollQuestion} onChange={(e) => setPollQuestion(e.target.value)} />{pollOptions.map((option, index) => <input key={index} className="form-input" required placeholder={`Option ${index + 1}`} value={option} onChange={(e) => setPollOptions((current) => current.map((item, i) => i === index ? e.target.value : item))} style={{ marginTop: 5 }} />)}<button type="submit" className="btn" style={{ marginTop: 5 }}>Launch Poll</button></form>}
          <div style={{ flex: 1, overflowY: 'auto', margin: '10px 0', maxHeight: 420 }}>
            {participants.filter((p) => p.raised).map((p) => <p key={`hand-${p.userId}`} className="text-xs" style={{ color: 'var(--amber)' }}>✋ {p.name} raised a hand</p>)}
            {messages.length === 0 && <p className="text-xs" style={{ color: 'var(--ink-soft)' }}>No messages yet.</p>}
            {messages.map((item) => <p key={item.id} className="text-xs" style={{ marginBottom: 8 }}><strong>{item.name}:</strong> {item.text}</p>)}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2"><input className="form-input" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask or reply…" /><button className="btn btn-primary" type="submit">Send</button></form>
        </aside>
      </div>
    </div>
  );
}
