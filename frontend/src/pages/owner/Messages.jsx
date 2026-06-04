import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import request from '../../utils/api';

function OwnerMessages() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [thread, setThread] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyError, setReplyError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await request('/api/messages');
        setMessages(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedPartner === null) return;
    const loadThread = async () => {
      setThreadLoading(true);
      try {
        const data = await request(`/api/messages/${selectedPartner._id}`);
        setThread(data);
      } catch (err) {
        setThread([]);
      } finally {
        setThreadLoading(false);
      }
    };
    loadThread();
  }, [selectedPartner]);

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) { setReplyError('Message cannot be empty.'); return; }
    setReplyError(null);
    try {
      await request('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ receiverId: selectedPartner._id, content: replyContent.trim() })
      });
      setReplyContent('');
      const [updatedMessages, updatedThread] = await Promise.all([
        request('/api/messages'),
        request(`/api/messages/${selectedPartner._id}`)
      ]);
      setMessages(updatedMessages);
      setThread(updatedThread);
    } catch (err) {
      setReplyError(err.message);
    }
  };

  const conversations = messages.reduce((acc, msg) => {
    const isMine = msg.sender?._id === user.id;
    const partner = isMine ? msg.receiver : msg.sender;
    const partnerId = partner?._id;
    if (partnerId !== undefined && !acc.find(c => c.partner._id === partnerId)) {
      acc.push({ partner: { _id: partnerId, name: partner?.name ?? 'Unknown' }, lastMessage: msg });
    }
    return acc;
  }, []);

  if (loading) return <p>Loading messages...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  return (
    <div>
      <h2>Messages</h2>
      <div style={{ display: 'flex', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', minHeight: '500px' }}>

        <div style={{ width: '240px', borderRight: '1px solid #e5e7eb', overflowY: 'auto', flexShrink: 0 }}>
          {conversations.length === 0 ? (
            <p style={{ padding: '16px', color: '#6b7280', fontSize: '14px' }}>No conversations yet.</p>
          ) : (
            conversations.map(({ partner, lastMessage }) => {
              const isMine = lastMessage.sender?._id === user.id;
              const preview = (isMine ? 'You: ' : '') + lastMessage.content;
              const isSelected = selectedPartner?._id === partner._id;
              return (
                <div
                  key={partner._id}
                  onClick={() => { setSelectedPartner(partner); setReplyContent(''); setReplyError(null); }}
                  style={{
                    padding: '12px 16px', cursor: 'pointer',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: isSelected ? '#eff6ff' : 'white'
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{partner.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {preview.length > 38 ? preview.slice(0, 38) + '...' : preview}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedPartner === null ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontSize: '14px' }}>
              Select a conversation to view messages
            </div>
          ) : (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', fontWeight: 'bold', fontSize: '15px' }}>
                {selectedPartner.name}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {threadLoading ? (
                  <p style={{ color: '#6b7280' }}>Loading...</p>
                ) : thread.length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: '14px' }}>No messages yet.</p>
                ) : (
                  thread.map(msg => {
                    const isMine = msg.sender?._id === user.id;
                    return (
                      <div key={msg._id} style={{
                        padding: '10px 14px', borderRadius: '8px',
                        backgroundColor: isMine ? '#eff6ff' : '#f9fafb',
                        border: `1px solid ${isMine ? '#bfdbfe' : '#e5e7eb'}`,
                        alignSelf: isMine ? 'flex-end' : 'flex-start',
                        maxWidth: '70%'
                      }}>
                        <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>
                          {isMine ? 'You' : selectedPartner.name} · {new Date(msg.createdAt).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div style={{ fontSize: '14px' }}>{msg.content}</div>
                      </div>
                    );
                  })
                )}
              </div>

              <div style={{ padding: '12px 16px', borderTop: '1px solid #e5e7eb' }}>
                {replyError && <p style={{ color: 'red', fontSize: '13px', margin: '0 0 6px' }}>{replyError}</p>}
                <form onSubmit={handleReply} style={{ display: 'flex', gap: '8px' }}>
                  <textarea
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    rows={2}
                    placeholder={`Reply to ${selectedPartner.name}...`}
                    style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'none', fontSize: '14px' }}
                  />
                  <button type="submit" style={{
                    padding: '8px 16px', backgroundColor: '#047857', color: 'white',
                    border: 'none', borderRadius: '6px', cursor: 'pointer', alignSelf: 'flex-end'
                  }}>
                    Send
                  </button>
                </form>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default OwnerMessages;
