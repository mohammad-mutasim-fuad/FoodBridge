import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  TextField,
  Button,
  Divider,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useAuth } from '../hooks/useAuth';
import {
  getConversationsByUserId,
  getMessagesByConversationId,
  sendMessage,
  firestore,
} from '../services/firebaseService';
import { doc, getDoc } from 'firebase/firestore';
import type { Conversation, Message } from '../types';

export const MessagesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const conversationId = searchParams.get('conversation');
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [otherUserName, setOtherUserName] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async () => {
    if (!currentUser) return;
    try {
      const convs = await getConversationsByUserId(currentUser.uid);
      setConversations(convs);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const loadMessages = useCallback(async (convId: string) => {
    try {
      const msgs = await getMessagesByConversationId(convId);
      setMessages(msgs);
      
      let conv = conversations.find(c => c.id === convId);
      
      if (!conv) {
        try {
          const convDoc = await getDoc(doc(firestore, 'Conversations', convId));
          if (convDoc.exists()) {
            conv = { id: convDoc.id, ...convDoc.data() } as Conversation;
          }
        } catch (e) {
          console.error('Error fetching conversation:', e);
        }
      }
      
      if (conv && conv.participants && currentUser) {
        const otherUser = currentUser.uid === conv.participants.donorId
          ? conv.participants.receiverName
          : conv.participants.donorName;
        setOtherUserName(otherUser);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [conversations, currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadConversations();
    }
  }, [currentUser, loadConversations]);

  useEffect(() => {
    if (conversationId) {
      loadMessages(conversationId);
    }
  }, [conversationId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !conversationId || !currentUser) return;

    try {
      setSending(true);
      await sendMessage(
        conversationId,
        currentUser.uid,
        currentUser.organizationName,
        currentUser.role as 'Donor' | 'Receiver',
        newMessage.trim()
      );
      setNewMessage('');
      loadMessages(conversationId);
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatDate = (date: any) => {
    if (!date) return '';
    let d: Date;
    if (date && typeof date === 'object' && 'toDate' in date) {
      d = date.toDate();
    } else if (date instanceof Date) {
      d = date;
    } else {
      d = new Date(date);
    }
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getOtherParticipant = (conv: Conversation) => {
    if (!currentUser) return { name: 'Unknown', role: '' };
    if (currentUser.uid === conv.participants.donorId) {
      return { name: conv.participants.receiverName, role: 'Receiver' };
    }
    return { name: conv.participants.donorName, role: 'Donor' };
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 120px)' }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 3 }}>
        💬 Messages
      </Typography>

      <Paper sx={{ display: 'flex', height: 'calc(100% - 60px)', overflow: 'hidden' }}>
        {/* Conversations List */}
        <Box sx={{ width: '35%', borderRight: '1px solid #e0e0e0', overflow: 'auto' }}>
          {conversations.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">No conversations yet.</Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Start a conversation by claiming a food listing or responding to a claim.
              </Typography>
            </Box>
          ) : (
            <List>
              {conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                return (
                  <React.Fragment key={conv.id}>
                    <ListItemButton
                      selected={conversationId === conv.id}
                      onClick={() => setSearchParams({ conversation: conv.id })}
                      sx={{
                        '&.Mui-selected': { backgroundColor: '#f5f5f5' },
                        '&:hover': { backgroundColor: '#fafafa' },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: conv.id === conversationId ? '#667eea' : '#9e9e9e' }}>
                          {other.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={other.name}
                        secondary={
                          <Stack spacing={0}>
                            <Typography variant="body2" color="textSecondary" noWrap>
                              {conv.foodItemName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {conv.lastMessage || 'No messages yet'}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItemButton>
                    <Divider />
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </Box>

        {/* Chat Area */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {!conversationId ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Typography color="textSecondary">
                Select a conversation to start messaging
              </Typography>
            </Box>
          ) : (
            <>
              {/* Chat Header */}
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {otherUserName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {conversations.find(c => c.id === conversationId)?.foodItemName}
                </Typography>
              </Box>

              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography color="textSecondary">No messages yet. Start the conversation!</Typography>
                  </Box>
                ) : (
                  messages.map((msg, index) => {
                    const isOwn = msg.senderId === currentUser?.uid;
                    return (
                      <Box
                        key={msg.id || index}
                        sx={{
                          display: 'flex',
                          justifyContent: isOwn ? 'flex-end' : 'flex-start',
                          mb: 2,
                        }}
                      >
                        <Paper
                          sx={{
                            p: 2,
                            maxWidth: '70%',
                            backgroundColor: isOwn ? '#667eea' : '#f5f5f5',
                            color: isOwn ? 'white' : 'inherit',
                          }}
                        >
                          <Typography variant="body2">{msg.content}</Typography>
                          <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 1 }}>
                            {formatDate(msg.createdAt)}
                          </Typography>
                        </Paper>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', backgroundColor: '#fafafa' }}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    multiline
                    maxRows={3}
                    disabled={sending}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    sx={{ minWidth: '100px' }}
                  >
                    {sending ? <CircularProgress size={24} /> : 'Send'}
                  </Button>
                </Stack>
              </Box>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};