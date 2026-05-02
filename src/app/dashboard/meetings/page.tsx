"use client";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, Phone, Plus, Send, Video, VideoOff } from "lucide-react";
import { Button, Card, Input, SectionHeader, Select } from "@/components/ui";

export default function MeetingsPage() {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role;
  const name = session?.user?.name || "User";
  const [meetings, setMeetings] = useState<any[]>([]);
  const [form, setForm] = useState({ title: "", classId: "" });
  const [code, setCode] = useState("");
  const [activeCode, setActiveCode] = useState("");
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const localVideo = useRef<HTMLVideoElement>(null);
  const remoteVideo = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({});

  const load = async () => {
    const res = await fetch("/api/meetings");
    setMeetings(await res.json().then((d) => Array.isArray(d) ? d : []));
  };

  useEffect(() => { load(); }, []);

  const createMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/meetings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const meeting = await res.json();
    if (res.ok) setCode(meeting.code);
    setForm({ title: "", classId: "" });
    load();
  };

  const createPeer = (peerId: string) => {
    const socket = socketRef.current;
    const stream = streamRef.current;
    if (!socket || !stream) return null;

    const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    peer.onicecandidate = (event) => {
      if (event.candidate) socket.emit("signal", { target: peerId, signal: { candidate: event.candidate } });
    };
    peer.ontrack = (event) => {
      if (remoteVideo.current) remoteVideo.current.srcObject = event.streams[0];
    };
    peersRef.current[peerId] = peer;
    return peer;
  };

  const joinMeeting = async (meetingCode = code) => {
    await fetch("/api/socket");
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    streamRef.current = stream;
    if (localVideo.current) localVideo.current.srcObject = stream;

    const socket = io({ path: "/api/socket", addTrailingSlash: false });
    socketRef.current = socket;
    socket.emit("join-room", { room: meetingCode, name });
    socket.on("existing-peers", async (peerIds: string[]) => {
      for (const peerId of peerIds) {
        const peer = createPeer(peerId);
        if (!peer) continue;
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("signal", { target: peerId, signal: offer });
      }
    });
    socket.on("signal", async ({ id, signal }) => {
      const peer = peersRef.current[id] || createPeer(id);
      if (!peer) return;
      if (signal.type === "offer") {
        await peer.setRemoteDescription(new RTCSessionDescription(signal));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit("signal", { target: id, signal: answer });
      } else if (signal.type === "answer") {
        await peer.setRemoteDescription(new RTCSessionDescription(signal));
      } else if (signal.candidate) {
        await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    });
    socket.on("meeting-chat", (msg) => setMessages((m) => [...m, msg]));
    socket.on("peer-joined", (peer) => setMessages((m) => [...m, { name: "System", message: `${peer.name || "A participant"} joined.`, at: new Date().toISOString() }]));
    setActiveCode(meetingCode);
  };

  const toggleAudio = () => {
    const next = !audioOn;
    streamRef.current?.getAudioTracks().forEach((track) => { track.enabled = next; });
    setAudioOn(next);
  };

  const toggleVideo = () => {
    const next = !videoOn;
    streamRef.current?.getVideoTracks().forEach((track) => { track.enabled = next; });
    setVideoOn(next);
  };

  const leave = () => {
    socketRef.current?.disconnect();
    Object.values(peersRef.current).forEach((peer) => peer.close());
    peersRef.current = {};
    streamRef.current?.getTracks().forEach((track) => track.stop());
    setActiveCode("");
  };

  const sendMessage = () => {
    if (!chatText.trim() || !activeCode) return;
    socketRef.current?.emit("meeting-chat", { room: activeCode, message: chatText, name });
    setChatText("");
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Meetings" subtitle="Create or join video meetings with camera, microphone, and chat." />

      <div className="grid lg:grid-cols-3 gap-6">
        {role === "TEACHER" && (
          <Card title="Create Meeting">
            <form onSubmit={createMeeting} className="space-y-3">
              <Input label="Title" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
              <Button type="submit"><Plus size={16} /> Create</Button>
            </form>
          </Card>
        )}

        <Card title="Join Meeting">
          <div className="space-y-3">
            <Input label="Meeting code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} />
            <Button onClick={() => joinMeeting()} disabled={!code}><Phone size={16} /> Join</Button>
          </div>
        </Card>

        <Card title="Recent Meetings" className={role === "TEACHER" ? "" : "lg:col-span-2"}>
          <Select value={code} onChange={(e) => setCode(e.target.value)}>
            <option value="">Select meeting</option>
            {meetings.map((m) => <option key={m.id} value={m.code}>{m.title} · {m.code}</option>)}
          </Select>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card title={activeCode ? `Live: ${activeCode}` : "Preview"} className="lg:col-span-2">
          <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center">
            <video ref={remoteVideo} autoPlay playsInline className="h-full w-full object-cover" />
            <video ref={localVideo} autoPlay muted playsInline className="absolute bottom-3 right-3 h-24 w-36 rounded-lg object-cover border border-white/30 bg-slate-800" />
            {!activeCode && <div className="absolute text-white text-sm">Join a meeting to start video</div>}
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="secondary" onClick={toggleAudio}>{audioOn ? <Mic size={16} /> : <MicOff size={16} />}</Button>
            <Button variant="secondary" onClick={toggleVideo}>{videoOn ? <Video size={16} /> : <VideoOff size={16} />}</Button>
            <Button variant="danger" onClick={leave} disabled={!activeCode}>Leave</Button>
          </div>
        </Card>

        <Card title="Chat">
          <div className="h-64 overflow-y-auto space-y-2 border border-slate-100 rounded-xl p-3 mb-3">
            {messages.map((m, i) => (
              <div key={i} className="text-sm">
                <span className="font-semibold text-slate-700">{m.name}: </span>
                <span className="text-slate-600">{m.message}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder="Message" />
            <Button onClick={sendMessage} disabled={!activeCode}><Send size={16} /></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
