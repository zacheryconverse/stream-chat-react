/* eslint-disable no-continue */
import React, { RefObject, useMemo } from 'react';
import isEqual from 'lodash.isequal';

import { insertDates } from './utils';

import { InfiniteScroll, InfiniteScrollProps } from '../InfiniteScrollPaginator';
import { Message } from '../Message';

import type { Channel, StreamChat, UserResponse } from 'stream-chat';

import type { DateSeparatorProps } from '../DateSeparator/DateSeparator';
import type { EmptyStateIndicatorProps } from '../EmptyStateIndicator/EmptyStateIndicator';
import type { EventComponentProps } from '../EventComponent/EventComponent';
import type { MessageProps } from '../Message/types';
import type { TypingIndicatorProps } from '../TypingIndicator/TypingIndicator';

import type { StreamMessage } from '../../context/ChannelContext';

import type {
  DefaultAttachmentType,
  DefaultChannelType,
  DefaultCommandType,
  DefaultEventType,
  DefaultMessageType,
  DefaultReactionType,
  DefaultUserType,
} from '../../../types/types';

export type MessageListInnerProps<
  At extends DefaultAttachmentType = DefaultAttachmentType,
  Ch extends DefaultChannelType = DefaultChannelType,
  Co extends DefaultCommandType = DefaultCommandType,
  Ev extends DefaultEventType = DefaultEventType,
  Me extends DefaultMessageType = DefaultMessageType,
  Re extends DefaultReactionType = DefaultReactionType,
  Us extends DefaultUserType<Us> = DefaultUserType
> = {
  bottomRef: RefObject<HTMLDivElement>;
  /** The currently active channel */
  channel: Channel<At, Ch, Co, Ev, Me, Re, Us>;
  /** Available from [ChatContext](https://getstream.github.io/stream-chat-react/#chat) */
  client: StreamChat<At, Ch, Co, Ev, Me, Re, Us>;
  /**
   * Date separator UI component to render
   * Defaults to and accepts same props as: [DateSeparator](https://github.com/GetStream/stream-chat-react/blob/master/src/components/DateSeparator.tsx)
   */
  DateSeparator: React.ComponentType<DateSeparatorProps>;
  /**
   * The messages to render in the list
   * Defaults to the messages stored in [ChannelContext](https://getstream.github.io/stream-chat-react/#section-channelcontext)
   * */
  messages: StreamMessage<At, Ch, Co, Ev, Me, Re, Us>[];
  /** Set to `true` to turn off grouping of messages by user */
  noGroupByUser: boolean;
  onMessageLoadCaptured: (event: React.SyntheticEvent<HTMLLIElement, Event>) => void;
  /** Set to `true` to indicate that the list is a thread  */
  threadList: boolean;
  /**
   * Typing indicator UI component to render
   * Defaults to and accepts same props as: [TypingIndicator](https://github.com/GetStream/stream-chat-react/blob/master/src/components/TypingIndicator/TypingIndicator.tsx)
   */
  TypingIndicator: React.ComponentType<TypingIndicatorProps>;
  /** Disables the injection of date separator components, defaults to `false` */
  disableDateSeparator?: boolean;
  /** The UI Indicator to use when `MessageList` or `ChannelList` is empty  */
  EmptyStateIndicator?: React.ComponentType<EmptyStateIndicatorProps>;
  /** Component to render at the top of the MessageList */
  HeaderComponent?: React.ComponentType;
  headerPosition?: number;
  /** Hides the MessageDeleted components from the list, defaults to `false` */
  hideDeletedMessages?: boolean;
  /** Overrides the default props passed to [InfiniteScroll](https://github.com/GetStream/stream-chat-react/blob/master/src/components/InfiniteScrollPaginator/InfiniteScroll.tsx) */
  internalInfiniteScrollProps?: InfiniteScrollProps;
  /** Overrides the default props passed to [Message](https://github.com/GetStream/stream-chat-react/blob/master/src/components/Message/Message.tsx) */
  internalMessageProps?: Omit<MessageProps<At, Ch, Co, Ev, Me, Re, Us>, 'message'>;
  /**
   * Custom UI component to display system messages
   * Defaults to and accepts same props as: [EventComponent](https://github.com/GetStream/stream-chat-react/blob/master/src/components/EventComponent.tsx)
   */
  MessageSystem?: React.ComponentType<EventComponentProps<At, Ch, Co, Ev, Me, Re, Us>>;
  read?: Record<string, { last_read: Date; user: UserResponse<Us> }>;
};

// fast since it usually iterates just the last few messages
const getLastReceived = <
  At extends DefaultAttachmentType = DefaultAttachmentType,
  Ch extends DefaultChannelType = DefaultChannelType,
  Co extends DefaultCommandType = DefaultCommandType,
  Ev extends DefaultEventType = DefaultEventType,
  Me extends DefaultMessageType = DefaultMessageType,
  Re extends DefaultReactionType = DefaultReactionType,
  Us extends DefaultUserType<Us> = DefaultUserType
>(
  messages: StreamMessage<At, Ch, Co, Ev, Me, Re, Us>[],
) => {
  for (let i = messages.length - 1; i > 0; i -= 1) {
    if (messages[i].status === 'received') {
      return messages[i].id;
    }
  }

  return null;
};

const getReadStates = <
  At extends DefaultAttachmentType = DefaultAttachmentType,
  Ch extends DefaultChannelType = DefaultChannelType,
  Co extends DefaultCommandType = DefaultCommandType,
  Ev extends DefaultEventType = DefaultEventType,
  Me extends DefaultMessageType = DefaultMessageType,
  Re extends DefaultReactionType = DefaultReactionType,
  Us extends DefaultUserType<Us> = DefaultUserType
>(
  messages: StreamMessage<At, Ch, Co, Ev, Me, Re, Us>[],
  read: Record<string, { last_read: Date; user: UserResponse<Us> }> = {},
) => {
  // create object with empty array for each message id
  const readData: Record<string, Array<UserResponse<Us>>> = {};

  Object.values(read).forEach((readState) => {
    if (!readState.last_read) return;

    let userLastReadMsgId;
    messages.forEach((msg) => {
      //@ts-expect-error
      if (msg.updated_at < readState.last_read) userLastReadMsgId = msg.id;
    });

    if (userLastReadMsgId) {
      if (!readData[userLastReadMsgId]) readData[userLastReadMsgId] = [];
      readData[userLastReadMsgId].push(readState.user);
    }
  });

  return readData;
};

const insertIntro = <
  At extends DefaultAttachmentType = DefaultAttachmentType,
  Ch extends DefaultChannelType = DefaultChannelType,
  Co extends DefaultCommandType = DefaultCommandType,
  Ev extends DefaultEventType = DefaultEventType,
  Me extends DefaultMessageType = DefaultMessageType,
  Re extends DefaultReactionType = DefaultReactionType,
  Us extends DefaultUserType<Us> = DefaultUserType
>(
  messages: StreamMessage<At, Ch, Co, Ev, Me, Re, Us>[],
  headerPosition?: number,
) => {
  const newMessages = messages;
  const intro = ({ type: 'channel.intro' } as unknown) as StreamMessage<At, Ch, Co, Ev, Me, Re, Us>;

  // if no headerPosition is set, HeaderComponent will go at the top
  if (!headerPosition) {
    newMessages.unshift(intro);
    return newMessages;
  }

  // if no messages, intro gets inserted
  if (!newMessages.length) {
    newMessages.unshift(intro);
    return newMessages;
  }

  // else loop over the messages
  for (let i = 0, l = messages.length; i < l; i += 1) {
    const message = messages[i];

    const messageTime = message.created_at
      ? //@ts-expect-error
        message.created_at.getTime()
      : null;
    const nextMessageTime =
      messages[i + 1] && messages[i + 1].created_at
        ? //@ts-expect-error
          messages[i + 1].created_at.getTime()
        : null;

    // header position is smaller than message time so comes after;
    if (messageTime < headerPosition) {
      // if header position is also smaller than message time continue;
      if (nextMessageTime < headerPosition) {
        if (messages[i + 1] && messages[i + 1].type === 'message.date') continue;
        if (!nextMessageTime) {
          newMessages.push(intro);
          return newMessages;
        }
        continue;
      } else {
        newMessages.splice(i + 1, 0, intro);
        return newMessages;
      }
    }
  }

  return newMessages;
};

export type GroupStyle = '' | 'middle' | 'top' | 'bottom' | 'single';

const getGroupStyles = <
  At extends DefaultAttachmentType = DefaultAttachmentType,
  Ch extends DefaultChannelType = DefaultChannelType,
  Co extends DefaultCommandType = DefaultCommandType,
  Ev extends DefaultEventType = DefaultEventType,
  Me extends DefaultMessageType = DefaultMessageType,
  Re extends DefaultReactionType = DefaultReactionType,
  Us extends DefaultUserType<Us> = DefaultUserType
>(
  message: StreamMessage<At, Ch, Co, Ev, Me, Re, Us>,
  previousMessage: StreamMessage<At, Ch, Co, Ev, Me, Re, Us>,
  nextMessage: StreamMessage<At, Ch, Co, Ev, Me, Re, Us>,
  noGroupByUser: boolean,
): GroupStyle => {
  if (message.type === 'message.date') return '';
  if (message.type === 'channel.event') return '';
  if (message.type === 'channel.intro') return '';

  if (noGroupByUser || message.attachments?.length !== 0) return 'single';

  const isTopMessage =
    !previousMessage ||
    previousMessage.type === 'channel.intro' ||
    previousMessage.type === 'message.date' ||
    previousMessage.type === 'system' ||
    previousMessage.type === 'channel.event' ||
    previousMessage.attachments?.length !== 0 ||
    message.user?.id !== previousMessage.user?.id ||
    previousMessage.type === 'error' ||
    previousMessage.deleted_at;

  const isBottomMessage =
    !nextMessage ||
    nextMessage.type === 'message.date' ||
    nextMessage.type === 'system' ||
    nextMessage.type === 'channel.event' ||
    nextMessage.type === 'channel.intro' ||
    nextMessage.attachments?.length !== 0 ||
    message.user?.id !== nextMessage.user?.id ||
    nextMessage.type === 'error' ||
    nextMessage.deleted_at;

  if (!isTopMessage && !isBottomMessage) {
    if (message.deleted_at || message.type === 'error') return 'single';
    return 'middle';
  }

  if (isBottomMessage) {
    if (isTopMessage || message.deleted_at || message.type === 'error') return 'single';
    return 'bottom';
  }

  if (isTopMessage) return 'top';

  return '';
};

const UnMemoizedMessageListInner = <
  At extends DefaultAttachmentType = DefaultAttachmentType,
  Ch extends DefaultChannelType = DefaultChannelType,
  Co extends DefaultCommandType = DefaultCommandType,
  Ev extends DefaultEventType = DefaultEventType,
  Me extends DefaultMessageType = DefaultMessageType,
  Re extends DefaultReactionType = DefaultReactionType,
  Us extends DefaultUserType<Us> = DefaultUserType
>(
  props: MessageListInnerProps<At, Ch, Co, Ev, Me, Re, Us>,
) => {
  const {
    bottomRef,
    channel,
    client,
    DateSeparator,
    disableDateSeparator = false,
    EmptyStateIndicator,
    HeaderComponent,
    headerPosition,
    hideDeletedMessages = false,
    internalInfiniteScrollProps,
    internalMessageProps,
    messages,
    MessageSystem,
    noGroupByUser,
    onMessageLoadCaptured,
    read,
    threadList,
    TypingIndicator,
  } = props;

  const lastRead = useMemo(() => channel.lastRead?.(), [channel]);

  const enrichMessages = () => {
    const messageWithDates = threadList
      ? messages
      : insertDates(messages, lastRead, client.userID, hideDeletedMessages, disableDateSeparator);

    if (HeaderComponent) {
      return insertIntro(messageWithDates, headerPosition);
    }

    return messageWithDates;
  };

  const enrichedMessages = enrichMessages();

  const messageGroupStyles = useMemo(
    () =>
      enrichedMessages.reduce((acc, message, i) => {
        const style = getGroupStyles(
          message,
          enrichedMessages[i - 1],
          enrichedMessages[i + 1],
          noGroupByUser,
        );
        if (style) acc[message.id] = style;
        return acc;
      }, {} as Record<string, GroupStyle>),
    [enrichedMessages, noGroupByUser],
  );

  // get the readData, but only for messages submitted by the user themselves
  const userID = client.userID;
  const readData = useMemo(
    () =>
      getReadStates(
        enrichedMessages.filter(({ user }) => user?.id === userID),
        read,
      ),
    [userID, enrichedMessages, read],
  );

  const lastReceivedId = useMemo(() => getLastReceived(enrichedMessages), [enrichedMessages]);

  const elements = useMemo(
    () =>
      enrichedMessages.map((message) => {
        if (message.type === 'message.date') {
          return (
            <li key={`${(message.date as Date).toISOString()}-i`}>
              <DateSeparator date={message.date as Date} unread={!!message.unread} />
            </li>
          );
        }

        if (message.type === 'channel.intro' && HeaderComponent) {
          return (
            <li key='intro'>
              <HeaderComponent />
            </li>
          );
        }

        if (message.type === 'channel.event' || message.type === 'system') {
          if (!MessageSystem) return null;
          return (
            <li
              key={
                (message.event as { created_at: string })?.created_at ||
                (message.created_at as string) ||
                ''
              }
            >
              <MessageSystem message={message} />
            </li>
          );
        }

        if (message.type !== 'message.read') {
          const groupStyles: GroupStyle = messageGroupStyles[message.id] || '';

          return (
            <li
              className={`str-chat__li str-chat__li--${groupStyles}`}
              key={message.id || (message.created_at as string)}
              onLoadCapture={onMessageLoadCaptured}
            >
              <Message
                client={client}
                groupStyles={[groupStyles]} /* TODO: convert to simple string */
                lastReceivedId={lastReceivedId}
                message={message}
                readBy={readData[message.id] || []}
                threadList={threadList}
                {...internalMessageProps}
              />
            </li>
          );
        }

        return null;
      }),
    [
      client,
      enrichedMessages,
      internalMessageProps,
      lastReceivedId,
      messageGroupStyles,
      MessageSystem,
      onMessageLoadCaptured,
      readData,
      threadList,
    ],
  );

  if (!elements.length && EmptyStateIndicator) {
    return <EmptyStateIndicator listType='message' />;
  }

  return (
    <InfiniteScroll
      className='str-chat__reverse-infinite-scroll'
      data-testid='reverse-infinite-scroll'
      isReverse
      useWindow={false}
      {...internalInfiniteScrollProps}
    >
      <ul className='str-chat__ul'>{elements}</ul>
      <TypingIndicator threadList={threadList} />
      <div key='bottom' ref={bottomRef} />
    </InfiniteScroll>
  );
};

export const MessageListInner = React.memo(
  UnMemoizedMessageListInner,
  isEqual,
) as typeof UnMemoizedMessageListInner;
