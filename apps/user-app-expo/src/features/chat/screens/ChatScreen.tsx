import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat, IMessage } from 'react-native-gifted-chat';
import axios from 'axios';

const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello! I am your health assistant. How can I help you today?',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Health Assistant',
        },
      },
    ]);
  }, []);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, newMessages)
    );

    const userMessage = newMessages[0].text;
    setIsLoading(true);

    try {
      const response = await axios.post('http://10.0.2.2:8082/api/chat/message', {
        message: userMessage
      });

      const assistantMessage: IMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: response.data.response,
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Health Assistant',
        },
      };

      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [assistantMessage])
      );
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: IMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: 'Sorry, I encountered an error. Please try again.',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'Health Assistant',
        },
      };
      setMessages(previousMessages =>
        GiftedChat.append(previousMessages, [errorMessage])
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={messages => onSend(messages)}
        user={{
          _id: 1,
        }}
        isLoadingEarlier={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default ChatScreen; 