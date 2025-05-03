import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import { Client } from '@stomp/stompjs';
import { v4 as uuidv4 } from 'uuid';

interface ChatMessage extends IMessage {
  sessionId?: string;
  type?: string;
  status?: string;
}

const WEBSOCKET_URL = 'ws://localhost:8086/ws';

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [sessionId] = useState<string>(uuidv4());

  useEffect(() => {
    const stompClient = new Client({
      brokerURL: WEBSOCKET_URL,
      connectHeaders: {
        userId: 'user-' + uuidv4(),
        sessionId: sessionId,
      },
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = () => {
      console.log('Connected to WebSocket');
      stompClient.subscribe('/topic/chat/' + sessionId, (message) => {
        const response = JSON.parse(message.body);
        const newMessage: ChatMessage = {
          _id: response.id,
          text: response.content,
          createdAt: new Date(response.timestamp),
          user: {
            _id: 2,
            name: 'Health Assistant',
          },
          sessionId: response.sessionId,
          type: response.type,
          status: response.status,
        };
        setMessages(previousMessages => 
          GiftedChat.append(previousMessages, [newMessage])
        );
      });

      // Send initial message
      stompClient.publish({
        destination: '/app/chat.addUser',
        body: JSON.stringify({
          sessionId: sessionId,
          userId: 'user-' + uuidv4(),
          type: 'CHAT',
          content: 'User joined chat',
        }),
      });
    };

    stompClient.onStompError = (frame) => {
      console.error('STOMP error:', frame);
    };

    stompClient.activate();
    setClient(stompClient);

    return () => {
      if (stompClient) {
        stompClient.deactivate();
      }
    };
  }, [sessionId]);

  const onSend = useCallback((newMessages: ChatMessage[] = []) => {
    if (client && client.connected) {
      const message = newMessages[0];
      client.publish({
        destination: '/app/chat.sendMessage',
        body: JSON.stringify({
          sessionId: sessionId,
          userId: message.user._id.toString(),
          content: message.text,
          type: 'CHAT',
        }),
      });

      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, newMessages)
      );
    }
  }, [client, sessionId]);

  return (
    <SafeAreaView style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: 1,
        }}
        renderAvatar={null}
        placeholder="Type your health concern..."
        alwaysShowSend
        scrollToBottom
        infiniteScroll
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default ChatScreen; 