import React from 'react';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  emojiMockConfig,
  generateChannel,
  generateMessage,
  generateReaction,
  generateUser,
  getTestClientWithUser,
} from 'mock-builders';

import { ChannelContext, ChatContext, TranslationContext } from '../../../context';
import { MessageTeam } from '../MessageTeam';
import { Avatar as AvatarMock } from '../../Avatar';
import { MML as MMLMock } from '../../MML';
import { MessageInput as MessageInputMock } from '../../MessageInput';
import { MessageActions as MessageActionsMock } from '../../MessageActions';
import Dayjs from 'dayjs';

jest.mock('../../Avatar', () => ({
  Avatar: jest.fn(() => <div />),
}));

jest.mock('../../MessageInput', () => ({
  MessageInput: jest.fn(() => <div />),
}));

jest.mock('../../MessageActions', () => ({
  MessageActions: jest.fn(() => <div />),
}));

jest.mock('../../MML', () => ({ MML: jest.fn(() => <div />) }));

const alice = generateUser({ image: 'alice-avatar.jpg', name: 'alice' });
const bob = generateUser({ image: 'bob-avatar.jpg', name: 'bob' });
const carol = generateUser({ image: 'carol-avatar.jpg', name: 'carol' });

async function renderMessageTeam(
  message,
  props = {},
  channelConfig = { reactions: true, replies: true },
) {
  const channel = generateChannel({ getConfig: () => channelConfig });
  const client = await getTestClientWithUser(alice);
  const customDateTimeParser = jest.fn((date) => Dayjs(date));

  return render(
    <ChatContext.Provider value={{ client }}>
      <ChannelContext.Provider
        value={{
          channel,
          client,
          emojiConfig: emojiMockConfig,
          t: (key) => key,
        }}
      >
        <TranslationContext.Provider
          value={{
            t: (key) => key,
            tDateTimeParser: customDateTimeParser,
            userLanguage: 'en',
          }}
        >
          <MessageTeam
            getMessageActions={() => []}
            isMyMessage={() => true}
            message={message}
            typing={false}
            {...props}
          />
        </TranslationContext.Provider>
      </ChannelContext.Provider>
    </ChatContext.Provider>,
  );
}

function generateAliceMessage(messageOptions) {
  return generateMessage({
    user: alice,
    ...messageOptions,
  });
}

const pdfAttachment = {
  asset_url: 'file.pdf',
  type: 'file',
};

const imageAttachment = {
  image_url: 'image.jpg',
  type: 'image',
};

const messageTeamTestId = 'message-team';
const messageTeamThreadIcon = 'message-team-thread-icon';
const messageTeamReactionIcon = 'message-team-reaction-icon';
const reactionSelectorTestId = 'reaction-selector';
const messageTeamMessageTestId = 'message-team-message';

describe('<MessageTeam />', () => {
  afterEach(cleanup);
  beforeEach(jest.clearAllMocks);

  it('should not render anything if message is of type message.read', async () => {
    const message = generateAliceMessage({ type: 'message.read' });
    const { container } = await renderMessageTeam(message);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render deleted message with custom component when message was deleted and a custom delete message component was passed', async () => {
    const deletedMessage = generateAliceMessage({
      deleted_at: new Date('2019-08-27T00:24:00'),
    });
    const CustomMessageDeletedComponent = () => <p data-testid='custom-message-deleted'>Gone!</p>;
    const { getByTestId } = await renderMessageTeam(deletedMessage, {
      MessageDeleted: CustomMessageDeletedComponent,
    });
    expect(getByTestId('custom-message-deleted')).toBeInTheDocument();
  });

  it('should render reaction selector with custom component when one is given', async () => {
    const message = generateAliceMessage({ text: undefined });
    const customSelectorTestId = 'custom-reaction-selector';
    // Passing the ref prevents a react warning
    // eslint-disable-next-line no-unused-vars
    const CustomReactionSelector = (props, ref) => (
      <ul data-testid={customSelectorTestId}>
        <li>
          <button onClick={(e) => props.handleReaction('smile-emoticon', e)}>:)</button>
        </li>
        <li>
          <button onClick={(e) => props.handleReaction('sad-emoticon', e)}>:(</button>
        </li>
      </ul>
    );
    const { getByTestId } = await renderMessageTeam(
      message,
      {
        ReactionSelector: React.forwardRef(CustomReactionSelector),
      },
      { reactions: true },
    );
    fireEvent.click(getByTestId(messageTeamReactionIcon));
    expect(getByTestId(customSelectorTestId)).toBeInTheDocument();
  });

  it('should render reaction list with custom component when one is given', async () => {
    const bobReaction = generateReaction({ type: 'cool-reaction', user: bob });
    const message = generateAliceMessage({
      latest_reactions: [bobReaction],
      text: undefined,
    });
    const CustomReactionsList = ({ reactions }) => (
      <ul data-testid='custom-reaction-list'>
        {reactions.map((reaction) => {
          if (reaction.type === 'cool-reaction') {
            return <li key={reaction.type + reaction.user_id}>:)</li>;
          }
          return <li key={reaction.type + reaction.user_id}>?</li>;
        })}
      </ul>
    );
    const { getByTestId } = await renderMessageTeam(
      message,
      {
        ReactionsList: CustomReactionsList,
      },
      { reactions: true },
    );
    expect(getByTestId('custom-reaction-list')).toBeInTheDocument();
  });

  it('should render custom avatar component when one is given', async () => {
    const message = generateAliceMessage();
    const CustomAvatar = () => <div data-testid='custom-avatar'>Avatar</div>;
    const { getByTestId } = await renderMessageTeam(message, {
      Avatar: CustomAvatar,
    });
    expect(getByTestId('custom-avatar')).toBeInTheDocument();
  });

  it('should render pin indicator when pinned is true', async () => {
    const message = generateAliceMessage({ pinned: true });
    const CustomPinIndicator = () => <div data-testid='pin-indicator'>Pin Indicator</div>;

    const { getByTestId } = await renderMessageTeam(message, {
      PinIndicator: CustomPinIndicator,
    });

    await waitFor(() => {
      expect(getByTestId('pin-indicator')).toBeInTheDocument();
    });
  });

  it('should not render pin indicator when pinned is false', async () => {
    const message = generateAliceMessage({ pinned: false });
    const CustomPinIndicator = () => <div data-testid='pin-indicator'>Pin Indicator</div>;

    const { queryByTestId } = await renderMessageTeam(message, {
      PinIndicator: CustomPinIndicator,
    });

    await waitFor(() => {
      expect(queryByTestId('pin-indicator')).not.toBeInTheDocument();
    });
  });

  it('should render custom edit message input component when one is given', async () => {
    const message = generateAliceMessage();
    const clearEditingState = jest.fn();

    const CustomEditMessageInput = () => <div>Edit Input</div>;

    await renderMessageTeam(message, {
      clearEditingState,
      editing: true,
      EditMessageInput: CustomEditMessageInput,
    });

    expect(MessageInputMock).toHaveBeenCalledWith(
      expect.objectContaining({
        clearEditingState,
        Input: CustomEditMessageInput,
        message,
      }),
      {},
    );
  });

  it('should render message input when in edit mode', async () => {
    const message = generateAliceMessage();
    const clearEditingState = jest.fn();
    await renderMessageTeam(message, {
      clearEditingState,
      editing: true,
    });
    expect(MessageInputMock).toHaveBeenCalledWith(
      expect.objectContaining({
        clearEditingState,
        message,
      }),
      {},
    );
  });

  it('should render MML', async () => {
    const mml = '<mml>text</mml>';
    const message = generateAliceMessage({ mml });
    await renderMessageTeam(message);
    expect(MMLMock).toHaveBeenCalledWith(
      expect.objectContaining({ align: 'left', source: mml }),
      {},
    );
  });

  it.each([
    ['should display', 'top', { shouldDisplay: true }],
    ['should display', 'single', { shouldDisplay: true }],
    ['should not display', 'middle', { shouldDisplay: false }],
    ['should not display', 'bottom', { shouldDisplay: false }],
  ])(
    '%s avatar component when rendered in edit mode and with first group style set to %s',
    async (_, groupStyle, { shouldDisplay }) => {
      const message = generateAliceMessage();
      const { getByTestId } = await renderMessageTeam(message, {
        editing: true,
        groupStyles: [groupStyle],
      });
      expect(getByTestId('message-team-edit')).toHaveClass(
        `str-chat__message-team str-chat__message-team--${groupStyle}`,
      );
      if (shouldDisplay) {
        expect(AvatarMock).toHaveBeenCalledWith(
          {
            image: alice.image,
            name: alice.name,
            onClick: expect.any(Function),
            onMouseOver: expect.any(Function),
            size: 40,
          },
          {},
        );
      } else {
        expect(AvatarMock).not.toHaveBeenCalledWith();
      }
    },
  );

  it('should display avatar if it is the first message on a thread', async () => {
    const message = generateAliceMessage();
    await renderMessageTeam(message, {
      initialMessage: true,
    });
    expect(AvatarMock).toHaveBeenCalledWith(
      {
        image: alice.image,
        name: alice.name,
        onClick: expect.any(Function),
        onMouseOver: expect.any(Function),
        size: 40,
      },
      {},
    );
  });

  it('should display text in users set language', async () => {
    const message = generateAliceMessage({
      i18n: { en_text: 'hello', fr_text: 'bonjour', language: 'fr' },
      text: 'bonjour',
    });

    const { getByText } = await renderMessageTeam(message);

    expect(getByText('hello')).toBeInTheDocument();
  });

  it('should place a spacer when message is not the first message on a thread and group style is not top or single', async () => {
    const message = generateAliceMessage();
    const { getByTestId } = await renderMessageTeam(message, {
      groupStyles: [],
      initialMessage: false,
    });
    expect(getByTestId('team-meta-spacer')).toBeInTheDocument();
  });

  it('should set group style as css class modifier', async () => {
    const message = generateAliceMessage();
    const groupStyle = 'set-group-style';
    const { getByTestId } = await renderMessageTeam(message, {
      groupStyles: [groupStyle],
    });
    console.log('messageTeamTestId', messageTeamTestId);
    expect(getByTestId(messageTeamTestId)).toHaveClass(
      `str-chat__message-team str-chat__message-team--${groupStyle}`,
    );
  });

  it("should display message's timestamp with time only format", async () => {
    const messageDate = new Date('2019-12-12T03:33:00');
    const message = generateAliceMessage({
      created_at: messageDate,
    });
    const { getByText } = await renderMessageTeam(message);
    expect(getByText('3:33AM')).toBeInTheDocument();
  });

  it('should set message type as css class modifier', async () => {
    const messageType = 'message-type';
    const message = generateAliceMessage({ type: messageType });
    const { getByTestId } = await renderMessageTeam(message);
    expect(getByTestId(messageTeamTestId)).toHaveClass(`str-chat__message-team--${messageType}`);
  });

  it('should set message status as css class modifier', async () => {
    const messageStatus = 'message-status';
    const message = generateAliceMessage({ status: messageStatus });
    const { getByTestId } = await renderMessageTeam(message);
    expect(getByTestId(messageTeamTestId)).toHaveClass(`str-chat__message-team--${messageStatus}`);
  });

  it('should render the user name and handle a click on it when message is the first in a thread list', async () => {
    const message = generateAliceMessage();
    const onUserClick = jest.fn();
    const { getByTestId } = await renderMessageTeam(message, {
      initialMessage: true,
      onUserClick,
    });
    expect(getByTestId('message-team-author')).toBeInTheDocument();
    fireEvent.click(getByTestId('message-team-author'));
    expect(onUserClick).toHaveBeenCalledTimes(1);
  });

  it('should inform user about error visibility when message is of error type and the first in a thread list', async () => {
    const message = generateAliceMessage({ type: 'error' });
    const { getByText } = await renderMessageTeam(message, {
      initialMessage: true,
    });
    expect(getByText('Only visible to you')).toBeInTheDocument();
  });

  it('should set first group style modifier to message content wrapper', async () => {
    const message = generateAliceMessage();
    const groupStyle = 'top';
    const { getByTestId } = await renderMessageTeam(message, {
      groupStyles: [groupStyle],
    });
    expect(getByTestId('message-team-content')).toHaveClass(
      `str-chat__message-team-content str-chat__message-team-content--${groupStyle}`,
    );
  });

  it.each([
    ['type', 'error'],
    ['type', 'system'],
    ['type', 'ephemeral'],
    ['status', 'failed'],
    ['status', 'sending'],
  ])('should not render actions if message is of %s %s', async (key, value) => {
    const message = generateAliceMessage({ [key]: value });
    const { queryByTestId } = await renderMessageTeam(message);
    expect(queryByTestId('message-team-actions')).not.toBeInTheDocument();
  });

  it('should display a reactions icon when channel has reactions enabled', async () => {
    const message = generateAliceMessage();
    const { getByTestId } = await renderMessageTeam(
      message,
      {},
      {
        reactions: true,
      },
    );
    expect(getByTestId(messageTeamReactionIcon)).toBeInTheDocument();
  });

  it('should open reaction selector when reaction icon is clicked', async () => {
    const message = generateAliceMessage();
    const { getByTestId, queryByTestId } = await renderMessageTeam(
      message,
      {},
      { reactions: true },
    );
    expect(queryByTestId(reactionSelectorTestId)).not.toBeInTheDocument();
    fireEvent.click(getByTestId(messageTeamReactionIcon));
    expect(getByTestId(reactionSelectorTestId)).toBeInTheDocument();
  });

  it('should close the reaction selector when user clicks outside the selector', async () => {
    const message = generateAliceMessage();
    const { getByTestId, queryByTestId } = await renderMessageTeam(
      message,
      {},
      { reactions: true },
    );
    fireEvent.click(getByTestId(messageTeamReactionIcon));
    expect(getByTestId(reactionSelectorTestId)).toBeInTheDocument();
    fireEvent.click(document);
    expect(queryByTestId(reactionSelectorTestId)).not.toBeInTheDocument();
  });

  it('should display thread action button when channel has replies enabled', async () => {
    const message = generateAliceMessage();
    const { getByTestId } = await renderMessageTeam(message, {}, { replies: true });
    expect(getByTestId(messageTeamThreadIcon)).toBeInTheDocument();
  });

  it('should open thread when thread action button is clicked', async () => {
    const message = generateAliceMessage();
    const handleOpenThread = jest.fn();
    const { getByTestId } = await renderMessageTeam(message, {
      channelConfig: { replies: true },
      handleOpenThread,
    });
    expect(handleOpenThread).not.toHaveBeenCalled();
    fireEvent.click(getByTestId(messageTeamThreadIcon));
    expect(handleOpenThread).toHaveBeenCalledWith(
      expect.any(Object), // THe click event
    );
  });

  it('should render action options when message has actions', async () => {
    const message = generateAliceMessage();
    const getMessageActions = () => ['edit, delete'];
    await renderMessageTeam(message, {
      getMessageActions,
    });
    expect(MessageActionsMock).toHaveBeenCalledTimes(1);
  });

  it('should set emoji css class when message has text that is only emojis', async () => {
    const message = generateAliceMessage({ text: '🤖🤖🤖🤖' });
    const { getByTestId } = await renderMessageTeam(message);
    expect(getByTestId(messageTeamMessageTestId)).toHaveClass(
      'str-chat__message-team-text--is-emoji',
    );
  });

  it('should trigger mentions hover handler when user hovers message text', async () => {
    const message = generateAliceMessage({ mentioned_users: [bob] });
    const onMentionsHoverMessage = jest.fn();
    const { getByTestId } = await renderMessageTeam(message, {
      onMentionsHoverMessage,
    });
    expect(onMentionsHoverMessage).not.toHaveBeenCalled();
    fireEvent.mouseOver(getByTestId(messageTeamMessageTestId));
    expect(onMentionsHoverMessage).toHaveBeenCalledTimes(1);
  });

  it('should trigger mentions click handler when user clicks message text', async () => {
    const message = generateAliceMessage({ mentioned_users: [bob] });
    const onMentionsClickMessage = jest.fn();
    const { getByTestId } = await renderMessageTeam(message, {
      onMentionsClickMessage,
    });
    expect(onMentionsClickMessage).not.toHaveBeenCalled();
    fireEvent.click(getByTestId(messageTeamMessageTestId));
    expect(onMentionsClickMessage).toHaveBeenCalledTimes(1);
  });

  it('should render message html when unsafeHTML is enabled', async () => {
    const customTestId = 'custom-test-id';
    const message = generateAliceMessage({
      html: `<h1 data-testid="${customTestId}">Hello world</h1>`,
    });
    const { getByTestId } = await renderMessageTeam(message, {
      unsafeHTML: true,
    });
    expect(getByTestId(customTestId)).toBeInTheDocument();
  });

  it('should render the message text', async () => {
    const text = 'Hello world!';
    const message = generateAliceMessage({ text });
    const { getByText } = await renderMessageTeam(message);
    expect(getByText(text)).toBeInTheDocument();
  });

  it('should render image attachments in gallery', async () => {
    const message = generateAliceMessage({
      attachments: [imageAttachment, imageAttachment, imageAttachment],
      text: undefined,
    });
    const { queryAllByTestId } = await renderMessageTeam(message);
    expect(queryAllByTestId('gallery-image')).toHaveLength(3);
  });

  it('should render non-image attachment components when message has empty text', async () => {
    const message = generateAliceMessage({
      attachments: [pdfAttachment, pdfAttachment, pdfAttachment],
      text: '',
    });
    const { queryAllByTestId } = await renderMessageTeam(message);
    expect(queryAllByTestId('attachment-file')).toHaveLength(3);
  });

  it('should display the reaction list when message has reactions and text is not empty', async () => {
    const bobReaction = generateReaction({ user: bob });
    const message = generateAliceMessage({
      latest_reactions: [bobReaction],
      text: 'Welcome, bob!',
    });
    const { getByTestId } = await renderMessageTeam(message);
    expect(getByTestId('simple-reaction-list')).toBeInTheDocument();
  });

  it('should not display the reaction list with non empty text if disabled in channel config', async () => {
    const bobReaction = generateReaction({ user: bob });
    const message = generateAliceMessage({
      latest_reactions: [bobReaction],
      text: 'Welcome, bob!',
    });
    const { queryByTestId } = await renderMessageTeam(message, {}, { reactions: false });
    expect(queryByTestId('simple-reaction-list')).not.toBeInTheDocument();
  });

  it('should allow message to be retried when it failed', async () => {
    const handleRetry = jest.fn();
    const message = generateAliceMessage({ status: 'failed' });
    const { getByTestId } = await renderMessageTeam(message, {
      handleRetry,
    });
    expect(handleRetry).not.toHaveBeenCalled();
    fireEvent.click(getByTestId('message-team-failed'));
    expect(handleRetry).toHaveBeenCalledWith(message);
  });

  it('should display loading status when message is being sent', async () => {
    const message = generateAliceMessage({ status: 'sending' });
    const { getByTestId } = await renderMessageTeam(message);
    expect(getByTestId('message-team-sending')).toBeInTheDocument();
  });

  it('should show users that read the message when it was read by another user that not the message owner', async () => {
    const message = generateAliceMessage();
    const { getByText } = await renderMessageTeam(message, {
      readBy: [alice, bob],
    });
    expect(getByText(bob.name)).toBeInTheDocument();
    expect(AvatarMock).toHaveBeenCalledWith(
      {
        image: bob.image,
        name: bob.name,
        size: 15,
      },
      {},
    );
  });

  it('should display the number of users that read the message if more than two users read it', async () => {
    const readBy = [alice, bob, carol];
    const message = generateAliceMessage();
    const { getByTestId } = await renderMessageTeam(message, { readBy });
    expect(getByTestId('message-team-read-by-count')).toHaveTextContent('2');
  });

  it('should display message delivered status when message is delivered', async () => {
    const messageId = 'd3ad47ce-74bf-4ef3-b6b3-b13340f9beda';
    const message = generateAliceMessage({ id: messageId, status: 'received' });
    const { getByTestId } = await renderMessageTeam(message, {
      lastReceivedId: messageId,
    });
    expect(getByTestId('message-team-received')).toHaveTextContent('Delivered');
  });

  it('should render attachments when message has text', async () => {
    const message = generateAliceMessage({
      attachments: [pdfAttachment, pdfAttachment, pdfAttachment],
      text: 'Hello, bob!',
    });
    const { queryAllByTestId } = await renderMessageTeam(message);
    expect(queryAllByTestId('attachment-file')).toHaveLength(3);
  });

  it('should display the reaction list when message has reactions and text is empty', async () => {
    const bobReaction = generateReaction({ user: bob });
    const message = generateAliceMessage({
      latest_reactions: [bobReaction],
      text: '',
    });
    const { getByTestId } = await renderMessageTeam(message);
    expect(getByTestId('simple-reaction-list')).toBeInTheDocument();
  });

  it('should not display the reaction list with empty text if disabled in channel config', async () => {
    const bobReaction = generateReaction({ user: bob });
    const message = generateAliceMessage({
      latest_reactions: [bobReaction],
      text: '',
    });
    const { queryByTestId } = await renderMessageTeam(message, {}, { reactions: false });
    expect(queryByTestId('simple-reaction-list')).not.toBeInTheDocument();
  });

  it('should display a message reply button when not on a thread and message has replies', async () => {
    const message = generateAliceMessage({ reply_count: 1 });
    const { getByTestId } = await renderMessageTeam(message, {
      initialMessage: false,
    });
    expect(getByTestId('replies-count-button')).toBeInTheDocument();
  });
});
