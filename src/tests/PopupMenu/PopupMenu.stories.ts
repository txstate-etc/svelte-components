import { storiesOf } from '@storybook/svelte'
import PopupMenuTest from './PopupMenuTest.svelte'

storiesOf('PopupMenuTest', module)
  .add('simple component example', () => ({
    Component: PopupMenuTest,
    data: {},
    on: {}
  }))
