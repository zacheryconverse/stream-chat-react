```js
import { Message } from './Message';
import { MessageLivestream } from './MessageLivestream';

const data = require('../../docs/data');

const readBy = [
  {
    created_at: '2019-01-22T16:35:18.417456Z',
    id: 'thierry',
    online: true,
    role: 'user',
    updated_at: '2019-01-25T18:07:04.20131Z',
  },
];

<Message
  message={data.message}
  Message={MessageLivestream}
  readBy={readBy}
  groupStyles={['bottom']}
  editing={false}
  mutes={[]}
  {...data.channelContext}
  {...data.translationContext}
/>;
```
