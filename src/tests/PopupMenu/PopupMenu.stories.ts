import { storiesOf } from '@storybook/svelte'
import PopupMenuComplex from './PopupMenuComplex.svelte'
import PopupMenuSimple from './PopupMenuSimple.svelte'
import PopupMenuBody from './PopupMenuBody.svelte'
import PopupMenuButtonIsParent from './PopupMenuButtonIsParent.svelte'

storiesOf('PopupMenu', module)
  .add('simple example', () => ({
    Component: PopupMenuSimple
  }))
  .add('hide selected', () => ({
    Component: PopupMenuSimple,
    props: {
      showSelected: false
    }
  }))
  .add('complex placement', () => ({
    Component: PopupMenuComplex
  }))
  .add('body placement', () => ({
    Component: PopupMenuBody
  }))
  .add('button is parent', () => ({
    Component: PopupMenuButtonIsParent
  }))
  .add('scrollable example', () => ({
    Component: PopupMenuComplex,
    props: {
      items: [
        { value: '0', label: 'Sunday', disabled: true },
        { value: '1', label: 'Monday' },
        { value: '2', label: 'Tuesday' },
        { value: '3', label: 'Wednesday' },
        { value: '4', label: 'Thursday', disabled: true },
        { value: '5', label: 'Friday' },
        { value: '6', label: 'Saturday', disabled: true },
        { value: '7', label: 'Sunday', disabled: true },
        { value: '8', label: 'Monday' },
        { value: '9', label: 'Tuesday' },
        { value: '10', label: 'Wednesday' },
        { value: '11', label: 'Thursday', disabled: true },
        { value: '12', label: 'Friday' },
        { value: '13', label: 'Saturday', disabled: true },
        { value: '14', label: 'Sunday', disabled: true },
        { value: '15', label: 'Monday' },
        { value: '16', label: 'Tuesday' },
        { value: '17', label: 'Wednesday' },
        { value: '18', label: 'Thursday', disabled: true },
        { value: '19', label: 'Friday' },
        { value: '20', label: 'Saturday', disabled: true }
      ]
    }
  }))
  .add('empty example', () => ({
    Component: PopupMenuComplex,
    props: {
      items: []
    }
  }))
