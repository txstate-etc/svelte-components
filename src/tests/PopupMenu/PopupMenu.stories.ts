import { storiesOf } from '@storybook/svelte'
import PopupMenuTest from './PopupMenuTest.svelte'

storiesOf('PopupMenuTest', module)
  .add('simple example', () => ({
    Component: PopupMenuTest
  }))
  .add('scrollable example', () => ({
    Component: PopupMenuTest,
    props: {
      items: [
        { value: '0', label: 'Sunday', disabled: true },
        { value: '1', label: 'Monday' },
        { value: '2', label: 'Tuesday' },
        { value: '3', label: 'Wednesday' },
        { value: '4', label: 'Thursday', disabled: true },
        { value: '5', label: 'Friday' },
        { value: '6', label: 'Saturday', disabled: true },
        { value: '0', label: 'Sunday', disabled: true },
        { value: '1', label: 'Monday' },
        { value: '2', label: 'Tuesday' },
        { value: '3', label: 'Wednesday' },
        { value: '4', label: 'Thursday', disabled: true },
        { value: '5', label: 'Friday' },
        { value: '6', label: 'Saturday', disabled: true },
        { value: '0', label: 'Sunday', disabled: true },
        { value: '1', label: 'Monday' },
        { value: '2', label: 'Tuesday' },
        { value: '3', label: 'Wednesday' },
        { value: '4', label: 'Thursday', disabled: true },
        { value: '5', label: 'Friday' },
        { value: '6', label: 'Saturday', disabled: true }
      ]
    }
  }))
