import React from 'react';

import { useTranslationContext } from '../../context/TranslationContext';

export const EmojiIconLarge: React.FC = () => {
  const { t } = useTranslationContext();

  return (
    <svg height='28' width='28' xmlns='http://www.w3.org/2000/svg'>
      <title>{t('Open emoji picker')}</title>
      <path
        d='M22.217 16.1c.483.25.674.849.423 1.334C21.163 20.294 17.771 22 14 22c-3.867 0-7.347-1.765-8.66-4.605a.994.994 0 0 1 .9-1.407c.385 0 .739.225.9.575C8.135 18.715 10.892 20 14 20c3.038 0 5.738-1.267 6.879-3.476a.99.99 0 0 1 1.338-.424zm1.583-3.652c.341.443.235 1.064-.237 1.384a1.082 1.082 0 0 1-.62.168c-.338 0-.659-.132-.858-.389-.212-.276-.476-.611-1.076-.611-.598 0-.864.337-1.08.614-.197.254-.517.386-.854.386-.224 0-.438-.045-.62-.167-.517-.349-.578-.947-.235-1.388.66-.847 1.483-1.445 2.789-1.445 1.305 0 2.136.6 2.79 1.448zm-14 0c.341.443.235 1.064-.237 1.384a1.082 1.082 0 0 1-.62.168c-.339 0-.659-.132-.858-.389C7.873 13.335 7.61 13 7.01 13c-.598 0-.864.337-1.08.614-.197.254-.517.386-.854.386-.224 0-.438-.045-.62-.167-.518-.349-.579-.947-.235-1.388C4.88 11.598 5.703 11 7.01 11c1.305 0 2.136.6 2.79 1.448zM14 0c7.732 0 14 6.268 14 14s-6.268 14-14 14S0 21.732 0 14 6.268 0 14 0zm8.485 22.485A11.922 11.922 0 0 0 26 14c0-3.205-1.248-6.219-3.515-8.485A11.922 11.922 0 0 0 14 2a11.922 11.922 0 0 0-8.485 3.515A11.922 11.922 0 0 0 2 14c0 3.205 1.248 6.219 3.515 8.485A11.922 11.922 0 0 0 14 26c3.205 0 6.219-1.248 8.485-3.515z'
        fillRule='evenodd'
      />
    </svg>
  );
};

export const EmojiIconSmall: React.FC = () => {
  const { t } = useTranslationContext();

  return (
    <svg height='14' width='14' xmlns='http://www.w3.org/2000/svg'>
      <title>{t('Open emoji picker')}</title>
      <path
        d='M11.108 8.05a.496.496 0 0 1 .212.667C10.581 10.147 8.886 11 7 11c-1.933 0-3.673-.882-4.33-2.302a.497.497 0 0 1 .9-.417C4.068 9.357 5.446 10 7 10c1.519 0 2.869-.633 3.44-1.738a.495.495 0 0 1 .668-.212zm.792-1.826a.477.477 0 0 1-.119.692.541.541 0 0 1-.31.084.534.534 0 0 1-.428-.194c-.106-.138-.238-.306-.539-.306-.298 0-.431.168-.54.307A.534.534 0 0 1 9.538 7a.544.544 0 0 1-.31-.084.463.463 0 0 1-.117-.694c.33-.423.742-.722 1.394-.722.653 0 1.068.3 1.396.724zm-7 0a.477.477 0 0 1-.119.692.541.541 0 0 1-.31.084.534.534 0 0 1-.428-.194c-.106-.138-.238-.306-.539-.306-.299 0-.432.168-.54.307A.533.533 0 0 1 2.538 7a.544.544 0 0 1-.31-.084.463.463 0 0 1-.117-.694c.33-.423.742-.722 1.394-.722.653 0 1.068.3 1.396.724zM7 0a7 7 0 1 1 0 14A7 7 0 0 1 7 0zm4.243 11.243A5.96 5.96 0 0 0 13 7a5.96 5.96 0 0 0-1.757-4.243A5.96 5.96 0 0 0 7 1a5.96 5.96 0 0 0-4.243 1.757A5.96 5.96 0 0 0 1 7a5.96 5.96 0 0 0 1.757 4.243A5.96 5.96 0 0 0 7 13a5.96 5.96 0 0 0 4.243-1.757z'
        fillRule='evenodd'
      />
    </svg>
  );
};

export const FileUploadIcon: React.FC = () => {
  const { t } = useTranslationContext();

  return (
    <svg height='14' width='14' xmlns='http://www.w3.org/2000/svg'>
      <title>{t('Attach files')}</title>
      <path
        d='M7 .5c3.59 0 6.5 2.91 6.5 6.5s-2.91 6.5-6.5 6.5S.5 10.59.5 7 3.41.5 7 .5zm0 12c3.031 0 5.5-2.469 5.5-5.5S10.031 1.5 7 1.5A5.506 5.506 0 0 0 1.5 7c0 3.034 2.469 5.5 5.5 5.5zM7.506 3v3.494H11v1.05H7.506V11h-1.05V7.544H3v-1.05h3.456V3h1.05z'
        fillRule='nonzero'
      />
    </svg>
  );
};

export const FileUploadIconFlat: React.FC = () => {
  const { t } = useTranslationContext();

  return (
    <svg height='14' width='14' xmlns='http://www.w3.org/2000/svg'>
      <title>{t('Attach files')}</title>
      <path
        d='M1.667.333h10.666c.737 0 1.334.597 1.334 1.334v10.666c0 .737-.597 1.334-1.334 1.334H1.667a1.333 1.333 0 0 1-1.334-1.334V1.667C.333.93.93.333 1.667.333zm2 1.334a1.667 1.667 0 1 0 0 3.333 1.667 1.667 0 0 0 0-3.333zm-2 9.333v1.333h10.666v-4l-2-2-4 4-2-2L1.667 11z'
        fillRule='nonzero'
      />
    </svg>
  );
};

export type SendButtonProps = {
  /** Function that gets triggered on click */
  sendMessage: React.FormEventHandler<HTMLFormElement>;
};

export const SendButton: React.FC<SendButtonProps> = ({ sendMessage }) => {
  const { t } = useTranslationContext();
  return (
    <button
      className='str-chat__send-button'
      onClick={
        /**
         * TODO: fix the below at some point because this type casting is wrong
         * and just forced to not have warnings currently with the unknown casting
         */
        (sendMessage as unknown) as React.MouseEventHandler<HTMLButtonElement>
      }
    >
      <svg height='17' viewBox='0 0 18 17' width='18' xmlns='http://www.w3.org/2000/svg'>
        <title>{t('Send')}</title>
        <path
          d='M0 17.015l17.333-8.508L0 0v6.617l12.417 1.89L0 10.397z'
          fill='#006cff'
          fillRule='evenodd'
        />
      </svg>
    </button>
  );
};
